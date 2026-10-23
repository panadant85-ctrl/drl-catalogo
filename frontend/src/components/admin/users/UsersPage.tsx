"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  createUser,
  deleteUser,
  getUserRoles,
  getUsers,
  updateUser,
  updateUserStatus,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";
import { useAdminAccess } from "@/app/admin/layout";

import commonStyles from "@/components/admin/styles/AdminCommon.module.css";
import tableStyles from "@/components/admin/styles/AdminTable.module.css";
import styles from "./Users.module.css";

type Role = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  active: boolean;
};

type AdminUser = {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  user_metadata: Record<string, unknown>;
  role: Role | null;
};


type UserForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleId: string;
  username: string;
  carnet: string;
};


const ITEMS_PER_PAGE = 10;

const INTERNAL_ROLE_CODES = [
  "admin",
  "manager",
  "vendedor",
];

export default function UsersPage() {
  const { hasPermission } = useAdminAccess();

  const canManageUsers =
    hasPermission("users.manage");
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<UserForm>({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  roleId: "",
  username: "",
  carnet: "",
});

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const accessToken = getAdminAccessToken();

      const response = await getUsers(accessToken);

      setUsers(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error cargando usuarios:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    try {
      setLoadingRoles(true);

      const accessToken = getAdminAccessToken();

      const response = await getUserRoles(accessToken);

      setRoles(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error cargando roles:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los roles."
      );
    } finally {
      setLoadingRoles(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    void loadRoles();
  }, []);

  /*
   * Los clientes tienen su propio flujo de registro
   * y utilizan el rol "cliente".
   *
   * Este módulo administra únicamente usuarios internos
   * del dashboard.
   */
  const internalRoles = useMemo(() => {
    return roles.filter((role) =>
      INTERNAL_ROLE_CODES.includes(role.code)
    );
  }, [roles]);

  const isManagerRole =
  internalRoles.some(
    (role) =>
      role.code === "manager" &&
      String(role.id) === form.roleId
  );

  function resetForm() {
  setForm({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    username: "",
    carnet: "",
  });

  setEditingId(null);
}

  function openCreateForm() {
    resetForm();
    setError("");
    setOpenMenuId(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    resetForm();
    setFormOpen(false);
    setError("");
  }

  function openEditForm(user: AdminUser) {
    setEditingId(user.id);

    setForm({
      fullName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : "",

      email: user.email ?? "",

      phone: user.phone ?? "",

      password: "",

      confirmPassword: "",

      roleId: user.role
        ? String(user.role.id)
        : "",

      username: "",
      carnet: "",
      });

    setError("");
    setFormOpen(true);
    setOpenMenuId(null);
  }

  function handleChange(
    field: keyof UserForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function isUserActive(user: AdminUser) {
    if (!user.banned_until) {
      return true;
    }

    const bannedUntil = new Date(
      user.banned_until
    ).getTime();

    if (Number.isNaN(bannedUntil)) {
      return false;
    }

    return bannedUntil <= Date.now();
  }

  async function handleToggleStatus(
    user: AdminUser
  ) {
    if (user.role?.code === "admin") {
      setError(
        "El usuario admin no puede desactivarse desde este módulo."
      );

      return;
    }

    const active = isUserActive(user);

    try {
      setError("");
      setSaving(true);

      const accessToken = getAdminAccessToken();

      await updateUserStatus(
        accessToken,
        user.id,
        !active
      );

      await loadUsers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del usuario."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const accessToken = getAdminAccessToken();

      if (editingId) {
        if (!form.fullName.trim()) {
          setError(
            "El nombre completo es obligatorio."
          );
          return;
        }

        if (!form.email.trim()) {
          setError(
            "El correo electrónico es obligatorio."
          );
          return;
        }

        if (!form.roleId) {
          setError(
            "Debes seleccionar un rol para el usuario."
          );
          return;
        }

        if (
          form.password &&
          !form.confirmPassword
        ) {
          setError(
            "Debes confirmar la nueva contraseña."
          );
          return;
        }

        await updateUser(
          accessToken,
          editingId,
          {
            fullName: form.fullName.trim(),

            email: form.email.trim(),

            phone: form.phone.trim(),

            password:
              form.password || undefined,

            confirmPassword:
              form.confirmPassword || undefined,

            roleId: Number(form.roleId),
          }
        );
      } else {
        if (
          !form.fullName.trim() ||
          !form.email.trim() ||
          !form.password ||
          !form.confirmPassword ||
          !form.roleId
        ) {
          setError(
            "Completa todos los campos obligatorios."
          );
          return;
        }

        if (isManagerRole) {
          const username = form.username
            .trim()
            .toLowerCase();

          const carnet = form.carnet.trim();

          if (!username) {
            setError(
              "El nombre de usuario es obligatorio para los gestores."
            );
            return;
          }

          if (
            !/^[a-z0-9](?:[a-z0-9._-]{2,28}[a-z0-9])?$/.test(
              username
            )
          ) {
            setError(
              "El nombre de usuario debe tener entre 4 y 30 caracteres y utilizar letras minúsculas, números, puntos, guiones o guiones bajos."
            );
            return;
          }

          if (!/^[0-9]{11}$/.test(carnet)) {
            setError(
              "El carnet debe contener exactamente 11 dígitos."
            );
            return;
          }
        }

        await createUser(accessToken, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          roleId: Number(form.roleId),

          ...(isManagerRole
            ? {
                username: form.username.trim().toLowerCase(),
                carnet: form.carnet.trim(),
              }
            : {}),
        });
      }

      resetForm();
      setFormOpen(false);

      await loadUsers();
    } catch (error) {
      console.error(
        "Error guardando usuario:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el usuario."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    user: AdminUser
  ) {
    if (user.role?.code === "admin") {
      setError(
        "Los usuarios con rol admin no pueden eliminarse desde este módulo."
      );

      setOpenMenuId(null);
      return;
    }

    const name =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email || "este usuario";

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar a ${name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      setOpenMenuId(null);
      return;
    }

    try {
      setError("");

      const accessToken = getAdminAccessToken();

      await deleteUser(
        accessToken,
        user.id
      );

      setSelectedIds((current) =>
        current.filter(
          (id) => id !== user.id
        )
      );

      setOpenMenuId(null);

      await loadUsers();
    } catch (error) {
      console.error(
        "Error eliminando usuario:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el usuario."
      );
    }
  }

  function getUserName(
    user: AdminUser
  ) {
    if (
      typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()
    ) {
      return user.user_metadata.full_name;
    }

    if (
      typeof user.user_metadata?.name === "string" &&
      user.user_metadata.name.trim()
    ) {
      return user.user_metadata.name;
    }

    return user.email || "Sin nombre";
  }

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "Nunca";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "es-ES",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  }

  const filteredUsers = useMemo(() => {
    const nameFilter =
      filters.name.trim().toLowerCase();

    const emailFilter =
      filters.email.trim().toLowerCase();

    const phoneFilter =
      filters.phone.trim().toLowerCase();

    const roleFilter =
      filters.role.trim().toLowerCase();

    const statusFilter =
      filters.status.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        getUserName(user).toLowerCase();

      const email =
        (user.email ?? "").toLowerCase();

      const phone =
        (user.phone ?? "").toLowerCase();

      const role = (
        user.role?.name ??
        user.role?.code ??
        ""
      ).toLowerCase();

      const status = isUserActive(user)
        ? "activo"
        : "inactivo";

      return (
        name.includes(nameFilter) &&
        email.includes(emailFilter) &&
        phone.includes(phoneFilter) &&
        role.includes(roleFilter) &&
        status.includes(statusFilter)
      );
    });
  }, [users, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedUsers =
    filteredUsers.slice(
      (safeCurrentPage - 1) *
        ITEMS_PER_PAGE,
      safeCurrentPage *
        ITEMS_PER_PAGE
    );

  const pageStart =
    filteredUsers.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const pageEnd = Math.min(
    safeCurrentPage *
      ITEMS_PER_PAGE,
    filteredUsers.length
  );

  const allPageSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((user) =>
      selectedIds.includes(user.id)
    );

  function toggleSelectAll() {
    const pageIds =
      paginatedUsers.map(
        (user) => user.id
      );

    if (allPageSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !pageIds.includes(id)
        )
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...pageIds,
      ]),
    ]);
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  }

  function updateFilter(
    field: keyof typeof filters,
    value: string
  ) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));

    setCurrentPage(1);
  }

  function toggleMenu(id: string) {
    setOpenMenuId((current) =>
      current === id ? null : id
    );
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
            <h1>Usuarios</h1>

            <p>
              Administra los usuarios
              administrativos y sus roles.
            </p>
          </div>

         {canManageUsers && (
          <button
            type="button"
            className={
              commonStyles.primaryButton
            }
            onClick={openCreateForm}
          >
            + Nuevo usuario
          </button>
        )}
        </div>

        {error && (
          <div
            className={
              commonStyles.error
            }
          >
            {error}
          </div>
        )}

        {formOpen && canManageUsers && (
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
              <h2>
                {editingId
                  ? "Editar usuario"
                  : "Nuevo usuario"}
              </h2>

              <p>
                {editingId
                  ? "Modifica los datos del usuario, su contraseña y el rol asignado."
                  : "Crea un nuevo usuario administrativo y asigna su rol."}
              </p>
            </div>

            <form
              className={
                commonStyles.form
              }
              onSubmit={handleSubmit}
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
                  <label htmlFor="fullName">
                    Nombre completo
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={
                      form.fullName
                    }
                    onChange={(event) =>
                      handleChange(
                        "fullName",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    placeholder="Nombre completo"
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label htmlFor="email">
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label htmlFor="phone">
                    Teléfono
                  </label>

                  <input
                    id="phone"
                    type="text"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    placeholder="+..."
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label htmlFor="password">
                    {editingId
                      ? "Nueva contraseña"
                      : "Contraseña"}
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      handleChange(
                        "password",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    placeholder={
                      editingId
                        ? "Dejar vacío para conservarla"
                        : "Mínimo 8 caracteres"
                    }
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label htmlFor="confirmPassword">
                    Confirmar contraseña
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={
                      form.confirmPassword
                    }
                    onChange={(event) =>
                      handleChange(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    placeholder={
                      editingId
                        ? "Repite la nueva contraseña"
                        : "Repite la contraseña"
                    }
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label htmlFor="roleId">
                    Rol
                  </label>

                  <select
                    id="roleId"
                    value={form.roleId}
                    onChange={(event) =>
                      handleChange(
                        "roleId",
                        event.target.value
                      )
                    }
                    disabled={
                      loadingRoles ||
                      saving
                    }
                  >
                    <option value="">
                      Seleccionar rol
                    </option>

                    {internalRoles.map(
                      (role) => (
                        <option
                          key={role.id}
                          value={role.id}
                        >
                          {role.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              
            {!editingId && isManagerRole && (
              <>
                <div className={commonStyles.field}>
                  <label htmlFor="username">
                    Nombre de usuario
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(event) =>
                      handleChange("username", event.target.value)
                    }
                    disabled={saving}
                    placeholder="Ej. gestor01"
                    autoComplete="username"
                    required
                    minLength={4}
                    maxLength={30}
                  />
                </div>

                <div className={commonStyles.field}>
                  <label htmlFor="carnet">
                    Carnet de identidad
                  </label>

                  <input
                    id="carnet"
                    type="text"
                    value={form.carnet}
                    onChange={(event) =>
                      handleChange(
                        "carnet",
                        event.target.value.replace(/\D/g, "").slice(0, 11)
                      )
                    }
                    disabled={saving}
                    placeholder="11 dígitos"
                    inputMode="numeric"
                    maxLength={11}
                    required
                  />
                </div>
              </>
            )}


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
                  disabled={
                    saving ||
                    loadingRoles
                  }
                >
                  {saving
                    ? "Guardando..."
                    : editingId
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>

                <button
                  type="button"
                  className={
                    commonStyles.secondaryButton
                  }
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

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
                Usuarios administrativos
              </h2>

              <span>
                {users.length}{" "}
                usuarios registrados
              </span>
            </div>
          </div>

          {loading ? (
            <div
              className={
                commonStyles.message
              }
            >
              Cargando usuarios...
            </div>
          ) : (
            <>
              <div
                className={
                  tableStyles.tableWrapper
                }
              >
                <table
                  className={`${tableStyles.table} ${styles.userTable}`}
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
                            allPageSelected
                          }
                          onChange={
                            toggleSelectAll
                          }
                          aria-label="Seleccionar todos"
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Usuario
                        </div>

                        <input
                          className={
                            tableStyles.filterInput
                          }
                          value={
                            filters.name
                          }
                          onChange={(event) =>
                            updateFilter(
                              "name",
                              event.target.value
                            )
                          }
                          placeholder="Filtrar..."
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Correo
                        </div>

                        <input
                          className={
                            tableStyles.filterInput
                          }
                          value={
                            filters.email
                          }
                          onChange={(event) =>
                            updateFilter(
                              "email",
                              event.target.value
                            )
                          }
                          placeholder="Filtrar..."
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Teléfono
                        </div>

                        <input
                          className={
                            tableStyles.filterInput
                          }
                          value={
                            filters.phone
                          }
                          onChange={(event) =>
                            updateFilter(
                              "phone",
                              event.target.value
                            )
                          }
                          placeholder="Filtrar..."
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
                          className={
                            tableStyles.filterInput
                          }
                          value={
                            filters.role
                          }
                          onChange={(event) =>
                            updateFilter(
                              "role",
                              event.target.value
                            )
                          }
                          placeholder="Filtrar..."
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Estado
                        </div>

                        <input
                          className={
                            tableStyles.filterInput
                          }
                          value={
                            filters.status
                          }
                          onChange={(event) =>
                            updateFilter(
                              "status",
                              event.target.value
                            )
                          }
                          placeholder="Filtrar..."
                        />
                      </th>
                     {canManageUsers && (
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
                    )}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={canManageUsers ? 8 : 7}
                          className={
                            tableStyles.noResults
                          }
                        >
                          No se encontraron
                          usuarios.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map(
                        (user) => {
                          const isAdmin =
                            user.role?.code ===
                            "admin";

                          return (
                            <tr
                              key={user.id}
                            >
                              <td
                                className={
                                  tableStyles.checkboxColumn
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(
                                    user.id
                                  )}
                                  onChange={() =>
                                    toggleSelect(
                                      user.id
                                    )
                                  }
                                  aria-label={`Seleccionar ${getUserName(
                                    user
                                  )}`}
                                />
                              </td>

                              <td>
                                <div
                                  className={
                                    styles.userCell
                                  }
                                >
                                  <div
                                    className={
                                      styles.avatar
                                    }
                                  >
                                    {getUserName(
                                      user
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>
                                      {getUserName(
                                        user
                                      )}
                                    </strong>

                                    {isAdmin && (
                                      <span
                                        className={
                                          styles.adminBadge
                                        }
                                      >
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td>
                                {user.email ||
                                  "—"}
                              </td>

                              <td>
                                {user.phone ||
                                  "—"}
                              </td>

                              <td>
                                <span
                                  className={
                                    styles.roleBadge
                                  }
                                >
                                  {user.role
                                    ?.name ||
                                    "Sin rol"}
                                </span>
                              </td>

                              <td>
                                {canManageUsers ? (
                                  <button
                                    type="button"
                                    className={
                                      tableStyles.toggle
                                    }
                                    data-active={isUserActive(user)}
                                    onClick={() =>
                                      handleToggleStatus(user)
                                    }
                                    disabled={
                                      saving || isAdmin
                                    }
                                    title={
                                      isAdmin
                                        ? "El usuario admin no puede desactivarse desde este módulo"
                                        : isUserActive(user)
                                          ? "Desactivar usuario"
                                          : "Activar usuario"
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
                                      {isUserActive(user)
                                        ? "Activo"
                                        : "Inactivo"}
                                    </span>
                                  </button>
                                ) : (
                                  <span>
                                    {isUserActive(user)
                                      ? "Activo"
                                      : "Inactivo"}
                                  </span>
                                )}
                              </td>

                              <td>
                                {formatDate(
                                  user.last_sign_in_at
                                )}
                              </td>
                              {canManageUsers && (
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
                                      toggleMenu(
                                        user.id
                                      )
                                    }
                                    aria-label="Acciones"
                                  >
                                    <span />
                                    <span />
                                    <span />
                                  </button>

                                  {openMenuId ===
                                    user.id && (
                                    <div
                                      className={
                                        tableStyles.actionMenu
                                      }
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditForm(
                                            user
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

                                        Editar
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDelete(
                                            user
                                          )
                                        }
                                        disabled={
                                          isAdmin
                                        }
                                      >
                                        <span
                                          className={
                                            tableStyles.menuIcon
                                          }
                                        >
                                          ×
                                        </span>

                                        {isAdmin
                                          ? "Usuario protegido"
                                          : "Eliminar usuario"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              )}
                            </tr>
                          );
                        }
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
                  {filteredUsers.length}
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
                    disabled={
                      safeCurrentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((page) => (
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
                        setCurrentPage(
                          page
                        )
                      }
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    className={
                      tableStyles.pageArrow
                    }
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (current) =>
                          Math.min(
                            totalPages,
                            current + 1
                          )
                      )
                    }
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}