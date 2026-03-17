import { Season } from "@/types";
import { apiClient } from "./api-client";

export const seasonService = {
  getAll: async (): Promise<Season[]> => {
    return apiClient.get<Season[]>("/seasons");
  },

  getById: async (id: string): Promise<Season> => {
    return apiClient.get<Season>(`/seasons/${id}`);
  },

  create: async (data: Omit<Season, "id">): Promise<Season> => {
    return apiClient.post<Season>("/seasons", data);
  },

  update: async (id: string, data: Partial<Season>): Promise<Season> => {
    return apiClient.put<Season>(`/seasons/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/seasons/${id}`);
  },
};
