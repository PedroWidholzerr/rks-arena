import { Team } from "@/types";
import { apiClient } from "./api-client";

export function resolveTeamLogoUrl(logoUrl?: string): string | undefined {
  if (!logoUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(logoUrl)) {
    return logoUrl;
  }

  const backendOrigin = apiClient.getBaseUrl().replace(/\/api\/?$/, "");

  if (logoUrl.startsWith("/")) {
    return `${backendOrigin}${logoUrl}`;
  }

  return `${backendOrigin}/${logoUrl}`;
}

export const teamService = {
  getAll: async (): Promise<Team[]> => {
    return apiClient.get<Team[]>("/teams");
  },

  getById: async (id: string): Promise<Team> => {
    return apiClient.get<Team>(`/teams/${id}`);
  },

  create: async (data: Omit<Team, "id">): Promise<Team> => {
    return apiClient.post<Team>("/teams", data);
  },

  update: async (id: string, data: Partial<Team>): Promise<Team> => {
    return apiClient.put<Team>(`/teams/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/teams/${id}`);
  },

  uploadLogo: async (id: string, file: File): Promise<Team> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return fetch(`${apiClient.getBaseUrl()}/teams/${id}/logo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    });
  },
};
