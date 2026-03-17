
import { Player } from "@/types";
import { Link } from "react-router-dom";
import { Crown, Award } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";

interface PlayerCardProps {
  player: Player;
  mvpCount?: number;
}

export default function PlayerCard({ player, mvpCount }: PlayerCardProps) {
  const { data: teams = [] } = useTeams();
  const team = teams.find(t => t.id === player.teamId);

  // MVP count pode ser passado por prop, se necessário
  // Se não, não mostra

  return (
    <Link to={`/players/${player.id}`} className="block">
      <div className="esports-card p-5 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 font-mono text-lg font-bold text-primary">
            {player.nickname.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold tracking-tight text-foreground">{player.nickname}</h3>
              {player.isCaptain && <Crown className="h-4 w-4 text-accent" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="tag-badge">{player.tag}</span>
              {team && (
                <span className="text-xs text-muted-foreground font-mono">{team.name}</span>
              )}
            </div>
          </div>
          {/* MVP count só se vier por prop */}
        </div>
      </div>
    </Link>
  );
}
