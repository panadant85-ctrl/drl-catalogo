import {
  findCustomers,
  findCustomerById,
  findCustomerByAuthUserId,
  findCustomersByManagerId,
  updateCustomerByAuthUserId,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  linkCustomerToManager,

  
} from "../../repositories/customers/customerRepository";
import { supabaseAdmin } from "../../config/supabase";

import { findManagerByCode } from "../../repositories/managers/managerRepository";

import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../validators/customers/customerValidator";

export async function getCustomers() {
  return findCustomers();
}


export async function getCustomersByManagerId(
  managerId: string
) {
  return findCustomersByManagerId(managerId);
}


export async function getCustomerById(
  id: number
) {
  return findCustomerById(id);
}


export async function changeCustomerPassword(
  customerId: number,
  newPassword: string
): Promise<void> {
  if (!newPassword || newPassword.length < 8) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres."
    );
  }

  const customer = await findCustomerById(customerId);

  if (!customer) {
    throw new Error("El cliente no existe.");
  }

  if (!customer.auth_user_id) {
    throw new Error(
      "Este cliente no tiene una cuenta de usuario asociada."
    );
  }

  const { error } =
    await supabaseAdmin.auth.admin.updateUserById(
      customer.auth_user_id,
      {
        password: newPassword,
      }
    );

  if (error) {
    throw new Error(
      `No se pudo cambiar la contraseña: ${error.message}`
    );
  }
}


export async function getCustomerByAuthUserId(
  authUserId: string
) {
  return findCustomerByAuthUserId(authUserId);
}
export async function updateCustomerProfile(
  authUserId: string,
  input: UpdateCustomerInput
) {
  return updateCustomerByAuthUserId(
    authUserId,
    input
  );
}
export async function createNewCustomer(
  input: CreateCustomerInput
) {
  return createCustomer(input);
}

export async function updateExistingCustomer(
  id: number,
  input: UpdateCustomerInput
) {
  return updateCustomer(id, input);
}

export async function removeCustomer(
  id: number
) {
  return deleteCustomer(id);
}

export async function linkCustomerToManagerProfile(
  authUserId: string,
  managerId: string
) {
  return linkCustomerToManager(
    authUserId,
    managerId
  );
}


export async function linkCustomerToManagerByCode(
  authUserId: string,
  managerCode: string
) {
  const code = managerCode.trim();

  if (!code) {
    throw new Error("Debes introducir el código del gestor.");
  }

  const customer = await findCustomerByAuthUserId(authUserId);

  if (!customer) {
    throw new Error("No existe un perfil de cliente asociado a este usuario.");
  }

  if (customer.manager_id) {
    throw new Error("Ya tienes un gestor vinculado a tu cuenta.");
  }

  const manager = await findManagerByCode(code);

  if (!manager) {
    throw new Error("El código no es válido o el gestor está inactivo.");
  }

  const linkedCustomer = await linkCustomerToManager(
    authUserId,
    manager.id
  );

  if (!linkedCustomer) {
    throw new Error(
      "No se pudo vincular el gestor. Es posible que tu cuenta ya tenga uno asignado."
    );
  }

  return {
    customer: linkedCustomer,
    manager: {
      id: manager.id,
      full_name: manager.full_name,
      manager_code: manager.manager_code,
    },
  };
}
