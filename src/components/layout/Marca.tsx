import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

/**
 * Marca do cabeçalho. O arquivo do logo Rising Kings tem fundo preto e halo; enquanto não houver versão com
 * fundo transparente (C-10), a marca é um monograma sobre pastilha escura, que serve nos dois temas.
 */
export function Marca({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <Link to="/" onClick={aoNavegar} className="flex min-h-toque items-center gap-2 rounded-md font-bold tracking-tight" aria-label="RKS Arena, página inicial">
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(40_5.7%_10.4%)] text-[hsl(39.2_89.1%_53.1%)] lg:h-10 lg:w-10">
        <Crown className="h-5 w-5" />
      </span>
      <span className="text-lg">RKS Arena</span>
    </Link>
  );
}
