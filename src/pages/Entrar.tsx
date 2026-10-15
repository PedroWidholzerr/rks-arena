import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alerta } from "@/components/Alerta";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { PularParaConteudo } from "@/components/layout/PularParaConteudo";
import { TemaToggle } from "@/components/layout/TemaToggle";
import { Marca } from "@/components/layout/Marca";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { mensagemDeErro } from "@/hooks/dados";

/** Login do Administrador: sem link no cabeçalho público, só "Administração" no rodapé. */
export default function Entrar() {
  const { autenticado, trocarSenha, sessaoExpirou, entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const destino = (local.state as { de?: string } | null)?.de ?? "/admin";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<{ titulo: string; texto: string } | null>(null);

  if (autenticado) return <Navigate to={trocarSenha ? "/troque-sua-senha" : destino} replace state={{ de: destino }} />;

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await entrar(email, senha);
      navegar(destino, { replace: true });
    } catch (e) {
      // O texto digitado fica no formulário; só a senha é limpa para nova tentativa.
      setErro(mensagemDeErro(e));
      setSenha("");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PularParaConteudo />
      <header className="container flex h-14 items-center justify-between">
        <Marca />
        <TemaToggle />
      </header>
      <main id="conteudo" tabIndex={-1} className="container max-w-formulario py-8 focus:outline-none">
        <CabecalhoDePagina titulo="Entrar na administração" descricao="Acesso restrito aos Administradores." />
        {sessaoExpirou ? (
          <Alerta variante="info" titulo="Sua sessão expirou." className="mb-4">
            Entre de novo para continuar.
          </Alerta>
        ) : null}
        {erro ? (
          <Alerta variante="erro" titulo={erro.titulo} className="mb-4">
            {erro.texto}
          </Alerta>
        ) : null}
        <form onSubmit={aoEnviar} className="space-y-4" aria-busy={enviando}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail (obrigatório)</Label>
            <Input id="email" type="email" autoComplete="username" required className="min-h-11 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Senha (obrigatório)</Label>
            <Input id="senha" type="password" autoComplete="current-password" required className="min-h-11 text-base" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <Button type="submit" className="min-h-toque w-full sm:w-auto" disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </main>
    </div>
  );
}
