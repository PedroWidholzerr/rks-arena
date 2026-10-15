import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Alerta } from "@/components/Alerta";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeSelecao } from "@/components/CampoDeSelecao";
import { DialogoDeConfirmacao } from "@/components/admin/DialogoDeConfirmacao";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { EstadoDaConsulta } from "@/components/estados/Estados";
import { SeloDaTemporada, SeloDoCampeonato } from "@/components/SeloEstado";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminChaves, useAdminCampeonatos, useAdminTemporadas, useAdminTimes, useAdminTimesDoCampeonato, useMutacao } from "@/hooks/dados";
import { ESTADO_DO_CAMPEONATO, MODO } from "@/lib/formato";
import { adminApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import type { Campeonato, CriterioDesempate, Pontuacao, Temporada } from "@/types";

const NOME_DO_CRITERIO: Record<CriterioDesempate, string> = {
  CONFRONTO_DIRETO: "Confronto direto",
  SALDO: "Saldo de Jogos",
  JOGOS_VENCIDOS: "Jogos vencidos",
};
const CRITERIOS_PADRAO: CriterioDesempate[] = ["CONFRONTO_DIRETO", "SALDO", "JOGOS_VENCIDOS"];
const PONTUACAO_PADRAO: Pontuacao = { vitoria: 2, derrotaDecisiva: 1, derrota: 0 };

/** Valida a pontuação no formulário; o servidor continua sendo a autoridade (422). */
export function validarPontuacao(p: Pontuacao): string | null {
  if ([p.vitoria, p.derrotaDecisiva, p.derrota].some((v) => !Number.isInteger(v) || v < 0)) return "Os pontos precisam ser números inteiros, sem negativos.";
  if (!(p.vitoria > p.derrotaDecisiva && p.derrotaDecisiva >= p.derrota)) return "A vitória precisa valer mais que a derrota decisiva, que vale pelo menos o mesmo que a derrota.";
  return null;
}

function OrdemDosCriterios({ valor, aoMudar, desabilitado }: { valor: CriterioDesempate[]; aoMudar: (v: CriterioDesempate[]) => void; desabilitado?: boolean }) {
  const mover = (indice: number, passo: -1 | 1) => {
    const destino = indice + passo;
    if (destino < 0 || destino >= valor.length) return;
    const novo = [...valor];
    [novo[indice], novo[destino]] = [novo[destino], novo[indice]];
    aoMudar(novo);
  };
  return (
    <fieldset disabled={desabilitado} className="space-y-2">
      <legend className="text-sm font-medium">Ordem do desempate (depois dos pontos)</legend>
      <ol className="space-y-1.5">
        {valor.map((criterio, indice) => (
          <li key={criterio} className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3">
            <span className="numero w-5 text-sm text-muted-foreground">{indice + 1}.</span>
            <span className="flex-1">{NOME_DO_CRITERIO[criterio]}</span>
            <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label={`Subir ${NOME_DO_CRITERIO[criterio]}`} disabled={indice === 0} onClick={() => mover(indice, -1)}>
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label={`Descer ${NOME_DO_CRITERIO[criterio]}`} disabled={indice === valor.length - 1} onClick={() => mover(indice, 1)}>
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">Pontos vêm primeiro e a decisão do Administrador vem por último; os três do meio você reordena.</p>
    </fieldset>
  );
}

function CamposDePontuacao({ valor, aoMudar, desabilitado }: { valor: Pontuacao; aoMudar: (p: Pontuacao) => void; desabilitado?: boolean }) {
  const campo = (rotulo: string, chave: keyof Pontuacao, ajuda?: string) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`pontos-${chave}`}>{rotulo}</Label>
      <Input
        id={`pontos-${chave}`}
        type="number"
        min={0}
        inputMode="numeric"
        disabled={desabilitado}
        className="min-h-11 text-base numero"
        value={Number.isNaN(valor[chave]) ? "" : valor[chave]}
        onChange={(e) => aoMudar({ ...valor, [chave]: e.target.value === "" ? Number.NaN : Number(e.target.value) })}
      />
      {ajuda ? <p className="text-sm text-muted-foreground">{ajuda}</p> : null}
    </div>
  );
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Pontuação</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {campo("Vitória", "vitoria")}
        {campo("Derrota", "derrota")}
        {campo("Derrota decisiva", "derrotaDecisiva", "Foi até o último Jogo.")}
      </div>
    </fieldset>
  );
}

function DialogoDeTemporada({ aberto, aoMudar, temporada }: { aberto: boolean; aoMudar: (a: boolean) => void; temporada?: Temporada }) {
  const [nome, setNome] = useState(temporada?.nome ?? "");
  const [inicio, setInicio] = useState(temporada?.dataInicio ?? "");
  const [fim, setFim] = useState(temporada?.dataFim ?? "");
  const salvar = useMutacao(
    () => {
      const dados = { nome, dataInicio: inicio || undefined, dataFim: fim || undefined };
      return temporada ? adminApi.atualizarTemporada(temporada.id, dados) : adminApi.criarTemporada(dados);
    },
    { invalidar: [adminChaves.temporadas], sucesso: temporada ? "Temporada salva." : "Temporada criada.", aoConcluir: () => aoMudar(false) },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate(undefined);
  };
  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent className="max-w-formulario shadow-flutuante">
        <DialogHeader>
          <DialogTitle>{temporada ? "Editar Temporada" : "Nova Temporada"}</DialogTitle>
          <DialogDescription>As datas são opcionais.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={salvar.isPending}>
          <ErroDaOperacao erro={salvar.error} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="temporada-nome">Nome (obrigatório)</Label>
            <Input id="temporada-nome" required maxLength={120} className="min-h-11 text-base" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="temporada-inicio">Início</Label>
              <Input id="temporada-inicio" type="date" className="min-h-11 text-base" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="temporada-fim">Fim</Label>
              <Input id="temporada-fim" type="date" className="min-h-11 text-base" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={() => aoMudar(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando…" : "Salvar Temporada"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogoDeCampeonato({ aberto, aoMudar, temporada }: { aberto: boolean; aoMudar: (a: boolean) => void; temporada: Temporada }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [melhorDe, setMelhorDe] = useState("1");
  const [pontuacao, setPontuacao] = useState<Pontuacao>(PONTUACAO_PADRAO);
  const [criterios, setCriterios] = useState<CriterioDesempate[]>(CRITERIOS_PADRAO);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const criar = useMutacao(
    () => adminApi.criarCampeonato({ temporadaId: temporada.id, nome, descricao: descricao || undefined, melhorDe: Number(melhorDe), pontuacao, criterios }),
    { invalidar: [adminChaves.campeonatos(temporada.id)], sucesso: "Campeonato criado.", aoConcluir: () => aoMudar(false) },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const problema = validarPontuacao(pontuacao);
    setErroLocal(problema);
    if (!problema) criar.mutate(undefined);
  };
  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent className="max-h-[90vh] max-w-formulario overflow-y-auto shadow-flutuante">
        <DialogHeader>
          <DialogTitle>Novo Campeonato</DialogTitle>
          <DialogDescription>
            Em {temporada.nome}. Pontos corridos; a Fase é criada junto. Depois da primeira Partida finalizada, melhor de N, pontuação e desempate não mudam mais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={criar.isPending}>
          {erroLocal ? <Alerta variante="erro" titulo="Pontuação inválida">{erroLocal}</Alerta> : null}
          <ErroDaOperacao erro={criar.error} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campeonato-nome">Nome (obrigatório)</Label>
            <Input id="campeonato-nome" required maxLength={120} className="min-h-11 text-base" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campeonato-descricao">Descrição</Label>
            <Textarea id="campeonato-descricao" className="text-base" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <CampoDeSelecao
            rotulo="Melhor de"
            valor={melhorDe}
            aoMudar={setMelhorDe}
            opcoes={[1, 3, 5, 7].map((n) => ({ valor: String(n), texto: `Melhor de ${n}` }))}
          />
          <CamposDePontuacao valor={pontuacao} aoMudar={setPontuacao} />
          <OrdemDosCriterios valor={criterios} aoMudar={setCriterios} />
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={() => aoMudar(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={criar.isPending}>
              {criar.isPending ? "Salvando…" : "Criar Campeonato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SecaoDaTemporada({ temporada }: { temporada: Temporada }) {
  const consulta = useAdminCampeonatos(temporada.id);
  const [editando, setEditando] = useState(false);
  const [criando, setCriando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const encerrar = useMutacao(() => (temporada.encerrada ? adminApi.reabrirTemporada(temporada.id) : adminApi.encerrarTemporada(temporada.id)), {
    invalidar: [adminChaves.temporadas],
    sucesso: temporada.encerrada ? "Temporada reaberta." : "Temporada encerrada.",
  });
  const excluir = useMutacao(() => adminApi.excluirTemporada(temporada.id), { invalidar: [adminChaves.temporadas], sucesso: "Temporada excluída." });

  return (
    <section aria-labelledby={`temporada-${temporada.id}`} className="rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`temporada-${temporada.id}`} className="flex items-center gap-2 text-lg font-semibold">
          {temporada.nome} <SeloDaTemporada encerrada={temporada.encerrada} />
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="min-h-toque" onClick={() => setCriando(true)}>
            <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Novo Campeonato
          </Button>
          <Button variant="secondary" className="min-h-toque" onClick={() => setEditando(true)}>
            Editar
          </Button>
          <Button variant="secondary" className="min-h-toque" disabled={encerrar.isPending} onClick={() => encerrar.mutate(undefined)}>
            {temporada.encerrada ? "Reabrir" : "Encerrar"}
          </Button>
          <Button variant="ghost" className="min-h-toque text-danger" onClick={() => setExcluindo(true)}>
            Excluir
          </Button>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        <ErroDaOperacao erro={encerrar.error ?? excluir.error} />
        <EstadoDaConsulta consulta={consulta} rotulo="os Campeonatos" vazio={{ quando: (l) => l.length === 0, titulo: "Esta Temporada ainda não tem Campeonatos.", texto: "Crie o primeiro com “Novo Campeonato”." }}>
          {(lista) => (
            <ul className="divide-y divide-border rounded-md border border-border">
              {lista.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  <Link to={`/admin/campeonatos/${c.id}`} className="min-h-toque flex-1 font-medium underline underline-offset-2">
                    {c.nome}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {MODO[c.modo]} · melhor de <span className="numero">{c.configuracao.melhorDe}</span>
                  </span>
                  <SeloDoCampeonato estado={c.estado} />
                  {c.congelado ? <span className="text-xs text-muted-foreground">configuração bloqueada</span> : null}
                </li>
              ))}
            </ul>
          )}
        </EstadoDaConsulta>
      </div>
      {editando ? <DialogoDeTemporada aberto={editando} aoMudar={setEditando} temporada={temporada} /> : null}
      {criando ? <DialogoDeCampeonato aberto={criando} aoMudar={setCriando} temporada={temporada} /> : null}
      <DialogoDeConfirmacao
        aberto={excluindo}
        aoMudar={setExcluindo}
        titulo={`Excluir a Temporada ${temporada.nome}?`}
        consequencia="Só dá para excluir uma Temporada sem Campeonatos e sem Partidas finalizadas. Se houver, encerre-a."
        rotuloDaAcao="Excluir Temporada"
        aoConfirmar={() => excluir.mutateAsync(undefined).catch(() => undefined)}
      />
    </section>
  );
}

export function AdminCampeonatos() {
  const consulta = useAdminTemporadas();
  const [criando, setCriando] = useState(false);
  return (
    <>
      <CabecalhoDePagina
        titulo="Campeonatos"
        descricao="Agrupados por Temporada."
        acoes={
          <Button className="min-h-toque" onClick={() => setCriando(true)}>
            <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Nova Temporada
          </Button>
        }
      />
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="as Temporadas"
        vazio={{ quando: (l) => l.length === 0, titulo: "Ainda não há Temporadas.", texto: "Crie a primeira para começar a montar Campeonatos." }}
      >
        {(lista) => (
          <div className="space-y-4">
            {lista.map((t) => (
              <SecaoDaTemporada key={t.id} temporada={t} />
            ))}
          </div>
        )}
      </EstadoDaConsulta>
      {criando ? <DialogoDeTemporada aberto={criando} aoMudar={setCriando} /> : null}
    </>
  );
}

function ConfiguracaoDoCampeonato({ campeonato }: { campeonato: Campeonato }) {
  const [melhorDe, setMelhorDe] = useState(String(campeonato.configuracao.melhorDe));
  const [pontuacao, setPontuacao] = useState<Pontuacao>(campeonato.configuracao.pontuacao);
  const [criterios, setCriterios] = useState<CriterioDesempate[]>(campeonato.configuracao.criterios);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const salvar = useMutacao(() => adminApi.configurarCampeonato(campeonato.id, { melhorDe: Number(melhorDe), pontuacao, criterios }), {
    invalidar: [adminChaves.campeonato(campeonato.id)],
    sucesso: "Configuração salva.",
  });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const problema = validarPontuacao(pontuacao);
    setErroLocal(problema);
    if (!problema) salvar.mutate(undefined);
  };
  return (
    <section aria-labelledby="configuracao" className="space-y-4 rounded-md border border-border bg-card p-4">
      <h2 id="configuracao" className="text-lg font-semibold">
        Regras do Campeonato
      </h2>
      {campeonato.congelado ? (
        <Alerta
          variante="aviso"
          titulo="Configuração bloqueada"
          acao={
            <Button asChild variant="secondary" size="sm" className="min-h-toque">
              <Link to={`/admin/partidas?campeonato=${campeonato.id}`}>Ver Partidas finalizadas</Link>
            </Button>
          }
        >
          Este Campeonato já tem <span className="numero">{campeonato.partidasFinalizadas}</span> Partida(s) finalizada(s), então melhor de N, pontuação e desempate não podem mudar. Para alterar, anule antes as Partidas finalizadas.
        </Alerta>
      ) : null}
      {erroLocal ? <Alerta variante="erro" titulo="Pontuação inválida">{erroLocal}</Alerta> : null}
      <ErroDaOperacao erro={salvar.error} />
      <form onSubmit={enviar} className="space-y-4" aria-busy={salvar.isPending}>
        <CampoDeSelecao
          rotulo="Melhor de"
          valor={melhorDe}
          aoMudar={setMelhorDe}
          disabled={campeonato.congelado}
          opcoes={[1, 3, 5, 7].map((n) => ({ valor: String(n), texto: `Melhor de ${n}` }))}
        />
        <CamposDePontuacao valor={pontuacao} aoMudar={setPontuacao} desabilitado={campeonato.congelado} />
        <OrdemDosCriterios valor={criterios} aoMudar={setCriterios} desabilitado={campeonato.congelado} />
        <Button type="submit" className="min-h-toque" disabled={campeonato.congelado || salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar regras"}
        </Button>
      </form>
    </section>
  );
}

function TimesDoCampeonato({ campeonato }: { campeonato: Campeonato }) {
  const participantes = useAdminTimesDoCampeonato(campeonato.id);
  const todos = useAdminTimes();
  const [escolhido, setEscolhido] = useState("");
  const [removendo, setRemovendo] = useState<{ id: string; nome: string } | null>(null);
  const invalidar = [adminChaves.timesDoCampeonato(campeonato.id)];
  const vincular = useMutacao((timeId: string) => adminApi.vincularTime(campeonato.id, timeId), { invalidar, sucesso: "Time vinculado.", aoConcluir: () => setEscolhido("") });
  const desvincular = useMutacao((timeId: string) => adminApi.desvincularTime(campeonato.id, timeId), { invalidar, sucesso: "Time removido do Campeonato." });
  const jaVinculados = new Set((participantes.data ?? []).map((p) => p.timeId));
  const disponiveis = (todos.data ?? []).filter((t) => !jaVinculados.has(t.id));

  return (
    <section aria-labelledby="times-do-campeonato" className="space-y-3 rounded-md border border-border bg-card p-4">
      <h2 id="times-do-campeonato" className="text-lg font-semibold">
        Times do Campeonato
      </h2>
      <ErroDaOperacao
        erro={vincular.error ?? desvincular.error}
        acao={
          <Button asChild variant="secondary" size="sm" className="min-h-toque">
            <Link to="/admin/times">Ir para Times</Link>
          </Button>
        }
      />
      <EstadoDaConsulta
        consulta={participantes}
        rotulo="os Times do Campeonato"
        vazio={{ quando: (l) => l.length === 0, titulo: "Nenhum Time vinculado.", texto: "Monte o Elenco do Time na Temporada e vincule-o aqui." }}
      >
        {(lista) => (
          <ul className="divide-y divide-border rounded-md border border-border">
            {lista.map((p) => (
              <li key={p.id} className="flex min-h-12 items-center gap-3 px-3">
                <span className="font-semibold">{p.timeTag}</span>
                <span className="flex-1 text-muted-foreground">{p.timeNome}</span>
                <Button variant="ghost" className="min-h-toque text-danger" onClick={() => setRemovendo({ id: p.timeId, nome: p.timeNome })}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </EstadoDaConsulta>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <CampoDeSelecao
            rotulo="Vincular Time"
            valor={escolhido}
            aoMudar={setEscolhido}
            opcoes={[{ valor: "", texto: disponiveis.length ? "Escolha um Time" : "Nenhum Time disponível" }, ...disponiveis.map((t) => ({ valor: t.id, texto: `${t.tag} · ${t.nome}` }))]}
          />
        </div>
        <Button className="min-h-toque" disabled={!escolhido || vincular.isPending} onClick={() => vincular.mutate(escolhido)}>
          {vincular.isPending ? "Vinculando…" : "Vincular"}
        </Button>
      </div>
      <DialogoDeConfirmacao
        aberto={removendo !== null}
        aoMudar={(aberto) => !aberto && setRemovendo(null)}
        titulo={`Remover ${removendo?.nome ?? "o Time"} do Campeonato?`}
        consequencia="Só é possível enquanto o Time não tem Partidas neste Campeonato."
        rotuloDaAcao="Remover Time"
        aoConfirmar={() => (removendo ? desvincular.mutateAsync(removendo.id).catch(() => undefined) : undefined)}
      />
    </section>
  );
}

export function AdminCampeonato() {
  const { id = "" } = useParams();
  const consulta = useQuery({ queryKey: adminChaves.campeonato(id), queryFn: () => adminApi.campeonato(id) });
  return (
    <EstadoDaConsulta consulta={consulta} rotulo="o Campeonato">
      {(campeonato) => <DetalheDoCampeonato campeonato={campeonato} />}
    </EstadoDaConsulta>
  );
}

function DetalheDoCampeonato({ campeonato }: { campeonato: Campeonato }) {
  const [nome, setNome] = useState(campeonato.nome);
  const [descricao, setDescricao] = useState(campeonato.descricao ?? "");
  const [estado, setEstado] = useState<string>(campeonato.estado);
  const salvar = useMutacao(() => adminApi.atualizarCampeonato(campeonato.id, { nome, descricao: descricao || undefined, estado }), {
    invalidar: [adminChaves.campeonato(campeonato.id)],
    sucesso: "Campeonato salvo.",
  });
  return (
    <div className="space-y-6">
      <CabecalhoDePagina
        titulo={campeonato.nome}
        descricao={
          <Link to="/admin/campeonatos" className="underline underline-offset-2">
            ← Voltar aos Campeonatos
          </Link>
        }
        acoes={
          <Button asChild variant="secondary" className="min-h-toque">
            <Link to={`/campeonatos/${campeonato.id}`}>Ver página pública</Link>
          </Button>
        }
      />
      <section aria-labelledby="dados" className="space-y-4 rounded-md border border-border bg-card p-4">
        <h2 id="dados" className="text-lg font-semibold">
          Dados
        </h2>
        <ErroDaOperacao erro={salvar.error} />
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate(undefined);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-nome">Nome (obrigatório)</Label>
            <Input id="c-nome" required className="min-h-11 text-base" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-descricao">Descrição</Label>
            <Textarea id="c-descricao" className="text-base" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <CampoDeSelecao
            rotulo="Estado"
            valor={estado}
            aoMudar={setEstado}
            opcoes={Object.entries(ESTADO_DO_CAMPEONATO).map(([valor, texto]) => ({ valor, texto }))}
          />
          <p className="text-sm text-muted-foreground">
            Modo: {MODO[campeonato.modo]} · Time de <span className="numero">{campeonato.tamanhoTime}</span> (fixos nesta etapa).
          </p>
          <Button type="submit" className="min-h-toque" disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Salvar dados"}
          </Button>
        </form>
      </section>
      <ConfiguracaoDoCampeonato campeonato={campeonato} />
      <TimesDoCampeonato campeonato={campeonato} />
      <section aria-labelledby="atalhos" className="space-y-2 rounded-md border border-border bg-card p-4">
        <h2 id="atalhos" className="text-lg font-semibold">
          Partidas e classificação
        </h2>
        <p className="text-sm text-muted-foreground">Agende e lance resultados em Partidas; veja a tabela e decida empates em Fases.</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="min-h-toque">
            <Link to={`/admin/partidas?campeonato=${campeonato.id}`}>Ir para Partidas</Link>
          </Button>
          <Button asChild variant="secondary" className="min-h-toque">
            <Link to={`/admin/fases?campeonato=${campeonato.id}`}>Ir para Fases</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
