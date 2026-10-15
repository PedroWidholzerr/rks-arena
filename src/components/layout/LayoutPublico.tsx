import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Menu, Shield, Swords, Trophy, User, Users, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marca } from "./Marca";
import { PularParaConteudo } from "./PularParaConteudo";

interface Item {
  para: string;
  rotulo: string;
  Icone: LucideIcon;
  fim?: boolean;
}

export const LINKS_PUBLICOS: Item[] = [
  { para: "/", rotulo: "Início", Icone: Trophy, fim: true },
  { para: "/temporadas", rotulo: "Temporadas", Icone: CalendarDays },
  { para: "/campeonatos", rotulo: "Campeonatos", Icone: Swords },
  { para: "/agenda", rotulo: "Agenda", Icone: CalendarDays },
  { para: "/times", rotulo: "Times", Icone: Users },
  { para: "/jogadores", rotulo: "Jogadores", Icone: User },
];

const classeDoLink = (ativo: boolean, tamanho: "sm" | "base") =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 font-mono uppercase tracking-wider transition-colors",
    tamanho === "sm" ? "text-xs" : "min-h-12 text-sm",
    ativo ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
  );

/** Layout público: barra fixa com desfoque, links em mono maiúsculo e menu recolhível no celular. */
export default function LayoutPublico() {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PularParaConteudo />
      <nav aria-label="Principal" className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Marca />
          <div className="hidden items-center gap-1 md:flex">
            {LINKS_PUBLICOS.map(({ para, rotulo, Icone, fim }) => (
              <NavLink key={para} to={para} end={fim} className={({ isActive }) => classeDoLink(isActive, "sm")}>
                <Icone aria-hidden="true" className="h-4 w-4" />
                {rotulo}
              </NavLink>
            ))}
            <Link
              to="/admin"
              className="ml-2 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
            >
              <Shield aria-hidden="true" className="h-4 w-4" />
              Admin
            </Link>
          </div>
          <button
            type="button"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            onClick={() => setAberto(!aberto)}
            className="flex h-11 w-11 items-center justify-center text-muted-foreground md:hidden"
          >
            {aberto ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
          </button>
        </div>
        <AnimatePresence>
          {aberto ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                {LINKS_PUBLICOS.map(({ para, rotulo, Icone, fim }) => (
                  <NavLink key={para} to={para} end={fim} onClick={() => setAberto(false)} className={({ isActive }) => classeDoLink(isActive, "base")}>
                    <Icone aria-hidden="true" className="h-4 w-4" />
                    {rotulo}
                  </NavLink>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setAberto(false)}
                  className="flex min-h-12 items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-sm uppercase tracking-wider text-primary"
                >
                  <Shield aria-hidden="true" className="h-4 w-4" />
                  Admin
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
      <main id="conteudo" tabIndex={-1} className="container mx-auto px-4 py-10 focus:outline-none">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <p>RKS Arena · Rising Kings</p>
          <Link to="/entrar" className="inline-flex min-h-toque items-center text-primary hover:underline">
            Administração
          </Link>
        </div>
      </footer>
    </div>
  );
}
