import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CartaoDeCampeonato } from "@/components/CartaoDeCampeonato";
import { CartaoDePartida } from "@/components/CartaoDePartida";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { SeloDaTemporada } from "@/components/SeloEstado";
import { Button } from "@/components/ui/button";
import { chaves, useTemporadasPublicas } from "@/hooks/dados";
import { chaveDoDia } from "@/lib/formato";
import { publico } from "@/services/api";
import type { Campeonato, Partida } from "@/types";

function HojeDasPartidas({ campeonatos }: { campeonatos: Campeonato[] }) {
  const hoje = chaveDoDia(new Date().toISOString());
  const consultas = useQueries({
    queries: campeonatos.map((c) => ({
      queryKey: chaves.partidas(c.id, { dia: hoje }),
      queryFn: () => publico.partidas(c.id, { dia: hoje }),
    })),
  });
  const carregando = consultas.some((c) => c.isPending);
  const partidas: Array<{ partida: Partida; campeonato: string }> = consultas.flatMap((c, i) =>
    (c.data?.dados ?? []).map((partida) => ({ partida, campeonato: campeonatos[i].nome })),
  );
  // Ao vivo primeiro, depois por horário.
  partidas.sort((a, b) => {
    const vivoA = a.partida.estado === "EM_ANDAMENTO" ? 0 : 1;
    const vivoB = b.partida.estado === "EM_ANDAMENTO" ? 0 : 1;
    return vivoA - vivoB || (a.partida.agendadaPara ?? "").localeCompare(b.partida.agendadaPara ?? "");
  });

  return (
    <section aria-labelledby="hoje" aria-busy={carregando}>
      <h2 id="hoje" className="mb-3 text-xl font-semibold">
        Hoje
      </h2>
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando as Partidas de hoje…</p>
      ) : partidas.length === 0 ? (
        <Vazio titulo="Nenhuma Partida hoje." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {partidas.map(({ partida, campeonato }) => (
            <CartaoDePartida key={partida.id} partida={partida} campeonato={campeonato} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Inicio() {
  const consulta = useTemporadasPublicas();
  return (
    <div className="space-y-8">
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="a página inicial"
        atualizadoEm={(r) => r.atualizadoEm}
        vazio={{
          quando: (r) => r.dados.length === 0,
          titulo: "Ainda não há Temporadas.",
          texto: "Quando o primeiro Campeonato for criado, ele aparece aqui.",
        }}
      >
        {(resposta) => {
          const destaque = resposta.dados.find((t) => t.destaque) ?? resposta.dados[0];
          const emAndamento = destaque.campeonatos.filter((c) => c.estado === "EM_ANDAMENTO");
          return (
            <>
              <CabecalhoDePagina
                destaque
                titulo={destaque.temporada.nome}
                descricao={
                  <span className="flex items-center gap-2">
                    <SeloDaTemporada encerrada={destaque.temporada.encerrada} /> Temporada em destaque
                  </span>
                }
                acoes={
                  <Button asChild variant="secondary" className="min-h-toque">
                    <Link to={`/temporadas/${destaque.temporada.id}`}>Ver a Temporada</Link>
                  </Button>
                }
              />
              <HojeDasPartidas campeonatos={destaque.campeonatos} />
              <section aria-labelledby="andamento">
                <h2 id="andamento" className="mb-3 text-xl font-semibold">
                  Campeonatos em andamento
                </h2>
                {emAndamento.length === 0 ? (
                  <Vazio
                    titulo="Nenhum Campeonato em andamento agora."
                    acao={
                      <Button asChild variant="secondary" className="min-h-toque">
                        <Link to="/temporadas">Ver as Temporadas</Link>
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {emAndamento.map((c) => (
                      <CartaoDeCampeonato key={c.id} campeonato={c} />
                    ))}
                  </div>
                )}
              </section>
            </>
          );
        }}
      </EstadoDaConsulta>
    </div>
  );
}
