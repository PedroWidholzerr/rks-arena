import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alerta } from "@/components/Alerta";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { Marca } from "@/components/layout/Marca";
import { PularParaConteudo } from "@/components/layout/PularParaConteudo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { mensagemDeErro } from "@/hooks/dados";

const MINIMO = 10;

/** Troca de senha. Obrigatória no primeiro login: até trocar, nenhuma outra rota admin abre. */
export default function TrocarSenha() {
  const { autenticado, trocarSenha: obrigatoria, trocar, sair } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const destino = (local.state as { de?: string } | null)?.de ?? "/admin";
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<{ titulo: string; texto: string } | null>(null);

  if (!autenticado) return <Navigate to="/entrar" replace state={{ de: "/troque-sua-senha" }} />;

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro(null);
    if (nova.length < MINIMO) {
      setErro({ titulo: "Senha curta demais", texto: `A nova senha precisa de pelo menos ${MINIMO} caracteres.` });
      return;
    }
    if (nova !== confirmacao) {
      setErro({ titulo: "As senhas não conferem", texto: "Digite a nova senha igual nos dois campos." });
      return;
    }
    setEnviando(true);
    try {
      await trocar(atual, nova);
      toast.success("Senha trocada.");
      navegar(destino === "/troque-sua-senha" ? "/admin" : destino, { replace: true });
    } catch (e) {
      const mensagem = mensagemDeErro(e);
      setErro({ titulo: mensagem.codigo === "CREDENCIAIS_INVALIDAS" ? "Senha atual incorreta" : mensagem.titulo, texto: mensagem.texto });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4 text-foreground">
      <PularParaConteudo />
      <main id="conteudo" tabIndex={-1} className="esports-card w-full max-w-md space-y-4 p-6 focus:outline-none">
        <div className="flex justify-center">
          <Marca />
        </div>
        <CabecalhoDePagina
          titulo={obrigatoria ? "Troque sua senha" : "Trocar senha"}
          descricao={obrigatoria ? "Por segurança, troque a senha temporária antes de continuar." : undefined}
        />
        {erro ? (
          <Alerta variante="erro" titulo={erro.titulo} className="mb-4">
            {erro.texto}
          </Alerta>
        ) : null}
        <form onSubmit={aoEnviar} className="space-y-4" aria-busy={enviando}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha-atual">Senha atual (obrigatório)</Label>
            <Input id="senha-atual" type="password" autoComplete="current-password" required className="min-h-11 text-base" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha-nova">Nova senha (obrigatório)</Label>
            <Input id="senha-nova" type="password" autoComplete="new-password" required minLength={MINIMO} aria-describedby="ajuda-senha" className="min-h-11 text-base" value={nova} onChange={(e) => setNova(e.target.value)} />
            <p id="ajuda-senha" className="text-sm text-muted-foreground">
              Pelo menos {MINIMO} caracteres, diferente da senha atual.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha-confirmacao">Repita a nova senha (obrigatório)</Label>
            <Input id="senha-confirmacao" type="password" autoComplete="new-password" required className="min-h-11 text-base" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="min-h-toque w-full sm:w-auto" disabled={enviando}>
              {enviando ? "Salvando…" : "Trocar senha"}
            </Button>
            <Button type="button" variant="ghost" className="min-h-toque" onClick={() => { sair(); navegar("/entrar"); }}>
              Sair
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
