export interface Manager {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  slug: string;
  commission_rate: number;
  active: boolean;
  created_at: string;
  username: string;
  carnet: string | null;
  avatar_url: string | null;
  manager_code: string | null;
  auth_user_id: string | null;
}