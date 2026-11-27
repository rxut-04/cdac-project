import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://mygit-backend-y27o.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
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
  ownerId?: number;
  ownerUsername: string;
  forkedFrom?: string;
  starsCount?: number;
  forksCount?: number;
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

  getByOwner: async (owner: string, name: string): Promise<RepositoryItem> => {
    const res = await api.get<RepositoryItem>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
    return res.data;
  },

  searchPublic: async (q = ""): Promise<any[]> => {
    const res = await api.get<any[]>(`/repos/public`, { params: { q } });
    return res.data;
  },

  delete: async (name: string): Promise<void> => {
    await api.delete(`/repos/${encodeURIComponent(name)}`);
  },

  getStarStatus: async (name: string): Promise<{ starred: boolean; starCount: number }> => {
    const res = await api.get<{ starred: boolean; starCount: number }>(`/repos/${encodeURIComponent(name)}/star`);
    return res.data;
  },

  toggleStar: async (name: string): Promise<{ starred: boolean; starCount: number }> => {
    const res = await api.post<{ starred: boolean; starCount: number }>(`/repos/${encodeURIComponent(name)}/star`);
    return res.data;
  },

  fork: async (name: string): Promise<RepositoryItem> => {
    const res = await api.post<RepositoryItem>(`/repos/${encodeURIComponent(name)}/fork`);
    return res.data;
  },

  update: async (name: string, data: { name?: string; description?: string }): Promise<RepositoryItem> => {
    const res = await api.patch<RepositoryItem>(`/repos/${encodeURIComponent(name)}`, data);
    return res.data;
  },

  updateVisibility: async (name: string, isPrivate: boolean): Promise<RepositoryItem> => {
    const res = await api.patch<RepositoryItem>(`/repos/${encodeURIComponent(name)}/visibility`, { isPrivate });
    return res.data;
  },

  transfer: async (name: string, newOwnerUsername: string): Promise<RepositoryItem> => {
    const res = await api.post<RepositoryItem>(`/repos/${encodeURIComponent(name)}/transfer`, { newOwnerUsername });
    return res.data;
  },

  upsertFile: async (
    name: string,
    payload: { path: string; content: string; branch?: string; message?: string }
  ): Promise<{ path: string; branch: string; commitSha: string; blobSha: string }> => {
    const res = await api.post(`/repos/${encodeURIComponent(name)}/files`, payload);
    return res.data;
  },

  chat: async (
    owner: string,
    name: string,
    payload: {
      message: string;
      branch?: string;
      activeFilePath?: string;
      activeFileContent?: string;
    }
  ): Promise<{
    reply: string;
    reasoning: string;
    reasoningSeconds: number;
    steps: Array<{
      id: string;
      title: string;
      state: "running" | "done" | "error";
      durationMs?: number;
      detail?: string;
    }>;
    model: string;
  }> => {
    const res = await api.post(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/chat`, payload);
    return res.data;
  },

  listDeployments: async (owner: string, name: string): Promise<any[]> => {
    const res = await api.get(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/deployments`);
    return res.data;
  },

  triggerDeployment: async (owner: string, name: string, branch = "main"): Promise<{ deployment: any; logs: any[] }> => {
    const res = await api.post(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/deployments`, { branch });
    return res.data;
  },

  getDeploymentLogs: async (id: number | string): Promise<{ deployment: any; logs: any[] }> => {
    const res = await api.get(`/deployments/${id}/logs`);
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<any> => {
    const res = await api.get("/dashboard/summary");
    return res.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    bio?: string;
    location?: string;
    website?: string;
  }): Promise<any> => {
    const res = await api.patch("/user/profile", data);
    return res.data;
  },

  listTokens: async (): Promise<any[]> => {
    const res = await api.get("/user/tokens");
    return res.data;
  },

  createToken: async (data: { name: string; expires?: string; scopes?: string }): Promise<any> => {
    const res = await api.post("/user/tokens", data);
    return res.data;
  },

  deleteToken: async (id: number | string): Promise<void> => {
    await api.delete(`/user/tokens/${id}`);
  },

  listSshKeys: async (): Promise<any[]> => {
    const res = await api.get("/user/ssh-keys");
    return res.data;
  },

  addSshKey: async (data: { title: string; publicKey: string }): Promise<any> => {
    const res = await api.post("/user/ssh-keys", data);
    return res.data;
  },

  deleteSshKey: async (id: number | string): Promise<void> => {
    await api.delete(`/user/ssh-keys/${id}`);
  },

  listDiscussions: async (): Promise<any[]> => {
    const res = await api.get("/discussions");
    return res.data;
  },

  createDiscussion: async (data: { title: string; body?: string; category?: string }): Promise<any> => {
    const res = await api.post("/discussions", data);
    return res.data;
  },

  listDiscussionComments: async (id: number | string): Promise<any[]> => {
    const res = await api.get(`/discussions/${id}/comments`);
    return res.data;
  },

  addDiscussionComment: async (id: number | string, body: string): Promise<any> => {
    const res = await api.post(`/discussions/${id}/comments`, { body });
    return res.data;
  },

  updateSettings: async (data: {
    emailOnPr?: boolean;
    emailOnMention?: boolean;
    weeklyDigest?: boolean;
  }): Promise<any> => {
    const res = await api.patch("/user/settings", data);
    return res.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete("/user");
  },

  markAllNotificationsRead: async (keys: string[]): Promise<void> => {
    await api.post("/user/notifications/read-all", { keys });
  },

  markNotificationRead: async (key: string): Promise<void> => {
    await api.post(`/user/notifications/${encodeURIComponent(key)}/read`);
  },

  muteNotification: async (key: string): Promise<void> => {
    await api.post(`/user/notifications/${encodeURIComponent(key)}/mute`);
  },

  importRepo: async (data: { url: string; name?: string; isPrivate?: boolean }): Promise<any> => {
    const res = await api.post("/repos/import", data);
    return res.data;
  },

  createIssue: async (
    repoName: string,
    data: { title: string; description?: string; labels?: string }
  ): Promise<any> => {
    const res = await api.post(`/repos/${encodeURIComponent(repoName)}/issues`, data);
    return res.data;
  },

  createPullRequest: async (
    repoName: string,
    data: { title: string; description?: string; sourceBranch?: string; targetBranch?: string }
  ): Promise<any> => {
    const res = await api.post(`/repos/${encodeURIComponent(repoName)}/pulls`, data);
    return res.data;
  },
};
