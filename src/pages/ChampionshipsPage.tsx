import { Link } from "react-router-dom";
import { useChampionships } from "@/hooks/useChampionships";
import { useSeasons } from "@/hooks/useSeasons";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function ChampionshipsPage() {
  const { data: championships = [], isLoading } = useChampionships();
  const { data: seasons = [] } = useSeasons();

  const statusOrder = { ongoing: 0, upcoming: 1, finished: 2 };

  const sorted = [...championships].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  function getSeasonById(id: string) {
    return seasons.find((s) => s.id === id);
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-foreground mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Campeonatos
        </h1>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando campeonatos...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((champ) => {
            const season = getSeasonById(champ.seasonId);
            const statusClass = `status-${champ.status}`;

            return (
              <Link key={champ.id} to={`/championships/${champ.id}`}>
                <div className="esports-card p-6 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`${statusClass} rounded-md px-2 py-0.5 font-mono text-xs uppercase`}
                    >
                      {champ.status}
                    </span>

                    {season && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {season.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                    {champ.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {champ.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}