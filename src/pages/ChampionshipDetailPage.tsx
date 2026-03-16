import { useParams, Link } from "react-router-dom";
import { getChampionshipById, getSeasonById, getMatchesByChampionship, getStandingsByChampionship } from "@/lib/mockData";
import StandingsTable from "@/components/championships/StandingsTable";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function ChampionshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const champ = getChampionshipById(id!);

  if (!champ) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Championship not found.</p>
        <Link to="/championships" className="text-primary mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  const season = getSeasonById(champ.seasonId);
  const standings = getStandingsByChampionship(champ.id);
  const allMatches = getMatchesByChampionship(champ.id);
  const playedMatches = allMatches.filter(m => m.scoreA > 0 || m.scoreB > 0);
  const scheduledMatches = allMatches.filter(m => m.scoreA === 0 && m.scoreB === 0);
  const statusClass = `status-${champ.status}`;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/championships" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3 w-3" /> Championships
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <span className={`${statusClass} rounded-md px-2 py-0.5 font-mono text-xs uppercase`}>{champ.status}</span>
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
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Standings</h2>
          <StandingsTable standings={standings} />
        </section>
      )}

      {/* Played Matches */}
      {playedMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Results</h2>
          <div className="grid gap-3">
            {playedMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Scheduled Matches */}
      {scheduledMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Schedule</h2>
          <div className="grid gap-3">
            {scheduledMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
