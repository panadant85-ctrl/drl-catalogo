import {
  findSuppliers,
  findSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../repositories/suppliers/supplierRepository";

import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../../validators/suppliers/supplierValidator";

export async function getSuppliers() {
  return findSuppliers();
}

export async function getSupplierById(
  id: number
) {
  return findSupplierById(id);
}

export async function createNewSupplier(
  input: CreateSupplierInput
) {
  return createSupplier(input);
}

export async function updateExistingSupplier(
  id: number,
  input: UpdateSupplierInput
) {
  return updateSupplier(id, input);
}

export async function removeSupplier(
  id: number
) {
  return deleteSupplier(id);
}