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

/**
 * Classificação exatamente como a API devolve: a interface nunca calcula nem reordena (sem ordenar por cabeçalho).
 * Cabeçalhos curtos com nome completo para leitor de tela. Times empatados dividem a posição e levam o selo "Empate".
 */
export function TabelaClassificacao({ linhas, empatesAbertos, foco, aoDecidir, densa = false }: Props) {
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const altura = densa ? "h-9" : "h-12";
  const nomes = new Map(linhas.map((l) => [l.timeId, l.nome]));

  const alternar = (id: string) =>
    setAbertas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });

  const cabecalho = (sigla: string, nome: string, extra?: string) => (
    <th scope="col" className={cn("px-2 text-right font-medium", extra)}>
      <abbr title={nome} className="no-underline">
        {sigla}
      </abbr>
      <span className="sr-only"> ({nome})</span>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Classificação</caption>
          <thead className="bg-surface-muted text-muted-foreground">
            <tr className="h-10 text-sm">
              <th scope="col" className="w-10 px-2 text-center font-medium">
                <span className="sr-only">Posição</span>
                <span aria-hidden="true">#</span>
              </th>
              <th scope="col" className="px-2 text-left font-medium">
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
                <th scope="col" className="px-2 text-right font-medium">
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
                  <tr className={cn("border-t border-border", altura, emFoco && "bg-accent-soft font-semibold")}>
                    <td className="numero px-2 text-center font-medium">
                      {linha.posicao}º
                      {linha.empate ? <span className="sr-only"> (empatadas, aguardando decisão)</span> : null}
                    </td>
                    <td className="px-2">
                      <Link to={`/times/${linha.timeId}`} className="flex min-h-toque items-center gap-2 lg:min-h-0">
                        <Avatar src={linha.logoUrl} texto={textoDoAvatarDoTime(linha.tag)} tamanho={28} />
                        <span className="font-semibold">{linha.tag}</span>
                        <span className="hidden max-w-[10rem] truncate font-normal text-muted-foreground sm:inline">{linha.nome}</span>
                        {linha.empate ? <Selo tom="info">Empate</Selo> : null}
                      </Link>
                    </td>
                    <td className="numero px-2 text-right">{linha.jogadas}</td>
                    <td className="numero px-2 text-right">{linha.vitorias}</td>
                    <td className="numero px-2 text-right">{linha.derrotas}</td>
                    <td className="numero hidden px-2 text-right md:table-cell">{linha.jogosAFavor}</td>
                    <td className="numero hidden px-2 text-right md:table-cell">{linha.jogosContra}</td>
                    <td className="numero px-2 text-right">{linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}</td>
                    <td className="numero px-2 text-right font-bold">{linha.pontos}</td>
                    {aoDecidir ? (
                      <td className="px-2 text-right">
                        {empate ? (
                          <button type="button" className="min-h-toque text-sm text-accent-text underline underline-offset-2 lg:min-h-0" onClick={() => aoDecidir(empate)}>
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
                        className="flex min-h-toque w-full items-center gap-1 px-3 text-xs text-accent-text underline underline-offset-2"
                      >
                        {aberta ? <ChevronUp aria-hidden="true" className="h-3 w-3" /> : <ChevronDown aria-hidden="true" className="h-3 w-3" />}
                        {aberta ? "Ocultar detalhes" : "Ver detalhes"} de {linha.tag}
                      </button>
                      {aberta ? (
                        <p className="numero px-3 pb-3 text-sm text-muted-foreground">
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
