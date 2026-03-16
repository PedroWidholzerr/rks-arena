import { useState } from "react";
import { players, getTeamById } from "@/lib/mockData";
import { Player } from "@/types";
import { Plus, Pencil, Trash2, Crown } from "lucide-react";

export default function ManagePlayers() {
  const [items] = useState<Player[]>(players);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Players</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20">
          <Plus className="h-4 w-4" /> New Player
        </button>
      </div>

      <div className="esports-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Nickname</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Tag</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Team</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const team = getTeamById(item.teamId);
              return (
                <tr key={item.id} className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]">
                  <td className="px-4 py-2 font-display text-sm font-semibold text-foreground">{item.nickname}</td>
                  <td className="px-4 py-2"><span className="tag-badge">{item.tag}</span></td>
                  <td className="px-4 py-2 font-mono text-sm text-muted-foreground">{team?.name}</td>
                  <td className="px-4 py-2">
                    {item.isCaptain && (
                      <span className="flex items-center gap-1 text-xs text-accent">
                        <Crown className="h-3 w-3" /> Captain
                      </span>
                    )}
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
