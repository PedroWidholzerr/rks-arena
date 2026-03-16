import { Player } from "@/types";
import { getTeamById, getMvpCountByPlayer } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { Crown, Award } from "lucide-react";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const team = getTeamById(player.teamId);
  const mvpCount = getMvpCountByPlayer(player.id);

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
          {mvpCount > 0 && (
            <div className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1">
              <Award className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs text-accent">{mvpCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
