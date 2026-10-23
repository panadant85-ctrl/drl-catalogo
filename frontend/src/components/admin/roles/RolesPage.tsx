"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";

import commonStyles from "../styles/AdminCommon.module.css";
import tableStyles from "../styles/AdminTable.module.css";
import styles from "./Roles.module.css";

type Role = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  active: boolean;
  created_at: string;
};

type RoleForm = {
  code: string;
  name: string;
  description: string;
  permissions: string[];
};

type Filters = {
  code: string;
  name: string;
  description: string;
};

const emptyForm: RoleForm = {
  code: "",
  name: "",
  description: "",
  permissions: [],
};

const emptyFilters: Filters = {
  code: "",
  name: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

const permissionGroups = [
  {
    name: "Dashboard",
    permissions: [
      {
        code: "admin.dashboard",
        label: "Acceso al dashboard administrativo",
      },
      {
        code: "manager.dashboard",
        label: "Acceso al dashboard del gestor",
      },
    ],
  },

  {
    name: "Marcas",
    permissions: [
      {
        code: "brands.view",
        label: "Ver marcas",
      },
      {
        code: "brands.manage",
        label: "Administrar marcas",
      },
    ],
  },

  {
    name: "Categorías",
    permissions: [
      {
        code: "categories.view",
        label: "Ver categorías",
      },
      {
        code: "categories.manage",
        label: "Administrar categorías",
      },
    ],
  },

  {
    name: "Clientes",
    permissions: [
      {
        code: "customers.view",
        label: "Ver clientes",
      },
      {
        code: "customers.create",
        label: "Crear clientes",
      },
      {
        code: "customers.update",
        label: "Modificar clientes",
      },
      {
        code: "customers.delete",
        label: "Eliminar clientes",
      },
    ],
  },

  {
    name: "Gestores",
    permissions: [
      {
        code: "managers.view",
        label: "Ver gestores",
      },
      {
        code: "managers.manage",
        label: "Administrar gestores",
      },
    ],
  },

  {
    name: "Pedidos",
    permissions: [
      {
        code: "orders.view",
        label: "Ver pedidos",
      },
      {
        code: "orders.manage",
        label: "Administrar pedidos",
      },
    ],
  },

  {
    name: "Pedidos del gestor",
    permissions: [
      {
        code: "manager.orders.view",
        label: "Ver pedidos del gestor",
      },
      {
        code: "manager.orders.create",
        label: "Crear pedidos del gestor",
      },
    ],
  },

  {
    name: "Productos",
    permissions: [
      {
        code: "products.view",
        label: "Ver productos",
      },
      {
        code: "products.manage",
        label: "Administrar productos",
      },
    ],
  },

  {
    name: "Clientes del gestor",
    permissions: [
      {
        code: "manager.customers.view",
        label: "Ver clientes del gestor",
      },
      {
        code: "manager.customers.manage",
        label: "Administrar clientes del gestor",
      },
    ],
  },

  {
    name: "Roles",
    permissions: [
      {
        code: "roles.view",
        label: "Ver roles",
      },
      {
        code: "roles.manage",
        label: "Administrar roles",
      },
    ],
  },

  {
    name: "Proveedores",
    permissions: [
      {
        code: "suppliers.view",
        label: "Ver proveedores",
      },
      {
        code: "suppliers.manage",
        label: "Administrar proveedores",
      },
    ],
  },

  {
    name: "Usuarios",
    permissions: [
      {
        code: "users.view",
        label: "Ver usuarios",
      },
      {
        code: "users.manage",
        label: "Administrar usuarios",
      },
    ],
  },
];

const allPermissions = permissionGroups.flatMap(
  (group) =>
    group.permissions.map(
      (permission) => permission.code
    )
);

const protectedRoleCodes = [
  "admin",
  "manager",
  "vendedor",
  "cliente",
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [editingRoleId, setEditingRoleId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<RoleForm>(emptyForm);

  const [filters, setFilters] =
    useState<Filters>(emptyFilters);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedRoles, setSelectedRoles] =
    useState<number[]>([]);

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  async function loadRoles() {
    try {
      setError("");

      const accessToken =
        getAdminAccessToken();

      const result =
        await getRoles(accessToken);

      setRoles(
        Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los roles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  function getAccessToken() {
    return getAdminAccessToken();
  }

  function handleNewRole() {
    setEditingRoleId(null);
    setForm(emptyForm);
    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleEditRole(role: Role) {
    setEditingRoleId(role.id);

    setForm({
      code: role.code,
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });

    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingRoleId(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(
    field: keyof RoleForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleFilterChange(
    field: keyof Filters,
    value: string
  ) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));

    setCurrentPage(1);
  }

  function handlePermissionChange(
    permission: string
  ) {
    setForm((current) => {
      const exists =
        current.permissions.includes(permission);

      if (exists) {
        return {
          ...current,
          permissions:
            current.permissions.filter(
              (item) => item !== permission
            ),
        };
      }

      return {
        ...current,
        permissions: [
          ...current.permissions,
          permission,
        ],
      };
    });
  }

  function handleSelectAllPermissions() {
    const allSelected = allPermissions.every(
      (permission) =>
        form.permissions.includes(permission)
    );

    if (allSelected) {
      setForm((current) => ({
        ...current,
        permissions:
          current.permissions.filter(
            (permission) =>
              !allPermissions.includes(permission)
          ),
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      permissions: Array.from(
        new Set([
          ...current.permissions,
          ...allPermissions,
        ])
      ),
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const accessToken =
        getAccessToken();

      const code = form.code
        .trim()
        .toLowerCase();

      const name = form.name.trim();

      if (!code) {
        throw new Error(
          "El código del rol es obligatorio."
        );
      }

      if (!name) {
        throw new Error(
          "El nombre del rol es obligatorio."
        );
      }

      const roleData = {
        code,
        name,
        description:
          form.description.trim() || null,
        permissions: form.permissions,
      };

      if (editingRoleId !== null) {
        await updateRole(
          accessToken,
          editingRoleId,
          roleData
        );
      } else {
        await createRole(
          accessToken,
          {
            ...roleData,
            active: true,
          }
        );
      }

      setForm(emptyForm);
      setEditingRoleId(null);
      setShowForm(false);

      await loadRoles();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el rol."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRole(role: Role) {
    try {
      setError("");

      const accessToken =
        getAccessToken();

      await updateRole(
        accessToken,
        role.id,
        {
          active: !role.active,
        }
      );

      setOpenMenuId(null);

      await loadRoles();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del rol."
      );
    }
  }

  async function handleDeleteRole(
    role: Role
  ) {
    if (
      protectedRoleCodes.includes(role.code)
    ) {
      setError(
        "Los roles principales del sistema no pueden eliminarse."
      );

      setOpenMenuId(null);

      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar el rol "${role.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const accessToken =
        getAccessToken();

      await deleteRole(
        accessToken,
        role.id
      );

      setSelectedRoles((current) =>
        current.filter(
          (id) => id !== role.id
        )
      );

      setOpenMenuId(null);

      await loadRoles();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el rol."
      );
    }
  }

  function handleSelectRole(
    roleId: number
  ) {
    setSelectedRoles((current) => {
      if (current.includes(roleId)) {
        return current.filter(
          (id) => id !== roleId
        );
      }

      return [...current, roleId];
    });
  }

  function handleSelectAll() {
    const currentPageIds =
      paginatedRoles.map(
        (role) => role.id
      );

    const allSelected =
      currentPageIds.length > 0 &&
      currentPageIds.every((id) =>
        selectedRoles.includes(id)
      );

    if (allSelected) {
      setSelectedRoles((current) =>
        current.filter(
          (id) =>
            !currentPageIds.includes(id)
        )
      );
    } else {
      setSelectedRoles((current) => [
        ...current,
        ...currentPageIds.filter(
          (id) => !current.includes(id)
        ),
      ]);
    }
  }

  const filteredRoles = useMemo(() => {
    const codeFilter =
      filters.code.trim().toLowerCase();

    const nameFilter =
      filters.name.trim().toLowerCase();

    const descriptionFilter =
      filters.description
        .trim()
        .toLowerCase();

    return roles.filter((role) => {
      const codeMatches =
        !codeFilter ||
        role.code
          .toLowerCase()
          .includes(codeFilter);

      const nameMatches =
        !nameFilter ||
        role.name
          .toLowerCase()
          .includes(nameFilter);

      const descriptionMatches =
        !descriptionFilter ||
        (role.description || "")
          .toLowerCase()
          .includes(
            descriptionFilter
          );

      return (
        codeMatches &&
        nameMatches &&
        descriptionMatches
      );
    });
  }, [roles, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRoles.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedRoles =
    filteredRoles.slice(
      (safeCurrentPage - 1) *
        ITEMS_PER_PAGE,
      safeCurrentPage *
        ITEMS_PER_PAGE
    );

  const pageStart =
    filteredRoles.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const pageEnd = Math.min(
    safeCurrentPage *
      ITEMS_PER_PAGE,
    filteredRoles.length
  );

  const currentPageIds =
    paginatedRoles.map(
      (role) => role.id
    );

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedRoles.includes(id)
    );

  const someCurrentPageSelected =
    currentPageIds.some((id) =>
      selectedRoles.includes(id)
    );

  function handlePageChange(
    page: number
  ) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
    setOpenMenuId(null);
  }

  function renderPageNumbers() {
    const pages: number[] = [];

    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      safeCurrentPage - 2
    );

    let endPage = Math.min(
      totalPages,
      startPage +
        maxVisiblePages -
        1
    );

    if (
      endPage - startPage + 1 <
      maxVisiblePages
    ) {
      startPage = Math.max(
        1,
        endPage -
          maxVisiblePages +
          1
      );
    }

    for (
      let page = startPage;
      page <= endPage;
      page += 1
    ) {
      pages.push(page);
    }

    return pages;
  }

  function getPermissionCount(
    role: Role
  ) {
    return role.permissions?.length || 0;
  }

  return (
    <DashboardShell>
      <div className={commonStyles.page}>
        <div
          className={
            commonStyles.pageHeader
          }
        >
          <div>
            <h1>Roles</h1>

            <p>
              Gestión de roles y
              permisos de DRL
              Electronik.
            </p>
          </div>

          {!showForm && (
            <button
              type="button"
              className={
                commonStyles.primaryButton
              }
              onClick={handleNewRole}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.462 20.87c-.153 .047 -.307 .09 -.462 .13a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 .11 6.37" />
                <path d="M16 19h6" />
                <path d="M19 16v6" />
              </svg>
            </button>
          )}
        </div>

        {showForm && (
          <section
            className={
              commonStyles.formCard
            }
          >
            <div
              className={
                commonStyles.formHeader
              }
            >
              <div>
                <h2>
                  {editingRoleId !== null
                    ? "Editar rol"
                    : "Nuevo rol"}
                </h2>

                <p>
                  Completa los datos
                  del rol y asigna
                  sus permisos.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={
                commonStyles.form
              }
            >
              <div
                className={
                  commonStyles.formGrid
                }
              >
                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label>
                    Código del rol
                  </label>

                  <input
                    type="text"
                    value={form.code}
                    onChange={(event) =>
                      handleChange(
                        "code",
                        event.target.value
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )
                      )
                    }
                    maxLength={100}
                    placeholder="ej. supervisor"
                    required
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label>
                    Nombre del rol
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value
                      )
                    }
                    maxLength={150}
                    placeholder="Ej. Supervisor"
                    required
                  />
                </div>

                <div
                  className={
                    commonStyles.fieldFull
                  }
                >
                  <label>
                    Descripción
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      handleChange(
                        "description",
                        event.target.value
                      )
                    }
                    maxLength={500}
                    rows={4}
                    placeholder="Describe las funciones de este rol."
                  />
                </div>
              </div>

              <div
                className={
                  styles.permissionsHeader
                }
              >
                <div>
                  <h3>
                    Permisos del rol
                  </h3>

                  <p>
                    Selecciona los
                    permisos que tendrá
                    este rol.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    commonStyles.secondaryButton
                  }
                  onClick={
                    handleSelectAllPermissions
                  }
                >
                  {allPermissions.every(
                    (permission) =>
                      form.permissions.includes(
                        permission
                      )
                  )
                    ? "Quitar todos"
                    : "Seleccionar todos"}
                </button>
              </div>

              <div
                className={
                  styles.permissionsGrid
                }
              >
                {permissionGroups.map(
                  (group) => (
                    <div
                      key={group.name}
                      className={
                        styles.permissionGroup
                      }
                    >
                      <div
                        className={
                          styles.permissionGroupTitle
                        }
                      >
                        {group.name}
                      </div>

                      {group.permissions.map(
                        (permission) => {
                          const checked =
                            form.permissions.includes(
                              permission.code
                            );

                          return (
                            <label
                              key={
                                permission.code
                              }
                              className={
                                styles.permissionItem
                              }
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={() =>
                                  handlePermissionChange(
                                    permission.code
                                  )
                                }
                              />

                              <span>
                                {
                                  permission.label
                                }
                              </span>
                            </label>
                          );
                        }
                      )}
                    </div>
                  )
                )}
              </div>

              <div
                className={
                  commonStyles.formActions
                }
              >
                <button
                  type="submit"
                  className={
                    commonStyles.primaryButton
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingRoleId !==
                        null
                      ? "Actualizar Rol"
                      : "Guardar Rol"}
                </button>

                <button
                  type="button"
                  className={
                    commonStyles.secondaryButton
                  }
                  onClick={
                    handleCancelForm
                  }
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {loading && (
          <div
            className={
              commonStyles.message
            }
          >
            Cargando roles...
          </div>
        )}

        {error && (
          <div
            className={
              commonStyles.error
            }
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          roles.length === 0 && (
            <div
              className={
                commonStyles.emptyState
              }
            >
              <h2>
                No hay roles
                registrados
              </h2>

              <p>
                Comienza agregando
                el primer rol de
                DRL Electronik.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          roles.length > 0 && (
            <section
              className={
                tableStyles.tableCard
              }
            >
              <div
                className={
                  tableStyles.tableHeader
                }
              >
                <div>
                  <h2>
                    Listado de Roles
                  </h2>

                  <span>
                    {
                      filteredRoles.length
                    }{" "}
                    {filteredRoles.length ===
                    1
                      ? "rol"
                      : "roles"}
                  </span>
                </div>
              </div>

              <div
                className={
                  tableStyles.tableWrapper
                }
              >
                <table
                  className={`${tableStyles.table} ${styles.roleTable}`}
                >
                  <thead>
                    <tr>
                      <th
                        className={
                          tableStyles.checkboxColumn
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            allCurrentPageSelected
                          }
                          ref={(element) => {
                            if (element) {
                              element.indeterminate =
                                !allCurrentPageSelected &&
                                someCurrentPageSelected;
                            }
                          }}
                          onChange={
                            handleSelectAll
                          }
                          aria-label="Seleccionar todos los roles"
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Código
                        </div>

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.code
                          }
                          onChange={(event) =>
                            handleFilterChange(
                              "code",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Rol
                        </div>

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.name
                          }
                          onChange={(event) =>
                            handleFilterChange(
                              "name",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Descripción
                        </div>

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.description
                          }
                          onChange={(event) =>
                            handleFilterChange(
                              "description",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Permisos
                        </div>
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Estado
                        </div>
                      </th>

                      <th
                        className={
                          tableStyles.actionsColumn
                        }
                      >
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Acciones
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRoles.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className={
                            tableStyles.noResults
                          }
                        >
                          No se encontraron
                          roles con esos
                          filtros.
                        </td>
                      </tr>
                    )}

                    {paginatedRoles.map(
                      (role) => (
                        <tr
                          key={role.id}
                        >
                          <td
                            className={
                              tableStyles.checkboxColumn
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(
                                role.id
                              )}
                              onChange={() =>
                                handleSelectRole(
                                  role.id
                                )
                              }
                              aria-label={`Seleccionar ${role.name}`}
                            />
                          </td>

                          <td>
                            <span
                              className={
                                styles.code
                              }
                            >
                              {role.code}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {role.name}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                styles.description
                              }
                            >
                              {role.description ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                styles.permissionCount
                              }
                            >
                              {
                                getPermissionCount(
                                  role
                                )
                              }
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={
                                tableStyles.toggle
                              }
                              data-active={
                                role.active
                              }
                              onClick={() =>
                                handleToggleRole(
                                  role
                                )
                              }
                              aria-label={
                                role.active
                                  ? `Desactivar ${role.name}`
                                  : `Activar ${role.name}`
                              }
                              aria-pressed={
                                role.active
                              }
                            >
                              <span
                                className={
                                  tableStyles.toggleTrack
                                }
                              >
                                <span
                                  className={
                                    tableStyles.toggleThumb
                                  }
                                />
                              </span>

                              <span
                                className={
                                  tableStyles.toggleLabel
                                }
                              >
                                {role.active
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>
                            </button>
                          </td>

                          <td
                            className={
                              tableStyles.actionsColumn
                            }
                          >
                            <div
                              className={
                                tableStyles.actionMenuWrapper
                              }
                            >
                              <button
                                type="button"
                                className={
                                  tableStyles.moreButton
                                }
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId ===
                                      role.id
                                      ? null
                                      : role.id
                                  )
                                }
                                aria-label={`Acciones de ${role.name}`}
                                aria-expanded={
                                  openMenuId ===
                                  role.id
                                }
                              >
                                <span />
                                <span />
                                <span />
                              </button>

                              {openMenuId ===
                                role.id && (
                                <div
                                  className={
                                    tableStyles.actionMenu
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditRole(
                                        role
                                      )
                                    }
                                  >
                                    <span
                                      className={
                                        tableStyles.menuIcon
                                      }
                                    >
                                      ✎
                                    </span>

                                    <span>
                                      Editar
                                    </span>
                                  </button>

                                  {!protectedRoleCodes.includes(
                                    role.code
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteRole(
                                          role
                                        )
                                      }
                                    >
                                      <span
                                        className={
                                          tableStyles.menuIcon
                                        }
                                      >
                                        🗑
                                      </span>

                                      <span>
                                        Eliminar
                                      </span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className={
                  tableStyles.pagination
                }
              >
                <div
                  className={
                    tableStyles.paginationInfo
                  }
                >
                  Mostrando {pageStart}–
                  {pageEnd} de{" "}
                  {
                    filteredRoles.length
                  }
                </div>

                <div
                  className={
                    tableStyles.paginationControls
                  }
                >
                  <button
                    type="button"
                    className={
                      tableStyles.pageArrow
                    }
                    onClick={() =>
                      handlePageChange(
                        safeCurrentPage -
                          1
                      )
                    }
                    disabled={
                      safeCurrentPage ===
                      1
                    }
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {renderPageNumbers().map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        className={`${tableStyles.pageNumber} ${
                          page ===
                          safeCurrentPage
                            ? tableStyles.pageNumberActive
                            : ""
                        }`}
                        onClick={() =>
                          handlePageChange(
                            page
                          )
                        }
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className={
                      tableStyles.pageArrow
                    }
                    onClick={() =>
                      handlePageChange(
                        safeCurrentPage +
                          1
                      )
                    }
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>
                </div>
              </div>
            </section>
          )}
      </div>
    </DashboardShell>
  );
}