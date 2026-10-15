import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Alerta } from "@/components/Alerta";
import { Avatar } from "@/components/Avatar";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeSelecao } from "@/components/CampoDeSelecao";
import { CampoDeImagem } from "@/components/admin/CampoDeImagem";
import { DialogoDeConfirmacao } from "@/components/admin/DialogoDeConfirmacao";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { EstadoDaConsulta } from "@/components/estados/Estados";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { adminChaves, mensagemDeErro, useAdminJogadores, useAdminTemporadas, useAdminTimes, useMutacao } from "@/hooks/dados";
import { textoDoAvatarDoTime } from "@/lib/formato";
import { adminApi } from "@/services/api";
import { ErroDeApi } from "@/services/apiClient";
import type { Time } from "@/types";

const TITULARES = 3;
const RESERVAS_MAXIMAS = 2;

interface Linha {
  chave: string;
  jogadorId: string;
  funcao: "TITULAR" | "RESERVA";
  capitao: boolean;
}

/** Regra do Elenco na O1: 3 titulares, até 2 reservas, 1 Capitão, sem Jogador repetido. O servidor valida de novo. */
export function validarElenco(linhas: Pick<Linha, "jogadorId" | "funcao" | "capitao">[]): string | null {
  const titulares = linhas.filter((l) => l.funcao === "TITULAR").length;
  const reservas = linhas.filter((l) => l.funcao === "RESERVA").length;
  if (linhas.some((l) => !l.jogadorId)) return "Escolha o Jogador de cada linha.";
  if (new Set(linhas.map((l) => l.jogadorId)).size !== linhas.length) return "Cada Jogador entra uma única vez no Elenco.";
  if (titulares !== TITULARES || reservas > RESERVAS_MAXIMAS) return `O Elenco precisa de ${TITULARES} titulares e no máximo ${RESERVAS_MAXIMAS} reservas.`;
  if (linhas.filter((l) => l.capitao).length !== 1) return "Escolha exatamente um Capitão.";
  return null;
}

