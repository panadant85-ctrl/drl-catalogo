import {
  supabase,
  supabaseAdmin,
} from "../../config/supabase";
import type {
  Order,
  OrderItem,
} from "../../types/order";

import type { FastifyRequest } from "fastify";
import { getAuthenticatedSupabase } from "../../config/authenticatedSupabase";

export async function findOrders(
  request: FastifyRequest
): Promise<Order[]> {
  const authenticatedSupabase =
    getAuthenticatedSupabase(request);

  if (!authenticatedSupabase) {
    throw new Error(
      "No se pudo obtener el token de autenticación."
    );
  }

  const { data, error } = await authenticatedSupabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;

  return (data ?? []) as Order[];
}

export async function findOrdersByCustomerId(
  customerId: number
): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("id", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Order[];
}

export async function findOrderById(
  id: number,
  request?: FastifyRequest
): Promise<Order | null> {
  const client = request
    ? getAuthenticatedSupabase(request)
    : supabaseAdmin;

  if (!client) {
    throw new Error(
      "No se pudo obtener el token de autenticación."
    );
  }

  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as Order | null;
}

export async function findOrderItems(
  orderId: number,
  request?: FastifyRequest
): Promise<OrderItem[]> {
  const client = request
    ? getAuthenticatedSupabase(request)
    : supabaseAdmin;

  if (!client) {
    throw new Error(
      "No se pudo obtener el token de autenticación."
    );
  }

  const { data, error } = await client
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []) as OrderItem[];
}

export async function createOrder(
  order: {
    order_number: string;
    customer_id: number;
    manager_id: string | null;
    source_type: "direct" | "manager";
    delivery: boolean;
    address: string | null;
    notes: string | null;
    total: number;
    status: "nuevo";
    commission_total: number;
  },
  items: Array<{
    product_id: number;
    product_name: string;
    variant: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
    commission_unit: number;
    commission_total: number;
  }>
): Promise<{
  order: Order;
  items: OrderItem[];
}> {
  const {
    data: createdOrder,
    error: orderError,
  } = await supabase
    .from("orders")
    .insert(order)
    .select("*")
    .single();

  if (orderError) {
    throw orderError;
  }

  const orderId = createdOrder.id;

  const itemsToInsert = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    product_name: item.product_name,
    variant: item.variant,
    unit_price: item.unit_price,
    quantity: item.quantity,
    subtotal: item.subtotal,
    commission_unit: item.commission_unit,
    commission_total: item.commission_total,
  }));

  const {
    data: createdItems,
    error: itemsError,
  } = await supabase
    .from("order_items")
    .insert(itemsToInsert)
    .select("*");

  if (itemsError) {
    // Intentamos limpiar el pedido si falló la inserción
    // de sus items.
    await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    throw itemsError;
  }

  return {
    order: createdOrder as Order,
    items: (createdItems ?? []) as OrderItem[],
  };
}

export async function updateOrderStatus(
  id: number,
  status:
    | "nuevo"
    | "confirmado"
    | "preparando"
    | "entregado"
    | "cancelado"
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Order | null;
}

export async function deleteOrder(
  id: number
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Order | null;
}

export async function decreaseProductStock(
  productId: number,
  quantity: number
): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc(
    "decrease_product_stock",
    {
      p_product_id: productId,
      p_quantity: quantity,
    }
  );

  if (error) {
    throw error;
  }

  return Number(data);
}

export async function createOrderAtomic(
  order: {
    order_number: string;
    customer_id: number;
    manager_id: string | null;
    source_type: "direct" | "manager";
    delivery: boolean;
    address: string | null;
    notes: string | null;
    total: number;
    status: "nuevo" | "entregado";
    commission_total: number;
  },
  items: Array<{
    product_id: number;
    product_name: string;
    variant: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
    commission_unit: number;
    commission_total: number;
  }>
): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc(
    "create_order_atomic",
    {
      p_order: order,
      p_items: items,
    }
  );

  if (error) {
    throw error;
  }

  return Number(data);
}