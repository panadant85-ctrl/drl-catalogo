"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.getCustomersByManagerId = getCustomersByManagerId;
exports.getCustomerById = getCustomerById;
exports.changeCustomerPassword = changeCustomerPassword;
exports.getCustomerByAuthUserId = getCustomerByAuthUserId;
exports.updateCustomerProfile = updateCustomerProfile;
exports.createNewCustomer = createNewCustomer;
exports.updateExistingCustomer = updateExistingCustomer;
exports.removeCustomer = removeCustomer;
exports.linkCustomerToManagerProfile = linkCustomerToManagerProfile;
exports.linkCustomerToManagerByCode = linkCustomerToManagerByCode;
const customerRepository_1 = require("../../repositories/customers/customerRepository");
const supabase_1 = require("../../config/supabase");
const managerRepository_1 = require("../../repositories/managers/managerRepository");
async function getCustomers() {
    return (0, customerRepository_1.findCustomers)();
}
async function getCustomersByManagerId(managerId) {
    return (0, customerRepository_1.findCustomersByManagerId)(managerId);
}
async function getCustomerById(id) {
    return (0, customerRepository_1.findCustomerById)(id);
}
async function changeCustomerPassword(customerId, newPassword) {
    if (!newPassword || newPassword.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }
    const customer = await (0, customerRepository_1.findCustomerById)(customerId);
    if (!customer) {
        throw new Error("El cliente no existe.");
    }
    if (!customer.auth_user_id) {
        throw new Error("Este cliente no tiene una cuenta de usuario asociada.");
    }
    const { error } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(customer.auth_user_id, {
        password: newPassword,
    });
    if (error) {
        throw new Error(`No se pudo cambiar la contraseña: ${error.message}`);
    }
}
async function getCustomerByAuthUserId(authUserId) {
    return (0, customerRepository_1.findCustomerByAuthUserId)(authUserId);
}
async function updateCustomerProfile(authUserId, input) {
    return (0, customerRepository_1.updateCustomerByAuthUserId)(authUserId, input);
}
async function createNewCustomer(input) {
    return (0, customerRepository_1.createCustomer)(input);
}
async function updateExistingCustomer(id, input) {
    return (0, customerRepository_1.updateCustomer)(id, input);
}
async function removeCustomer(id) {
    return (0, customerRepository_1.deleteCustomer)(id);
}
async function linkCustomerToManagerProfile(authUserId, managerId) {
    return (0, customerRepository_1.linkCustomerToManager)(authUserId, managerId);
}
async function linkCustomerToManagerByCode(authUserId, managerCode) {
    const code = managerCode.trim();
    if (!code) {
        throw new Error("Debes introducir el código del gestor.");
    }
    const customer = await (0, customerRepository_1.findCustomerByAuthUserId)(authUserId);
    if (!customer) {
        throw new Error("No existe un perfil de cliente asociado a este usuario.");
    }
    if (customer.manager_id) {
        throw new Error("Ya tienes un gestor vinculado a tu cuenta.");
    }
    const manager = await (0, managerRepository_1.findManagerByCode)(code);
    if (!manager) {
        throw new Error("El código no es válido o el gestor está inactivo.");
    }
    const linkedCustomer = await (0, customerRepository_1.linkCustomerToManager)(authUserId, manager.id);
    if (!linkedCustomer) {
        throw new Error("No se pudo vincular el gestor. Es posible que tu cuenta ya tenga uno asignado.");
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
