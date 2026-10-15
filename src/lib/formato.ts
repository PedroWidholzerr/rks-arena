// Datas e textos no padrão do produto: pt-BR, 24 h e fuso do Campeonato (America/Sao_Paulo).
export const FUSO = "America/Sao_Paulo";

const formatadorDia = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" });
const formatadorHora = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", hour12: false });
const formatadorDiaCompleto = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const formatadorIso = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });

/** "dd/mm" no fuso do Campeonato. */
export function dia(iso: string | null | undefined): string {
  return iso ? formatadorDia.format(new Date(iso)) : "";
}

/** "HH:mm" no fuso do Campeonato. */
export function hora(iso: string | null | undefined): string {
  return iso ? formatadorHora.format(new Date(iso)) : "";
}

/** "dd/mm às HH:mm", ou "Sem horário" quando a Partida ainda não tem data. */
export function diaEHora(iso: string | null | undefined): string {
  return iso ? `${dia(iso)} às ${hora(iso)}` : "Sem horário";
}

/** "AAAA-MM-DD" do dia no fuso do Campeonato, para agrupar e comparar. */
export function chaveDoDia(iso: string): string {
  return formatadorIso.format(new Date(iso));
}

/** "Hoje", "Amanhã" ou "segunda-feira, 12 de outubro". */
export function rotuloDoDia(chave: string, agora: Date = new Date()): string {
  const hoje = formatadorIso.format(agora);
  const amanha = formatadorIso.format(new Date(agora.getTime() + 24 * 60 * 60 * 1000));
  if (chave === hoje) return "Hoje";
  if (chave === amanha) return "Amanhã";
  return formatadorDiaCompleto.format(new Date(`${chave}T12:00:00-03:00`));
}

/** Placar como "2×1"; o sinal de menos quando ainda não há resultado. */
export function placar(a: number | null, b: number | null): string {
  return a === null || b === null ? "–" : `${a}×${b}`;
}

/** Até duas iniciais de um nome, para o avatar sem imagem. */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Texto do avatar de um Time: a tag, com até 3 letras. */
export function textoDoAvatarDoTime(tag: string): string {
  return tag.trim().slice(0, 3).toUpperCase();
}

export const MODO: Record<string, string> = { ARAM: "ARAM", SUMMONERS_RIFT: "Summoner's Rift" };

export const ESTADO_DO_CAMPEONATO: Record<string, string> = {
  EM_BREVE: "Em breve",
  EM_ANDAMENTO: "Em andamento",
  ENCERRADO: "Encerrado",
};

/** Só https é aberto como link externo. */
export function ehHttps(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Placares válidos de uma Partida melhor de N, só a partir de N (o servidor continua sendo a autoridade). */
export function placaresValidos(melhorDe: number): Array<[number, number]> {
  const necessarios = Math.ceil(melhorDe / 2);
  const opcoes: Array<[number, number]> = [];
  for (let perdedor = necessarios - 1; perdedor >= 0; perdedor--) opcoes.push([necessarios, perdedor]);
  for (let perdedor = 0; perdedor <= necessarios - 1; perdedor++) opcoes.push([perdedor, necessarios]);
  return opcoes;
}
