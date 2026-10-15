import { mensagemDeErro } from "@/hooks/dados";
import { Alerta } from "@/components/Alerta";
import { ErroDeApi } from "@/services/apiClient";
import type { ReactNode } from "react";

/**
 * Erro de uma operação do admin: título e texto em português (sem "409", "422" nem código na tela principal); o
 * código estável fica num detalhe recolhível "Detalhes técnicos", só no admin.
 */
export function ErroDaOperacao({ erro, acao }: { erro: unknown; acao?: ReactNode }) {
  if (!erro) return null;
  const mensagem = mensagemDeErro(erro);
  return (
    <Alerta variante="erro" titulo={mensagem.titulo} acao={acao}>
      <p>{mensagem.texto}</p>
      {mensagem.codigo || erro instanceof ErroDeApi ? (
        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Detalhes técnicos</summary>
          <p className="numero mt-1">
            {mensagem.codigo ? `Código: ${mensagem.codigo}. ` : ""}
            {erro instanceof ErroDeApi ? `Resposta: ${erro.status}.` : ""}
          </p>
        </details>
      ) : null}
    </Alerta>
  );
}
