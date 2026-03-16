import { Link } from "react-router-dom";
import { Calendar, Trophy, Users, User, Swords } from "lucide-react";
import { seasons, championships, teams, players, matches } from "@/lib/mockData";

const stats = [
  { label: "Seasons", value: () => seasons.length, icon: Calendar, path: "/admin/seasons" },
  { label: "Championships", value: () => championships.length, icon: Trophy, path: "/admin/championships" },
  { label: "Teams", value: () => teams.length, icon: Users, path: "/admin/teams" },
  { label: "Players", value: () => players.length, icon: User, path: "/admin/players" },
  { label: "Matches", value: () => matches.length, icon: Swords, path: "/admin/matches" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground mb-8">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.path}>
            <div className="esports-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-3xl font-bold text-foreground tabular-nums">{stat.value()}</p>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
