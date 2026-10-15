import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import { Alerta } from "@/components/Alerta";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeSelecao } from "@/components/CampoDeSelecao";
import { CartaoDePartida } from "@/components/CartaoDePartida";
import { DialogoDeConfirmacao } from "@/components/admin/DialogoDeConfirmacao";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { PainelDeResultado } from "@/components/admin/PainelDeResultado";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminChaves, useAdminPartidas, useAdminTimesDoCampeonato, useMutacao, useTodosOsCampeonatosDoAdmin } from "@/hooks/dados";
import { diaEHora, placar } from "@/lib/formato";
import { adminApi } from "@/services/api";
import type { Campeonato, Partida } from "@/types";

type Filtro = "sem-resultado" | "finalizadas" | "todas";

/** ISO (UTC) -> "AAAA-MM-DDTHH:mm" no fuso do navegador, para o campo datetime-local. */
function paraCampoDeData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}T${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

function DialogoDePartida({ aberto, aoMudar, campeonato, partida }: { aberto: boolean; aoMudar: (a: boolean) => void; campeonato: Campeonato; partida?: Partida }) {
  const participantes = useAdminTimesDoCampeonato(campeonato.id);
  const [timeA, setTimeA] = useState(partida?.timeA?.id ?? "");
  const [timeB, setTimeB] = useState(partida?.timeB?.id ?? "");
  const [rodada, setRodada] = useState(String(partida?.rodada ?? 1));
  const [quando, setQuando] = useState(paraCampoDeData(partida?.agendadaPara ?? null));
  const [link, setLink] = useState(partida?.streamUrl ?? "");
  const invalidar = [adminChaves.partidas(campeonato.faseId ?? "")];
  const salvar = useMutacao(
    () => {
      const agendadaPara = quando ? new Date(quando).toISOString() : undefined;
      const streamUrl = link.trim() || undefined;
      return partida
        ? adminApi.atualizarPartida(partida.id, { version: partida.version, timeAId: timeA, timeBId: timeB, agendadaPara: agendadaPara ?? null, streamUrl: streamUrl ?? null })
        : adminApi.agendarPartida({ faseId: campeonato.faseId as string, timeAId: timeA, timeBId: timeB, rodada: Number(rodada), agendadaPara, streamUrl });
    },
    { invalidar, sucesso: partida ? "Partida salva." : "Partida agendada.", aoConcluir: () => aoMudar(false) },
  );
  const opcoes = (participantes.data ?? []).map((p) => ({ valor: p.timeId, texto: `${p.timeTag} · ${p.timeNome}` }));
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate(undefined);
  };
  const trocaTimes = !partida || partida.estado === "AGENDADA";
  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent className="max-h-[90vh] max-w-formulario overflow-y-auto shadow-flutuante">
        <DialogHeader>
          <DialogTitle>{partida ? "Reagendar Partida" : "Agendar Partida"}</DialogTitle>
          <DialogDescription>
            {campeonato.nome}. O horário é no fuso de Brasília. O link de transmissão precisa ser https.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={salvar.isPending}>
          <ErroDaOperacao erro={salvar.error} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoDeSelecao rotulo="Time A" valor={timeA} aoMudar={setTimeA} required disabled={!trocaTimes} opcoes={[{ valor: "", texto: "Escolha" }, ...opcoes]} />
            <CampoDeSelecao rotulo="Time B" valor={timeB} aoMudar={setTimeB} required disabled={!trocaTimes} opcoes={[{ valor: "", texto: "Escolha" }, ...opcoes]} />
          </div>
          {!partida ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="partida-rodada">Rodada</Label>
              <Input id="partida-rodada" type="number" min={1} className="min-h-11 text-base numero" value={rodada} onChange={(e) => setRodada(e.target.value)} />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="partida-quando">Data e hora</Label>
            <Input id="partida-quando" type="datetime-local" className="min-h-11 text-base" value={quando} onChange={(e) => setQuando(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="partida-link">Link de transmissão</Label>
            <Input id="partida-link" type="url" placeholder="https://" className="min-h-11 text-base" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={() => aoMudar(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={salvar.isPending || !timeA || !timeB}>
              {salvar.isPending ? "Salvando…" : partida ? "Salvar Partida" : "Agendar Partida"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Acao = { tipo: "resultado" | "reagendar" | "anular" | "excluir"; partida: Partida };

function ListaDePartidas({ campeonato, temporadaId }: { campeonato: Campeonato; temporadaId: string }) {
  const consulta = useAdminPartidas(campeonato.faseId ?? undefined);
  const [filtro, setFiltro] = useState<Filtro>("sem-resultado");
  const [acao, setAcao] = useState<Acao | null>(null);
  const [agendando, setAgendando] = useState(false);
  const invalidar = [adminChaves.partidas(campeonato.faseId ?? "")];
  const iniciar = useMutacao((p: Partida) => adminApi.iniciarPartida(p.id, p.version), { invalidar, sucesso: "Partida iniciada." });
  const anular = useMutacao((p: Partida) => adminApi.anularResultado(p.id, p.version), { invalidar, sucesso: "Resultado anulado. A Partida voltou a Agendada." });
  const excluir = useMutacao((p: Partida) => adminApi.excluirPartida(p.id), { invalidar, sucesso: "Partida excluída." });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <CampoDeSelecao
          rotulo="Mostrar"
          valor={filtro}
          aoMudar={(v) => setFiltro(v as Filtro)}
          opcoes={[
            { valor: "sem-resultado", texto: "Sem resultado" },
            { valor: "finalizadas", texto: "Finalizadas" },
            { valor: "todas", texto: "Todas" },
          ]}
        />
        <Button className="min-h-toque" onClick={() => setAgendando(true)}>
          <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Agendar Partida
        </Button>
      </div>
      <ErroDaOperacao erro={iniciar.error ?? anular.error ?? excluir.error} />
      <EstadoDaConsulta consulta={consulta} rotulo="as Partidas" vazio={{ quando: (l) => l.length === 0, titulo: "Este Campeonato ainda não tem Partidas.", texto: "Vincule os Times ao Campeonato e agende a primeira." }}>
        {(lista) => {
          const visiveis = lista.filter((p) =>
            filtro === "todas" ? true : filtro === "finalizadas" ? p.estado === "FINALIZADA" : p.estado !== "FINALIZADA",
          );
          if (visiveis.length === 0) return <Vazio titulo="Nenhuma Partida neste filtro." />;
          return (
            <div className="grid gap-3 lg:grid-cols-2">
              {visiveis.map((p) => (
                <CartaoDePartida
                  key={p.id}
                  partida={p}
                  acoes={
                    <>
                      {p.estado === "AGENDADA" ? (
                        <Button variant="secondary" className="min-h-toque" disabled={iniciar.isPending} onClick={() => iniciar.mutate(p)}>
                          Iniciar partida
                        </Button>
                      ) : null}
                      <Button className="min-h-toque" onClick={() => setAcao({ tipo: "resultado", partida: p })}>
                        {p.estado === "FINALIZADA" ? "Editar resultado" : "Lançar resultado"}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="min-h-toque" aria-label={`Mais ações da Partida ${p.timeA?.tag ?? ""} contra ${p.timeB?.tag ?? ""}`}>
                            <MoreHorizontal aria-hidden="true" className="mr-1 h-4 w-4" /> Mais
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="shadow-flutuante">
                          {p.estado !== "FINALIZADA" ? (
                            <DropdownMenuItem className="min-h-toque" onSelect={() => setAcao({ tipo: "reagendar", partida: p })}>
                              Reagendar ou trocar o link
                            </DropdownMenuItem>
                          ) : null}
                          {p.estado === "FINALIZADA" ? (
                            <DropdownMenuItem className="min-h-toque" onSelect={() => setAcao({ tipo: "anular", partida: p })}>
                              Anular resultado
                            </DropdownMenuItem>
                          ) : null}
                          {p.estado !== "FINALIZADA" ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="min-h-toque text-danger" onSelect={() => setAcao({ tipo: "excluir", partida: p })}>
                                Excluir Partida
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  }
                />
              ))}
            </div>
          );
        }}
      </EstadoDaConsulta>

      {agendando ? <DialogoDePartida aberto={agendando} aoMudar={setAgendando} campeonato={campeonato} /> : null}
      {acao?.tipo === "resultado" ? (
        <PainelDeResultado
          partida={acao.partida}
          melhorDe={campeonato.configuracao.melhorDe}
          temporadaId={temporadaId}
          nomeDoCampeonato={campeonato.nome}
          aberto
          aoMudar={(aberto) => !aberto && setAcao(null)}
          aoRecarregar={() => void consulta.refetch()}
        />
      ) : null}
      {acao?.tipo === "reagendar" ? <DialogoDePartida aberto aoMudar={(a) => !a && setAcao(null)} campeonato={campeonato} partida={acao.partida} /> : null}
      <DialogoDeConfirmacao
        aberto={acao?.tipo === "anular"}
        aoMudar={(aberto) => !aberto && setAcao(null)}
        titulo="Anular o resultado?"
        afetados={acao?.tipo === "anular" ? [`${acao.partida.timeA?.nome} ${placar(acao.partida.jogosA, acao.partida.jogosB)} ${acao.partida.timeB?.nome}`] : []}
        consequencia="A Partida volta a Agendada, sem placar, e deixa de contar na Classificação."
        rotuloDaAcao="Anular resultado"
        aoConfirmar={() => (acao?.tipo === "anular" ? anular.mutateAsync(acao.partida).catch(() => undefined) : undefined)}
      />
      <DialogoDeConfirmacao
        aberto={acao?.tipo === "excluir"}
        aoMudar={(aberto) => !aberto && setAcao(null)}
        titulo="Excluir a Partida?"
        afetados={acao?.tipo === "excluir" ? [`${acao.partida.timeA?.nome} contra ${acao.partida.timeB?.nome} · ${diaEHora(acao.partida.agendadaPara)}`] : []}
        consequencia="A Partida e o horário e o link dela se perdem."
        rotuloDaAcao="Excluir Partida"
        aoConfirmar={() => (acao?.tipo === "excluir" ? excluir.mutateAsync(acao.partida).catch(() => undefined) : undefined)}
      />
    </div>
  );
}

export function AdminPartidas() {
  const [parametros, setParametros] = useSearchParams();
  const { lista, carregando, erro } = useTodosOsCampeonatosDoAdmin();
  const escolhido = parametros.get("campeonato") ?? lista[0]?.campeonato.id ?? "";
  const atual = lista.find((c) => c.campeonato.id === escolhido);

  return (
    <>
      <CabecalhoDePagina titulo="Partidas" descricao="Agende, inicie e lance resultados." />
      {erro ? <Alerta variante="erro" titulo="Não foi possível carregar os Campeonatos">Verifique sua conexão e tente de novo.</Alerta> : null}
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando os Campeonatos…</p>
      ) : lista.length === 0 ? (
        <Vazio
          titulo="Ainda não há Campeonatos."
          texto="Crie uma Temporada e um Campeonato para agendar Partidas."
          acao={
            <Button asChild className="min-h-toque">
              <Link to="/admin/campeonatos">Ir para Campeonatos</Link>
            </Button>
          }
        />
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
          {atual ? (
            atual.campeonato.faseId ? (
              <ListaDePartidas key={atual.campeonato.id} campeonato={atual.campeonato} temporadaId={atual.temporada.id} />
            ) : (
              <Vazio titulo="Este Campeonato não tem Fase." texto="Isso não deveria acontecer: avise o mantenedor." />
            )
          ) : null}
        </div>
      )}
    </>
  );
}
