"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminUsers = getAdminUsers;
exports.getAdminUserById = getAdminUserById;
exports.getAvailableRoles = getAvailableRoles;
exports.getUserRole = getUserRole;
exports.createAdminUser = createAdminUser;
exports.deleteAdminUser = deleteAdminUser;
exports.updateAdminUserStatus = updateAdminUserStatus;
exports.updateAdminUser = updateAdminUser;
const userRepository_1 = require("../../repositories/users/userRepository");
async function getAdminUsers() {
    return await (0, userRepository_1.listAuthUsers)();
}
async function getAdminUserById(userId) {
    const user = await (0, userRepository_1.findAuthUserById)(userId);
    if (!user) {
        throw new Error("Usuario no encontrado.");
    }
    return user;
}
async function getAvailableRoles() {
    return await (0, userRepository_1.findActiveRoles)();
}
async function getUserRole(userId) {
    const userRole = await (0, userRepository_1.findUserRoleByUserId)(userId);
    if (!userRole) {
        return null;
    }
    return await (0, userRepository_1.findRoleById)(userRole.role_id);
}
async function createAdminUser(input) {
    const role = await (0, userRepository_1.findRoleById)(input.roleId);
    if (!role) {
        throw new Error("El rol seleccionado no existe.");
    }
    if (!role.active) {
        throw new Error("El rol seleccionado está inactivo.");
    }
    const isManager = role.code === "manager";
    let createdUser;
    try {
        createdUser = await (0, userRepository_1.createAuthUser)({
            email: input.email,
            phone: input.phone || undefined,
            password: input.password,
            fullName: input.fullName,
            accountType: isManager ? "manager" : "admin",
            ...(isManager
                ? {
                    username: input.username?.trim().toLowerCase(),
                    carnet: input.carnet?.trim(),
                }
                : {}),
        });
        try {
            await (0, userRepository_1.assignRoleToUser)(createdUser.id, input.roleId);
        }
        catch (roleError) {
            console.error("Falló la asignación del rol. Se realizará rollback del usuario Auth.", roleError);
            await (0, userRepository_1.deleteAuthUser)(createdUser.id);
            throw new Error("No se pudo asignar el rol al usuario. El usuario no fue creado.");
        }
        return await (0, userRepository_1.findAuthUserById)(createdUser.id);
    }
    catch (error) {
        throw error;
    }
}
async function deleteAdminUser(userId) {
    const user = await (0, userRepository_1.findAuthUserById)(userId);
    if (!user) {
        throw new Error("Usuario no encontrado.");
    }
    if (user.role?.code === "admin") {
        throw new Error("Los usuarios con rol admin no pueden eliminarse desde este módulo.");
    }
    const currentUserRole = await (0, userRepository_1.findUserRoleByUserId)(userId);
    try {
        await (0, userRepository_1.deleteAuthUser)(userId);
    }
    catch (error) {
        console.error("No se pudo eliminar el usuario de Supabase Auth.", error);
        throw new Error("No se pudo eliminar el usuario.");
    }
    try {
        await (0, userRepository_1.removeUserRole)(userId);
    }
    catch (roleError) {
        console.error("El usuario fue eliminado de Auth, pero no se pudo eliminar su relación de rol.", roleError);
    }
    return {
        id: userId,
        roleId: currentUserRole?.role_id ?? null,
    };
}
async function updateAdminUserStatus(userId, active) {
    const user = await (0, userRepository_1.findAuthUserById)(userId);
    if (!user) {
        throw new Error("Usuario no encontrado.");
    }
    if (user.role?.code === "admin" && !active) {
        throw new Error("El usuario principal con rol admin no puede desactivarse desde este módulo.");
    }
    await (0, userRepository_1.updateAuthUserStatus)(userId, active);
    return await (0, userRepository_1.findAuthUserById)(userId);
}
async function updateAdminUser(userId, input) {
    const user = await (0, userRepository_1.findAuthUserById)(userId);
    if (!user) {
        throw new Error("Usuario no encontrado.");
    }
    // 1. Actualizar los datos de Supabase Auth
    await (0, userRepository_1.updateAuthUser)(userId, {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        password: input.password || undefined,
    });
    // 2. Si roleId no viene, conservamos el rol actual.
    if (input.roleId === undefined) {
        return await (0, userRepository_1.findAuthUserById)(userId);
    }
    // 3. Si roleId es null, quitamos el rol.
    if (input.roleId === null) {
        await (0, userRepository_1.removeUserRole)(userId);
        return await (0, userRepository_1.findAuthUserById)(userId);
    }
    // 4. Si viene un rol, comprobamos que exista y esté activo.
    const newRole = await (0, userRepository_1.findRoleById)(input.roleId);
    if (!newRole) {
        throw new Error("El rol seleccionado no existe.");
    }
    if (!newRole.active) {
        throw new Error("El rol seleccionado está inactivo.");
    }
    // 5. Asignar el rol si el usuario no tenía ninguno.
    const currentUserRole = await (0, userRepository_1.findUserRoleByUserId)(userId);
    if (!currentUserRole) {
        await (0, userRepository_1.assignRoleToUser)(userId, input.roleId);
        return await (0, userRepository_1.findAuthUserById)(userId);
    }
    // 6. Si ya tiene ese mismo rol, no hacemos nada.
    if (currentUserRole.role_id ===
        input.roleId) {
        return await (0, userRepository_1.findAuthUserById)(userId);
    }
    // 7. Cambiar el rol existente.
    const previousRoleId = currentUserRole.role_id;
    await (0, userRepository_1.updateUserRole)(userId, input.roleId);
    try {
        return await (0, userRepository_1.findAuthUserById)(userId);
    }
    catch (error) {
        console.error("Falló la lectura del usuario después de actualizar el rol. Se intentará restaurar el rol anterior.", error);
        try {
            await (0, userRepository_1.updateUserRole)(userId, previousRoleId);
        }
        catch (rollbackError) {
            console.error("No se pudo restaurar el rol anterior:", rollbackError);
        }
        throw error;
    }
}
