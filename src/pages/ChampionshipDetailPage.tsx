import { useParams, Link } from "react-router-dom";
import { useChampionship } from "@/hooks/useChampionships";
import { useSeasons } from "@/hooks/useSeasons";
import { useMatchesByChampionshipId } from "@/hooks/useMatches";
import { useStandingsByChampionshipId } from "@/hooks/useStandings";
import StandingsTable from "@/components/championships/StandingsTable";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function ChampionshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: champ, isLoading } = useChampionship(id!);
  const { data: seasons = [] } = useSeasons();
  const { data: standings = [] } = useStandingsByChampionshipId(id!);
  const { data: allMatches = [] } = useMatchesByChampionshipId(id!);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Campeonato não encontrado.</p>
        <Link to="/championships" className="text-primary mt-4 inline-block">← Voltar</Link>
      </div>
    );
  }

  const season = seasons.find(s => s.id === champ.seasonId);
  const playedMatches = allMatches.filter(m => m.scoreA > 0 || m.scoreB > 0);
  const scheduledMatches = allMatches.filter(m => m.scoreA === 0 && m.scoreB === 0);
  const statusLabel: Record<string, string> = { ongoing: "Em andamento", upcoming: "Em breve", finished: "Finalizado" };
  const statusClass = `status-${champ.status}`;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/championships" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3 w-3" /> Campeonatos
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <span className={`${statusClass} rounded-md px-2 py-0.5 font-mono text-xs uppercase`}>{statusLabel[champ.status] || champ.status}</span>
          {season && <span className="font-mono text-xs text-muted-foreground">{season.name}</span>}
        </div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          {champ.name}
        </h1>
        <p className="mt-2 text-muted-foreground">{champ.description}</p>
      </motion.div>

      {/* Standings */}
      {standings.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Classificação</h2>
          <StandingsTable standings={standings} />
        </section>
      )}

      {/* Played Matches */}
      {playedMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Resultados</h2>
          <div className="grid gap-3">
            {playedMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Scheduled Matches */}
      {scheduledMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Agenda</h2>
          <div className="grid gap-3">
            {scheduledMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
