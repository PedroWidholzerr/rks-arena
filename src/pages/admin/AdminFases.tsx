import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Alerta } from "@/components/Alerta";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeSelecao } from "@/components/CampoDeSelecao";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { TabelaClassificacao } from "@/components/TabelaClassificacao";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chaves, useClassificacao, useMutacao, useTodosOsCampeonatosDoAdmin } from "@/hooks/dados";
import { adminApi } from "@/services/api";
import type { EmpateAberto, Recalculo, Tabela } from "@/types";

/** Decidir empate (admin): lista ordenável por botões Subir e Descer (nunca só arrastar), com a posição resultante. */
function DialogoDeDecisao({ faseId, empate, tabela, aoFechar }: { faseId: string; empate: EmpateAberto; tabela: Tabela; aoFechar: () => void }) {
  const [ordem, setOrdem] = useState<string[]>(empate.times);
  const [motivo, setMotivo] = useState("");
  const nomes = new Map(tabela.linhas.map((l) => [l.timeId, `${l.tag} · ${l.nome}`]));
  const decidir = useMutacao(() => adminApi.decidirEmpate(faseId, ordem, motivo), {
    invalidar: [chaves.classificacao(faseId)],
    sucesso: "Decisão salva. A classificação foi atualizada.",
    aoConcluir: aoFechar,
  });
  const mover = (indice: number, passo: -1 | 1) => {
    const destino = indice + passo;
    if (destino < 0 || destino >= ordem.length) return;
    const nova = [...ordem];
    [nova[indice], nova[destino]] = [nova[destino], nova[indice]];
    setOrdem(nova);
  };
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    decidir.mutate(undefined);
  };
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-h-[90vh] max-w-formulario overflow-y-auto shadow-flutuante">
        <DialogHeader>
          <DialogTitle>Decidir empate</DialogTitle>
          <DialogDescription>
            Empatados em pontos, confronto direto, saldo de Jogos e Jogos vencidos, em <span className="numero">{empate.posicao}</span>º. A decisão vale para este conjunto exato de Times.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={decidir.isPending}>
          <ErroDaOperacao erro={decidir.error} />
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Ordem final</legend>
            <ol className="space-y-1.5">
              {ordem.map((id, indice) => (
                <li key={id} className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-card px-3">
                  <span className="numero w-8 font-semibold">{empate.posicao + indice}º</span>
                  <span className="flex-1">{nomes.get(id) ?? id}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label={`Subir ${nomes.get(id) ?? "Time"}`} disabled={indice === 0} onClick={() => mover(indice, -1)}>
                    <ArrowUp aria-hidden="true" className="h-4 w-4" /> <span className="sr-only">Subir</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label={`Descer ${nomes.get(id) ?? "Time"}`} disabled={indice === ordem.length - 1} onClick={() => mover(indice, 1)}>
                    <ArrowDown aria-hidden="true" className="h-4 w-4" /> <span className="sr-only">Descer</span>
                  </Button>
                </li>
              ))}
            </ol>
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo">Motivo (obrigatório)</Label>
            <Textarea id="motivo" required className="text-base" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <p className="text-sm text-muted-foreground">O motivo fica registrado e aparece na classificação.</p>
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={decidir.isPending || !motivo.trim()}>
              {decidir.isPending ? "Salvando…" : "Salvar decisão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PainelDaFase({ faseId }: { faseId: string }) {
  const consulta = useClassificacao(faseId);
  const [decidindo, setDecidindo] = useState<EmpateAberto | null>(null);
  const [recalculo, setRecalculo] = useState<Recalculo | null>(null);
  const recalcular = useMutacao(() => adminApi.recalcular(faseId), { aoConcluir: (r) => setRecalculo(r) });
  return (
    <div className="space-y-4">
      <EstadoDaConsulta consulta={consulta} rotulo="a classificação" atualizadoEm={(r) => r.atualizadoEm}>
        {(resposta) => {
          const tabela = resposta.dados;
          if (tabela.linhas.length === 0) return <Vazio titulo="Ainda não há Times nesta Fase." texto="Vincule os Times ao Campeonato em Campeonatos." />;
          return (
            <div className="space-y-3">
              {tabela.empatesAbertos.length > 0 ? (
                <Alerta variante="aviso" titulo="Há empate sem decisão">
                  Os Times empatados dividem a posição até você decidir. Use “Decidir” na linha do empate.
                </Alerta>
              ) : null}
              {tabela.decisoesOrfas > 0 ? (
                <Alerta variante="info" titulo="Decisões sem efeito">
                  <span className="numero">{tabela.decisoesOrfas}</span> decisão(ões) manual(is) não se aplicam a nenhum empate atual (uma edição desfez o empate). Elas continuam guardadas.
                </Alerta>
              ) : null}
              <TabelaClassificacao linhas={tabela.linhas} empatesAbertos={tabela.empatesAbertos} aoDecidir={setDecidindo} densa />
              {decidindo ? <DialogoDeDecisao faseId={faseId} empate={decidindo} tabela={tabela} aoFechar={() => setDecidindo(null)} /> : null}
            </div>
          );
        }}
      </EstadoDaConsulta>
      <div className="space-y-2 rounded-md border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">Recalcular a classificação</h2>
        <p className="text-sm text-muted-foreground">
          Refaz a tabela do zero a partir das Partidas finalizadas e compara com a consulta normal. Qualquer diferença indica defeito, e não rotina.
        </p>
        <ErroDaOperacao erro={recalcular.error} />
        <Button variant="secondary" className="min-h-toque" disabled={recalcular.isPending} onClick={() => recalcular.mutate(undefined)}>
          {recalcular.isPending ? "Recalculando…" : "Recalcular"}
        </Button>
        {recalculo ? (
          recalculo.consistente ? (
            <Alerta variante="sucesso" titulo="Recálculo idêntico">
              O recálculo bateu com a consulta normal.
            </Alerta>
          ) : (
            <Alerta variante="erro" titulo="Erro de consistência">
              O recálculo difere da consulta normal. Isso indica um defeito: avise o mantenedor.
            </Alerta>
          )
        ) : null}
      </div>
    </div>
  );
}

export function AdminFases() {
  const [parametros, setParametros] = useSearchParams();
  const { lista, carregando } = useTodosOsCampeonatosDoAdmin();
  const escolhido = parametros.get("campeonato") ?? lista[0]?.campeonato.id ?? "";
  const atual = lista.find((c) => c.campeonato.id === escolhido);
  return (
    <>
      <CabecalhoDePagina titulo="Fases" descricao="Classificação e decisão de empates. Os Campeonatos desta etapa têm uma Fase de pontos corridos." />
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando os Campeonatos…</p>
      ) : lista.length === 0 ? (
        <Vazio titulo="Ainda não há Campeonatos." texto="Crie um Campeonato para ver a Fase dele." />
      ) : (
        <div className="space-y-4">
          <div className="max-w-formulario">
            <CampoDeSelecao
              rotulo="Campeonato"
              valor={escolhido}
              aoMudar={(v) => setParametros({ campeonato: v })}
              opcoes={lista.map(({ campeonato, temporada }) => ({ valor: campeonato.id, texto: `${campeonato.nome} · ${temporada.nome}` }))}
            />
          </div>
          {atual?.campeonato.faseId ? <PainelDaFase key={atual.campeonato.faseId} faseId={atual.campeonato.faseId} /> : null}
        </div>
      )}
    </>
  );
}
