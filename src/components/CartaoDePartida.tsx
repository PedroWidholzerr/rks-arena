import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { SeloDaPartida } from "@/components/SeloEstado";
import { Button } from "@/components/ui/button";
import { diaEHora, ehHttps, placar, textoDoAvatarDoTime } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { Partida, TimeResumo } from "@/types";

function LinhaDoTime({ time, jogos, vencedor }: { time: TimeResumo | null; jogos: number | null; vencedor: boolean }) {
  return (
    <div className={cn("relative flex min-h-12 items-center gap-3 pl-3", vencedor && "font-bold")}>
      {vencedor ? <span aria-hidden="true" className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-primary" /> : null}
      {time ? (
        <>
          <Avatar src={time.logoUrl} texto={textoDoAvatarDoTime(time.tag)} tamanho={32} />
          <Link to={`/times/${time.id}`} className="min-w-0 flex-1 truncate">
            <span className="font-semibold">{time.tag}</span> <span className="font-normal text-muted-foreground">{time.nome}</span>
          </Link>
        </>
      ) : (
        <span className="flex-1 text-muted-foreground">A definir</span>
      )}
      <span className={cn("numero w-8 text-right text-2xl font-bold leading-none", jogos === null && "text-muted-foreground")}>{jogos === null ? "–" : jogos}</span>
    </div>
  );
}

interface Props {
  partida: Partida;
  /** Rótulo do Campeonato, quando a lista mistura Campeonatos (Agenda). */
  campeonato?: string;
  /** Ações do admin (Lançar resultado, menu "Mais"). */
  acoes?: ReactNode;
}

/**
 * Cartão de Partida do DESIGN.md: duas linhas (uma por Time), placar à direita, vencedor com barra dourada e negrito.
 * Cada estado tem texto, não só cor. "Assistir" só aparece com URL https e abre em nova aba.
 */
export function CartaoDePartida({ partida, campeonato, acoes }: Props) {
  const finalizada = partida.estado === "FINALIZADA";
  const aVenceu = finalizada && (partida.jogosA ?? 0) > (partida.jogosB ?? 0);
  const bVenceu = finalizada && (partida.jogosB ?? 0) > (partida.jogosA ?? 0);
  const aoVivo = partida.estado === "EM_ANDAMENTO" && ehHttps(partida.streamUrl);
  const nomeA = partida.timeA?.nome ?? "a definir";
  const nomeB = partida.timeB?.nome ?? "a definir";

  return (
    <article className="rounded-md border border-border bg-card p-4" aria-label={`${nomeA} contra ${nomeB}`}>
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span>
          {campeonato ? `${campeonato} · ` : ""}Rodada {partida.rodada}
          {partida.agendadaPara ? <span className="numero"> · {diaEHora(partida.agendadaPara)}</span> : " · Sem horário"}
        </span>
        <SeloDaPartida estado={partida.estado} aoVivo={aoVivo} />
      </header>
      <div className="divide-y divide-border">
        <LinhaDoTime time={partida.timeA} jogos={partida.jogosA} vencedor={aVenceu} />
        <LinhaDoTime time={partida.timeB} jogos={partida.jogosB} vencedor={bVenceu} />
      </div>
      {finalizada ? (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          <span className="sr-only">Placar em Jogos: </span>
          <span className="numero">{placar(partida.jogosA, partida.jogosB)}</span>
          {partida.walkover ? " · W.O." : ""}
        </p>
      ) : null}
      {ehHttps(partida.streamUrl) || acoes ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {ehHttps(partida.streamUrl) ? (
            <Button asChild variant={aoVivo ? "default" : "secondary"} className="min-h-toque">
              <a
                href={partida.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Assistir transmissão de ${nomeA} contra ${nomeB} (abre em nova aba)`}
              >
                <ExternalLink aria-hidden="true" className="mr-2 h-4 w-4" />
                Assistir
              </a>
            </Button>
          ) : null}
          {acoes}
        </div>
      ) : null}
    </article>
  );
}
