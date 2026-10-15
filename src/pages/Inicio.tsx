import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { CartaoDeCampeonato } from "@/components/CartaoDeCampeonato";
import { ESPACO } from "@/components/layout/LayoutPublico";
import { cn } from "@/lib/utils";
import { CartaoDePartida } from "@/components/CartaoDePartida";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { SeloDaTemporada } from "@/components/SeloEstado";
import { chaves, useTemporadasPublicas, useTimesPublicos } from "@/hooks/dados";
import { useTituloDaPagina } from "@/hooks/useTituloDaPagina";
import { chaveDoDia, textoDoAvatarDoTime } from "@/lib/formato";
import { publico } from "@/services/api";
import type { Campeonato, Partida } from "@/types";

function TituloDeSecao({ id, icone, children, link }: { id: string; icone?: React.ReactNode; children: React.ReactNode; link?: { para: string; rotulo: string } }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 id={id} className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-tighter text-foreground">
        {icone}
        {children}
      </h2>
      {link ? (
        <Link to={link.para} className="flex min-h-toque items-center gap-1 font-mono text-xs uppercase tracking-wider text-accent-text hover:underline">
          {link.rotulo} <ArrowRight aria-hidden="true" className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}

function HojeDasPartidas({ campeonatos }: { campeonatos: Campeonato[] }) {
  const hoje = chaveDoDia(new Date().toISOString());
  const consultas = useQueries({
    queries: campeonatos.map((c) => ({
      queryKey: chaves.partidas(c.id, { dia: hoje }),
      queryFn: () => publico.partidas(c.id, { dia: hoje }),
    })),
  });
  const carregando = consultas.some((c) => c.isPending);
  const partidas: Array<{ partida: Partida; campeonato: string }> = consultas.flatMap((c, i) =>
    (c.data?.dados ?? []).map((partida) => ({ partida, campeonato: campeonatos[i].nome })),
  );
  // Ao vivo primeiro, depois por horário.
  partidas.sort((a, b) => {
    const vivoA = a.partida.estado === "EM_ANDAMENTO" ? 0 : 1;
    const vivoB = b.partida.estado === "EM_ANDAMENTO" ? 0 : 1;
    return vivoA - vivoB || (a.partida.agendadaPara ?? "").localeCompare(b.partida.agendadaPara ?? "");
  });

  return (
    <section aria-labelledby="hoje" aria-busy={carregando}>
      <TituloDeSecao id="hoje">Hoje</TituloDeSecao>
      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando as Partidas de hoje…</p>
      ) : partidas.length === 0 ? (
        <Vazio titulo="Nenhuma Partida hoje." />
      ) : (
        <div className="grid gap-3">
          {partidas.map(({ partida, campeonato }) => (
            <CartaoDePartida key={partida.id} partida={partida} campeonato={campeonato} />
          ))}
        </div>
      )}
    </section>
  );
}

function TimesEmDestaque() {
  const consulta = useTimesPublicos();
  const times = (consulta.data?.dados ?? []).slice(0, 6);
  if (times.length === 0) return null;
  return (
    <section aria-labelledby="times-inicio">
      <TituloDeSecao id="times-inicio" icone={<Users aria-hidden="true" className="h-6 w-6 text-accent-text" />} link={{ para: "/times", rotulo: "Ver todos" }}>
        Times
      </TituloDeSecao>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {times.map((t) => (
          <Link key={t.id} to={`/times/${t.id}`} className="block">
            <div className="esports-card flex items-center gap-4 p-5 transition-all hover:scale-[1.02]">
              <Avatar src={t.logoUrl} texto={textoDoAvatarDoTime(t.tag)} tamanho={40} />
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-bold tracking-tight text-foreground">{t.nome}</h3>
                <span className="tag-badge">{t.tag}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Inicio() {
  useTituloDaPagina("Início");
  const consulta = useTemporadasPublicas();
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className={cn(ESPACO, "relative py-12 md:py-16")}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>
            <div className="mb-4 flex items-center gap-2">
              <Zap aria-hidden="true" className="h-5 w-5 animate-pulse-glow text-accent-text" />
              <span className="font-mono text-xs uppercase tracking-widest text-accent-text">Campeonatos de League of Legends</span>
            </div>
            <h1 className="font-display text-5xl font-bold uppercase tracking-tighter text-foreground md:text-7xl">
              RKS <span className="glow-text text-accent-text">Arena</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Acompanhe temporadas, campeonatos, classificação, partidas, times e jogadores do Rising Kings.
            </p>
          </motion.div>
        </div>
      </section>

      <div className={cn(ESPACO, "space-y-12 py-10")}>
        <EstadoDaConsulta
          consulta={consulta}
          rotulo="a página inicial"
          atualizadoEm={(r) => r.atualizadoEm}
          vazio={{
            quando: (r) => r.dados.length === 0,
            titulo: "Ainda não há Temporadas.",
            texto: "Quando o primeiro Campeonato for criado, ele aparece aqui.",
          }}
        >
          {(resposta) => {
            const destaque = resposta.dados.find((t) => t.destaque) ?? resposta.dados[0];
            const emAndamento = destaque.campeonatos.filter((c) => c.estado === "EM_ANDAMENTO");
            return (
              <>
                <HojeDasPartidas campeonatos={destaque.campeonatos} />
                <section aria-labelledby="andamento">
                  <TituloDeSecao
                    id="andamento"
                    icone={<Trophy aria-hidden="true" className="h-6 w-6 text-accent-text" />}
                    link={{ para: `/temporadas/${destaque.temporada.id}`, rotulo: "Ver a Temporada" }}
                  >
                    Campeonatos ativos
                  </TituloDeSecao>
                  <p className="-mt-3 mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    <SeloDaTemporada encerrada={destaque.temporada.encerrada} /> {destaque.temporada.nome}
                  </p>
                  {emAndamento.length === 0 ? (
                    <Vazio titulo="Nenhum Campeonato em andamento agora." texto="Veja as Temporadas para acompanhar o que vem por aí." />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {emAndamento.map((c) => (
                        <CartaoDeCampeonato key={c.id} campeonato={c} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            );
          }}
        </EstadoDaConsulta>
        <TimesEmDestaque />
      </div>
    </div>
  );
}
