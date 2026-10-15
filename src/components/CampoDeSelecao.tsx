import type { SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  rotulo: string;
  opcoes: Array<{ valor: string; texto: string }>;
  valor: string;
  aoMudar: (valor: string) => void;
}

/** Seleção nativa (acessível, boa no celular), com rótulo sempre visível e alvo de 44 px. */
export function CampoDeSelecao({ rotulo, opcoes, valor, aoMudar, className, id, ...resto }: Props) {
  const identificador = id ?? `campo-${rotulo.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={identificador} className="text-sm font-medium">
        {rotulo}
      </Label>
      <select
        id={identificador}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={cn("min-h-11 rounded-md border border-input bg-card px-3 text-base", className)}
        {...resto}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  );
}
