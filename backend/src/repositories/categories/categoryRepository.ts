import {
  supabase,
  supabaseAdmin,
} from "../../config/supabase";

import type { Category } from "../../types/categories/category";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../validators/categories/categoryValidator";

export async function findCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select(`
      *,
      product_categories(count)
    `)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((category) => ({
    ...category,
    product_count:
      category.product_categories?.[0]?.count ?? 0,
  })) as Category[];
}

export async function findCategoryById(
  id: number
): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Category | null;
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      name: input.name,
      slug: input.slug,
      description:
        input.description ?? null,
      parent_id:
        input.parent_id ?? null,
      active:
        input.active ?? true,
      position:
        input.position ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Category;
}

export async function updateCategory(
  id: number,
  input: UpdateCategoryInput
): Promise<Category | null> {
  const updateData = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Category | null;
}

export async function deleteCategory(
  id: number
): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Category | null;
}