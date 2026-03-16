import { useParams, Link } from "react-router-dom";
import { getPlayerById, getTeamById, getMatchesByTeam, getMvpCountByPlayer, getChampionshipsByTeam, matches } from "@/lib/mockData";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowLeft, Crown, Award, Trophy, Swords } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const player = getPlayerById(id!);

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Player not found.</p>
        <Link to="/players" className="text-primary mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  const team = getTeamById(player.teamId);
  const mvpCount = getMvpCountByPlayer(player.id);
  const playerMatches = matches.filter(m => m.teamAId === player.teamId || m.teamBId === player.teamId);
  const playedMatches = playerMatches.filter(m => m.scoreA > 0 || m.scoreB > 0);
  const champHistory = team ? getChampionshipsByTeam(team.id) : [];

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/players" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3 w-3" /> Players
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-5 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 font-mono text-3xl font-bold text-primary">
            {player.nickname.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground">{player.nickname}</h1>
              <span className="tag-badge text-sm">{player.tag}</span>
              {player.isCaptain && <Crown className="h-5 w-5 text-accent" />}
            </div>
            {team && (
              <Link to={`/teams/${team.id}`} className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                {team.name} <span className="font-mono text-xs">({team.tag})</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="esports-card p-4 text-center">
            <Swords className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
            <p className="font-mono text-2xl font-bold text-foreground tabular-nums">{playedMatches.length}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">Matches</p>
          </div>
          <div className="esports-card p-4 text-center">
            <Award className="mx-auto h-5 w-5 text-accent mb-1" />
            <p className="font-mono text-2xl font-bold text-accent tabular-nums">{mvpCount}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">MVP Awards</p>
          </div>
          <div className="esports-card p-4 text-center">
            <Trophy className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="font-mono text-2xl font-bold text-foreground tabular-nums">{champHistory.length}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">Championships</p>
          </div>
        </div>
      </motion.div>

      {/* Match History */}
      {playedMatches.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Match History</h2>
          <div className="grid gap-3">
            {playedMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
