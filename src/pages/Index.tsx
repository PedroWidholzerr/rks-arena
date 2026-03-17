import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Zap, Users, User } from "lucide-react";
import { useChampionships } from "@/hooks/useChampionships";
import { useMatches } from "@/hooks/useMatches";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayersHook";
import MatchCard from "@/components/matches/MatchCard";
import TeamCard from "@/components/teams/TeamCard";
import PlayerCard from "@/components/players/PlayerCard";

export default function Index() {
  const { data: championships = [] } = useChampionships();
  const { data: allMatches = [] } = useMatches();
  const { data: teams = [] } = useTeams();
  const { data: players = [] } = usePlayers();

  const activeChamps = championships.filter(c => c.status === "ongoing");
  const upcomingChamps = championships.filter(c => c.status === "upcoming");
  const recentMatches = [...allMatches]
    .filter(m => m.scoreA > 0 || m.scoreB > 0)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 3);
  const upcomingMatches = allMatches
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
              <span className="font-mono text-xs uppercase tracking-widest text-primary">Plataforma de Gerenciamentos de Torneios </span>
            </div>
            <h1 className="font-display text-5xl font-bold uppercase tracking-tighter text-foreground md:text-7xl">
              RKS <span className="glow-text text-primary">System</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Gerenciamento de torneios ARAM amador. Acompanhe temporadas, campeonatos e estatísticas de jogadores.
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
                Campeonatos Ativos
              </h2>
              <Link to="/championships" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-primary hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeChamps.map(champ => (
                <Link key={champ.id} to={`/championships/${champ.id}`}>
                  <div className="esports-card p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-ongoing rounded-md px-2 py-0.5 font-mono text-xs uppercase">Em andamento</span>
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
              Resultados Recentes
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
              Próximas Partidas
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
              Próximos Campeonatos
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingChamps.map(champ => (
                <Link key={champ.id} to={`/championships/${champ.id}`}>
                  <div className="esports-card p-6">
                    <span className="status-upcoming rounded-md px-2 py-0.5 font-mono text-xs uppercase">Em breve</span>
                    <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">{champ.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{champ.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Teams */}
        {teams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Times
              </h2>
              <Link to="/teams" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-primary hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.slice(0, 6).map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </section>
        )}

        {/* Players */}
        {players.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-foreground flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Jogadores
              </h2>
              <Link to="/players" className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-primary hover:underline">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {players.slice(0, 6).map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
