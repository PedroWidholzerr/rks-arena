import { useParams, Link } from "react-router-dom";
import { usePlayer } from "@/hooks/usePlayersHook";
import { useTeams } from "@/hooks/useTeams";
import { useMatches } from "@/hooks/useMatches";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowLeft, Crown, Award, Swords } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: player, isLoading } = usePlayer(id!);
  const { data: teams = [] } = useTeams();
  const { data: allMatches = [] } = useMatches();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Jogador não encontrado.</p>
        <Link to="/players" className="text-primary mt-4 inline-block">← Voltar</Link>
      </div>
    );
  }

  const team = teams.find(t => t.id === player.teamId);
  const playerMatches = allMatches.filter(m => m.teamAId === player.teamId || m.teamBId === player.teamId);
  const playedMatches = playerMatches.filter(m => m.scoreA > 0 || m.scoreB > 0);
  const mvpCount = allMatches.filter(m => m.mvpPlayerId === player.id).length;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/players" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3 w-3" /> Jogadores
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
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="esports-card p-4 text-center">
            <Swords className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
            <p className="font-mono text-2xl font-bold text-foreground tabular-nums">{playedMatches.length}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">Partidas</p>
          </div>
          <div className="esports-card p-4 text-center">
            <Award className="mx-auto h-5 w-5 text-accent mb-1" />
            <p className="font-mono text-2xl font-bold text-accent tabular-nums">{mvpCount}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">Prêmios MVP</p>
          </div>
        </div>
      </motion.div>

      {/* Match History */}
      {playedMatches.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Histórico de Partidas</h2>
          <div className="grid gap-3">
            {playedMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
