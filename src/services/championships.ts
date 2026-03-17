import { Championship } from "@/types";
import { apiClient } from "./api-client";

export const championshipService = {
  getAll: async (): Promise<Championship[]> => {
    return apiClient.get<Championship[]>("/championships");
  },

  getById: async (id: string): Promise<Championship> => {
    return apiClient.get<Championship>(`/championships/${id}`);
  },

  getBySeasonId: async (seasonId: string): Promise<Championship[]> => {
    return apiClient.get<Championship[]>(`/championships?seasonId=${seasonId}`);
  },

  create: async (data: Omit<Championship, "id">): Promise<Championship> => {
    return apiClient.post<Championship>("/championships", data);
  },

  update: async (id: string, data: Partial<Championship>): Promise<Championship> => {
    return apiClient.put<Championship>(`/championships/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/championships/${id}`);
  },

  getTeamIds: async (championshipId: string): Promise<string[]> => {
    return apiClient.get<string[]>(`/championships/${championshipId}/teams`);
  },

  setTeams: async (championshipId: string, teamIds: string[]): Promise<void> => {
    return apiClient.put<void>(`/championships/${championshipId}/teams`, { teamIds });
  },
};
