import { ChampionshipTeam } from "@/types";
import { apiClient } from "./api-client";

export const standingsService = {
  getByChampionshipId: async (championshipId: string): Promise<ChampionshipTeam[]> => {
    return apiClient.get<ChampionshipTeam[]>(`/standings?championshipId=${championshipId}`);
  },

  getById: async (id: string): Promise<ChampionshipTeam> => {
    return apiClient.get<ChampionshipTeam>(`/standings/${id}`);
  },

  create: async (data: Omit<ChampionshipTeam, "id">): Promise<ChampionshipTeam> => {
    return apiClient.post<ChampionshipTeam>("/standings", data);
  },

  update: async (id: string, data: Partial<ChampionshipTeam>): Promise<ChampionshipTeam> => {
    return apiClient.put<ChampionshipTeam>(`/standings/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/standings/${id}`);
  },
};
