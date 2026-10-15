// Espelho dos DTOs do backend. Mudar um DTO exige mudar o tipo aqui, no mesmo commit.

export interface Temporada {
  id: string;
  nome: string;
  dataInicio: string | null;
  dataFim: string | null;
  encerrada: boolean;
  criadoEm: string;
}

export interface Pontuacao {
  vitoria: number;
  derrotaDecisiva: number;
  derrota: number;
}

export type CriterioDesempate = "CONFRONTO_DIRETO" | "SALDO" | "JOGOS_VENCIDOS";

export interface ConfiguracaoDoCampeonato {
  melhorDe: number;
  pontuacao: Pontuacao;
  criterios: CriterioDesempate[];
}

export type EstadoDoCampeonato = "EM_BREVE" | "EM_ANDAMENTO" | "ENCERRADO";

export interface Campeonato {
  id: string;
  temporadaId: string;
  faseId: string | null;
  nome: string;
  descricao: string | null;
  modo: "ARAM" | "SUMMONERS_RIFT";
  tamanhoTime: number;
  configuracao: ConfiguracaoDoCampeonato;
  limiteTimes: number | null;
  estado: EstadoDoCampeonato;
  congelado: boolean;
  partidasFinalizadas: number;
  criadoEm: string;
}

export interface Fase {
  id: string;
  nome: string;
  formato: string;
  ordem: number;
  turnos: number;
}

export interface Time {
  id: string;
  nome: string;
  tag: string;
  logoUrl: string | null;
  criadoEm: string;
}

export interface Jogador {
  id: string;
  nick: string;
  tag: string;
  riotId: string;
  fotoUrl: string | null;
  criadoEm: string;
}

export interface MembroDoElenco {
  jogadorId: string;
  nick: string;
  tag: string;
  funcao: "TITULAR" | "RESERVA";
  capitao: boolean;
}

export interface Elenco {
  id: string;
  timeId: string;
  temporadaId: string;
  membros: MembroDoElenco[];
}

export interface Participacao {
  id: string;
  campeonatoId: string;
  timeId: string;
  timeNome: string;
  timeTag: string;
  elencoId: string;
}

export interface TimeResumo {
  id: string;
  nome: string;
  tag: string;
}

export type EstadoDaPartida = "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "ANULADA";

export interface Partida {
  id: string;
  faseId: string;
  campeonatoId: string;
  rodada: number;
  posicao: number;
  timeA: TimeResumo | null;
  timeB: TimeResumo | null;
  estado: EstadoDaPartida;
  jogosA: number | null;
  jogosB: number | null;
  walkover: boolean;
  agendadaPara: string | null;
  streamUrl: string | null;
  mvpJogadorId: string | null;
  version: number;
  atualizadoEm: string;
}

export interface LinhaDaTabela {
  posicao: number;
  timeId: string;
  nome: string;
  tag: string;
  logoUrl: string | null;
  jogadas: number;
  vitorias: number;
  derrotas: number;
  jogosAFavor: number;
  jogosContra: number;
  saldo: number;
  pontos: number;
  empate: boolean;
}

export interface EmpateAberto {
  posicao: number;
  times: string[];
}

export interface Tabela {
  faseId: string;
  campeonatoId: string;
  melhorDe: number;
  linhas: LinhaDaTabela[];
  empatesAbertos: EmpateAberto[];
  decisoesOrfas: number;
  atualizadoEm: string;
}

export interface Administrador {
  id: string;
  email: string;
  ativo: boolean;
  trocarSenha: boolean;
  criadoEm: string;
}

export interface SessaoDoServidor {
  token: string;
  trocarSenha: boolean;
  expiraEm: string;
}

/** Envelope das respostas públicas de dados: sempre traz quando o dado foi montado. */
export interface RespostaPublica<T> {
  dados: T;
  atualizadoEm: string;
}

export interface TemporadaComCampeonatos {
  temporada: Temporada;
  campeonatos: Campeonato[];
  destaque: boolean;
}

export interface TimePublico {
  time: Time;
  elencos: Elenco[];
}

export interface Pagina<T> {
  itens: T[];
  pagina: number;
  tamanho: number;
  total: number;
}

export interface Recalculo {
  consistente: boolean;
  tabela: Tabela;
}
