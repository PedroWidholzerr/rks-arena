import { useState } from "react";
import { teams } from "@/lib/mockData";
import { Team } from "@/types";
import { TeamLogo } from "@/components/teams/TeamCard";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ManageTeams() {
  const [items] = useState<Team[]>(teams);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Teams</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20">
          <Plus className="h-4 w-4" /> New Team
        </button>
      </div>

      <div className="esports-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Team</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Tag</th>
              <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <TeamLogo team={item} size="sm" />
                    <span className="font-display text-sm font-semibold text-foreground">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2"><span className="tag-badge">{item.tag}</span></td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
