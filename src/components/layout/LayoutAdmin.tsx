import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, ClipboardList, Layers, LogOut, Menu, Shield, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Marca } from "./Marca";
import { PularParaConteudo } from "./PularParaConteudo";
import { TemaToggle } from "./TemaToggle";

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

function Navegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <nav aria-label="Áreas do painel" className="flex flex-col gap-1">
      {AREAS_DO_ADMIN.map(({ para, rotulo, Icone, fim }) => (
        <NavLink
          key={para}
          to={para}
          end={fim}
          onClick={aoNavegar}
          className={({ isActive }) =>
            cn(
              "flex min-h-toque items-center gap-3 border-l-4 px-3 text-sm lg:min-h-9",
              isActive ? "border-primary bg-card font-semibold text-foreground" : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground",
            )
          }
        >
          <Icone aria-hidden="true" className="h-4 w-4" />
          {rotulo}
        </NavLink>
      ))}
    </nav>
  );
}

export default function LayoutAdmin() {
  const { email, sair } = useAuth();
  const navegar = useNavigate();
  const [gaveta, setGaveta] = useState(false);

  const aoSair = () => {
    sair();
    navegar("/entrar");
  };

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[240px_1fr]">
      <PularParaConteudo />
      <aside className="hidden border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 flex h-screen flex-col gap-4 p-4">
          <Marca />
          <p className="px-3 text-xs font-medium text-muted-foreground">Painel do Administrador</p>
          <Navegacao />
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-4">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={gaveta} onOpenChange={setGaveta}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="min-h-toque" aria-label="Abrir menu">
                  <Menu aria-hidden="true" className="mr-2 h-4 w-4" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar shadow-flutuante">
                <SheetHeader>
                  <SheetTitle>Painel do Administrador</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Navegacao aoNavegar={() => setGaveta(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {email ? <span className="hidden max-w-[16rem] truncate text-sm text-muted-foreground sm:inline">{email}</span> : null}
            <TemaToggle />
            <Button asChild variant="ghost" className="min-h-toque">
              <Link to="/troque-sua-senha">Trocar senha</Link>
            </Button>
            <Button variant="ghost" className="min-h-toque" onClick={aoSair}>
              <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1} className="flex-1 p-4 focus:outline-none sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
