import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Guarda da área admin. Sem sessão, vai para /entrar guardando a rota de destino; com troca de senha
 * pendente, qualquer rota admin leva a "Troque sua senha" antes de tudo.
 */
export function RotaAdmin() {
  const { autenticado, trocarSenha } = useAuth();
  const local = useLocation();
  if (!autenticado) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />;
  if (trocarSenha) return <Navigate to="/troque-sua-senha" replace state={{ de: local.pathname }} />;
  return <Outlet />;
}
