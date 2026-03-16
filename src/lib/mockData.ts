import { Season, Championship, Team, Player, Match, ChampionshipTeam } from "@/types";

export const seasons: Season[] = [
  { id: "s1", name: "Season 1: Genesis", year: 2024 },
  { id: "s2", name: "Season 2: Rising", year: 2025 },
];

export const championships: Championship[] = [
  { id: "c1", name: "ARAM Cup #1", description: "The inaugural ARAM championship.", seasonId: "s1", status: "finished" },
  { id: "c2", name: "ARAM Cup #2", description: "Second championship, higher stakes.", seasonId: "s1", status: "finished" },
  { id: "c3", name: "The Ascent", description: "Season 2 opening championship.", seasonId: "s2", status: "ongoing" },
  { id: "c4", name: "Winter Clash", description: "End of year showdown.", seasonId: "s2", status: "upcoming" },
];

export const teams: Team[] = [
  { id: "t1", name: "Shadow Wolves", tag: "SHW", description: "Aggressive early-game team." },
  { id: "t2", name: "Neon Vipers", tag: "NVP", description: "Strategic and patient playstyle." },
  { id: "t3", name: "Frost Giants", tag: "FRG", description: "Tank-heavy compositions." },
  { id: "t4", name: "Crimson Blaze", tag: "CRB", description: "All-out damage dealers." },
  { id: "t5", name: "Phantom Rift", tag: "PHR", description: "Masters of the late game." },
  { id: "t6", name: "Iron Sentinels", tag: "IRS", description: "Defensive fortress team." },
];

export const players: Player[] = [
  { id: "p1", nickname: "Darkflow", tag: "DRK", teamId: "t1", isCaptain: true },
  { id: "p2", nickname: "Blitz", tag: "BLZ", teamId: "t1", isCaptain: false },
  { id: "p3", nickname: "Shade", tag: "SHD", teamId: "t1", isCaptain: false },
  { id: "p4", nickname: "Venom", tag: "VNM", teamId: "t2", isCaptain: true },
  { id: "p5", nickname: "Pulse", tag: "PLS", teamId: "t2", isCaptain: false },
  { id: "p6", nickname: "Cipher", tag: "CPR", teamId: "t2", isCaptain: false },
  { id: "p7", nickname: "Glacier", tag: "GLC", teamId: "t3", isCaptain: true },
  { id: "p8", nickname: "Titan", tag: "TTN", teamId: "t3", isCaptain: false },
  { id: "p9", nickname: "Inferno", tag: "INF", teamId: "t4", isCaptain: true },
  { id: "p10", nickname: "Scorch", tag: "SCR", teamId: "t4", isCaptain: false },
  { id: "p11", nickname: "Wraith", tag: "WRT", teamId: "t5", isCaptain: true },
  { id: "p12", nickname: "Echo", tag: "ECH", teamId: "t5", isCaptain: false },
  { id: "p13", nickname: "Bastion", tag: "BST", teamId: "t6", isCaptain: true },
  { id: "p14", nickname: "Aegis", tag: "AGS", teamId: "t6", isCaptain: false },
];

export const matches: Match[] = [
  { id: "m1", championshipId: "c3", teamAId: "t1", teamBId: "t2", scheduledAt: "2025-03-10T20:00:00Z", scoreA: 1, scoreB: 0, mvpPlayerId: "p1" },
  { id: "m2", championshipId: "c3", teamAId: "t3", teamBId: "t4", scheduledAt: "2025-03-11T20:00:00Z", scoreA: 0, scoreB: 1, mvpPlayerId: "p9" },
  { id: "m3", championshipId: "c3", teamAId: "t1", teamBId: "t3", scheduledAt: "2025-03-15T20:00:00Z", scoreA: 1, scoreB: 0, mvpPlayerId: "p2" },
  { id: "m4", championshipId: "c3", teamAId: "t2", teamBId: "t4", scheduledAt: "2025-03-16T21:00:00Z", scoreA: 0, scoreB: 0 },
  { id: "m5", championshipId: "c3", teamAId: "t5", teamBId: "t6", scheduledAt: "2025-03-18T20:00:00Z", scoreA: 0, scoreB: 0 },
  { id: "m6", championshipId: "c1", teamAId: "t1", teamBId: "t2", scheduledAt: "2024-06-10T20:00:00Z", scoreA: 1, scoreB: 0, mvpPlayerId: "p1" },
  { id: "m7", championshipId: "c1", teamAId: "t3", teamBId: "t4", scheduledAt: "2024-06-12T20:00:00Z", scoreA: 1, scoreB: 0, mvpPlayerId: "p7" },
];

export const championshipTeams: ChampionshipTeam[] = [
  { id: "ct1", championshipId: "c3", teamId: "t1", wins: 2, losses: 0, points: 6 },
  { id: "ct2", championshipId: "c3", teamId: "t2", wins: 0, losses: 1, points: 0 },
  { id: "ct3", championshipId: "c3", teamId: "t3", wins: 0, losses: 1, points: 0 },
  { id: "ct4", championshipId: "c3", teamId: "t4", wins: 1, losses: 0, points: 3 },
  { id: "ct5", championshipId: "c3", teamId: "t5", wins: 0, losses: 0, points: 0 },
  { id: "ct6", championshipId: "c3", teamId: "t6", wins: 0, losses: 0, points: 0 },
  { id: "ct7", championshipId: "c1", teamId: "t1", wins: 1, losses: 0, points: 3 },
  { id: "ct8", championshipId: "c1", teamId: "t2", wins: 0, losses: 1, points: 0 },
  { id: "ct9", championshipId: "c1", teamId: "t3", wins: 1, losses: 0, points: 3 },
  { id: "ct10", championshipId: "c1", teamId: "t4", wins: 0, losses: 1, points: 0 },
];

// Helper functions
export function getTeamById(id: string) {
  return teams.find(t => t.id === id);
}

export function getPlayerById(id: string) {
  return players.find(p => p.id === id);
}

export function getPlayersByTeam(teamId: string) {
  return players.filter(p => p.teamId === teamId);
}

export function getChampionshipById(id: string) {
  return championships.find(c => c.id === id);
}

export function getSeasonById(id: string) {
  return seasons.find(s => s.id === id);
}

export function getMatchesByChampionship(championshipId: string) {
  return matches.filter(m => m.championshipId === championshipId);
}

export function getStandingsByChampionship(championshipId: string) {
  return championshipTeams
    .filter(ct => ct.championshipId === championshipId)
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
}

export function getMatchesByTeam(teamId: string) {
  return matches.filter(m => m.teamAId === teamId || m.teamBId === teamId);
}

export function getMvpCountByPlayer(playerId: string) {
  return matches.filter(m => m.mvpPlayerId === playerId).length;
}

export function getChampionshipsByTeam(teamId: string) {
  return championshipTeams
    .filter(ct => ct.teamId === teamId)
    .map(ct => ({ ...ct, championship: getChampionshipById(ct.championshipId)! }));
}
