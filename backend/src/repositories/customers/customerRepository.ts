
import {
  supabase,
  supabaseAdmin,
} from "../../config/supabase";

import type { Customer } from "../../types/customer";

import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../validators/customers/customerValidator";


export async function findCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  const customers = data ?? [];

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id");

  if (ordersError) {
    throw ordersError;
  }

  const orderCounts = new Map<number, number>();

  for (const order of orders ?? []) {
    if (order.customer_id == null) {
      continue;
    }

    const customerId = Number(order.customer_id);

    orderCounts.set(
      customerId,
      (orderCounts.get(customerId) ?? 0) + 1
    );
  }

  return customers.map((customer) => ({
    ...customer,
    orders_count: orderCounts.get(Number(customer.id)) ?? 0,
  })) as Customer[];
}

export async function findCustomersByManagerId(
  managerId: string
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("manager_id", managerId)
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Customer[];
}


export async function findCustomerById(
  id: number
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}


export async function findCustomerByAuthUserId(
  authUserId: string
): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}


/**
 * Actualizar perfil del cliente autenticado.
 *
 * No modificamos:
 * - auth_user_id
 * - manager_id
 *
 * El nombre completo viene generado por el validator
 * a partir de:
 * - first_name
 * - last_name_1
 * - last_name_2
 */
export async function updateCustomerByAuthUserId(
  authUserId: string,
  input: UpdateCustomerInput
): Promise<Customer | null> 

{
  console.log("Perfil recibido para actualizar:", {
  authUserId,
  full_name: input.full_name,
  identification: input.identification,
});
  const updateData = {
    ...input,

    email:
      input.email ?? undefined,

    phone:
      input.phone ?? undefined,

    province:
      input.province ?? undefined,

    municipality:
      input.municipality ?? undefined,

    address:
      input.address ?? undefined,

    auth_user_id:
      undefined,

    manager_id:
      undefined,
  };

  const { data, error } = await supabaseAdmin
    .from("customers")
    .update(updateData)
    .eq("auth_user_id", authUserId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}


/**
 * Crear nuevo cliente.
 *
 * Se guardan:
 * - first_name
 * - last_name_1
 * - last_name_2
 * - full_name
 *
 * full_name ya viene construido por el validator.
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      first_name:
        input.first_name,

      last_name_1:
        input.last_name_1,

      last_name_2:
        input.last_name_2,

      full_name:
        input.full_name,

      identification:
        input.identification,

      email:
        input.email ?? null,

      phone:
        input.phone ?? null,

      province:
        input.province ?? null,

      municipality:
        input.municipality ?? null,

      address:
        input.address ?? null,

      auth_user_id:
        input.auth_user_id ?? null,

      manager_id:
        input.manager_id ?? null,

      source_type:
        input.source_type,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Customer;
}


/**
 * Actualizar cliente por ID.
 *
 * Los nuevos campos de nombre y full_name
 * son manejados por el validator.
 */
export async function updateCustomer(
  id: number,
  input: UpdateCustomerInput
): Promise<Customer | null> {
  const updateData = {
    ...input,

    email:
      input.email ?? undefined,

    phone:
      input.phone ?? undefined,

    province:
      input.province ?? undefined,

    municipality:
      input.municipality ?? undefined,

    address:
      input.address ?? undefined,

    auth_user_id:
      input.auth_user_id ?? undefined,

    manager_id:
      input.manager_id ?? undefined,
  };

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}


export async function deleteCustomer(
  id: number
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Customer | null;
}


export async function linkCustomerToManager(
  authUserId: string,
  managerId: string
): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .update({
      manager_id: managerId,
      source_type: "manager",
    })
    .eq("auth_user_id", authUserId)
    .is("manager_id", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo vincular el cliente al gestor: ${error.message}`
    );
  }

  return data as Customer | null;
}
