import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, Trophy, Users, User, Swords, LayoutDashboard, ArrowLeft } from "lucide-react";

const adminNav = [
  { path: "/admin", label: "Painel", icon: LayoutDashboard },
  { path: "/admin/seasons", label: "Temporadas", icon: Calendar },
  { path: "/admin/championships", label: "Campeonatos", icon: Trophy },
  { path: "/admin/teams", label: "Times", icon: Users },
  { path: "/admin/players", label: "Jogadores", icon: User },
  { path: "/admin/matches", label: "Partidas", icon: Swords },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-surface p-4 hidden md:block">
        <Link to="/" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Voltar ao site
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Painel Admin</p>
        <nav className="flex flex-col gap-1">
          {adminNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-border bg-surface p-2 fixed top-16 left-0 right-0 z-40 overflow-x-auto">
        <div className="flex gap-1">
          {adminNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 font-mono text-xs uppercase tracking-wider ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-10 md:pt-6 pt-20">
        <Outlet />
      </div>
    </div>
  );
}
