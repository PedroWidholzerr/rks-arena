import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Altura em classes do Tailwind; a largura acompanha a proporção do desenho. */
  altura?: string;
  className?: string;
}

/** Logo do Rising Kings, completo e sem cortes, com fundo transparente: serve nos temas claro e escuro. */
export function Logo({ altura = "h-12", className }: LogoProps) {
  return <img src="/logo-rks.png" alt="Rising Kings E-Sports" className={cn("w-auto shrink-0 object-contain", altura, className)} />;
}

/** Marca do cabeçalho: logo e o nome do site. */
export function Marca({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <Link to="/" onClick={aoNavegar} className="flex items-center gap-3 rounded-md" aria-label="RKS Arena, página inicial">
      <Logo altura="h-12 sm:h-14" />
      <span className="font-display text-lg font-bold uppercase tracking-tighter text-foreground sm:text-xl">
        RKS <span className="text-accent-text">Arena</span>
      </span>
    </Link>
  );
}
