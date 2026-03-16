import { players } from "@/lib/mockData";
import PlayerCard from "@/components/players/PlayerCard";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayersPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground mb-8 flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          Players
        </h1>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
