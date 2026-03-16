import { useParams, Link } from "react-router-dom";
import { getTeamById, getPlayersByTeam, getMatchesByTeam, getChampionshipsByTeam, getChampionshipById } from "@/lib/mockData";
import { TeamLogo } from "@/components/teams/TeamCard";
import PlayerCard from "@/components/players/PlayerCard";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const team = getTeamById(id!);

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Team not found.</p>
        <Link to="/teams" className="text-primary mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  const teamPlayers = getPlayersByTeam(team.id);
  const teamMatches = getMatchesByTeam(team.id);
  const champHistory = getChampionshipsByTeam(team.id);

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/teams" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3 w-3" /> Teams
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
        <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Roster</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {teamPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
        </div>
      </section>

      {/* Championship History */}
      {champHistory.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Championship History</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {champHistory.map(ct => (
              <Link key={ct.id} to={`/championships/${ct.championshipId}`}>
                <div className="esports-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-display text-sm font-semibold text-foreground">{ct.championship.name}</span>
                  </div>
                  <div className="font-mono text-sm">
                    <span className="win-text">W {ct.wins}</span>
                    <span className="text-muted-foreground mx-1">-</span>
                    <span className="loss-text">L {ct.losses}</span>
                    <span className="text-muted-foreground mx-2">|</span>
                    <span className="text-foreground font-bold">{ct.points} PTS</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Match History */}
      {teamMatches.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-4">Match History</h2>
          <div className="grid gap-3">
            {teamMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
