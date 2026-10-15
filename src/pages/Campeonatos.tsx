import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeSelecao } from "@/components/CampoDeSelecao";
import { CartaoDeCampeonato } from "@/components/CartaoDeCampeonato";
import { CartaoDePartida } from "@/components/CartaoDePartida";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { SeloDoCampeonato } from "@/components/SeloEstado";
import { TabelaClassificacao } from "@/components/TabelaClassificacao";
import { Avatar } from "@/components/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampeonatoPublico, useClassificacao, useFasesPublicas, usePartidasPublicas, useTemporadasPublicas } from "@/hooks/dados";
import { MODO, textoDoAvatarDoTime } from "@/lib/formato";
import type { Campeonato } from "@/types";

export function ListaDeCampeonatos() {
  const consulta = useTemporadasPublicas();
  const [temporada, setTemporada] = useState("");
  const [modo, setModo] = useState("");
  return (
    <>
      <CabecalhoDePagina titulo="Campeonatos" />
      <EstadoDaConsulta consulta={consulta} rotulo="os Campeonatos" atualizadoEm={(r) => r.atualizadoEm}>
        {(resposta) => {
          const lista: Campeonato[] = resposta.dados
            .filter((t) => !temporada || t.temporada.id === temporada)
            .flatMap((t) => t.campeonatos)
            .filter((c) => !modo || c.modo === modo);
          return (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <CampoDeSelecao
                  rotulo="Temporada"
                  valor={temporada}
                  aoMudar={setTemporada}
                  opcoes={[{ valor: "", texto: "Todas" }, ...resposta.dados.map((t) => ({ valor: t.temporada.id, texto: t.temporada.nome }))]}
                />
                <CampoDeSelecao
                  rotulo="Modo"
                  valor={modo}
                  aoMudar={setModo}
                  opcoes={[{ valor: "", texto: "Todos" }, { valor: "ARAM", texto: "ARAM" }, { valor: "SUMMONERS_RIFT", texto: "Summoner's Rift" }]}
                />
              </div>
              {lista.length === 0 ? (
                <Vazio titulo="Nenhum Campeonato encontrado." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {lista.map((c) => (
                    <CartaoDeCampeonato key={c.id} campeonato={c} />
                  ))}
                </div>
              )}
            </div>
          );
        }}
      </EstadoDaConsulta>
    </>
  );
}

