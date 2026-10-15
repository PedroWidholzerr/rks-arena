import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { SeloDaPartida } from "@/components/SeloEstado";
import { Button } from "@/components/ui/button";
import { diaEHora, ehHttps, textoDoAvatarDoTime } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { Partida, TimeResumo } from "@/types";

function Lado({ time, direita }: { time: TimeResumo | null; direita?: boolean }) {
  const identificacao = (
    <div className={cn("min-w-0", direita && "text-right")}>
      <p className="truncate font-display text-sm font-bold tracking-tight text-foreground">{time?.nome ?? "A definir"}</p>
      <span className="font-mono text-xs text-muted-foreground">{time?.tag ?? "—"}</span>
    </div>
  );
  const logo = <Avatar src={time?.logoUrl} texto={textoDoAvatarDoTime(time?.tag ?? "?")} tamanho={32} />;
  const conteudo = direita ? (
    <>
      {identificacao}
      {logo}
    </>
  ) : (
    <>
      {logo}
      {identificacao}
    </>
  );
  const classe = cn("flex min-w-0 flex-1 items-center gap-3", direita && "justify-end");
  return time ? (
    <Link to={`/times/${time.id}`} className={classe}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
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
 * Cartão de Partida no estilo do site: Time A, placar em mono no centro, Time B. Vencedor em ciano e perdedor em
 * vermelho suave, com o texto "W.O." e o estado sempre escritos. "Assistir" só aparece com URL https e abre em nova aba.
 */
export function CartaoDePartida({ partida, campeonato, acoes }: Props) {
  const finalizada = partida.estado === "FINALIZADA";
  const aVenceu = finalizada && (partida.jogosA ?? 0) > (partida.jogosB ?? 0);
  const bVenceu = finalizada && (partida.jogosB ?? 0) > (partida.jogosA ?? 0);
  const aoVivo = partida.estado === "EM_ANDAMENTO" && ehHttps(partida.streamUrl);
  const nomeA = partida.timeA?.nome ?? "a definir";
  const nomeB = partida.timeB?.nome ?? "a definir";
  const classeDoPlacar = (venceu: boolean, perdeu: boolean) =>
    cn("numero font-mono text-2xl font-bold", venceu ? "win-text" : perdeu ? "loss-text" : "text-muted-foreground");

  return (
    <article className="esports-card p-4" aria-label={`${nomeA} contra ${nomeB}`}>
      <div className="flex items-center justify-between gap-2">
        <Lado time={partida.timeA} />
        <div className="flex items-center gap-3 px-2 sm:px-4">
          <span className={classeDoPlacar(aVenceu, bVenceu)}>
            <span className="sr-only">{nomeA}: </span>
            {partida.jogosA ?? "–"}
          </span>
          <span className="font-mono text-sm text-muted-foreground" aria-hidden="true">
            vs
          </span>
          <span className={classeDoPlacar(bVenceu, aVenceu)}>
            <span className="sr-only">{nomeB}: </span>
            {partida.jogosB ?? "–"}
          </span>
        </div>
        <Lado time={partida.timeB} direita />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar aria-hidden="true" className="h-3 w-3" />
            <span className="numero font-mono">{partida.agendadaPara ? diaEHora(partida.agendadaPara) : "Sem horário"}</span>
          </span>
          <span className="font-mono">
            {campeonato ? `${campeonato} · ` : ""}Rodada <span className="numero">{partida.rodada}</span>
          </span>
          {partida.walkover ? <span className="font-mono uppercase">W.O.</span> : null}
        </div>
        <SeloDaPartida estado={partida.estado} aoVivo={aoVivo} />
      </div>

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
