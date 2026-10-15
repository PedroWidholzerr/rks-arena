// Chamadas HTTP tipadas. A interface nunca calcula posição, pontos nem desempate: mostra o que a API devolve.
import { apiClient } from "./apiClient";
import type {
  Administrador,
  Campeonato,
  CriterioDesempate,
  Elenco,
  Fase,
  Jogador,
  Pagina,
  Participacao,
  Partida,
  Pontuacao,
  Recalculo,
  RespostaPublica,
  SessaoDoServidor,
  Tabela,
  Temporada,
  TemporadaComCampeonatos,
  Time,
  TimePublico,
} from "@/types";

const get = <T>(caminho: string) => apiClient.requisitar<T>(caminho);
const admin = <T>(caminho: string, metodo: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET", corpo?: unknown) =>
  apiClient.requisitar<T>(caminho, { metodo, corpo, autenticada: true });

export const status = () => get<{ ok: boolean; versao: string }>("/public/status");

// ---- Autenticação ----
export const autenticacao = {
  entrar: (email: string, senha: string) =>
    apiClient.requisitar<SessaoDoServidor>("/auth/login", { metodo: "POST", corpo: { email, senha }, repetir: "sempre" }),
  trocarSenha: (senhaAtual: string, novaSenha: string) =>
    apiClient.requisitar<SessaoDoServidor>("/auth/password", {
      metodo: "POST",
      corpo: { senhaAtual, novaSenha },
      autenticada: true,
    }),
};

// ---- Público (somente leitura) ----
export const publico = {
  temporadas: () => get<RespostaPublica<TemporadaComCampeonatos[]>>("/public/seasons"),
  temporada: (id: string) => get<RespostaPublica<TemporadaComCampeonatos>>(`/public/seasons/${id}`),
  campeonato: (id: string) => get<RespostaPublica<Campeonato>>(`/public/championships/${id}`),
  fases: (campeonatoId: string) => get<RespostaPublica<Fase[]>>(`/public/championships/${campeonatoId}/phases`),
  classificacao: (faseId: string) => get<RespostaPublica<Tabela>>(`/public/phases/${faseId}/standings`),
  partidas: (campeonatoId: string, filtros: { fase?: string; time?: string; dia?: string } = {}) => {
    const parametros = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => valor && parametros.set(chave, valor));
    const consulta = parametros.toString();
    return get<RespostaPublica<Partida[]>>(`/public/championships/${campeonatoId}/matches${consulta ? `?${consulta}` : ""}`);
  },
  times: () => get<RespostaPublica<Time[]>>("/public/teams"),
  time: (id: string) => get<RespostaPublica<TimePublico>>(`/public/teams/${id}`),
  jogadores: (busca = "", pagina?: number) => {
    const parametros = new URLSearchParams();
    if (busca) parametros.set("busca", busca);
    if (pagina !== undefined) parametros.set("pagina", String(pagina));
    const consulta = parametros.toString();
    return get<RespostaPublica<Pagina<Jogador>>>(`/public/players${consulta ? `?${consulta}` : ""}`);
  },
  jogador: (id: string) => get<RespostaPublica<Jogador>>(`/public/players/${id}`),
};

// ---- Admin ----
export interface DadosDoCampeonato {
  temporadaId: string;
  nome: string;
  descricao?: string;
  melhorDe?: number;
  pontuacao?: Pontuacao;
  criterios?: CriterioDesempate[];
}

