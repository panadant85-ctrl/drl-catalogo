import {
  createBrand,
  deleteBrand,
  findBrandById,
  findBrands,
  updateBrand,
  uploadBrandLogo,
} from "../../repositories/brands/brandRepository";

import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "../../validators/brands/brandValidator";

export async function getBrands() {
  return findBrands();
}

export async function getBrandById(id: number) {
  return findBrandById(id);
}

export async function createNewBrand(input: CreateBrandInput) {
  return createBrand(input);
}

export async function updateExistingBrand(
  id: number,
  input: UpdateBrandInput
) {
  return updateBrand(id, input);
}

export async function removeBrand(id: number) {
  return deleteBrand(id);
}

export async function saveBrandLogo(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
) {
  return uploadBrandLogo(
    filePath,
    fileBuffer,
    contentType
  );
}