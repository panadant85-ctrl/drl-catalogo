"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoles = getRoles;
exports.getRoleById = getRoleById;
exports.createNewRole = createNewRole;
exports.updateExistingRole = updateExistingRole;
exports.removeRole = removeRole;
const roleRepository_1 = require("../../repositories/roles/roleRepository");
async function getRoles() {
    return (0, roleRepository_1.findRoles)();
}
async function getRoleById(id) {
    return (0, roleRepository_1.findRoleById)(id);
}
async function createNewRole(input) {
    const existingRole = await (0, roleRepository_1.findRoleByCode)(input.code);
    if (existingRole) {
        throw new Error(`Ya existe un rol con el código "${input.code}".`);
    }
    return (0, roleRepository_1.createRole)(input);
}
async function updateExistingRole(id, input) {
    const existingRole = await (0, roleRepository_1.findRoleById)(id);
    if (!existingRole) {
        throw new Error("El rol no existe.");
    }
    if (input.code !== undefined &&
        input.code !== existingRole.code) {
        const roleWithSameCode = await (0, roleRepository_1.findRoleByCode)(input.code);
        if (roleWithSameCode &&
            roleWithSameCode.id !== id) {
            throw new Error(`Ya existe otro rol con el código "${input.code}".`);
        }
    }
    return (0, roleRepository_1.updateRole)(id, input);
}
async function removeRole(id) {
    const existingRole = await (0, roleRepository_1.findRoleById)(id);
    if (!existingRole) {
        throw new Error("El rol no existe.");
    }
    if (existingRole.code === "admin" ||
        existingRole.code === "manager") {
        throw new Error("Los roles principales del sistema no pueden eliminarse.");
    }
    await (0, roleRepository_1.deleteRole)(id);
}
