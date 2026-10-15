import { useEffect } from "react";

/** Troca o título do documento a cada rota, para leitor de tela e para a aba do navegador. */
export function useTituloDaPagina(titulo: string): void {
  useEffect(() => {
    document.title = `${titulo} · RKS Arena`;
  }, [titulo]);
}
