import { Link } from "react-router-dom";
import { SeloDoCampeonato } from "@/components/SeloEstado";
import { MODO } from "@/lib/formato";
import type { Campeonato } from "@/types";

/** Cartão de Campeonato: nome, Modo, tamanho do time, melhor de N e estado. */
export function CartaoDeCampeonato({ campeonato }: { campeonato: Campeonato }) {
  return (
    <Link to={`/campeonatos/${campeonato.id}`} className="block rounded-md border border-border bg-card p-4 hover:bg-accent">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{campeonato.nome}</h3>
        <SeloDoCampeonato estado={campeonato.estado} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {MODO[campeonato.modo]} · <span className="numero">{campeonato.tamanhoTime}×{campeonato.tamanhoTime}</span> · melhor de{" "}
        <span className="numero">{campeonato.configuracao.melhorDe}</span>
      </p>
    </Link>
  );
}
