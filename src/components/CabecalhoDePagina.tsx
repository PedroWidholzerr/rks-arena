import type { ReactNode } from "react";
import { useTituloDaPagina } from "@/hooks/useTituloDaPagina";

interface Props {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  /** Título grande, usado na página inicial e na do Campeonato. */
  destaque?: boolean;
}

/** Título de página em caixa alta no estilo do site; cada rota muda o <h1> e o título do documento. */
export function CabecalhoDePagina({ titulo, descricao, acoes, destaque = false }: Props) {
  useTituloDaPagina(titulo);
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1
          className={
            destaque
              ? "font-display text-4xl font-bold uppercase tracking-tighter text-foreground md:text-5xl"
              : "font-display text-3xl font-bold uppercase tracking-tighter text-foreground md:text-4xl"
          }
        >
          {titulo}
        </h1>
        {descricao ? <div className="mt-2 text-sm text-muted-foreground">{descricao}</div> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}
