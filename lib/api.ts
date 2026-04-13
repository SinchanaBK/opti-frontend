import type { AuthResponse, Asset, AssetCreate, AssetUpdate, DashboardStats, User, UserCreate } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : JSON.stringify(data.detail));
  return data as T;
}

export const authApi = {
  login:  (email: string, password: string) => apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me:     (token: string) => apiFetch<User>("/auth/me", {}, token),
};

export const assetsApi = {
  getAll: (token: string) => apiFetch<Asset[]>("/assets/", {}, token),
  getMy:  (token: string) => apiFetch<Asset[]>("/assets/my", {}, token),
  getOne: (id: number, token: string) => apiFetch<Asset>(`/assets/${id}`, {}, token),
  create: (p: AssetCreate, token: string) => apiFetch<Asset>("/assets/", { method: "POST", body: JSON.stringify(p) }, token),
  update: (id: number, p: AssetUpdate, token: string) => apiFetch<Asset>(`/assets/${id}`, { method: "PUT", body: JSON.stringify(p) }, token),
  delete: (id: number, token: string) => apiFetch<void>(`/assets/${id}`, { method: "DELETE" }, token),
};

export const usersApi = {
  getAll: (token: string) => apiFetch<User[]>("/users/", {}, token),
  create: (p: UserCreate, token: string) => apiFetch<User>("/users/", { method: "POST", body: JSON.stringify(p) }, token),
  delete: (id: number, token: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }, token),
};

export const dashboardApi = {
  getStats: (token: string) => apiFetch<DashboardStats>("/dashboard/stats", {}, token),
};
register: (name: string, email: string, password: string) =>
  apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  }),
