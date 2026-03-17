import { Player } from "@/types";
import { apiClient } from "./api-client";

export const playerService = {
  getAll: async (): Promise<Player[]> => {
    return apiClient.get<Player[]>("/players");
  },

  getById: async (id: string): Promise<Player> => {
    return apiClient.get<Player>(`/players/${id}`);
  },

  getByTeamId: async (teamId: string): Promise<Player[]> => {
    return apiClient.get<Player[]>(`/players?teamId=${teamId}`);
  },

  create: async (data: Omit<Player, "id">): Promise<Player> => {
    return apiClient.post<Player>("/players", data);
  },

  update: async (id: string, data: Partial<Player>): Promise<Player> => {
    return apiClient.put<Player>(`/players/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/players/${id}`);
  },
};
