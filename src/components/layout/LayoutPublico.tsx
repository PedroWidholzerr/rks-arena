import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Menu, Shield, Swords, Trophy, User, Users, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marca } from "./Marca";
import { PularParaConteudo } from "./PularParaConteudo";
import { TemaToggle } from "./TemaToggle";

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

/** Largura e respiro do conteúdo: fluido no celular e limitado numa tela grande, sempre alinhado ao cabeçalho. */
export const ESPACO = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const classeDoLink = (ativo: boolean, tamanho: "sm" | "base") =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 font-mono uppercase tracking-wider transition-colors",
    tamanho === "sm" ? "text-xs" : "min-h-12 text-sm",
    ativo ? "bg-primary/15 text-accent-text" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
  );

/** Layout público: barra fixa com desfoque, links em mono maiúsculo, tema claro/escuro e menu recolhível no celular. */
export default function LayoutPublico() {
  const [aberto, setAberto] = useState(false);
  const naInicial = useLocation().pathname === "/";
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PularParaConteudo />
      <nav aria-label="Principal" className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className={cn(ESPACO, "flex h-[4.5rem] items-center justify-between gap-2")}>
          <Marca />
          <div className="hidden items-center gap-1 lg:flex">
            {LINKS_PUBLICOS.map(({ para, rotulo, Icone, fim }) => (
              <NavLink key={para} to={para} end={fim} className={({ isActive }) => classeDoLink(isActive, "sm")}>
                <Icone aria-hidden="true" className="h-4 w-4" />
                {rotulo}
              </NavLink>
            ))}
            <Link
              to="/admin"
              className="ml-2 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-accent-text transition-colors hover:bg-primary/20"
            >
              <Shield aria-hidden="true" className="h-4 w-4" />
              Admin
            </Link>
            <TemaToggle />
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <TemaToggle />
            <button
              type="button"
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={aberto}
              onClick={() => setAberto(!aberto)}
              className="flex h-11 w-11 items-center justify-center text-muted-foreground"
            >
              {aberto ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {aberto ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-border lg:hidden"
            >
              <div className={cn(ESPACO, "flex flex-col gap-1 py-4")}>
                {LINKS_PUBLICOS.map(({ para, rotulo, Icone, fim }) => (
                  <NavLink key={para} to={para} end={fim} onClick={() => setAberto(false)} className={({ isActive }) => classeDoLink(isActive, "base")}>
                    <Icone aria-hidden="true" className="h-4 w-4" />
                    {rotulo}
                  </NavLink>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setAberto(false)}
                  className="flex min-h-12 items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-sm uppercase tracking-wider text-accent-text"
                >
                  <Shield aria-hidden="true" className="h-4 w-4" />
                  Admin
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>

      {/* A página inicial tem herói de largura total e cuida do próprio espaçamento. */}
      <main id="conteudo" tabIndex={-1} className={cn("flex-1 focus:outline-none", !naInicial && cn(ESPACO, "py-8 md:py-10"))}>
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className={cn(ESPACO, "py-6 font-mono text-xs uppercase tracking-wider text-muted-foreground")}>
          <p>RKS Arena · Rising Kings E-Sports</p>
        </div>
      </footer>
    </div>
  );
}
