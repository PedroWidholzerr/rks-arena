import { Link, useParams } from "react-router-dom";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CartaoDeCampeonato } from "@/components/CartaoDeCampeonato";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { SeloDaTemporada } from "@/components/SeloEstado";
import { useTemporadaPublica, useTemporadasPublicas } from "@/hooks/dados";
import { dia } from "@/lib/formato";
import type { Temporada } from "@/types";

function Periodo({ temporada }: { temporada: Temporada }) {
  if (!temporada.dataInicio && !temporada.dataFim) return null;
  return (
    <span className="numero">
      {temporada.dataInicio ? dia(`${temporada.dataInicio}T12:00:00-03:00`) : "…"} a {temporada.dataFim ? dia(`${temporada.dataFim}T12:00:00-03:00`) : "…"}
    </span>
  );
}

export function ListaDeTemporadas() {
  const consulta = useTemporadasPublicas();
  return (
    <>
      <CabecalhoDePagina titulo="Temporadas" descricao="Da mais recente para a mais antiga." />
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="as Temporadas"
        atualizadoEm={(r) => r.atualizadoEm}
        vazio={{ quando: (r) => r.dados.length === 0, titulo: "Ainda não há Temporadas." }}
      >
        {(resposta) => (
          <ul className="space-y-3">
            {resposta.dados.map(({ temporada, campeonatos, destaque }) => (
              <li key={temporada.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">
                    <Link to={`/temporadas/${temporada.id}`} className="underline underline-offset-2">
                      {temporada.nome}
                    </Link>
                  </h2>
                  <SeloDaTemporada encerrada={temporada.encerrada} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <Periodo temporada={temporada} /> {destaque ? "· em destaque" : ""} · <span className="numero">{campeonatos.length}</span> Campeonatos
                </p>
              </li>
            ))}
          </ul>
        )}
      </EstadoDaConsulta>
    </>
  );
}

export function DetalheDaTemporada() {
  const { id = "" } = useParams();
  const consulta = useTemporadaPublica(id);
  return (
    <EstadoDaConsulta consulta={consulta} rotulo="a Temporada" atualizadoEm={(r) => r.atualizadoEm}>
      {({ dados }) => (
        <>
          <CabecalhoDePagina
            titulo={dados.temporada.nome}
            descricao={
              <span className="flex flex-wrap items-center gap-2">
                <SeloDaTemporada encerrada={dados.temporada.encerrada} /> <Periodo temporada={dados.temporada} />
              </span>
            }
          />
          {dados.campeonatos.length === 0 ? (
            <Vazio titulo="Esta Temporada ainda não tem Campeonatos." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {dados.campeonatos.map((c) => (
                <CartaoDeCampeonato key={c.id} campeonato={c} />
              ))}
            </div>
          )}
        </>
      )}
    </EstadoDaConsulta>
  );
}
