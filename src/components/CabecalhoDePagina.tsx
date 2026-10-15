import type { ReactNode } from "react";
import { useTituloDaPagina } from "@/hooks/useTituloDaPagina";

interface Props {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  /** `display` (28 px) só no título da página inicial e do Campeonato; as demais usam `title` (20 px). */
  destaque?: boolean;
}

/** Cada rota muda o <h1> e o título do documento. */
export function CabecalhoDePagina({ titulo, descricao, acoes, destaque = false }: Props) {
  useTituloDaPagina(titulo);
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className={destaque ? "text-[1.75rem] font-bold leading-tight tracking-tight" : "text-xl font-semibold leading-snug"}>{titulo}</h1>
        {descricao ? <div className="mt-1 text-sm text-muted-foreground">{descricao}</div> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}
