import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Circle, Clock, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { ESTADO_DO_CAMPEONATO } from "@/lib/formato";
import type { EstadoDaPartida, EstadoDoCampeonato } from "@/types";

type Tom = "neutro" | "info" | "aviso" | "sucesso" | "ao-vivo" | "andamento" | "encerrado";

const TOM: Record<Tom, string> = {
  neutro: "status-upcoming",
  info: "bg-info-soft text-info",
  aviso: "bg-warning-soft text-warning",
  sucesso: "bg-success-soft text-success",
  andamento: "status-ongoing",
  encerrado: "status-finished",
  "ao-vivo": "bg-live text-live-foreground",
};

/** Selo no estilo do site (mono, maiúsculo, cantos suaves). O ícone e o texto dizem o estado, a cor não é o único sinal. */
export function Selo({ tom = "neutro", icone, children, className }: { tom?: Tom; icone?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs uppercase", TOM[tom], className)}>
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
      return <Selo tom="encerrado" icone={<CheckCircle2 aria-hidden="true" className="h-3 w-3" />}>Finalizada</Selo>;
    case "ANULADA":
      return <Selo tom="aviso" icone={<AlertTriangle aria-hidden="true" className="h-3 w-3" />}>Cancelada</Selo>;
  }
}

export function SeloDoCampeonato({ estado }: { estado: EstadoDoCampeonato }) {
  const tom: Tom = estado === "EM_ANDAMENTO" ? "andamento" : estado === "ENCERRADO" ? "encerrado" : "neutro";
  return <Selo tom={tom}>{ESTADO_DO_CAMPEONATO[estado]}</Selo>;
}

export function SeloDaTemporada({ encerrada }: { encerrada: boolean }) {
  return <Selo tom={encerrada ? "encerrado" : "andamento"}>{encerrada ? "Encerrada" : "Ativa"}</Selo>;
}
