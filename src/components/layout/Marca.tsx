import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

/** Marca do cabeçalho: escudo ciano e "RKS Arena" em caixa alta. */
export function Marca({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <Link to="/" onClick={aoNavegar} className="flex items-center gap-2 rounded-md" aria-label="RKS Arena, página inicial">
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Shield className="h-5 w-5 text-primary" />
      </span>
      <span className="font-display text-lg font-bold uppercase tracking-tighter text-foreground">
        RKS <span className="text-primary">Arena</span>
      </span>
    </Link>
  );
}
