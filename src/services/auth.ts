import { apiClient } from "./api-client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export const authService = {

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    apiClient.setToken(response.token);
    // Padroniza o role para 'admin' se vier como 'ADMIN'
    if (response.user && response.user.role && response.user.role.toLowerCase() === "admin") {
      response.user.role = "admin";
    }
    return response;
  },


  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    apiClient.setToken(response.token);
    if (response.user && response.user.role && response.user.role.toLowerCase() === "admin") {
      response.user.role = "admin";
    }
    return response;
  },

  logout: () => {
    apiClient.clearToken();
  },

  refreshToken: async (): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/refresh");
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<AuthResponse>("/auth/me");
    if (response.user && response.user.role && response.user.role.toLowerCase() === "admin") {
      response.user.role = "admin";
    }
    return response.user;
  },

  isAuthenticated: (): boolean => {
    return apiClient.isAuthenticated();
  },
};
