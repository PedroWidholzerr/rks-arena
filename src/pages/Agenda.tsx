import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeSelecao } from "@/components/CampoDeSelecao";
import { CartaoDePartida } from "@/components/CartaoDePartida";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { chaves, useTemporadasPublicas } from "@/hooks/dados";
import { chaveDoDia, rotuloDoDia } from "@/lib/formato";
import { publico } from "@/services/api";
import type { Campeonato, Partida } from "@/types";

function PartidasDaAgenda({ campeonatos }: { campeonatos: Campeonato[] }) {
  const [campeonato, setCampeonato] = useState("");
  const [time, setTime] = useState("");
  const consultas = useQueries({
    queries: campeonatos.map((c) => ({ queryKey: chaves.partidas(c.id, {}), queryFn: () => publico.partidas(c.id) })),
  });
  const carregando = consultas.some((c) => c.isPending);
  const todas: Array<{ partida: Partida; nome: string }> = consultas.flatMap((c, i) =>
    (c.data?.dados ?? []).map((partida) => ({ partida, nome: campeonatos[i].nome })),
  );
  const times = new Map<string, string>();
  todas.forEach(({ partida }) => {
    [partida.timeA, partida.timeB].forEach((t) => t && times.set(t.id, t.nome));
  });

  const visiveis = todas
    .filter(({ partida }) => !campeonato || partida.campeonatoId === campeonato)
    .filter(({ partida }) => !time || partida.timeA?.id === time || partida.timeB?.id === time);

  // Ao vivo primeiro; depois por horário. Partidas sem horário vão para o fim, num grupo próprio.
  const porDia = new Map<string, typeof visiveis>();
  visiveis.forEach((item) => {
    const chave = item.partida.agendadaPara ? chaveDoDia(item.partida.agendadaPara) : "sem-horario";
    porDia.set(chave, [...(porDia.get(chave) ?? []), item]);
  });
  const dias = [...porDia.keys()].sort((a, b) => (a === "sem-horario" ? 1 : b === "sem-horario" ? -1 : a.localeCompare(b)));

  return (
    <div className="space-y-4" aria-busy={carregando}>
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoDeSelecao
          rotulo="Campeonato"
          valor={campeonato}
          aoMudar={setCampeonato}
          opcoes={[{ valor: "", texto: "Todos" }, ...campeonatos.map((c) => ({ valor: c.id, texto: c.nome }))]}
        />
        <CampoDeSelecao
          rotulo="Time"
          valor={time}
          aoMudar={setTime}
          opcoes={[{ valor: "", texto: "Todos" }, ...[...times.entries()].map(([id, nome]) => ({ valor: id, texto: nome }))]}
        />
      </div>
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando as Partidas…</p>
      ) : dias.length === 0 ? (
        <Vazio titulo={time ? "Este Time não joga neste período." : "Nenhuma Partida neste período."} />
      ) : (
        dias.map((chave) => (
          <section key={chave} aria-labelledby={`dia-${chave}`}>
            <h2 id={`dia-${chave}`} className="mb-3 font-display text-lg font-bold uppercase tracking-tight text-foreground">
              {chave === "sem-horario" ? "Sem horário" : rotuloDoDia(chave)}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {(porDia.get(chave) ?? [])
                .sort((a, b) => {
                  const vivoA = a.partida.estado === "EM_ANDAMENTO" ? 0 : 1;
                  const vivoB = b.partida.estado === "EM_ANDAMENTO" ? 0 : 1;
                  return vivoA - vivoB || (a.partida.agendadaPara ?? "").localeCompare(b.partida.agendadaPara ?? "");
                })
                .map(({ partida, nome }) => (
                  <CartaoDePartida key={partida.id} partida={partida} campeonato={nome} />
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default function Agenda() {
  const consulta = useTemporadasPublicas();
  return (
    <>
      <CabecalhoDePagina titulo="Agenda" descricao="Partidas da Temporada em destaque, por dia." />
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="a agenda"
        atualizadoEm={(r) => r.atualizadoEm}
        vazio={{ quando: (r) => r.dados.length === 0, titulo: "Nenhuma Partida neste período." }}
      >
        {(resposta) => {
          const destaque = resposta.dados.find((t) => t.destaque) ?? resposta.dados[0];
          return <PartidasDaAgenda campeonatos={destaque.campeonatos} />;
        }}
      </EstadoDaConsulta>
    </>
  );
}
