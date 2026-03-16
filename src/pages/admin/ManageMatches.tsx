import { useState } from "react";
import { matches, getTeamById, getChampionshipById, getPlayerById } from "@/lib/mockData";
import { Match } from "@/types";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { format } from "date-fns";

export default function ManageMatches() {
  const [items] = useState<Match[]>(matches);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Matches</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20">
          <Plus className="h-4 w-4" /> New Match
        </button>
      </div>

      <div className="esports-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Championship</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Match</th>
              <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">MVP</th>
              <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const teamA = getTeamById(item.teamAId);
              const teamB = getTeamById(item.teamBId);
              const champ = getChampionshipById(item.championshipId);
              const mvp = item.mvpPlayerId ? getPlayerById(item.mvpPlayerId) : null;
              const isPlayed = item.scoreA > 0 || item.scoreB > 0;
              return (
                <tr key={item.id} className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{champ?.name}</td>
                  <td className="px-4 py-2">
                    <span className="font-display text-sm text-foreground">{teamA?.tag}</span>
                    <span className="text-muted-foreground mx-1">vs</span>
                    <span className="font-display text-sm text-foreground">{teamB?.tag}</span>
                  </td>
                  <td className="px-4 py-2 text-center font-mono text-sm">
                    {isPlayed ? (
                      <>
                        <span className={item.scoreA > item.scoreB ? "win-text" : "loss-text"}>{item.scoreA}</span>
                        <span className="text-muted-foreground mx-1">-</span>
                        <span className={item.scoreB > item.scoreA ? "win-text" : "loss-text"}>{item.scoreB}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {format(new Date(item.scheduledAt), "MMM dd, HH:mm")}
                  </td>
                  <td className="px-4 py-2">
                    {mvp && (
                      <span className="flex items-center gap-1 text-xs text-accent">
                        <Award className="h-3 w-3" /> {mvp.nickname}
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
