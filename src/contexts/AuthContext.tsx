import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { autenticacao } from "@/services/api";
import { apiClient } from "@/services/apiClient";

interface SessaoGuardada {
  email: string;
  trocarSenha: boolean;
}

interface ContextoDeAutenticacao {
  /** Há token guardado (a sessão pode ter expirado no servidor; o 401 limpa). */
  autenticado: boolean;
  email: string | null;
  /** Troca obrigatória de senha pendente: antes disso, só a tela de troca abre. */
  trocarSenha: boolean;
  /** A sessão acabou de expirar (401): a tela de login explica. */
  sessaoExpirou: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  trocar: (senhaAtual: string, novaSenha: string) => Promise<void>;
  sair: () => void;
  limparAviso: () => void;
}

const CHAVE = "rks_sessao";
const Contexto = createContext<ContextoDeAutenticacao | null>(null);

function lerSessao(): SessaoGuardada | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto || !apiClient.temToken()) return null;
    return JSON.parse(bruto) as SessaoGuardada;
  } catch {
    return null;
  }
}

function guardarSessao(sessao: SessaoGuardada | null): void {
  try {
    if (sessao) localStorage.setItem(CHAVE, JSON.stringify(sessao));
    else localStorage.removeItem(CHAVE);
  } catch {
    // armazenamento bloqueado: a sessão vale só até recarregar
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<SessaoGuardada | null>(lerSessao);
  const [sessaoExpirou, setSessaoExpirou] = useState(false);

  useEffect(() => {
    apiClient.aoExpirarSessao(() => {
      guardarSessao(null);
      setSessao(null);
      setSessaoExpirou(true);
    });
    return () => apiClient.aoExpirarSessao(null);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await autenticacao.entrar(email, senha);
    apiClient.definirToken(resposta.token);
    const nova = { email: email.trim(), trocarSenha: resposta.trocarSenha };
    guardarSessao(nova);
    setSessaoExpirou(false);
    setSessao(nova);
  }, []);

  const trocar = useCallback(
    async (senhaAtual: string, novaSenha: string) => {
      const resposta = await autenticacao.trocarSenha(senhaAtual, novaSenha);
      apiClient.definirToken(resposta.token);
      const nova = { email: sessao?.email ?? "", trocarSenha: resposta.trocarSenha };
      guardarSessao(nova);
      setSessao(nova);
    },
    [sessao?.email],
  );

  const sair = useCallback(() => {
    apiClient.definirToken(null);
    guardarSessao(null);
    setSessao(null);
    setSessaoExpirou(false);
  }, []);

  const valor = useMemo<ContextoDeAutenticacao>(
    () => ({
      autenticado: sessao !== null,
      email: sessao?.email ?? null,
      trocarSenha: sessao?.trocarSenha ?? false,
      sessaoExpirou,
      entrar,
      trocar,
      sair,
      limparAviso: () => setSessaoExpirou(false),
    }),
    [sessao, sessaoExpirou, entrar, trocar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoDeAutenticacao {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return contexto;
}
