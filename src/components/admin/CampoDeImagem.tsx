import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TIPOS = ["image/png", "image/jpeg", "image/webp"];
const LIMITE = 2 * 1024 * 1024;

interface Props {
  rotulo: string;
  /** Imagem atual (URL pública), para mostrar antes de escolher outra. */
  atual: string | null | undefined;
  /** Texto do avatar de fallback (tag do Time ou iniciais do Jogador). */
  texto: string;
  /** Recebe o arquivo escolhido e válido, ou null quando o campo volta ao estado anterior. */
  aoEscolher: (arquivo: File | null) => void;
  erroDoEnvio?: string | null;
}

/** Validação local antes de enviar: formato e tamanho, com erro específico em português e o campo voltando ao estado anterior. */
export function validarImagem(arquivo: Pick<File, "type" | "size">): string | null {
  if (!TIPOS.includes(arquivo.type)) return "Formato não aceito. Use PNG, JPEG ou WebP.";
  if (arquivo.size > LIMITE) return "A imagem passa de 2 MB. Escolha um arquivo menor.";
  return null;
}

/**
 * Campo de arquivo (logo ou foto): prévia circular local antes de enviar, limite e formatos no texto de ajuda,
 * e erros específicos (formato, tamanho, falha de envio). O servidor valida o conteúdo de novo.
 */
export function CampoDeImagem({ rotulo, atual, texto, aoEscolher, erroDoEnvio }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const aoSelecionar = (arquivo: File | undefined) => {
    if (!arquivo) return;
    const problema = validarImagem(arquivo);
    if (problema) {
      setErro(problema);
      setPrevia(null);
      aoEscolher(null);
      if (entrada.current) entrada.current.value = "";
      return;
    }
    setErro(null);
    setPrevia(URL.createObjectURL(arquivo));
    aoEscolher(arquivo);
  };

  const mensagem = erro ?? erroDoEnvio ?? null;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="campo-de-imagem">{rotulo}</Label>
      <div className="flex items-center gap-4">
        <Avatar src={previa ?? atual} texto={texto} tamanho={96} />
        <div className="space-y-2">
          <input
            ref={entrada}
            id="campo-de-imagem"
            type="file"
            accept={TIPOS.join(",")}
            aria-describedby="ajuda-imagem"
            aria-invalid={mensagem ? true : undefined}
            className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-md file:border file:border-border-strong file:bg-card file:px-3"
            onChange={(e) => aoSelecionar(e.target.files?.[0])}
          />
          {previa ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-toque"
              onClick={() => {
                setPrevia(null);
                aoEscolher(null);
                if (entrada.current) entrada.current.value = "";
              }}
            >
              Desfazer a escolha
            </Button>
          ) : null}
        </div>
      </div>
      <p id="ajuda-imagem" className="text-sm text-muted-foreground">
        PNG, JPEG ou WebP, até 2 MB. A imagem é reduzida para 512 px.
      </p>
      {mensagem ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {mensagem}
        </p>
      ) : null}
    </div>
  );
}
