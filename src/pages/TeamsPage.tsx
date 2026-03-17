import { useTeams } from "@/hooks/useTeams";
import TeamCard from "@/components/teams/TeamCard";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Times
        </h1>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando times...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}