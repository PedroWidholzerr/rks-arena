/**
 * Utilitários para o sistema de Arena
 */

export const StatusLabels: Record<string, string> = {
  upcoming: "Próximo",
  ongoing: "Em Andamento",
  finished: "Finalizado",
};

export const StatusColors: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "bg-blue-500/10", text: "text-blue-500" },
  ongoing: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  finished: { bg: "bg-green-500/10", text: "text-green-500" },
};

export function getStatusLabel(
  status: "upcoming" | "ongoing" | "finished"
): string {
  return StatusLabels[status] || status;
}

export function getStatusColor(
  status: "upcoming" | "ongoing" | "finished"
): { bg: string; text: string } {
  return StatusColors[status] || { bg: "bg-gray-500/10", text: "text-gray-500" };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getScoreResult(
  scoreA: number,
  scoreB: number
): "WIN" | "LOSS" | "DRAW" {
  if (scoreA > scoreB) return "WIN";
  if (scoreA < scoreB) return "LOSS";
  return "DRAW";
}

export function getTeamResult(teamId: string, match: any): string {
  if (match.teamAId === teamId) {
    return getScoreResult(match.scoreA, match.scoreB);
  } else {
    return getScoreResult(match.scoreB, match.scoreA);
  }
}

export function getTeamPoints(wins: number, losses: number): number {
  // Padrão: vitória = 3 pontos, derrota = 0 pontos
  return wins * 3;
}

export function sortByPoints(
  a: any,
  b: any
): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (a.losses !== b.losses) return a.losses - b.losses;
  return 0;
}
