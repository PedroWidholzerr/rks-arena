import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Estado = "carregando" | "ok" | "falhou";

const TAMANHOS = {
  24: "h-6 w-6 text-[10px]",
  28: "h-7 w-7 text-[11px]",
  32: "h-8 w-8 text-xs",
  40: "h-10 w-10 text-sm",
  96: "h-20 w-20 text-xl",
} as const;

interface Props {
  /** URL pública da imagem; ausente ou com falha, mostra o texto (tag do Time ou iniciais do Jogador). */
  src: string | null | undefined;
  texto: string;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}

/**
 * Logo/foto com fallback de três estados (carregando, ok, falhou), no estilo do site: quadrado arredondado ciano
 * com a tag em mono. Falha nunca mostra ícone quebrado nem texto alternativo cru; tenta uma vez de novo ao voltar a aba.
 * O `alt` é vazio porque o nome fica ao lado.
 */
export function Avatar({ src, texto, tamanho = 32, className }: Props) {
  const [estado, setEstado] = useState<Estado>(src ? "carregando" : "falhou");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    setEstado(src ? "carregando" : "falhou");
    setTentativa(0);
  }, [src]);

  useEffect(() => {
    if (estado !== "falhou" || !src || tentativa >= 1) return undefined;
    const aoVoltar = () => {
      if (document.visibilityState === "visible") {
        setTentativa((t) => t + 1);
        setEstado("carregando");
      }
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [estado, src, tentativa]);

  const mostrarImagem = Boolean(src) && estado !== "falhou";
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 font-mono font-bold text-primary",
        TAMANHOS[tamanho],
        className,
      )}
    >
      {/* O fallback aparece sem piscar enquanto a imagem carrega; a imagem entra por cima. */}
      <span aria-hidden={mostrarImagem && estado === "ok"} className={estado === "ok" ? "invisible" : undefined}>
        {texto}
      </span>
      {mostrarImagem ? (
        <img
          key={tentativa}
          src={src ?? undefined}
          alt=""
          loading="lazy"
          onLoad={() => setEstado("ok")}
          onError={() => setEstado("falhou")}
          className={cn("absolute inset-0 h-full w-full object-cover", estado === "ok" ? "opacity-100" : "opacity-0")}
        />
      ) : null}
    </span>
  );
}
