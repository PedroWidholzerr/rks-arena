import { ChampionshipTeam } from "@/types";
import { getTeamById } from "@/lib/mockData";
import { TeamLogo } from "@/components/teams/TeamCard";

interface StandingsTableProps {
  standings: ChampionshipTeam[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="esports-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-background">
            <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">#</th>
            <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Team</th>
            <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">W</th>
            <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">L</th>
            <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry, index) => {
            const team = getTeamById(entry.teamId);
            if (!team) return null;
            return (
              <tr
                key={entry.id}
                className="h-12 border-b border-border transition-colors last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]"
              >
                <td className="px-4 py-2 font-mono text-sm text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <TeamLogo team={team} size="sm" />
                    <div>
                      <span className="font-display text-sm font-semibold text-foreground">{team.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{team.tag}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-center font-mono text-sm win-text">{entry.wins}</td>
                <td className="px-4 py-2 text-center font-mono text-sm loss-text">{entry.losses}</td>
                <td className="px-4 py-2 text-center font-mono text-sm font-bold text-foreground">{entry.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
