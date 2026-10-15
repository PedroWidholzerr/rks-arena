import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Marca } from "./Marca";
import { PularParaConteudo } from "./PularParaConteudo";
import { TemaToggle } from "./TemaToggle";

export const LINKS_PUBLICOS = [
  { para: "/", rotulo: "Início", fim: true },
  { para: "/temporadas", rotulo: "Temporadas" },
  { para: "/campeonatos", rotulo: "Campeonatos" },
  { para: "/agenda", rotulo: "Agenda" },
  { para: "/times", rotulo: "Times" },
  { para: "/jogadores", rotulo: "Jogadores" },
] as const;

const classeDoLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex min-h-toque items-center rounded-md px-3 text-sm font-medium",
    isActive ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );

export default function LayoutPublico() {
  const [gavetaAberta, setGavetaAberta] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PularParaConteudo />
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container flex h-14 items-center justify-between gap-2">
          <Marca />
          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {LINKS_PUBLICOS.map(({ para, rotulo, ...resto }) => (
              <NavLink key={para} to={para} end={"fim" in resto} className={classeDoLink}>
                {rotulo}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <TemaToggle />
            <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 md:hidden" aria-label="Abrir menu">
                  <Menu aria-hidden="true" className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 shadow-flutuante">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav aria-label="Principal" className="mt-4 flex flex-col gap-1">
                  {LINKS_PUBLICOS.map(({ para, rotulo, ...resto }) => (
                    <NavLink
                      key={para}
                      to={para}
                      end={"fim" in resto}
                      onClick={() => setGavetaAberta(false)}
                      className={(estado) => cn(classeDoLink(estado), "min-h-12 text-base")}
                    >
                      {rotulo}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="container flex-1 py-6 focus:outline-none">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-surface-muted">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-muted-foreground">
          <p>RKS Arena · campeonatos de League of Legends do Rising Kings</p>
          <Link to="/entrar" className="inline-flex min-h-toque items-center text-accent-text underline underline-offset-2">
            Administração
          </Link>
        </div>
      </footer>
    </div>
  );
}
