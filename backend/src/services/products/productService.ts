import {
  findActiveProducts,
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from "../../repositories/products/productRepository";

import type {
  CreateProductInput,
  UpdateProductInput,
} from "../../validators/products/productValidator";

export async function getActiveProducts() {
  return findActiveProducts();
}

export async function getAllProducts() {
  return findAllProducts();
}

export async function getProductById(
  id: number
) {
  return findProductById(id);
}

export async function createNewProduct(
  input: CreateProductInput
) {
  return createProduct(input);
}

export async function updateExistingProduct(
  id: number,
  input: UpdateProductInput
) {
  return updateProduct(id, input);
}

export async function changeProductStatus(
  id: number,
  active: boolean
) {
  return updateProductStatus(id, active);
}

export async function removeProduct(
  id: number
) {
  return deleteProduct(id);
}