import { Match } from "@/types";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayersHook";
import { TeamLogo } from "@/components/teams/TeamCard";
import { Calendar, Award } from "lucide-react";

interface MatchCardProps {
  match: Match;
}

/** Parse scheduledAt sem conversão de timezone (backend usa LocalDateTime com Z literal) */
function formatMatchDate(iso: string): string {
  const clean = iso.replace(/\.?\d*[Zz]$/, "");
  const [datePart, timePart = "00:00"] = clean.split("T");
  const [y, m, d] = datePart.split("-");
  const [hh, mm] = timePart.split(":");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(m) - 1]} ${d}, ${y} • ${hh}:${mm}`;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { data: teams = [] } = useTeams();
  const { data: players = [] } = usePlayers();

  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const mvp = match.mvpPlayerId ? players.find(p => p.id === match.mvpPlayerId) : null;
  const isPlayed = match.scoreA > 0 || match.scoreB > 0;

  if (!teamA || !teamB) {
    return (
      <div className="esports-card p-4">
        <p className="text-sm text-muted-foreground">Carregando partida...</p>
      </div>
    );
  }

  return (
    <div className="esports-card p-4">
      <div className="flex items-center justify-between">
        {/* Team A */}
        <div className="flex flex-1 items-center gap-3">
          <TeamLogo team={teamA} size="sm" />
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-foreground">{teamA.name}</p>
            <span className="font-mono text-xs text-muted-foreground">{teamA.tag}</span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 px-4">
          <span className={`font-mono text-2xl font-bold tabular-nums ${isPlayed && match.scoreA > match.scoreB ? "win-text" : isPlayed ? "loss-text" : "text-muted-foreground"}`}>
            {match.scoreA}
          </span>
          <span className="font-mono text-sm text-muted-foreground">vs</span>
          <span className={`font-mono text-2xl font-bold tabular-nums ${isPlayed && match.scoreB > match.scoreA ? "win-text" : isPlayed ? "loss-text" : "text-muted-foreground"}`}>
            {match.scoreB}
          </span>
        </div>

        {/* Team B */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="text-right">
            <p className="font-display text-sm font-bold tracking-tight text-foreground">{teamB.name}</p>
            <span className="font-mono text-xs text-muted-foreground">{teamB.tag}</span>
          </div>
          <TeamLogo team={teamB} size="sm" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span className="font-mono">{formatMatchDate(match.scheduledAt)}</span>
        </div>
        {mvp && (
          <div className="flex items-center gap-1 text-xs">
            <Award className="h-3 w-3 text-accent" />
            <span className="font-mono text-accent">MVP: {mvp.nickname}</span>
          </div>
        )}
        {!isPlayed && (
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">Agendada</span>
        )}
      </div>
    </div>
  );
}
