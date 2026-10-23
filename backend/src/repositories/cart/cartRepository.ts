import { supabaseAdmin } from "../../config/supabase";

import type {
  CartItem,
  CartItemWithProduct,
} from "../../types/cart";

export async function findCartItems(
  authUserId: string
): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("cart_items")
    .select(`
      id,
      auth_user_id,
      product_id,
      quantity,
      variant,
      created_at,
      updated_at,
      product:products (
        id,
        name,
        brand,
        model,
        sku,
        category,
        price,
        stock,
        description,
        features,
        images,
        family_id,
        variant,
        active
      )
    `)
    .eq("auth_user_id", authUserId)
    .order("id", { ascending: true });

  if (error) {
        console.error(
            "CART SUPABASE ERROR:",
            error
        );

        throw error;
        }

        return (data ?? []) as unknown as CartItemWithProduct[];
}

export async function findCartItem(
  authUserId: string,
  productId: number,
  variant: string | null
): Promise<CartItem | null> {
  let query = supabaseAdmin
    .from("cart_items")
    .select("*")
    .eq("auth_user_id", authUserId)
    .eq("product_id", productId);

  if (variant === null) {
    query = query.is("variant", null);
  } else {
    query = query.eq("variant", variant);
  }

  const { data, error } =
    await query.maybeSingle();

  if (error) {
            throw error;
            }

  return data as CartItem | null;
}

export async function createCartItem(
  authUserId: string,
  productId: number,
  quantity: number,
  variant: string | null
): Promise<CartItem> {
  const { data, error } = await supabaseAdmin
    .from("cart_items")
    .insert({
      auth_user_id: authUserId,
      product_id: productId,
      quantity,
      variant,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CartItem;
}

export async function updateCartItemQuantity(
  authUserId: string,
  productId: number,
  variant: string | null,
  quantity: number
): Promise<CartItem | null> {
  let query = supabaseAdmin
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", authUserId)
    .eq("product_id", productId);

  if (variant === null) {
    query = query.is("variant", null);
  } else {
    query = query.eq("variant", variant);
  }

  const { data, error } =
    await query.select("*").maybeSingle();

  if (error) {
    throw error;
  }

  return data as CartItem | null;
}

export async function deleteCartItem(
  authUserId: string,
  productId: number,
  variant: string | null
): Promise<CartItem | null> {
  let query = supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("auth_user_id", authUserId)
    .eq("product_id", productId);

  if (variant === null) {
    query = query.is("variant", null);
  } else {
    query = query.eq("variant", variant);
  }

  const { data, error } =
    await query.select("*").maybeSingle();

  if (error) {
    throw error;
  }

  return data as CartItem | null;
}

export async function clearCart(
  authUserId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("auth_user_id", authUserId);

  if (error) {
    throw error;
  }
}