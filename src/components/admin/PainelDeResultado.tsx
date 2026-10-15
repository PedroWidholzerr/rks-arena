import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alerta } from "@/components/Alerta";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { adminChaves, useMutacao } from "@/hooks/dados";
import { diaEHora, placar, placaresValidos } from "@/lib/formato";
import { adminApi } from "@/services/api";
import { ErroDeApi } from "@/services/apiClient";
import type { MembroDoElenco, Partida } from "@/types";

interface Props {
  partida: Partida;
  melhorDe: number;
  temporadaId: string;
  nomeDoCampeonato: string;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  /** Recarrega as Partidas (conflito de versão). */
  aoRecarregar: () => void;
}

const chaveDoPlacar = (a: number, b: number) => `${a}-${b}`;

/**
 * Painel de lançamento de resultado (EXPERIENCE.md): lateral no desktop e folha de baixo no celular, sem sair da
 * página. O placar é um grupo de opções com TODOS os placares válidos do "melhor de N" (impossível de errar; o
 * servidor continua sendo a autoridade). MVP opcional, "Registrar W.O." troca o placar por "Quem venceu?". A chave
 * de idempotência nasce aqui e só muda quando o conteúdo muda: repetir o mesmo envio (cold start, duplo clique)
 * não grava duas vezes.
 */
