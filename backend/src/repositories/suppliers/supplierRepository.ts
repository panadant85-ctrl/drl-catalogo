import {
  supabase,
  supabaseAdmin,
} from "../../config/supabase";

import type { Supplier } from "../../types/suppliers/supplier";

import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../../validators/suppliers/supplierValidator";

export async function findSuppliers(): Promise<
  Supplier[]
> {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("*")
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Supplier[];
}

export async function findSupplierById(
  id: number
): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Supplier | null;
}

export async function createSupplier(
  input: CreateSupplierInput
): Promise<Supplier> {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .insert({
      company_name: input.company_name,

      nit: input.nit,

      address: input.address,

      phone: input.phone ?? null,

      email: input.email ?? null,

      active: input.active ?? true,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Supplier;
}

export async function updateSupplier(
  id: number,
  input: UpdateSupplierInput
): Promise<Supplier | null> {
  const updateData = {
    ...input,

    phone:
      input.phone ?? undefined,

    email:
      input.email ?? undefined,

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Supplier | null;
}

export async function deleteSupplier(
  id: number
): Promise<Supplier | null> {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Supplier | null;
}