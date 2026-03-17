import { useParams, Link } from "react-router-dom";
import { useTeam } from "@/hooks/useTeams";
import { usePlayersByTeamId } from "@/hooks/usePlayersHook";
import { useMatchesByTeamId } from "@/hooks/useMatches";
import { useStandingsByChampionshipId } from "@/hooks/useStandings";
import { useChampionships } from "@/hooks/useChampionships";
import { TeamLogo } from "@/components/teams/TeamCard";
import PlayerCard from "@/components/players/PlayerCard";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading } = useTeam(id!);
  const { data: teamPlayers = [] } = usePlayersByTeamId(id!);
  const { data: teamMatches = [] } = useMatchesByTeamId(id!);
  const { data: championships = [] } = useChampionships();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Time não encontrado.</p>
        <Link to="/teams" className="text-primary mt-4 inline-block">← Voltar</Link>
      </div>
    );
  }

  const playedMatches = teamMatches.filter(m => m.scoreA > 0 || m.scoreB > 0);

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/teams" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3 w-3" /> Times
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-5 mb-2">
          <TeamLogo team={team} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground">{team.name}</h1>
              <span className="tag-badge text-sm">{team.tag}</span>
            </div>
            <p className="mt-1 text-muted-foreground">{team.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Players */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Elenco</h2>
        {teamPlayers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {teamPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum jogador cadastrado.</p>
        )}
      </section>

      {/* Match History */}
      {playedMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Histórico de Partidas</h2>
          <div className="grid gap-3">
            {playedMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
