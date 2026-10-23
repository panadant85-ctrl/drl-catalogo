"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserRoles = findUserRoles;
exports.findUserRoleByUserId = findUserRoleByUserId;
exports.assignRoleToUser = assignRoleToUser;
exports.updateUserRole = updateUserRole;
exports.removeUserRole = removeUserRole;
exports.findRoleById = findRoleById;
exports.findActiveRoles = findActiveRoles;
exports.listAuthUsers = listAuthUsers;
exports.findAuthUserById = findAuthUserById;
exports.createAuthUser = createAuthUser;
exports.deleteAuthUser = deleteAuthUser;
exports.updateAuthUserStatus = updateAuthUserStatus;
exports.updateAuthUser = updateAuthUser;
exports.isProtectedAdminAccount = isProtectedAdminAccount;
const supabase_1 = require("../../config/supabase");
const USER_ROLE_COLUMNS = `
  user_id,
  role_id,
  created_at
`;
async function findUserRoles() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .select(USER_ROLE_COLUMNS);
    if (error) {
        console.error("Error obteniendo relaciones user_roles:", error);
        throw error;
    }
    return (data ?? []);
}
async function findUserRoleByUserId(userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .select(USER_ROLE_COLUMNS)
        .eq("user_id", userId)
        .maybeSingle();
    if (error) {
        console.error(`Error obteniendo el rol del usuario ${userId}:`, error);
        throw error;
    }
    return (data ?? null);
}
async function assignRoleToUser(userId, roleId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .upsert({
        user_id: userId,
        role_id: roleId,
    }, {
        onConflict: "user_id",
    })
        .select(USER_ROLE_COLUMNS)
        .single();
    if (error) {
        console.error(`Error asignando el rol ${roleId} al usuario ${userId}:`, error);
        throw error;
    }
    return data;
}
async function updateUserRole(userId, roleId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .update({
        role_id: roleId,
    })
        .eq("user_id", userId)
        .select(USER_ROLE_COLUMNS)
        .single();
    if (error) {
        console.error(`Error actualizando el rol del usuario ${userId}:`, error);
        throw error;
    }
    return data;
}
async function removeUserRole(userId) {
    const { error } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
    if (error) {
        console.error(`Error eliminando el rol del usuario ${userId}:`, error);
        throw error;
    }
}
async function findRoleById(roleId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .select(`
      id,
      code,
      name,
      description,
      permissions,
      active
    `)
        .eq("id", roleId)
        .maybeSingle();
    if (error) {
        console.error(`Error obteniendo el rol ${roleId}:`, error);
        throw error;
    }
    return data;
}
async function findActiveRoles() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .select(`
      id,
      code,
      name,
      description,
      permissions,
      active
    `)
        .eq("active", true)
        .order("id", { ascending: true });
    if (error) {
        console.error("Error obteniendo roles activos:", error);
        throw error;
    }
    return data ?? [];
}
async function listAuthUsers() {
    const users = [];
    const { data: customerLinks, error: customerLinksError } = await supabase_1.supabaseAdmin
        .from("customers")
        .select("auth_user_id")
        .not("auth_user_id", "is", null);
    if (customerLinksError) {
        console.error("Error obteniendo las cuentas vinculadas a clientes:", customerLinksError);
        throw customerLinksError;
    }
    const customerAuthUserIds = new Set((customerLinks ?? [])
        .map((customer) => customer.auth_user_id)
        .filter((authUserId) => Boolean(authUserId)));
    let page = 1;
    const perPage = 100;
    while (true) {
        const { data, error } = await supabase_1.supabaseAdmin.auth.admin.listUsers({
            page,
            perPage,
        });
        if (error) {
            console.error("Error obteniendo usuarios de Supabase Auth:", error);
            throw error;
        }
        const authUsers = data.users ?? [];
        for (const user of authUsers) {
            const accountType = user.user_metadata?.account_type;
            if (accountType === "customer") {
                continue;
            }
            if (customerAuthUserIds.has(user.id) &&
                accountType !== "admin") {
                continue;
            }
            const userRole = await findUserRoleByUserId(user.id);
            let role = null;
            if (userRole) {
                role = await findRoleById(userRole.role_id);
            }
            users.push({
                id: user.id,
                email: user.email ?? null,
                phone: user.phone ?? null,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at ?? null,
                banned_until: user.banned_until ?? null,
                user_metadata: user.user_metadata ?? {},
                role,
            });
        }
        if (authUsers.length < perPage) {
            break;
        }
        page++;
    }
    return users;
}
async function findAuthUserById(userId) {
    const { data, error } = await supabase_1.supabaseAdmin.auth.admin.getUserById(userId);
    if (error) {
        console.error(`Error obteniendo usuario Auth ${userId}:`, error);
        throw error;
    }
    if (!data.user) {
        return null;
    }
    const userRole = await findUserRoleByUserId(userId);
    let role = null;
    if (userRole) {
        role = await findRoleById(userRole.role_id);
    }
    return {
        id: data.user.id,
        email: data.user.email ?? null,
        phone: data.user.phone ?? null,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at ?? null,
        banned_until: data.user.banned_until ?? null,
        user_metadata: data.user.user_metadata ?? {},
        role,
    };
}
async function createAuthUser(params) {
    const { data, error } = await supabase_1.supabaseAdmin.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
        ...(params.phone
            ? {
                phone: params.phone,
                phone_confirm: true,
            }
            : {}),
        user_metadata: {
            full_name: params.fullName,
            name: params.fullName,
            phone: params.phone ?? null,
            account_type: params.accountType ?? "admin",
            ...(params.accountType === "manager"
                ? {
                    username: params.username?.trim(),
                    carnet: params.carnet?.trim(),
                }
                : {}),
        },
    });
    if (error) {
        console.error("Error creando usuario en Supabase Auth:", error);
        throw error;
    }
    if (!data.user) {
        throw new Error("Supabase Auth no devolvió el usuario creado.");
    }
    return data.user;
}
async function deleteAuthUser(userId) {
    const { error } = await supabase_1.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
        console.error(`Error eliminando usuario Auth ${userId}:`, error);
        throw error;
    }
}
async function updateAuthUserStatus(userId, active) {
    const { data, error } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: active
            ? "none"
            : "876000h",
    });
    if (error) {
        console.error(`Error actualizando el estado del usuario ${userId}:`, error);
        throw error;
    }
    if (!data.user) {
        throw new Error("Supabase Auth no devolvió el usuario actualizado.");
    }
    return data.user;
}
async function updateAuthUser(userId, params) {
    const updateData = {};
    if (params.email !== undefined) {
        updateData.email = params.email;
    }
    if (params.phone !== undefined) {
        updateData.phone = params.phone || undefined;
    }
    if (params.password) {
        updateData.password = params.password;
    }
    if (params.fullName !== undefined) {
        const { data: currentUserData } = await supabase_1.supabaseAdmin.auth.admin.getUserById(userId);
        const currentMetadata = (currentUserData.user?.user_metadata ??
            {});
        updateData.user_metadata = {
            ...currentMetadata,
            full_name: params.fullName,
            name: params.fullName,
        };
    }
    const { data, error } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(userId, updateData);
    if (error) {
        console.error("Error actualizando usuario de Supabase Auth:", error);
        throw error;
    }
    if (!data.user) {
        throw new Error("Supabase Auth no devolvió el usuario actualizado.");
    }
    return data.user;
}
async function isProtectedAdminAccount(user) {
    // Un usuario con rol admin activo está protegido.
    if (user.role?.code === "admin" && user.role.active) {
        return true;
    }
    // También protegemos las cuentas administrativas
    // registradas en admin_users, aunque no tengan rol asignado.
    if (!user.email) {
        return false;
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("admin_users")
        .select("email")
        .eq("active", true);
    if (error) {
        console.error("Error verificando la protección administrativa:", error);
        // Si no podemos comprobar la protección, no asumimos
        // que la cuenta sea segura para modificar.
        throw new Error("No se pudo verificar la protección de la cuenta administrativa.");
    }
    const normalizedEmail = user.email.toLowerCase();
    return (data ?? []).some((admin) => typeof admin.email === "string" &&
        admin.email.toLowerCase() === normalizedEmail);
}
