import {
  createCategory,
  deleteCategory,
  findCategories,
  findCategoryById,
  updateCategory,
} from "../../repositories/categories/categoryRepository";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../validators/categories/categoryValidator";

export async function getCategories() {
  return findCategories();
}

export async function getCategoryById(
  id: number
) {
  return findCategoryById(id);
}

export async function createNewCategory(
  input: CreateCategoryInput
) {
  return createCategory(input);
}

export async function updateExistingCategory(
  id: number,
  input: UpdateCategoryInput
) {
  return updateCategory(id, input);
}

export async function removeCategory(
  id: number
) {
  return deleteCategory(id);
}