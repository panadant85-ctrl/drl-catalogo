
import { supabaseAdmin } from "../../config/supabase";

const PRODUCT_IMAGES_BUCKET = "product-images";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadProductImage(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(
      "Formato no permitido. Utiliza JPG, PNG o WEBP."
    );
  }

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
