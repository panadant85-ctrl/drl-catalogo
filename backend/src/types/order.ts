export type OrderSourceType =
  | "direct"
  | "manager";

export type OrderStatus =
  | "nuevo"
  | "confirmado"
  | "preparando"
  | "entregado"
  | "cancelado";

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  manager_id: string | null;
  source_type: OrderSourceType;
  delivery: boolean;
  address: string | null;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  commission_total: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  variant: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  commission_unit: number;
  commission_total: number;
}