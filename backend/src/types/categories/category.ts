export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  product_count: number;
};