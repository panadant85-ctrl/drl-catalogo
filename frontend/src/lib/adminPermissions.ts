export type AdminAccess = {
  isAdmin: boolean;
  hasAdminAccess: boolean;
  role: {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    active: boolean;
  } | null;
  permissions: string[];
};

export function hasAdminPermission(
  access: AdminAccess | null | undefined,
  permission: string
): boolean {
  if (!access) {
    return false;
  }

  // El administrador tiene acceso administrativo completo.
  if (access.isAdmin) {
    return true;
  }

  return access.permissions.includes(permission);
}

export function hasAnyAdminPermission(
  access: AdminAccess | null | undefined,
  permissions: string[]
): boolean {
  if (!access) {
    return false;
  }

  if (access.isAdmin) {
    return true;
  }

  return permissions.some((permission) =>
    access.permissions.includes(permission)
  );
}