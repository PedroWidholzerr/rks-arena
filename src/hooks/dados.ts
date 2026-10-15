// Hooks do React Query. A repetição para o cold start é do apiClient, então aqui não há `retry`.
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi, publico } from "@/services/api";
import { ErroDeApi } from "@/services/apiClient";

export const chaves = {
  temporadas: ["publico", "temporadas"] as const,
  temporada: (id: string) => ["publico", "temporada", id] as const,
  campeonato: (id: string) => ["publico", "campeonato", id] as const,
  fases: (id: string) => ["publico", "fases", id] as const,
  classificacao: (faseId: string) => ["publico", "classificacao", faseId] as const,
  partidas: (id: string, filtros: object) => ["publico", "partidas", id, filtros] as const,
  times: ["publico", "times"] as const,
  time: (id: string) => ["publico", "time", id] as const,
  jogadores: (busca: string) => ["publico", "jogadores", busca] as const,
  jogador: (id: string) => ["publico", "jogador", id] as const,
};

export const useTemporadasPublicas = () => useQuery({ queryKey: chaves.temporadas, queryFn: publico.temporadas });
export const useTemporadaPublica = (id: string) => useQuery({ queryKey: chaves.temporada(id), queryFn: () => publico.temporada(id) });
export const useCampeonatoPublico = (id: string) => useQuery({ queryKey: chaves.campeonato(id), queryFn: () => publico.campeonato(id) });
export const useFasesPublicas = (id: string) => useQuery({ queryKey: chaves.fases(id), queryFn: () => publico.fases(id) });
export const useClassificacao = (faseId: string | undefined) =>
  useQuery({ queryKey: chaves.classificacao(faseId ?? ""), queryFn: () => publico.classificacao(faseId as string), enabled: Boolean(faseId) });
export const usePartidasPublicas = (campeonatoId: string, filtros: { fase?: string; time?: string; dia?: string } = {}) =>
  useQuery({ queryKey: chaves.partidas(campeonatoId, filtros), queryFn: () => publico.partidas(campeonatoId, filtros), enabled: Boolean(campeonatoId) });
export const useTimesPublicos = () => useQuery({ queryKey: chaves.times, queryFn: publico.times });
export const useTimePublico = (id: string) => useQuery({ queryKey: chaves.time(id), queryFn: () => publico.time(id) });
export const useJogadoresPublicos = (busca: string) =>
  useQuery({ queryKey: chaves.jogadores(busca), queryFn: () => publico.jogadores(busca), placeholderData: keepPreviousData });
export const useJogadorPublico = (id: string) => useQuery({ queryKey: chaves.jogador(id), queryFn: () => publico.jogador(id) });

// ---- Admin ----
export const adminChaves = {
  temporadas: ["admin", "temporadas"] as const,
  campeonatos: (temporadaId: string) => ["admin", "campeonatos", temporadaId] as const,
  campeonato: (id: string) => ["admin", "campeonato", id] as const,
  timesDoCampeonato: (id: string) => ["admin", "times-do-campeonato", id] as const,
  times: ["admin", "times"] as const,
  jogadores: (busca: string) => ["admin", "jogadores", busca] as const,
  elenco: (timeId: string, temporadaId: string) => ["admin", "elenco", timeId, temporadaId] as const,
  partidas: (faseId: string) => ["admin", "partidas", faseId] as const,
  administradores: ["admin", "administradores"] as const,
};

export const useAdminTemporadas = () => useQuery({ queryKey: adminChaves.temporadas, queryFn: adminApi.temporadas });
export const useAdminCampeonatos = (temporadaId: string | undefined) =>
  useQuery({ queryKey: adminChaves.campeonatos(temporadaId ?? ""), queryFn: () => adminApi.campeonatos(temporadaId as string), enabled: Boolean(temporadaId) });
export const useAdminTimesDoCampeonato = (id: string | undefined) =>
  useQuery({ queryKey: adminChaves.timesDoCampeonato(id ?? ""), queryFn: () => adminApi.timesDoCampeonato(id as string), enabled: Boolean(id) });
export const useAdminTimes = () => useQuery({ queryKey: adminChaves.times, queryFn: adminApi.times });
export const useAdminJogadores = (busca: string) =>
  useQuery({ queryKey: adminChaves.jogadores(busca), queryFn: () => adminApi.jogadores(busca), placeholderData: keepPreviousData });
export const useAdminPartidas = (faseId: string | undefined) =>
  useQuery({ queryKey: adminChaves.partidas(faseId ?? ""), queryFn: () => adminApi.partidas(faseId as string), enabled: Boolean(faseId) });
export const useAdminAdministradores = () => useQuery({ queryKey: adminChaves.administradores, queryFn: adminApi.administradores });