export const adminApi = {
  temporadas: () => admin<Temporada[]>("/admin/seasons"),
  criarTemporada: (dados: { nome: string; dataInicio?: string; dataFim?: string }) => admin<Temporada>("/admin/seasons", "POST", dados),
  atualizarTemporada: (id: string, dados: { nome: string; dataInicio?: string; dataFim?: string }) =>
    admin<Temporada>(`/admin/seasons/${id}`, "PUT", dados),
  encerrarTemporada: (id: string) => admin<Temporada>(`/admin/seasons/${id}/close`, "POST"),
  reabrirTemporada: (id: string) => admin<Temporada>(`/admin/seasons/${id}/reopen`, "POST"),
  excluirTemporada: (id: string) => admin<void>(`/admin/seasons/${id}`, "DELETE"),

  campeonatos: (temporadaId: string) => admin<Campeonato[]>(`/admin/championships?temporadaId=${temporadaId}`),
  campeonato: (id: string) => admin<Campeonato>(`/admin/championships/${id}`),
  criarCampeonato: (dados: DadosDoCampeonato) => admin<Campeonato>("/admin/championships", "POST", dados),
  atualizarCampeonato: (id: string, dados: { nome: string; descricao?: string; estado?: string }) =>
    admin<Campeonato>(`/admin/championships/${id}`, "PUT", dados),
  configurarCampeonato: (id: string, dados: { melhorDe: number; pontuacao: Pontuacao; criterios: CriterioDesempate[] }) =>
    admin<Campeonato>(`/admin/championships/${id}/config`, "PUT", dados),
  timesDoCampeonato: (id: string) => admin<Participacao[]>(`/admin/championships/${id}/teams`),
  vincularTime: (id: string, timeId: string) => admin<Participacao>(`/admin/championships/${id}/teams`, "POST", { timeId }),
  desvincularTime: (id: string, timeId: string) => admin<void>(`/admin/championships/${id}/teams/${timeId}`, "DELETE"),

  times: () => admin<Time[]>("/admin/teams"),
  criarTime: (dados: { nome: string; tag: string }) => admin<Time>("/admin/teams", "POST", dados),
  atualizarTime: (id: string, dados: { nome: string; tag: string }) => admin<Time>(`/admin/teams/${id}`, "PUT", dados),
  excluirTime: (id: string) => admin<void>(`/admin/teams/${id}`, "DELETE"),
  elenco: (timeId: string, temporadaId: string) => admin<Elenco>(`/admin/teams/${timeId}/rosters/${temporadaId}`),
  salvarElenco: (timeId: string, temporadaId: string, membros: { jogadorId: string; funcao: string; capitao: boolean }[]) =>
    admin<Elenco>(`/admin/teams/${timeId}/rosters/${temporadaId}`, "PUT", { membros }),
  enviarLogo: (timeId: string, arquivo: File) => enviarArquivo<Time>(`/admin/teams/${timeId}/logo`, arquivo),
  removerLogo: (timeId: string) => admin<void>(`/admin/teams/${timeId}/logo`, "DELETE"),

  jogadores: (busca = "") => admin<Jogador[]>(`/admin/players${busca ? `?busca=${encodeURIComponent(busca)}` : ""}`),
  criarJogador: (dados: { nick: string; tag: string }) => admin<Jogador>("/admin/players", "POST", dados),
  atualizarJogador: (id: string, dados: { nick: string; tag: string }) => admin<Jogador>(`/admin/players/${id}`, "PUT", dados),
  enviarFoto: (jogadorId: string, arquivo: File) => enviarArquivo<Jogador>(`/admin/players/${jogadorId}/photo`, arquivo),
  removerFoto: (jogadorId: string) => admin<void>(`/admin/players/${jogadorId}/photo`, "DELETE"),

  partidas: (faseId: string) => admin<Partida[]>(`/admin/matches?faseId=${faseId}`),
  agendarPartida: (dados: { faseId: string; timeAId: string; timeBId: string; rodada?: number; agendadaPara?: string; streamUrl?: string }) =>
    admin<Partida>("/admin/matches", "POST", dados),
  atualizarPartida: (id: string, dados: { version: number; timeAId: string; timeBId: string; agendadaPara?: string | null; streamUrl?: string | null }) =>
    admin<Partida>(`/admin/matches/${id}`, "PUT", dados),
  excluirPartida: (id: string) => admin<void>(`/admin/matches/${id}`, "DELETE"),
  iniciarPartida: (id: string, version: number) => admin<Partida>(`/admin/matches/${id}/start`, "POST", { version }),
  /** A chave de idempotência nasce na tela, uma por tentativa de salvar (repetir a mesma não grava duas vezes). */
  lancarResultado: (id: string, dados: { version: number; jogosA: number; jogosB: number; mvpJogadorId?: string | null }, chave: string) =>
    apiClient.requisitar<Partida>(`/admin/matches/${id}/result`, {
      metodo: "PUT",
      corpo: dados,
      autenticada: true,
      cabecalhos: { "Idempotency-Key": chave },
      repetir: "sempre",
    }),
  registrarWalkover: (id: string, version: number, vencedor: "A" | "B") =>
    admin<Partida>(`/admin/matches/${id}/walkover`, "PUT", { version, vencedor }),
  anularResultado: (id: string, version: number) => admin<Partida>(`/admin/matches/${id}/annul`, "PUT", { version }),

  decidirEmpate: (faseId: string, ordem: string[], motivo: string) =>
    admin<Tabela>(`/admin/phases/${faseId}/tie-decisions`, "POST", { ordem, motivo }),
  recalcular: (faseId: string) => admin<Recalculo>(`/admin/phases/${faseId}/recalculate`, "POST"),

  administradores: () => admin<Administrador[]>("/admin/users"),
  criarAdministrador: (email: string) =>
    admin<{ administrador: Administrador; senhaTemporaria: string }>("/admin/users", "POST", { email }),
  definirAtivo: (id: string, ativo: boolean) => admin<Administrador>(`/admin/users/${id}/active`, "PATCH", { ativo }),
  exportar: () => admin<Record<string, unknown>>("/admin/export"),
};

function enviarArquivo<T>(caminho: string, arquivo: File): Promise<T> {
  const formulario = new FormData();
  formulario.append("arquivo", arquivo);
  return apiClient.requisitar<T>(caminho, { metodo: "PUT", formulario, autenticada: true });
}
