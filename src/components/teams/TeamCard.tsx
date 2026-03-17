
import { Team } from "@/types";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { usePlayers } from "@/hooks/usePlayersHook";
import { resolveTeamLogoUrl } from "@/services/teams";

interface TeamLogoProps {
  team: Team;
  size?: "sm" | "md" | "lg";
}

export function TeamLogo({ team, size = "md" }: TeamLogoProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-sm", lg: "h-20 w-20 text-xl" };
  const logoUrl = resolveTeamLogoUrl(team.logoUrl);

  if (logoUrl) {
    return <img src={logoUrl} alt={team.name} className={`${sizes[size]} rounded-md object-cover`} />;
  }

  return (
    <div className={`${sizes[size]} flex items-center justify-center rounded-md bg-primary/10 font-mono font-bold text-primary`}>
      {team.tag}
    </div>
  );
}

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const { data: players = [], isLoading } = usePlayers();
  const teamPlayers = players.filter(p => p.teamId === team.id);
  const captain = teamPlayers.find(p => p.isCaptain);

  return (
    <Link to={`/teams/${team.id}`} className="block">
      <div className="esports-card p-5 transition-all hover:scale-[1.02]">
        <div className="flex items-start gap-4">
          <TeamLogo team={team} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground">{team.name}</h3>
              <span className="tag-badge">{team.tag}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{team.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="font-mono">{isLoading ? '-' : teamPlayers.length} jogadores</span>
              </div>
              {captain && (
                <div className="text-xs text-muted-foreground">
                  Capitão: <span className="font-mono text-primary">{captain.nickname}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