/** Mensagem em português para um erro da API, com os textos da tabela de voz do EXPERIENCE.md. */
export function mensagemDeErro(erro: unknown): { titulo: string; texto: string; codigo?: string } {
  if (!(erro instanceof ErroDeApi)) return { titulo: "Algo deu errado", texto: "Tente de novo em instantes." };
  const extras = erro.extras;
  switch (erro.codigo) {
    case "PLACAR_INVALIDO":
      return { titulo: "Placar inválido", texto: "Escolha um dos placares da lista.", codigo: erro.codigo };
    case "CONFIG_CONGELADA":
      return {
        titulo: "Configuração bloqueada",
        texto: `Este Campeonato já tem ${extras.partidasFinalizadas ?? "uma"} Partida(s) finalizada(s), então melhor de N, pontuação e desempate não podem mudar. Para alterar, anule antes as Partidas finalizadas.`,
        codigo: erro.codigo,
      };
    case "VERSAO_DESATUALIZADA":
      return { titulo: "Esta Partida mudou", texto: "Outra pessoa alterou esta Partida depois que você a abriu. Recarregue para ver a versão atual e refaça a alteração.", codigo: erro.codigo };
    case "LIMITE_DE_ADMINISTRADORES":
      return { titulo: "Limite de administradores", texto: "O sistema permite até 3 Administradores ativos. Desative um antes de criar outro.", codigo: erro.codigo };
    case "ULTIMO_ADMINISTRADOR":
      return { titulo: "Não é possível desativar", texto: "Este é o último Administrador ativo.", codigo: erro.codigo };
    case "IMAGEM_FORMATO_INVALIDO":
    case "IMAGEM_GRANDE":
      return { titulo: "Imagem não aceita", texto: "Use PNG, JPEG ou WebP de até 2 MB.", codigo: erro.codigo };
    case "CREDENCIAIS_INVALIDAS":
      return { titulo: "E-mail ou senha inválidos", texto: "Confira os dados e tente de novo.", codigo: erro.codigo };
    case "TAG_JA_CADASTRADA":
      return { titulo: "Tag já cadastrada", texto: erro.message, codigo: erro.codigo };
    case "JOGADOR_JA_EXISTE":
      return { titulo: "Jogador já cadastrado", texto: erro.message, codigo: erro.codigo };
    default:
      return { titulo: erro.ehDeRede ? "Não foi possível falar com o servidor" : "Não foi possível concluir", texto: erro.message, codigo: erro.codigo };
  }
}

interface OpcoesDeMutacao<A, R> {
  /** Chaves a invalidar depois do sucesso. */
  invalidar?: QueryKey[];
  sucesso?: string | ((resultado: R, argumentos: A) => string);
  aoConcluir?: (resultado: R, argumentos: A) => void;
}

/** Mutação do admin: invalida o que mudou e confirma com toast; o erro fica com quem chama (formulário ou painel). */
export function useMutacao<A, R>(funcao: (argumentos: A) => Promise<R>, opcoes: OpcoesDeMutacao<A, R> = {}) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: funcao,
    onSuccess: async (resultado, argumentos) => {
      await Promise.all((opcoes.invalidar ?? []).map((chave) => cliente.invalidateQueries({ queryKey: chave })));
      // O dado público também muda quando o admin salva algo.
      await cliente.invalidateQueries({ queryKey: ["publico"] });
      if (opcoes.sucesso) toast.success(typeof opcoes.sucesso === "function" ? opcoes.sucesso(resultado, argumentos) : opcoes.sucesso);
      opcoes.aoConcluir?.(resultado, argumentos);
    },
  });
}

export interface CampeonatoDoAdmin {
  campeonato: import("@/types").Campeonato;
  temporada: import("@/types").Temporada;
}

/** Todos os Campeonatos de todas as Temporadas, para os seletores do admin. */
export function useTodosOsCampeonatosDoAdmin() {
  const temporadas = useAdminTemporadas();
  const consultas = useQueries({
    queries: (temporadas.data ?? []).map((t) => ({
      queryKey: adminChaves.campeonatos(t.id),
      queryFn: () => adminApi.campeonatos(t.id),
    })),
  });
  const carregando = temporadas.isPending || consultas.some((c) => c.isPending);
  const lista: CampeonatoDoAdmin[] = (temporadas.data ?? []).flatMap((temporada, i) =>
    (consultas[i]?.data ?? []).map((campeonato) => ({ campeonato, temporada })),
  );
  return { lista, carregando, erro: temporadas.error ?? consultas.find((c) => c.error)?.error ?? null, temporadas: temporadas.data ?? [] };
}
