export interface AdminUserRole {
  user_id: string;
  role_id: number;
  created_at: string;
}

export interface AdminUserRoleDetails {
  id: number;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  active: boolean;
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  user_metadata: Record<string, unknown>;
  role: AdminUserRoleDetails | null;
}