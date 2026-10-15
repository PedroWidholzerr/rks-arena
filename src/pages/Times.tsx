import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CartaoDePartida } from "@/components/CartaoDePartida";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { Selo } from "@/components/SeloEstado";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { chaves, useTemporadasPublicas, useTimePublico, useTimesPublicos } from "@/hooks/dados";
import { iniciais, textoDoAvatarDoTime } from "@/lib/formato";
import { publico } from "@/services/api";
import type { Partida } from "@/types";

export function ListaDeTimes() {
  const consulta = useTimesPublicos();
  const [busca, setBusca] = useState("");
  return (
    <>
      <CabecalhoDePagina titulo="Times" />
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="os Times"
        atualizadoEm={(r) => r.atualizadoEm}
        vazio={{ quando: (r) => r.dados.length === 0, titulo: "Ainda não há Times." }}
      >
        {(resposta) => {
          const termo = busca.trim().toLowerCase();
          const times = resposta.dados.filter((t) => !termo || t.nome.toLowerCase().includes(termo) || t.tag.toLowerCase().includes(termo));
          return (
            <div className="space-y-4">
              <div className="flex max-w-formulario flex-col gap-1.5">
                <Label htmlFor="busca-time">Buscar Time</Label>
                <Input id="busca-time" type="search" className="min-h-11 text-base" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome ou tag" />
              </div>
              {times.length === 0 ? (
                <Vazio titulo="Nenhum Time encontrado." />
              ) : (
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {times.map((t) => (
                    <li key={t.id}>
                      <Link to={`/times/${t.id}`} className="block h-full">
                        <div className="esports-card flex h-full items-center gap-4 p-5 transition-all hover:scale-[1.02]">
                          <Avatar src={t.logoUrl} texto={textoDoAvatarDoTime(t.tag)} tamanho={40} />
                          <span className="min-w-0">
                            <span className="block truncate font-display text-lg font-bold tracking-tight text-foreground">{t.nome}</span>
                            <span className="tag-badge">{t.tag}</span>
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }}
      </EstadoDaConsulta>
    </>
  );
}

function HistoricoDoTime({ timeId }: { timeId: string }) {
  const temporadas = useTemporadasPublicas();
  const campeonatos = (temporadas.data?.dados ?? []).flatMap((t) => t.campeonatos);
  const consultas = useQueries({
    queries: campeonatos.map((c) => ({ queryKey: chaves.partidas(c.id, { time: timeId }), queryFn: () => publico.partidas(c.id, { time: timeId }) })),
  });
  const carregando = temporadas.isPending || consultas.some((c) => c.isPending);
  const partidas: Array<{ partida: Partida; nome: string }> = consultas.flatMap((c, i) =>
    (c.data?.dados ?? []).map((partida) => ({ partida, nome: campeonatos[i].nome })),
  );
  if (carregando) return <p className="text-sm text-muted-foreground">Carregando as Partidas…</p>;
  if (partidas.length === 0) return <Vazio titulo="Sem Partidas ainda." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {partidas.map(({ partida, nome }) => (
        <CartaoDePartida key={partida.id} partida={partida} campeonato={nome} />
      ))}
    </div>
  );
}

export function DetalheDoTime() {
  const { id = "" } = useParams();
  const consulta = useTimePublico(id);
  const temporadas = useTemporadasPublicas();
  const nomeDaTemporada = new Map((temporadas.data?.dados ?? []).map((t) => [t.temporada.id, t.temporada.nome]));
  return (
    <EstadoDaConsulta consulta={consulta} rotulo="o Time" atualizadoEm={(r) => r.atualizadoEm}>
      {({ dados }) => (
        <>
          <div className="mb-6 flex items-center gap-4">
            <Avatar src={dados.time.logoUrl} texto={textoDoAvatarDoTime(dados.time.tag)} tamanho={96} />
            <CabecalhoDePagina titulo={`${dados.time.tag} · ${dados.time.nome}`} />
          </div>
          <section aria-labelledby="elenco" className="mb-8">
            <h2 id="elenco" className="mb-4 font-display text-2xl font-bold uppercase tracking-tighter text-foreground">
              Elenco
            </h2>
            {dados.elencos.length === 0 ? (
              <Vazio titulo="Este Time ainda não tem Elenco nesta Temporada." />
            ) : (
              <div className="space-y-4">
                {dados.elencos.map((elenco) => (
                  <div key={elenco.id} className="rounded-md border border-border bg-card p-4">
                    <h3 className="mb-3 font-display text-lg font-bold uppercase tracking-tight text-foreground">{nomeDaTemporada.get(elenco.temporadaId) ?? "Temporada"}</h3>
                    <ul className="divide-y divide-border">
                      {elenco.membros.map((m) => (
                        <li key={m.jogadorId} className="flex min-h-12 items-center gap-3">
                          <Avatar src={null} texto={iniciais(m.nick)} tamanho={32} />
                          <Link to={`/jogadores/${m.jogadorId}`} className="font-medium underline-offset-2 hover:underline">
                            {m.nick}
                            <span className="text-muted-foreground">#{m.tag}</span>
                          </Link>
                          {m.capitao ? (
                            <Selo tom="info">
                              <span aria-label="Capitão" title="Capitão">
                                C
                              </span>
                            </Selo>
                          ) : null}
                          <span className="ml-auto text-sm text-muted-foreground">{m.funcao === "TITULAR" ? "Titular" : "Reserva"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section aria-labelledby="historico">
            <h2 id="historico" className="mb-4 font-display text-2xl font-bold uppercase tracking-tighter text-foreground">
              Partidas
            </h2>
            <HistoricoDoTime timeId={id} />
          </section>
        </>
      )}
    </EstadoDaConsulta>
  );
}