function AbaClassificacao({ campeonatoId }: { campeonatoId: string }) {
  const fases = useFasesPublicas(campeonatoId);
  const [faseEscolhida, setFaseEscolhida] = useState<string>("");
  const faseId = faseEscolhida || fases.data?.dados[0]?.id;
  const classificacao = useClassificacao(faseId);

  return (
    <div className="space-y-4">
      {fases.data && fases.data.dados.length > 1 ? (
        <CampoDeSelecao
          rotulo="Fase"
          valor={faseId ?? ""}
          aoMudar={setFaseEscolhida}
          opcoes={fases.data.dados.map((f) => ({ valor: f.id, texto: f.nome }))}
        />
      ) : null}
      <EstadoDaConsulta consulta={classificacao} rotulo="a classificação" atualizadoEm={(r) => r.atualizadoEm}>
        {(resposta) => {
          const tabela = resposta.dados;
          const semResultados = tabela.linhas.every((l) => l.jogadas === 0);
          if (tabela.linhas.length === 0) {
            return <Vazio titulo="Ainda não há Times neste Campeonato." texto="A classificação aparece depois da primeira Partida finalizada." />;
          }
          if (semResultados) {
            return (
              <div className="space-y-3">
                <Vazio titulo="A classificação aparece depois da primeira Partida finalizada." />
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tabela.linhas.map((l) => (
                    <li key={l.timeId}>
                      <Link to={`/times/${l.timeId}`} className="flex min-h-toque items-center gap-3 rounded-md border border-border bg-card px-3">
                        <Avatar src={l.logoUrl} texto={textoDoAvatarDoTime(l.tag)} tamanho={28} />
                        <span className="font-semibold">{l.tag}</span>
                        <span className="text-muted-foreground">{l.nome}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <div className="space-y-2">
              <TabelaClassificacao linhas={tabela.linhas} empatesAbertos={tabela.empatesAbertos} />
              <p className="text-xs text-muted-foreground">
                J: jogadas · V: vitórias · D: derrotas · JP: Jogos a favor · JC: Jogos contra · SJ: saldo de Jogos · Pts: pontos
              </p>
            </div>
          );
        }}
      </EstadoDaConsulta>
    </div>
  );
}

function AbaPartidas({ campeonatoId }: { campeonatoId: string }) {
  const consulta = usePartidasPublicas(campeonatoId);
  return (
    <EstadoDaConsulta
      consulta={consulta}
      rotulo="as Partidas"
      atualizadoEm={(r) => r.atualizadoEm}
      vazio={{ quando: (r) => r.dados.length === 0, titulo: "Os jogos ainda não foram gerados." }}
    >
      {(resposta) => {
        const porRodada = new Map<number, typeof resposta.dados>();
        resposta.dados.forEach((p) => porRodada.set(p.rodada, [...(porRodada.get(p.rodada) ?? []), p]));
        return (
          <div className="space-y-6">
            {[...porRodada.entries()]
              .sort(([a], [b]) => a - b)
              .map(([rodada, partidas]) => (
                <section key={rodada} aria-labelledby={`rodada-${rodada}`}>
                  <h3 id={`rodada-${rodada}`} className="mb-3 font-display text-lg font-bold uppercase tracking-tight text-foreground">
                    Rodada <span className="numero">{rodada}</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {partidas.map((p) => (
                      <CartaoDePartida key={p.id} partida={p} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        );
      }}
    </EstadoDaConsulta>
  );
}

function AbaTimes({ campeonatoId }: { campeonatoId: string }) {
  const fases = useFasesPublicas(campeonatoId);
  const classificacao = useClassificacao(fases.data?.dados[0]?.id);
  return (
    <EstadoDaConsulta
      consulta={classificacao}
      rotulo="os Times"
      atualizadoEm={(r) => r.atualizadoEm}
      vazio={{ quando: (r) => r.dados.linhas.length === 0, titulo: "Ainda não há Times neste Campeonato." }}
    >
      {(resposta) => (
        <ul className="grid gap-2 sm:grid-cols-2">
          {resposta.dados.linhas.map((l) => (
            <li key={l.timeId}>
              <Link to={`/times/${l.timeId}`} className="flex min-h-toque items-center gap-3 rounded-md border border-border bg-card px-3">
                <Avatar src={l.logoUrl} texto={textoDoAvatarDoTime(l.tag)} tamanho={32} />
                <span className="font-semibold">{l.tag}</span>
                <span className="text-muted-foreground">{l.nome}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </EstadoDaConsulta>
  );
}

export function DetalheDoCampeonato() {
  const { id = "" } = useParams();
  const consulta = useCampeonatoPublico(id);
  return (
    <EstadoDaConsulta consulta={consulta} rotulo="o Campeonato" atualizadoEm={(r) => r.atualizadoEm}>
      {({ dados: campeonato }) => (
        <>
          <CabecalhoDePagina
            destaque
            titulo={campeonato.nome}
            descricao={
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <SeloDoCampeonato estado={campeonato.estado} />
                <span>
                  {MODO[campeonato.modo]} · <span className="numero">{campeonato.tamanhoTime}×{campeonato.tamanhoTime}</span> · melhor de{" "}
                  <span className="numero">{campeonato.configuracao.melhorDe}</span>
                </span>
              </span>
            }
          />
          {campeonato.descricao ? <p className="mb-4 max-w-prose text-sm">{campeonato.descricao}</p> : null}
          <Tabs defaultValue="classificacao">
            <TabsList className="mb-4 h-auto w-full justify-start overflow-x-auto">
              <TabsTrigger value="classificacao" className="min-h-toque">
                Classificação
              </TabsTrigger>
              <TabsTrigger value="partidas" className="min-h-toque">
                Partidas
              </TabsTrigger>
              <TabsTrigger value="times" className="min-h-toque">
                Times
              </TabsTrigger>
            </TabsList>
            <TabsContent value="classificacao">
              <AbaClassificacao campeonatoId={id} />
            </TabsContent>
            <TabsContent value="partidas">
              <AbaPartidas campeonatoId={id} />
            </TabsContent>
            <TabsContent value="times">
              <AbaTimes campeonatoId={id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </EstadoDaConsulta>
  );
}
