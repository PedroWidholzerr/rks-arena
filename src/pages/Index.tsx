import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Zap } from "lucide-react";
import { championships, matches, getTeamById, getChampionshipById } from "@/lib/mockData";
import MatchCard from "@/components/matches/MatchCard";

export default function Index() {
  const activeChamps = championships.filter(c => c.status === "ongoing");
  const upcomingChamps = championships.filter(c => c.status === "upcoming");
  const recentMatches = [...matches]
    .filter(m => m.scoreA > 0 || m.scoreB > 0)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 3);
  const upcomingMatches = matches
    .filter(m => m.scoreA === 0 && m.scoreB === 0)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary animate-pulse-glow" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary">Live Tournament Platform</span>
            </div>
            <h1 className="font-display text-5xl font-bold uppercase tracking-tighter text-foreground md:text-7xl">
              RKS <span className="glow-text text-primary">System</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Amateur ARAM tournament management. Track seasons, championships, and player stats.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-12">
        {/* Active Championships */}
        {activeChamps.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Active Championships
              </h2>
              <Link to="/championships" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeChamps.map(champ => (
                <Link key={champ.id} to={`/championships/${champ.id}`}>
                  <div className="esports-card p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-ongoing rounded-md px-2 py-0.5 font-mono text-xs uppercase">Ongoing</span>
                    </div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground">{champ.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{champ.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {recentMatches.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-6">
              Recent Results
            </h2>
            <div className="grid gap-3">
              {recentMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-6">
              Upcoming Matches
            </h2>
            <div className="grid gap-3">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Championships */}
        {upcomingChamps.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground mb-6">
              Upcoming Championships
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingChamps.map(champ => (
                <div key={champ.id} className="esports-card p-6">
                  <span className="status-upcoming rounded-md px-2 py-0.5 font-mono text-xs uppercase">Upcoming</span>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">{champ.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{champ.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
