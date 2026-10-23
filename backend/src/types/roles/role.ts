export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  active: boolean;
  created_at: string;   
}