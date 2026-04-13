export interface Permission { id: number; name: string; description: string | null; }
export interface Role       { id: number; name: string; permissions: Permission[]; }
export interface User {
  id: number; full_name: string; email: string;
  is_active: boolean; created_at: string; role: Role;
}
export interface AuthState  { token: string; user: User; permissions: string[]; }
export interface AuthResponse { access_token: string; token_type: string; user: User; permissions: string[]; }

export type AssetStatus = "available" | "assigned" | "retired";
export interface Asset {
  id: number; name: string; asset_tag: string; category: string;
  status: AssetStatus; value: number; description: string | null;
  assigned_to_id: number | null; assigned_user: User | null; created_at: string;
}
export interface AssetCreate {
  name: string; asset_tag: string; category: string;
  status: AssetStatus; value: number; description?: string; assigned_to_id?: number;
}
export interface AssetUpdate {
  name?: string; category?: string; status?: AssetStatus;
  value?: number; description?: string; assigned_to_id?: number;
}
export interface DashboardStats {
  total_assets: number; assigned_assets: number; available_assets: number;
  retired_assets: number; total_users: number; total_value: number;
}
export interface UserCreate { full_name: string; email: string; password: string; role_id: number; }
