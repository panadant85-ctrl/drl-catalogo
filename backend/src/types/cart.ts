export interface CartItem {
  id: number;
  auth_user_id: string;
  product_id: number;
  quantity: number;
  variant: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct
  extends CartItem {
  product: {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    sku: string | null;
    category: string | null;
    price: number;
    stock: number;
    description: string | null;
    features: Record<string, unknown> | null;
    images: string[] | null;
    family_id: number | null;
    variant: string | null;
    active: boolean;
  };
}