export type Status = "upcoming" | "ongoing" | "finished";

export interface Season {
  id: string;
  name: string;
  year: number;
}

export interface Championship {
  id: string;
  name: string;
  description: string;
  seasonId: string;
  status: Status;
  bestOf: number;
  pointsPerWin: number;
  pointsPerLoss: number;
  pointsPerLossDecider: number;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logoUrl?: string;
  description: string;
}

export interface Player {
  id: string;
  nickname: string;
  tag: string;
  teamId: string;
  isCaptain: boolean;
  notes?: string;
}

export interface Match {
  id: string;
  championshipId: string;
  teamAId: string;
  teamBId: string;
  scheduledAt: string;
  scoreA: number;
  scoreB: number;
  comment?: string;
  mvpPlayerId?: string;
}

export interface ChampionshipTeam {
  id: string;
  championshipId: string;
  teamId: string;
  wins: number;
  losses: number;
  points: number;
}