function EditorDeElenco({ time, aoFechar }: { time: Time; aoFechar: () => void }) {
  const temporadas = useAdminTemporadas();
  const jogadores = useAdminJogadores("");
  const [temporadaId, setTemporadaId] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  useEffect(() => {
    if (!temporadaId && temporadas.data?.length) setTemporadaId(temporadas.data[0].id);
  }, [temporadas.data, temporadaId]);

  const elenco = useQuery({
    queryKey: adminChaves.elenco(time.id, temporadaId),
    queryFn: () => adminApi.elenco(time.id, temporadaId),
    enabled: Boolean(temporadaId),
    retry: false,
  });

  // Carrega as linhas do Elenco salvo; Time sem Elenco nesta Temporada começa vazio.
  useEffect(() => {
    if (elenco.data) {
      setLinhas(elenco.data.membros.map((m) => ({ chave: m.jogadorId, jogadorId: m.jogadorId, funcao: m.funcao, capitao: m.capitao })));
    } else if (elenco.error instanceof ErroDeApi && elenco.error.status === 404) {
      setLinhas([]);
    }
  }, [elenco.data, elenco.error]);

  const salvar = useMutacao(
    () => adminApi.salvarElenco(time.id, temporadaId, linhas.map(({ jogadorId, funcao, capitao }) => ({ jogadorId, funcao, capitao }))),
    { invalidar: [adminChaves.elenco(time.id, temporadaId)], sucesso: "Elenco salvo." },
  );

  const titulares = linhas.filter((l) => l.funcao === "TITULAR").length;
  const reservas = linhas.filter((l) => l.funcao === "RESERVA").length;
  const adicionar = (funcao: Linha["funcao"]) =>
    setLinhas((atual) => [...atual, { chave: crypto.randomUUID(), jogadorId: "", funcao, capitao: false }]);
  const atualizar = (chave: string, mudanca: Partial<Linha>) => setLinhas((atual) => atual.map((l) => (l.chave === chave ? { ...l, ...mudanca } : l)));
  const remover = (linha: Linha) => {
    if (linha.capitao && linhas.length > 1) {
      setErroLocal("Escolha o novo Capitão antes de remover.");
      return;
    }
    setErroLocal(null);
    setLinhas((atual) => atual.filter((l) => l.chave !== linha.chave));
  };
  const marcarCapitao = (chave: string) => setLinhas((atual) => atual.map((l) => ({ ...l, capitao: l.chave === chave })));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const problema = validarElenco(linhas);
    setErroLocal(problema);
    if (!problema) salvar.mutate(undefined);
  };

  const opcoesDeJogador = [{ valor: "", texto: "Escolha o Jogador" }, ...(jogadores.data ?? []).map((j) => ({ valor: j.id, texto: j.riotId }))];
  const semElenco = elenco.error instanceof ErroDeApi && elenco.error.status === 404;

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto shadow-flutuante">
        <DialogHeader>
          <DialogTitle>Elenco de {time.nome}</DialogTitle>
          <DialogDescription>Um Elenco por Temporada: 3 titulares, até 2 reservas e exatamente um Capitão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={salvar.isPending}>
          <CampoDeSelecao
            rotulo="Temporada"
            valor={temporadaId}
            aoMudar={setTemporadaId}
            opcoes={(temporadas.data ?? []).map((t) => ({ valor: t.id, texto: t.nome }))}
          />
          {temporadas.data?.length === 0 ? <Alerta variante="info" titulo="Ainda não há Temporadas">Crie uma Temporada em Campeonatos para montar o Elenco.</Alerta> : null}
          {semElenco ? <Alerta variante="info" titulo="Este Time ainda não tem Elenco nesta Temporada">Adicione os Jogadores abaixo.</Alerta> : null}
          {erroLocal ? <Alerta variante="erro" titulo="Elenco inválido">{erroLocal}</Alerta> : null}
          <ErroDaOperacao erro={salvar.error} />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Jogadores: <span className="numero">{titulares} de {TITULARES}</span> titulares, <span className="numero">{reservas} de {RESERVAS_MAXIMAS}</span> reservas
            </legend>
            <RadioGroup
              value={linhas.find((l) => l.capitao)?.chave ?? ""}
              onValueChange={marcarCapitao}
              aria-label="Capitão"
              className="gap-2"
            >
              {linhas.map((linha, indice) => (
                <div key={linha.chave} className="grid items-end gap-2 rounded-md border border-border bg-card p-3 sm:grid-cols-[1fr_9rem_auto_auto]">
                  <CampoDeSelecao
                    rotulo={`Jogador ${indice + 1}`}
                    valor={linha.jogadorId}
                    aoMudar={(v) => atualizar(linha.chave, { jogadorId: v })}
                    opcoes={opcoesDeJogador}
                  />
                  <CampoDeSelecao
                    rotulo="Função"
                    valor={linha.funcao}
                    aoMudar={(v) => atualizar(linha.chave, { funcao: v as Linha["funcao"] })}
                    opcoes={[{ valor: "TITULAR", texto: "Titular" }, { valor: "RESERVA", texto: "Reserva" }]}
                  />
                  <Label htmlFor={`capitao-${linha.chave}`} className="flex min-h-11 cursor-pointer items-center gap-2 font-medium">
                    <RadioGroupItem id={`capitao-${linha.chave}`} value={linha.chave} />
                    Capitão
                  </Label>
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label={`Remover o Jogador ${indice + 1}`} onClick={() => remover(linha)}>
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" className="min-h-toque" disabled={titulares >= TITULARES} onClick={() => adicionar("TITULAR")}>
                <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Adicionar titular
              </Button>
              <Button type="button" variant="secondary" className="min-h-toque" disabled={reservas >= RESERVAS_MAXIMAS} onClick={() => adicionar("RESERVA")}>
                <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Adicionar reserva
              </Button>
            </div>
          </fieldset>

          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={aoFechar}>
              Fechar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={salvar.isPending || !temporadaId}>
              {salvar.isPending ? "Salvando…" : "Salvar Elenco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogoDeTime({ aoFechar, time }: { aoFechar: () => void; time?: Time }) {
  const [nome, setNome] = useState(time?.nome ?? "");
  const [tag, setTag] = useState(time?.tag ?? "");
  const [logo, setLogo] = useState<File | null>(null);
  const [erroDoLogo, setErroDoLogo] = useState<string | null>(null);
  const salvar = useMutacao(
    async () => {
      const dados = { nome, tag };
      const salvo = time ? await adminApi.atualizarTime(time.id, dados) : await adminApi.criarTime(dados);
      if (logo) {
        try {
          await adminApi.enviarLogo(salvo.id, logo);
        } catch (e) {
          // O Time ficou salvo; só a imagem falhou, e o campo volta ao estado anterior.
          setErroDoLogo(mensagemDeErro(e).texto);
          throw e;
        }
      }
      return salvo;
    },
    { invalidar: [adminChaves.times], sucesso: time ? "Time salvo." : "Time criado.", aoConcluir: aoFechar },
  );
  const removerLogo = useMutacao(() => adminApi.removerLogo(time?.id as string), { invalidar: [adminChaves.times], sucesso: "Logo removido." });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setErroDoLogo(null);
    salvar.mutate(undefined);
  };
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-h-[90vh] max-w-formulario overflow-y-auto shadow-flutuante">
        <DialogHeader>
          <DialogTitle>{time ? "Editar Time" : "Novo Time"}</DialogTitle>
          <DialogDescription>A tag é única e não diferencia maiúsculas de minúsculas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={salvar.isPending}>
          {!erroDoLogo ? <ErroDaOperacao erro={salvar.error ?? removerLogo.error} /> : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="time-nome">Nome (obrigatório)</Label>
            <Input id="time-nome" required maxLength={120} className="min-h-11 text-base" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="time-tag">Tag (obrigatório)</Label>
            <Input id="time-tag" required maxLength={10} className="min-h-11 text-base" value={tag} onChange={(e) => setTag(e.target.value)} aria-describedby="ajuda-tag" />
            <p id="ajuda-tag" className="text-sm text-muted-foreground">
              Até 10 caracteres. O avatar sem imagem mostra as 3 primeiras letras.
            </p>
          </div>
          <CampoDeImagem rotulo="Logo" atual={time?.logoUrl} texto={textoDoAvatarDoTime(tag || "?")} aoEscolher={setLogo} erroDoEnvio={erroDoLogo} />
          {time?.logoUrl ? (
            <Button type="button" variant="ghost" className="min-h-toque text-danger" disabled={removerLogo.isPending} onClick={() => removerLogo.mutate(undefined)}>
              Remover logo atual
            </Button>
          ) : null}
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando…" : "Salvar Time"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminTimes() {
  const consulta = useAdminTimes();
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Time | "novo" | null>(null);
  const [elenco, setElenco] = useState<Time | null>(null);
  const [excluindo, setExcluindo] = useState<Time | null>(null);
  const excluir = useMutacao((t: Time) => adminApi.excluirTime(t.id), { invalidar: [adminChaves.times], sucesso: "Time excluído." });

  return (
    <>
      <CabecalhoDePagina
        titulo="Times"
        descricao="Cadastro, logo e Elenco da Temporada."
        acoes={
          <Button className="min-h-toque" onClick={() => setEditando("novo")}>
            <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Novo Time
          </Button>
        }
      />
      <ErroDaOperacao erro={excluir.error} />
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="os Times"
        vazio={{ quando: (l) => l.length === 0, titulo: "Ainda não há Times.", texto: "Crie o primeiro com “Novo Time”." }}
      >
        {(lista) => {
          const termo = busca.trim().toLowerCase();
          const visiveis = lista.filter((t) => !termo || t.nome.toLowerCase().includes(termo) || t.tag.toLowerCase().includes(termo));
          return (
            <div className="space-y-3">
              <div className="flex max-w-formulario flex-col gap-1.5">
                <Label htmlFor="busca-times-admin">Buscar Time</Label>
                <Input id="busca-times-admin" type="search" className="min-h-11 text-base" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <ul className="divide-y divide-border rounded-md border border-border bg-card">
                {visiveis.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                    <Avatar src={t.logoUrl} texto={textoDoAvatarDoTime(t.tag)} tamanho={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{t.tag}</span>
                      <span className="block truncate text-sm text-muted-foreground">{t.nome}</span>
                    </span>
                    <Button variant="secondary" className="min-h-toque" onClick={() => setElenco(t)}>
                      Elenco
                    </Button>
                    <Button variant="secondary" className="min-h-toque" onClick={() => setEditando(t)}>
                      Editar
                    </Button>
                    <Button variant="ghost" className="min-h-toque text-danger" onClick={() => setExcluindo(t)}>
                      Excluir
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          );
        }}
      </EstadoDaConsulta>
      {editando ? <DialogoDeTime time={editando === "novo" ? undefined : editando} aoFechar={() => setEditando(null)} /> : null}
      {elenco ? <EditorDeElenco time={elenco} aoFechar={() => setElenco(null)} /> : null}
      <DialogoDeConfirmacao
        aberto={excluindo !== null}
        aoMudar={(aberto) => !aberto && setExcluindo(null)}
        titulo={`Excluir o Time ${excluindo?.nome ?? ""}?`}
        consequencia="Só dá para excluir um Time sem Partidas finalizadas e fora de Campeonatos."
        rotuloDaAcao="Excluir Time"
        aoConfirmar={() => (excluindo ? excluir.mutateAsync(excluindo).catch(() => undefined) : undefined)}
      />
    </>
  );
}
