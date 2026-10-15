import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variante = "erro" | "aviso" | "info" | "sucesso";

const ESTILO: Record<Variante, { fundo: string; barra: string; icone: string; Icone: typeof Info; papel: "alert" | "status" }> = {
  erro: { fundo: "bg-danger-soft", barra: "border-l-danger", icone: "text-danger", Icone: XCircle, papel: "alert" },
  aviso: { fundo: "bg-warning-soft", barra: "border-l-warning", icone: "text-warning", Icone: AlertTriangle, papel: "status" },
  info: { fundo: "bg-info-soft", barra: "border-l-info", icone: "text-info", Icone: Info, papel: "status" },
  sucesso: { fundo: "bg-success-soft", barra: "border-l-success", icone: "text-success", Icone: CheckCircle2, papel: "status" },
};

interface Props {
  variante: Variante;
  titulo: string;
  children?: ReactNode;
  acao?: ReactNode;
  className?: string;
}

/**
 * Aviso do DESIGN.md: fundo *-soft, barra lateral de 4 px na cor cheia, ícone, título e corpo em texto.
 * A cor nunca é o único sinal: o ícone e o título dizem o que houve.
 */
export function Alerta({ variante, titulo, children, acao, className }: Props) {
  const { fundo, barra, icone, Icone, papel } = ESTILO[variante];
  return (
    <div role={papel} className={cn("flex gap-3 rounded-md border border-l-4 border-border p-4 text-foreground", fundo, barra, className)}>
      <Icone aria-hidden="true" className={cn("mt-0.5 h-5 w-5 shrink-0", icone)} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{titulo}</p>
        {children ? <div className="mt-1 text-sm">{children}</div> : null}
        {acao ? <div className="mt-3">{acao}</div> : null}
      </div>
    </div>
  );
}
