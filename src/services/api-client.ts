// API Client Configuration
function resolveApiBaseUrl(rawUrl?: string) {
  if (!rawUrl?.trim()) {
    return "http://localhost:8081/api";
  }

  const normalizedUrl = rawUrl.trim().replace(/\/+$/, "");
  return normalizedUrl.endsWith("/api")
    ? normalizedUrl
    : `${normalizedUrl}/api`;
}

const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null as T;
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return null as T;
    }

    return JSON.parse(responseText) as T;
  }

  private async handleError(response: Response): Promise<never> {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // Response não é JSON
    }

    if (response.status === 401) {
      this.clearToken();
    }

    const error: ApiError = {
      message: errorData.message || response.statusText,
      status: response.status,
      errors: errorData.errors,
    };

    throw error;
  }

  // Métodos convenientes
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Instância global
export const apiClient = new ApiClient();