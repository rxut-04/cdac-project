import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every call as instructed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthorized: clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("mygit_user");
      if (typeof window !== "undefined" && window.location.hash === "#dashboard") {
        window.location.hash = "#login";
      }
    }
    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
}

export interface RepositoryItem {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  ownerId: number;
  ownerUsername: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("mygit_user", JSON.stringify(res.data));
    return res.data;
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", { username, email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("mygit_user", JSON.stringify(res.data));
    return res.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await api.get<AuthUser>("/auth/me");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("mygit_user");
  },

  getToken: () => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  },

  getStoredUser: (): AuthResponse | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("mygit_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

export const repoApi = {
  list: async (): Promise<RepositoryItem[]> => {
    const res = await api.get<RepositoryItem[]>("/repos");
    return res.data;
  },

  create: async (data: { name: string; description?: string; isPrivate?: boolean }): Promise<RepositoryItem> => {
    const res = await api.post<RepositoryItem>("/repos", data);
    return res.data;
  },

  get: async (name: string): Promise<RepositoryItem> => {
    const res = await api.get<RepositoryItem>(`/repos/${encodeURIComponent(name)}`);
    return res.data;
  },

  delete: async (name: string): Promise<void> => {
    await api.delete(`/repos/${encodeURIComponent(name)}`);
  },
};
