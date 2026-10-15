import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { Vazio } from "@/components/estados/Estados";
import { Button } from "@/components/ui/button";
import { adminChaves, chaves, useTodosOsCampeonatosDoAdmin } from "@/hooks/dados";
import { diaEHora } from "@/lib/formato";
import { adminApi, publico } from "@/services/api";

/** Painel de Pendências: o que fazer primeiro. Cada bloco vazio some; bloco com itens mostra a contagem. */
export function AdminPendencias() {
  const { lista, carregando } = useTodosOsCampeonatosDoAdmin();
  const emCurso = lista.filter(({ campeonato }) => campeonato.faseId && campeonato.estado !== "ENCERRADO");
  const partidas = useQueries({
    queries: emCurso.map(({ campeonato }) => ({
      queryKey: adminChaves.partidas(campeonato.faseId as string),
      queryFn: () => adminApi.partidas(campeonato.faseId as string),
    })),
  });
  const tabelas = useQueries({
    queries: emCurso.map(({ campeonato }) => ({
      queryKey: chaves.classificacao(campeonato.faseId as string),
      queryFn: () => publico.classificacao(campeonato.faseId as string),
    })),
  });

  const agora = Date.now();
  const semResultado = emCurso.flatMap(({ campeonato }, i) =>
    (partidas[i]?.data ?? [])
      .filter((p) => p.estado !== "FINALIZADA" && p.agendadaPara && new Date(p.agendadaPara).getTime() < agora)
      .map((p) => ({ campeonato, partida: p })),
  );
  const empates = emCurso.flatMap(({ campeonato }, i) => (tabelas[i]?.data?.dados.empatesAbertos ?? []).map((e) => ({ campeonato, empate: e })));
  const semTimes = emCurso.filter(({ campeonato }, i) => (tabelas[i]?.data?.dados.linhas.length ?? 1) === 0 && campeonato.estado !== "EM_BREVE");
  const carregandoTudo = carregando || partidas.some((c) => c.isPending) || tabelas.some((c) => c.isPending);
  const vazio = !carregandoTudo && semResultado.length === 0 && empates.length === 0 && semTimes.length === 0;

  return (
    <>
      <CabecalhoDePagina titulo="Pendências" descricao="O que fazer primeiro." />
      {carregandoTudo ? <p className="text-sm text-muted-foreground">Verificando o que está pendente…</p> : null}
      {vazio ? <Vazio titulo="Nada pendente. Tudo em dia." /> : null}
      <div className="space-y-6">
        {semResultado.length > 0 ? (
          <section aria-labelledby="sem-resultado" className="space-y-2">
            <h2 id="sem-resultado" className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
              Partidas passadas sem resultado (<span className="numero">{semResultado.length}</span>)
            </h2>
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {semResultado.map(({ campeonato, partida }) => (
                <li key={partida.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  <span className="flex-1">
                    <span className="font-medium">
                      {partida.timeA?.nome} contra {partida.timeB?.nome}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {campeonato.nome} · <span className="numero">{diaEHora(partida.agendadaPara)}</span>
                    </span>
                  </span>
                  <Button asChild variant="secondary" className="min-h-toque">
                    <Link to={`/admin/partidas?campeonato=${campeonato.id}`}>Lançar resultado</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {empates.length > 0 ? (
          <section aria-labelledby="empates" className="space-y-2">
            <h2 id="empates" className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
              Empates a decidir (<span className="numero">{empates.length}</span>)
            </h2>
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {empates.map(({ campeonato, empate }) => (
                <li key={`${campeonato.id}-${empate.posicao}`} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  <span className="flex-1">
                    {campeonato.nome}: empate em <span className="numero">{empate.posicao}</span>º entre <span className="numero">{empate.times.length}</span> Times
                  </span>
                  <Button asChild variant="secondary" className="min-h-toque">
                    <Link to={`/admin/fases?campeonato=${campeonato.id}`}>Decidir empate</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {semTimes.length > 0 ? (
          <section aria-labelledby="sem-times" className="space-y-2">
            <h2 id="sem-times" className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
              Campeonatos sem Times (<span className="numero">{semTimes.length}</span>)
            </h2>
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {semTimes.map(({ campeonato }) => (
                <li key={campeonato.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  <span className="flex-1">{campeonato.nome}</span>
                  <Button asChild variant="secondary" className="min-h-toque">
                    <Link to={`/admin/campeonatos/${campeonato.id}`}>Vincular Times</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
