import { Match } from "@/types";
import { apiClient } from "./api-client";

export const matchService = {
  getAll: async (): Promise<Match[]> => {
    return apiClient.get<Match[]>("/matches");
  },

  getById: async (id: string): Promise<Match> => {
    return apiClient.get<Match>(`/matches/${id}`);
  },

  getByChampionshipId: async (championshipId: string): Promise<Match[]> => {
    return apiClient.get<Match[]>(`/matches?championshipId=${championshipId}`);
  },

  getByTeamId: async (teamId: string): Promise<Match[]> => {
    return apiClient.get<Match[]>(`/matches?teamId=${teamId}`);
  },

  create: async (data: Omit<Match, "id">): Promise<Match> => {
    return apiClient.post<Match>("/matches", data);
  },

  update: async (id: string, data: Partial<Match>): Promise<Match> => {
    return apiClient.put<Match>(`/matches/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/matches/${id}`);
  },
};
