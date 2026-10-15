import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Selo } from "@/components/SeloEstado";
import { textoDoAvatarDoTime } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { EmpateAberto, LinhaDaTabela } from "@/types";

interface Props {
  linhas: LinhaDaTabela[];
  empatesAbertos: EmpateAberto[];
  /** Time em foco (filtrado): fundo suave e peso negrito. */
  foco?: string;
  /** Admin: coluna "Ações" nas linhas empatadas, com "Decidir". */
  aoDecidir?: (empate: EmpateAberto) => void;
  /** Densidade do admin (36 px) em vez da pública (48 px). */
  densa?: boolean;
}

const CABECALHO = "px-3 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground";

/**
 * Classificação no estilo do site, exatamente como a API devolve: a interface nunca calcula nem reordena (sem ordenar
 * por cabeçalho). Cabeçalhos curtos com nome completo para leitor de tela. Times empatados dividem a posição e levam o
 * selo "Empate". Vitórias em ciano e derrotas em vermelho suave, sempre como números escritos.
 */
export function TabelaClassificacao({ linhas, empatesAbertos, foco, aoDecidir, densa = false }: Props) {
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const altura = densa ? "h-10" : "h-12";
  const nomes = new Map(linhas.map((l) => [l.timeId, l.nome]));

  const alternar = (id: string) =>
    setAbertas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });

  const cabecalho = (sigla: string, nome: string, extra?: string) => (
    <th scope="col" className={cn(CABECALHO, "text-center font-medium", extra)}>
      <abbr title={nome} className="no-underline">
        {sigla}
      </abbr>
      <span className="sr-only"> ({nome})</span>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="esports-card overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Classificação</caption>
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className={cn(CABECALHO, "w-10 text-left")}>
                <span className="sr-only">Posição</span>
                <span aria-hidden="true">#</span>
              </th>
              <th scope="col" className={cn(CABECALHO, "text-left")}>
                Time
              </th>
              {cabecalho("J", "Jogadas")}
              {cabecalho("V", "Vitórias")}
              {cabecalho("D", "Derrotas")}
              {cabecalho("JP", "Jogos a favor", "hidden md:table-cell")}
              {cabecalho("JC", "Jogos contra", "hidden md:table-cell")}
              {cabecalho("SJ", "Saldo de Jogos")}
              {cabecalho("Pts", "Pontos")}
              {aoDecidir ? (
                <th scope="col" className={cn(CABECALHO, "text-right")}>
                  Ações
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => {
              const emFoco = foco === linha.timeId;
              const aberta = abertas.has(linha.timeId);
              const empate = empatesAbertos.find((e) => e.times.includes(linha.timeId));
              return (
                <Fragment key={linha.timeId}>
                  <tr className={cn("border-b border-border transition-colors hover:bg-[hsl(0_0%_100%/0.03)]", altura, emFoco && "bg-primary/10")}>
                    <td className="numero px-3 py-2 font-mono text-sm text-muted-foreground">
                      {linha.posicao}º
                      {linha.empate ? <span className="sr-only"> (empatadas, aguardando decisão)</span> : null}
                    </td>
                    <td className="px-3 py-2">
                      <Link to={`/times/${linha.timeId}`} className="flex min-h-toque items-center gap-3 lg:min-h-0">
                        <Avatar src={linha.logoUrl} texto={textoDoAvatarDoTime(linha.tag)} tamanho={32} />
                        <span className="min-w-0">
                          <span className="font-display text-sm font-semibold text-foreground">{linha.nome}</span>
                          <span className="ml-2 font-mono text-xs text-muted-foreground">{linha.tag}</span>
                        </span>
                        {linha.empate ? <Selo tom="info">Empate</Selo> : null}
                      </Link>
                    </td>
                    <td className="numero px-3 py-2 text-center font-mono text-sm">{linha.jogadas}</td>
                    <td className="numero win-text px-3 py-2 text-center font-mono text-sm">{linha.vitorias}</td>
                    <td className="numero loss-text px-3 py-2 text-center font-mono text-sm">{linha.derrotas}</td>
                    <td className="numero hidden px-3 py-2 text-center font-mono text-sm md:table-cell">{linha.jogosAFavor}</td>
                    <td className="numero hidden px-3 py-2 text-center font-mono text-sm md:table-cell">{linha.jogosContra}</td>
                    <td className="numero px-3 py-2 text-center font-mono text-sm">{linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}</td>
                    <td className="numero px-3 py-2 text-center font-mono text-sm font-bold text-foreground">{linha.pontos}</td>
                    {aoDecidir ? (
                      <td className="px-3 py-2 text-right">
                        {empate ? (
                          <button type="button" className="min-h-toque font-mono text-xs uppercase tracking-wider text-primary underline underline-offset-2 lg:min-h-0" onClick={() => aoDecidir(empate)}>
                            Decidir
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                  <tr className="border-0 md:hidden">
                    <td colSpan={aoDecidir ? 8 : 7} className="p-0">
                      <button
                        type="button"
                        aria-expanded={aberta}
                        onClick={() => alternar(linha.timeId)}
                        className="flex min-h-toque w-full items-center gap-1 px-3 font-mono text-xs uppercase tracking-wider text-primary"
                      >
                        {aberta ? <ChevronUp aria-hidden="true" className="h-3 w-3" /> : <ChevronDown aria-hidden="true" className="h-3 w-3" />}
                        {aberta ? "Ocultar detalhes" : "Ver detalhes"} de {linha.tag}
                      </button>
                      {aberta ? (
                        <p className="numero px-3 pb-3 font-mono text-xs text-muted-foreground">
                          Jogos a favor: {linha.jogosAFavor} · Jogos contra: {linha.jogosContra}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {empatesAbertos.map((empate) => (
        <p key={empate.posicao} className="text-sm text-muted-foreground">
          Empate entre {empate.times.map((id) => nomes.get(id) ?? id).join(", ")} em {empate.posicao}º. Aguardando decisão do Administrador.
        </p>
      ))}
    </div>
  );
}
