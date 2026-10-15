import { Link } from "react-router-dom";
import { SeloDoCampeonato } from "@/components/SeloEstado";
import { MODO } from "@/lib/formato";
import type { Campeonato } from "@/types";

/** Cartão de Campeonato no estilo do site: selo de estado, nome em destaque e os dados do formato. */
export function CartaoDeCampeonato({ campeonato }: { campeonato: Campeonato }) {
  return (
    <Link to={`/campeonatos/${campeonato.id}`} className="block h-full">
      <div className="esports-card h-full p-6">
        <div className="mb-3 flex items-center gap-2">
          <SeloDoCampeonato estado={campeonato.estado} />
          <span className="font-mono text-xs text-muted-foreground">{MODO[campeonato.modo]}</span>
        </div>
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">{campeonato.nome}</h3>
        {campeonato.descricao ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{campeonato.descricao}</p> : null}
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <span className="numero">{campeonato.tamanhoTime}×{campeonato.tamanhoTime}</span> · melhor de <span className="numero">{campeonato.configuracao.melhorDe}</span>
        </p>
      </div>
    </Link>
  );
}
