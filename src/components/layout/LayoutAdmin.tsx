import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CalendarDays, ClipboardList, Layers, LogOut, Shield, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { PularParaConteudo } from "./PularParaConteudo";

interface Area {
  para: string;
  rotulo: string;
  Icone: LucideIcon;
  fim?: boolean;
}

/** As 8 áreas do painel, na ordem e com os nomes do EXPERIENCE.md. */
export const AREAS_DO_ADMIN: Area[] = [
  { para: "/admin", rotulo: "Pendências", Icone: Bell, fim: true },
  { para: "/admin/campeonatos", rotulo: "Campeonatos", Icone: Trophy },
  { para: "/admin/fases", rotulo: "Fases", Icone: Layers },
  { para: "/admin/partidas", rotulo: "Partidas", Icone: CalendarDays },
  { para: "/admin/inscricoes", rotulo: "Inscrições", Icone: ClipboardList },
  { para: "/admin/times", rotulo: "Times", Icone: Users },
  { para: "/admin/jogadores", rotulo: "Jogadores", Icone: UserRound },
  { para: "/admin/administradores", rotulo: "Administradores", Icone: Shield },
];

/** Painel admin: barra lateral de 224 px no desktop e faixa rolável no celular, em mono maiúsculo. */
export default function LayoutAdmin() {
  const { email, sair } = useAuth();
  const navegar = useNavigate();

  const aoSair = () => {
    sair();
    navegar("/entrar");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PularParaConteudo />
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface p-4 md:block">
        <Link to="/" className="mb-6 flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="h-3 w-3" /> Voltar ao site
        </Link>
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Painel Admin</p>
        <nav aria-label="Áreas do painel" className="flex flex-col gap-1">
          {AREAS_DO_ADMIN.map(({ para, rotulo, Icone, fim }) => (
            <NavLink
              key={para}
              to={para}
              end={fim}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              <Icone aria-hidden="true" className="h-4 w-4" />
              {rotulo}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-8">
            <Link to="/" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground md:hidden">
              <ArrowLeft aria-hidden="true" className="h-3 w-3" /> Site
            </Link>
            <div className="ml-auto flex items-center gap-1">
              {email ? <span className="hidden max-w-[16rem] truncate font-mono text-xs text-muted-foreground sm:inline">{email}</span> : null}
              <Button asChild variant="ghost" className="min-h-toque font-mono text-xs uppercase tracking-wider">
                <Link to="/troque-sua-senha">Trocar senha</Link>
              </Button>
              <Button variant="ghost" className="min-h-toque font-mono text-xs uppercase tracking-wider" onClick={aoSair}>
                <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
          <nav aria-label="Áreas do painel" className="overflow-x-auto border-t border-border bg-surface p-2 md:hidden">
            <div className="flex gap-1">
              {AREAS_DO_ADMIN.map(({ para, rotulo, Icone, fim }) => (
                <NavLink
                  key={para}
                  to={para}
                  end={fim}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-toque items-center gap-1 whitespace-nowrap rounded-md px-3 font-mono text-xs uppercase tracking-wider",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    )
                  }
                >
                  <Icone aria-hidden="true" className="h-3 w-3" />
                  {rotulo}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>
        <main id="conteudo" tabIndex={-1} className="flex-1 p-4 focus:outline-none md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
