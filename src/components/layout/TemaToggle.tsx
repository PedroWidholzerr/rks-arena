import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const OPCOES = [
  { valor: "light", rotulo: "Claro", Icone: Sun },
  { valor: "dark", rotulo: "Escuro", Icone: Moon },
  { valor: "system", rotulo: "Sistema", Icone: Monitor },
] as const;

/** Claro, Escuro ou Sistema; a escolha fica lembrada no navegador (next-themes). */
export function TemaToggle() {
  const { theme = "system", setTheme } = useTheme();
  const atual = OPCOES.find((o) => o.valor === theme) ?? OPCOES[2];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11" aria-label={`Tema: ${atual.rotulo}. Alterar tema`}>
          <atual.Icone aria-hidden="true" className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-flutuante">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {OPCOES.map(({ valor, rotulo, Icone }) => (
            <DropdownMenuRadioItem key={valor} value={valor} className="min-h-toque gap-2">
              <Icone aria-hidden="true" className="h-4 w-4" />
              {rotulo}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
