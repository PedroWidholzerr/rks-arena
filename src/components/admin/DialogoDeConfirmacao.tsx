import { useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  /** Título curto na forma de pergunta ("Anular o resultado?"). */
  titulo: string;
  /** Lista do que será afetado, uma linha por item. */
  afetados?: string[];
  /** Frase de consequência. */
  consequencia?: ReactNode;
  /** Verbo da ação, nunca "OK" nem "Sim" ("Anular resultado"). */
  rotuloDaAcao: string;
  /** `destrutiva` (padrão) usa o botão vermelho; `normal` usa o primário. */
  tom?: "destrutiva" | "normal";
  aoConfirmar: () => Promise<unknown> | unknown;
}

const LIMITE_DA_LISTA = 8;

/**
 * Confirmação destrutiva (EXPERIENCE.md): título em pergunta, lista do que será afetado, frase de consequência e
 * dois botões, a ação à direita e "Cancelar" à esquerda. O foco inicial vai para "Cancelar". Com mais de 8 itens,
 * mostra 8 e "e mais N", com "Ver todos" expandindo no próprio diálogo.
 */
export function DialogoDeConfirmacao({ aberto, aoMudar, titulo, afetados = [], consequencia, rotuloDaAcao, tom = "destrutiva", aoConfirmar }: Props) {
  const [verTodos, setVerTodos] = useState(false);
  const [executando, setExecutando] = useState(false);
  const visiveis = verTodos ? afetados : afetados.slice(0, LIMITE_DA_LISTA);
  const restantes = afetados.length - visiveis.length;

  const confirmar = async () => {
    setExecutando(true);
    try {
      await aoConfirmar();
      aoMudar(false);
    } finally {
      setExecutando(false);
    }
  };

  return (
    <AlertDialog open={aberto} onOpenChange={(valor) => (executando ? undefined : aoMudar(valor))}>
      <AlertDialogContent className="shadow-flutuante">
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left text-foreground">
              {afetados.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {visiveis.map((item, indice) => (
                    <li key={`${indice}-${item}`} className="flex items-start gap-2">
                      <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {restantes > 0 ? (
                    <li>
                      e mais <span className="numero">{restantes}</span>{" "}
                      <button type="button" className="text-accent-text underline underline-offset-2" onClick={() => setVerTodos(true)}>
                        Ver todos
                      </button>
                    </li>
                  ) : null}
                </ul>
              ) : null}
              {consequencia ? <p className="text-sm">{consequencia}</p> : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-between sm:space-x-0">
          {/* O Radix dá o foco inicial ao primeiro botão do rodapé: "Cancelar" vem primeiro de propósito. */}
          <AlertDialogCancel disabled={executando} className="mt-0 min-h-toque">
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant={tom === "destrutiva" ? "destructive" : "default"}
            className={cn("min-h-toque")}
            disabled={executando}
            onClick={() => void confirmar()}
          >
            {executando ? "Aguarde…" : rotuloDaAcao}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
