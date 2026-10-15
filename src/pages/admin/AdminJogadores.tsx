import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { CampoDeImagem } from "@/components/admin/CampoDeImagem";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { EstadoDaConsulta } from "@/components/estados/Estados";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminChaves, mensagemDeErro, useAdminJogadores, useMutacao } from "@/hooks/dados";
import { iniciais } from "@/lib/formato";
import { adminApi } from "@/services/api";
import { ErroDeApi } from "@/services/apiClient";
import type { Jogador } from "@/types";

function DialogoDeJogador({ aoFechar, jogador }: { aoFechar: () => void; jogador?: Jogador }) {
  const [nick, setNick] = useState(jogador?.nick ?? "");
  const [tag, setTag] = useState(jogador?.tag ?? "");
  const [foto, setFoto] = useState<File | null>(null);
  const [erroDaFoto, setErroDaFoto] = useState<string | null>(null);
  const salvar = useMutacao(
    async () => {
      const dados = { nick, tag };
      const salvo = jogador ? await adminApi.atualizarJogador(jogador.id, dados) : await adminApi.criarJogador(dados);
      if (foto) {
        try {
          await adminApi.enviarFoto(salvo.id, foto);
        } catch (e) {
          setErroDaFoto(mensagemDeErro(e).texto);
          throw e;
        }
      }
      return salvo;
    },
    { invalidar: [["admin", "jogadores"]], sucesso: jogador ? "Jogador salvo." : "Jogador criado.", aoConcluir: aoFechar },
  );
  const removerFoto = useMutacao(() => adminApi.removerFoto(jogador?.id as string), { invalidar: [["admin", "jogadores"]], sucesso: "Foto removida." });
  const duplicado = salvar.error instanceof ErroDeApi && salvar.error.codigo === "JOGADOR_JA_EXISTE" ? String(salvar.error.extras.jogadorId ?? "") : "";
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setErroDaFoto(null);
    salvar.mutate(undefined);
  };
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-h-[90vh] max-w-formulario overflow-y-auto shadow-flutuante">
        <DialogHeader>
          <DialogTitle>{jogador ? "Editar Jogador" : "Novo Jogador"}</DialogTitle>
          <DialogDescription>O Riot ID é único. Mudar o nick edita o mesmo Jogador e preserva o histórico.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4" aria-busy={salvar.isPending}>
          {!erroDaFoto ? (
            <ErroDaOperacao
              erro={salvar.error ?? removerFoto.error}
              acao={
                duplicado ? (
                  <Button asChild variant="secondary" size="sm" className="min-h-toque">
                    <Link to={`/jogadores/${duplicado}`}>Já cadastrado: abrir perfil</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jogador-nick">Nick (obrigatório)</Label>
              <Input id="jogador-nick" required maxLength={60} className="min-h-11 text-base" value={nick} onChange={(e) => setNick(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jogador-tag">Tag (obrigatório)</Label>
              <Input id="jogador-tag" required maxLength={20} placeholder="BR1" className="min-h-11 text-base" value={tag} onChange={(e) => setTag(e.target.value)} />
            </div>
          </div>
          <CampoDeImagem rotulo="Foto" atual={jogador?.fotoUrl} texto={iniciais(nick || "?")} aoEscolher={setFoto} erroDoEnvio={erroDaFoto} />
          {jogador?.fotoUrl ? (
            <Button type="button" variant="ghost" className="min-h-toque text-danger" disabled={removerFoto.isPending} onClick={() => removerFoto.mutate(undefined)}>
              Remover foto atual
            </Button>
          ) : null}
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" className="min-h-toque" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-toque" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando…" : "Salvar Jogador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminJogadores() {
  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState("");
  useEffect(() => {
    const espera = setTimeout(() => setTermo(busca.trim()), 300);
    return () => clearTimeout(espera);
  }, [busca]);
  const consulta = useAdminJogadores(termo);
  const [editando, setEditando] = useState<Jogador | "novo" | null>(null);
  void adminChaves;

  return (
    <>
      <CabecalhoDePagina
        titulo="Jogadores"
        descricao="Cadastro por Riot ID e foto."
        acoes={
          <Button className="min-h-toque" onClick={() => setEditando("novo")}>
            <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Novo Jogador
          </Button>
        }
      />
      <div className="mb-4 flex max-w-formulario flex-col gap-1.5">
        <Label htmlFor="busca-jogadores-admin">Buscar por Riot ID</Label>
        <Input id="busca-jogadores-admin" type="search" className="min-h-11 text-base" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="os Jogadores"
        vazio={{ quando: (l) => l.length === 0, titulo: termo ? "Nenhum Jogador encontrado." : "Ainda não há Jogadores.", texto: termo ? undefined : "Crie o primeiro com “Novo Jogador”." }}
      >
        {(lista) => (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {lista.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <Avatar src={j.fotoUrl} texto={iniciais(j.nick)} tamanho={40} />
                <span className="flex-1 font-medium">
                  {j.nick}
                  <span className="text-muted-foreground">#{j.tag}</span>
                </span>
                <Button asChild variant="ghost" className="min-h-toque">
                  <Link to={`/jogadores/${j.id}`}>Perfil público</Link>
                </Button>
                <Button variant="secondary" className="min-h-toque" onClick={() => setEditando(j)}>
                  Editar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </EstadoDaConsulta>
      {editando ? <DialogoDeJogador jogador={editando === "novo" ? undefined : editando} aoFechar={() => setEditando(null)} /> : null}
    </>
  );
}
