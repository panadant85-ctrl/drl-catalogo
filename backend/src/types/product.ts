export interface Product {
  id: number;

  name: string;

  brand: string | null;
  brand_id: number;

  model: string | null;
  sku: string | null;
  barcode: string | null;
  category: string | null;

  supplier_id: number;
  supplier?: {
      company_name: string;
    } | null;

  price: number;
  cost: number;
  vip_price: number | null;

  stock: number;

  description: string | null;

  features: Record<string, unknown> | null;

  technical_specs: Record<string, unknown> | null;

  images: string[] | null;

  family_id: number | null;
  variant: string | null;

  active: boolean;
  stock_disabled_by_inventory: boolean;
  manager_commission: number;

  created_at: string;
  updated_at: string;
}