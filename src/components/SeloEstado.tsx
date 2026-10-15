import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Circle, Clock, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { ESTADO_DO_CAMPEONATO } from "@/lib/formato";
import type { EstadoDaPartida, EstadoDoCampeonato } from "@/types";

type Tom = "neutro" | "info" | "aviso" | "sucesso" | "ao-vivo";

const TOM: Record<Tom, string> = {
  neutro: "bg-surface-muted text-foreground",
  info: "bg-info-soft text-foreground [&>svg]:text-info",
  aviso: "bg-warning-soft text-foreground [&>svg]:text-warning",
  sucesso: "bg-success-soft text-foreground [&>svg]:text-success",
  "ao-vivo": "bg-live text-live-foreground",
};

/** Selo de 12 px com ícone e texto: a cor nunca é o único sinal (DESIGN.md, Selos de estado). */
export function Selo({ tom = "neutro", icone, children, className }: { tom?: Tom; icone?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tracking-wide", TOM[tom], className)}>
      {icone}
      {children}
    </span>
  );
}

export function SeloDaPartida({ estado, aoVivo = false }: { estado: EstadoDaPartida; aoVivo?: boolean }) {
  if (aoVivo) {
    return (
      <Selo tom="ao-vivo" icone={<Radio aria-hidden="true" className="h-3 w-3" />}>
        Ao vivo
      </Selo>
    );
  }
  switch (estado) {
    case "AGENDADA":
      return <Selo icone={<Clock aria-hidden="true" className="h-3 w-3" />}>Agendada</Selo>;
    case "EM_ANDAMENTO":
      return <Selo tom="info" icone={<Circle aria-hidden="true" className="h-3 w-3" />}>Em andamento</Selo>;
    case "FINALIZADA":
      return <Selo icone={<CheckCircle2 aria-hidden="true" className="h-3 w-3" />}>Finalizada</Selo>;
    case "ANULADA":
      return <Selo tom="aviso" icone={<AlertTriangle aria-hidden="true" className="h-3 w-3" />}>Cancelada</Selo>;
  }
}

export function SeloDoCampeonato({ estado }: { estado: EstadoDoCampeonato }) {
  const tom: Tom = estado === "EM_ANDAMENTO" ? "info" : "neutro";
  return <Selo tom={tom}>{ESTADO_DO_CAMPEONATO[estado]}</Selo>;
}

export function SeloDaTemporada({ encerrada }: { encerrada: boolean }) {
  return <Selo tom={encerrada ? "neutro" : "sucesso"}>{encerrada ? "Encerrada" : "Ativa"}</Selo>;
}