export function PainelDeResultado({ partida, melhorDe, temporadaId, nomeDoCampeonato, aberto, aoMudar, aoRecarregar }: Props) {
  const celular = useIsMobile();
  const navegar = useNavigate();
  const editando = partida.estado === "FINALIZADA";
  const opcoes = useMemo(() => placaresValidos(melhorDe), [melhorDe]);
  const inicial = editando && partida.jogosA !== null && partida.jogosB !== null ? chaveDoPlacar(partida.jogosA, partida.jogosB) : "";

  const [placarEscolhido, setPlacarEscolhido] = useState(inicial);
  const [mvp, setMvp] = useState(partida.mvpJogadorId ?? "");
  const [modoWalkover, setModoWalkover] = useState(false);
  const [vencedorWo, setVencedorWo] = useState<"A" | "B" | "">("");
  const [chave, setChave] = useState(() => crypto.randomUUID());

  // Cada conteúdo novo ganha uma chave nova; o mesmo conteúdo reaproveita a chave.
  useEffect(() => {
    setChave(crypto.randomUUID());
  }, [placarEscolhido, mvp]);

  const times = [partida.timeA, partida.timeB].filter((t): t is NonNullable<typeof t> => t !== null);
  const elencos = useQueries({
    queries: times.map((t) => ({
      queryKey: adminChaves.elenco(t.id, temporadaId),
      queryFn: () => adminApi.elenco(t.id, temporadaId),
      retry: false,
    })),
  });
  const jogadoresDoMvp: Array<{ time: string; membros: MembroDoElenco[] }> = times.map((t, i) => ({
    time: t.nome,
    membros: elencos[i]?.data?.membros ?? [],
  }));

  const nomeA = partida.timeA?.nome ?? "Time A";
  const nomeB = partida.timeB?.nome ?? "Time B";
  const invalidar = [adminChaves.partidas(partida.faseId)];
  const aoSalvar = (resultado: Partida) => {
    aoMudar(false);
    toast.success(`Resultado salvo: ${nomeA} ${placar(resultado.jogosA, resultado.jogosB)} ${nomeB}. Classificação atualizada.`, {
      action: { label: "Ver classificação", onClick: () => navegar(`/admin/fases?campeonato=${partida.campeonatoId}`) },
    });
  };

  const salvarResultado = useMutacao(
    () => {
      const [a, b] = placarEscolhido.split("-").map(Number);
      return adminApi.lancarResultado(partida.id, { version: partida.version, jogosA: a, jogosB: b, mvpJogadorId: mvp || null }, chave);
    },
    { invalidar, aoConcluir: aoSalvar },
  );
  const salvarWalkover = useMutacao(() => adminApi.registrarWalkover(partida.id, partida.version, vencedorWo as "A" | "B"), {
    invalidar,
    aoConcluir: aoSalvar,
  });

  const mudou = placarEscolhido !== inicial || mvp !== (partida.mvpJogadorId ?? "") || modoWalkover;
  const salvando = salvarResultado.isPending || salvarWalkover.isPending;
  const mutacao = modoWalkover ? salvarWalkover : salvarResultado;
  const conflito = mutacao.error instanceof ErroDeApi && mutacao.error.codigo === "VERSAO_DESATUALIZADA";

  const aoFechar = (valor: boolean) => {
    if (!valor && mudou && !salvando && !window.confirm("Descartar as alterações deste resultado?")) return;
    aoMudar(valor);
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (salvando) return;
    if (modoWalkover) {
      if (vencedorWo) salvarWalkover.mutate(undefined);
    } else if (placarEscolhido) {
      salvarResultado.mutate(undefined);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={aoFechar}>
      <SheetContent side={celular ? "bottom" : "right"} className={celular ? "h-[92vh] overflow-y-auto shadow-flutuante" : "w-[26rem] overflow-y-auto shadow-flutuante sm:max-w-md"}>
        <SheetHeader className="text-left">
          <SheetTitle>{modoWalkover ? "Registrar W.O." : editando ? "Editar resultado" : "Lançar resultado"}</SheetTitle>
          <SheetDescription asChild>
            <div className="text-foreground">
              <p className="font-semibold">
                {nomeA} contra {nomeB}
              </p>
              <p className="text-sm text-muted-foreground">
                {nomeDoCampeonato} · Rodada <span className="numero">{partida.rodada}</span> · <span className="numero">{diaEHora(partida.agendadaPara)}</span>
              </p>
              {editando ? (
                <p className="mt-1 text-sm">
                  Resultado anterior: <span className="numero font-semibold">{placar(partida.jogosA, partida.jogosB)}</span>
                  {partida.walkover ? " (W.O.)" : ""}
                </p>
              ) : null}
            </div>
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={enviar} className="mt-4 space-y-5" aria-busy={salvando}>
          {conflito ? (
            <Alerta
              variante="aviso"
              titulo="Esta Partida mudou"
              acao={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-toque"
                  onClick={() => {
                    aoRecarregar();
                    aoMudar(false);
                  }}
                >
                  Recarregar
                </Button>
              }
            >
              Outra pessoa alterou esta Partida depois que você a abriu. Recarregue para ver a versão atual; nada foi sobrescrito.
            </Alerta>
          ) : (
            <ErroDaOperacao erro={mutacao.error} />
          )}

          {modoWalkover ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Quem venceu por W.O.?</legend>
              <RadioGroup value={vencedorWo} onValueChange={(v) => setVencedorWo(v as "A" | "B")} className="gap-2">
                {[
                  { valor: "A", nome: nomeA },
                  { valor: "B", nome: nomeB },
                ].map(({ valor, nome }) => (
                  <Label key={valor} htmlFor={`wo-${valor}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border-strong bg-card px-3 font-medium">
                    <RadioGroupItem id={`wo-${valor}`} value={valor} />
                    {nome}
                  </Label>
                ))}
              </RadioGroup>
              <p className="text-sm text-muted-foreground">O W.O. vale como vitória e derrota normais e não gera estatística de Jogador.</p>
            </fieldset>
          ) : (
            <>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Placar em Jogos (melhor de {melhorDe})</legend>
                <RadioGroup value={placarEscolhido} onValueChange={setPlacarEscolhido} className="grid grid-cols-2 gap-2">
                  {opcoes.map(([a, b]) => (
                    <Label
                      key={chaveDoPlacar(a, b)}
                      htmlFor={`placar-${a}-${b}`}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border-strong bg-card px-3 text-lg font-semibold"
                    >
                      <RadioGroupItem id={`placar-${a}-${b}`} value={chaveDoPlacar(a, b)} aria-label={`${nomeA} ${a}, ${nomeB} ${b}`} />
                      <span className="numero">
                        {a}×{b}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  O primeiro número é de {nomeA}; o segundo, de {nomeB}.
                </p>
              </fieldset>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mvp">MVP (opcional)</Label>
                <select id="mvp" value={mvp} onChange={(e) => setMvp(e.target.value)} className="min-h-11 rounded-md border border-input bg-card px-3 text-base">
                  <option value="">Sem MVP</option>
                  {jogadoresDoMvp.map((grupo) => (
                    <optgroup key={grupo.time} label={grupo.time}>
                      {grupo.membros.map((m) => (
                        <option key={m.jogadorId} value={m.jogadorId}>
                          {m.nick}#{m.tag}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {jogadoresDoMvp.every((g) => g.membros.length === 0) ? (
                  <p className="text-sm text-muted-foreground">Os Times ainda não têm Elenco nesta Temporada, então não há Jogadores para o MVP.</p>
                ) : null}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={() => aoFechar(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={salvando || (modoWalkover ? !vencedorWo : !placarEscolhido)}>
              {salvando ? "Salvando…" : modoWalkover ? "Salvar W.O." : "Salvar resultado"}
            </Button>
          </div>
          {!editando ? (
            <button
              type="button"
              className="min-h-toque text-sm text-accent-text underline underline-offset-2"
              onClick={() => {
                setModoWalkover(!modoWalkover);
                mutacao.reset();
              }}
            >
              {modoWalkover ? "Voltar para o placar" : "Registrar W.O."}
            </button>
          ) : null}
        </form>
      </SheetContent>
    </Sheet>
  );
}
