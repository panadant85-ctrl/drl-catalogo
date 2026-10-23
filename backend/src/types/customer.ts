export interface Customer {
  id: number;

  full_name: string;

  first_name: string | null;

  last_name_1: string | null;

  last_name_2: string | null;

  identification: string;

  email: string | null;

  phone: string | null;

  province: string | null;

  municipality: string | null;

  address: string | null;

  auth_user_id: string | null;

  manager_id: string | null;

  source_type: "direct" | "manager";

  created_at: string;

  updated_at: string;
}

