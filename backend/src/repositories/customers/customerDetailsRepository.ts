import { supabase } from "../../config/supabase";

import type { Customer } from "../../types/customer";
import type {
  Order,
  OrderItem,
} from "../../types/order";

export async function findCustomerDetailsBase(
  customerId: number
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}

export async function findOrdersByCustomerId(
  customerId: number
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Order[];
}

export async function findOrderItemsByOrderIds(
  orderIds: number[]
): Promise<OrderItem[]> {
  if (orderIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderItem[];
}