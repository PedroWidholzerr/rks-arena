
import { Team } from "@/types";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { usePlayers } from "@/hooks/usePlayersHook";
import { resolveTeamLogoUrl } from "@/services/teams";
import { useState } from "react";

interface TeamLogoProps {
  team: Team;
  size?: "sm" | "md" | "lg";
}

export function TeamLogo({ team, size = "md" }: TeamLogoProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-sm", lg: "h-20 w-20 text-xl" };
  const logoUrl = resolveTeamLogoUrl(team.logoUrl);
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={team.name}
        className={`${sizes[size]} shrink-0 rounded-md object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${sizes[size]} shrink-0 flex items-center justify-center rounded-md bg-primary/10 font-mono font-bold text-primary`}>
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

  // Remove trailing commas/spaces from description
  const cleanDescription = team.description?.replace(/[,\s]+$/, "") || "";

  return (
    <Link to={`/teams/${team.id}`} className="block h-full">
      <div className="esports-card p-5 transition-all hover:scale-[1.02] h-full flex flex-col">
        <div className="flex items-start gap-4 flex-1 min-h-0">
          <TeamLogo team={team} size="lg" />
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground truncate">{team.name}</h3>
              <span className="tag-badge shrink-0">{team.tag}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cleanDescription}</p>
            <div className="mt-auto pt-3 flex items-center gap-3">
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
