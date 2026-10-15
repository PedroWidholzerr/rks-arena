import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Largura e altura em classes do Tailwind (a imagem é quadrada e sempre aparece inteira). */
  tamanho?: string;
  className?: string;
}

/**
 * Logo do Rising Kings, completo e sem cortes (object-contain). O arquivo tem fundo preto, então fica numa pastilha
 * escura, que o integra aos dois temas.
 */
export function Logo({ tamanho = "h-14 w-14", className }: LogoProps) {
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden rounded-lg bg-black", tamanho, className)}>
      <img src="/logo-rks.png" alt="Rising Kings E-Sports" className="h-full w-full object-contain" />
    </span>
  );
}

/** Marca do cabeçalho: logo completo e o nome do site. */
export function Marca({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <Link to="/" onClick={aoNavegar} className="flex items-center gap-3 rounded-md" aria-label="RKS Arena, página inicial">
      <Logo tamanho="h-12 w-12 sm:h-14 sm:w-14" />
      <span className="font-display text-lg font-bold uppercase tracking-tighter text-foreground sm:text-xl">
        RKS <span className="text-accent-text">Arena</span>
      </span>
    </Link>
  );
}
