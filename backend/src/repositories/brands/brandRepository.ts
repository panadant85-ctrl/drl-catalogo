import { supabase, supabaseAdmin } from "../../config/supabase";
import type { Brand } from "../../types/brands/brand";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "../../validators/brands/brandValidator";

export async function findBrands(): Promise<Brand[]> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Brand[];
}

export async function findBrandById(id: number): Promise<Brand | null> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as Brand | null;
}

export async function createBrand(
  input: CreateBrandInput
): Promise<Brand> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .insert({
      name: input.name,
      description: input.description ?? null,
      logo_url: input.logo_url ?? null,
      active: input.active ?? true,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as Brand;
}

export async function updateBrand(
  id: number,
  input: UpdateBrandInput
): Promise<Brand | null> {
  const updateData = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("brands")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data as Brand | null;
}

export async function deleteBrand(id: number): Promise<Brand | null> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data as Brand | null;
}

export async function uploadBrandLogo(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from("brand-logos")
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("brand-logos")
    .getPublicUrl(filePath);

  return publicUrl;
}