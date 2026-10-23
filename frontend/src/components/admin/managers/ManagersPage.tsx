
"use client";

import tableStyles from "../styles/AdminTable.module.css";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  checkAdminAccess,
  createManager,
  getManagers,
  updateManager,
  type CreateManagerData,
  type ManagerData,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";

import {
  hasAdminPermission,
  type AdminAccess,
} from "@/lib/adminPermissions";

import styles from "./ManagersPage.module.css";

type ManagerSortField =
  | "id"
  | "code"
  | "name"
  | "phone"
  | "email"
  | "customers"
  | "active";

type SortDirection = "asc" | "desc";

type ManagerRow = ManagerData & {
  customer_count: number;
};

type ManagerResponse = {
  success?: boolean;
  data?: ManagerRow[];
  message?: string;
};

type ManagerSearches = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  customers: string;
};

const EMPTY_SEARCHES: ManagerSearches = {
  id: "",
  code: "",
  name: "",
  phone: "",
  email: "",
  customers: "",
};

const EMPTY_MANAGER_FORM: CreateManagerData = {
  full_name: "",
  email: "",
  phone: "",
  username: "",
  carnet: "",
  active: true,
};

export default function ManagersPage() {
  const router = useRouter();
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] =
    useState<CreateManagerData>(EMPTY_MANAGER_FORM);

    
  const [searches, setSearches] =
    useState<ManagerSearches>(EMPTY_SEARCHES);
  const [sortField, setSortField] =
    useState<ManagerSortField>("id");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  function handleSort(field: ManagerSortField) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function renderSortHeader(
    label: string,
    field: ManagerSortField
  ) {
    const indicator =
      sortField !== field
        ? "↕"
        : sortDirection === "asc"
          ? "↑"
          : "↓";

    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        aria-label={`Ordenar por ${label}`}
        style={{
          border: 0,
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          font: "inherit",
          fontWeight: 600,
          color: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        {label} {indicator}
      </button>
    );
  }
  const canManage = hasAdminPermission(access, "managers.manage");

  const [updatingManagerId, setUpdatingManagerId] =
  useState<string | null>(null);

  async function handleToggleManagerStatus(manager: ManagerRow) {
        if (!canManage || updatingManagerId !== null) {
          return;
        }

        const nextActive = !manager.active;

        const action = nextActive ? "activar" : "desactivar";

        const confirmed = window.confirm(
          `¿Estás seguro de que deseas ${action} al gestor ${manager.full_name}?`
        );

        if (!confirmed) {
          return;
        }

        setUpdatingManagerId(manager.id);
        setError("");

        try {
          const token = getAdminAccessToken();

          if (!token) {
            throw new Error(
              "No hay una sesión administrativa activa."
            );
          }

          await updateManager(token, manager.id, {
            active: nextActive,
          });

          setManagers((previous) =>
            previous.map((item) =>
              item.id === manager.id
                ? { ...item, active: nextActive }
                : item
            )
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo actualizar el estado del gestor."
          );
        } finally {
          setUpdatingManagerId(null);
        }
      }
  const loadManagers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAdminAccessToken();

      if (!token) {
        throw new Error("No hay una sesión administrativa activa.");
      }

      const accessResult = await checkAdminAccess(token);
      const currentAccess = accessResult?.data ?? accessResult;

      setAccess(currentAccess as AdminAccess);

      if (!hasAdminPermission(currentAccess, "managers.view")) {
        throw new Error("No tienes permiso para consultar los gestores.");
      }

      const result = (await getManagers(token)) as ManagerResponse;

      if (!Array.isArray(result?.data)) {
        throw new Error(
          "La respuesta del servidor no contiene una lista válida de gestores."
        );
      }

      setManagers(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los gestores."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  const filteredManagers = useMemo(() => {
    return managers.filter((manager) => {
      const values: ManagerSearches = {
        id: String(manager.id ?? ""),
        code: manager.manager_code ?? "",
        name: manager.full_name ?? "",
        phone: manager.phone ?? "",
        email: manager.email ?? "",
        customers: String(manager.customer_count ?? 0),
      };

      return Object.entries(searches).every(([key, value]) => {
        const field = key as keyof ManagerSearches;

        return values[field]
          .toLowerCase()
          .includes(value.trim().toLowerCase());
      });
    });
  }, [managers, searches]);

  const sortedManagers = useMemo(() => {
      return [...filteredManagers].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case "id":
            comparison = String(a.id ?? "").localeCompare(
              String(b.id ?? ""),
              "es",
              { numeric: true, sensitivity: "base" }
            );
            break;

          case "code":
            comparison = (a.manager_code ?? "").localeCompare(
              b.manager_code ?? "",
              "es",
              { numeric: true, sensitivity: "base" }
            );
            break;

          case "name":
            comparison = (a.full_name ?? "").localeCompare(
              b.full_name ?? "",
              "es",
              { numeric: true, sensitivity: "base" }
            );
            break;

          case "phone":
            comparison = (a.phone ?? "").localeCompare(
              b.phone ?? "",
              "es",
              { numeric: true, sensitivity: "base" }
            );
            break;

          case "email":
            comparison = (a.email ?? "").localeCompare(
              b.email ?? "",
              "es",
              { numeric: true, sensitivity: "base" }
            );
            break;

          case "customers":
            comparison =
              (a.customer_count ?? 0) -
              (b.customer_count ?? 0);
            break;

          case "active":
            comparison =
              Number(a.active) - Number(b.active);
            break;
        }

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      });
    }, [filteredManagers, sortField, sortDirection]);
  function updateSearch(
    field: keyof ManagerSearches,
    value: string
  ) {
    setSearches((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateCreateForm<K extends keyof CreateManagerData>(
    field: K,
    value: CreateManagerData[K]
  ) {
    setCreateForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setError("");
    setCreateForm({ ...EMPTY_MANAGER_FORM });
    setShowCreateForm(true);
  }

  function closeCreateForm() {
    if (creating) return;

    setShowCreateForm(false);
    setCreateForm({ ...EMPTY_MANAGER_FORM });
    setError("");
  }

  async function handleCreateManager(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canManage) {
      setError("No tienes permiso para crear gestores.");
      return;
    }

    const fullName = createForm.full_name.trim();
    const email = createForm.email.trim();
    const username = createForm.username.trim();
    const carnet = createForm.carnet?.trim() || "";

    if (fullName.length < 2) {
      setError("Introduce el nombre completo del gestor.");
      return;
    }

    if (!email) {
      setError("Introduce el email del gestor.");
      return;
    }

    if (username.length < 3) {
      setError("El username debe tener al menos 3 caracteres.");
      return;
    }

    if (carnet && !/^\d{11}$/.test(carnet)) {
      setError("El carnet debe contener exactamente 11 dígitos.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = getAdminAccessToken();

      if (!token) {
        throw new Error("No hay una sesión administrativa activa.");
      }

      const payload: CreateManagerData = {
        ...createForm,
        full_name: fullName,
        email,
        username,
        phone: createForm.phone?.trim() || null,
        carnet: carnet || null,
      };

      await createManager(token, payload);

      setShowCreateForm(false);
      setCreateForm({ ...EMPTY_MANAGER_FORM });

      await loadManagers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el gestor."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleManager(
        manager: ManagerRow
      ) {
        if (!canManage || updatingManagerId !== null) {
          return;
        }

        try {
          setError("");
          setUpdatingManagerId(manager.id);

          const accessToken = getAdminAccessToken();

          if (!accessToken) {
            throw new Error(
              "No hay una sesión administrativa activa."
            );
          }

          await updateManager(
            accessToken,
            manager.id,
            {
              active: !manager.active,
            }
          );

          await loadManagers();
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "No se pudo cambiar el estado del gestor."
          );
        } finally {
          setUpdatingManagerId(null);
        }
      }

  function renderSearchInput(
    field: keyof ManagerSearches,
    label: string,
    placeholder: string
  ) {
    return (
      <input
        aria-label={label}
        placeholder={placeholder}
        value={searches[field]}
        onChange={(event) => updateSearch(field, event.target.value)}
      />
    );
  }

  return (
    <DashboardShell
      title="Gestores"
      subtitle="Administración de gestores y clientes asociados"
    >
      <div className={styles.managersPage}>
        <div className={styles.managersToolbar}>
          <div>
            <h2 className={styles.pageTitle}>
              Gestores registrados
            </h2>

            <p className={styles.pageSubtitle}>
              Consulta los datos y los clientes asociados a cada gestor.
            </p>
          </div>

          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void loadManagers()}
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={openCreateForm}
              disabled={!canManage || creating}
              title={
                canManage
                  ? "Agregar un gestor"
                  : "No tienes permiso para gestionar gestores"
              }
            >
              + Agregar gestor
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className={styles.createFormCard}>
            <h3 className={styles.formHeading}>
              Registrar nuevo gestor
            </h3>

            <p className={styles.formDescription}>
              El código de gestor y el slug se generarán automáticamente.
            </p>

            <form onSubmit={handleCreateManager}>
              <div className={styles.createFormGrid}>
                <label className={styles.formField}>
                  Nombre completo *
                  <input
                    className={styles.formInput}
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={150}
                    value={createForm.full_name}
                    onChange={(event) =>
                      updateCreateForm("full_name", event.target.value)
                    }
                  />
                </label>

                <label className={styles.formField}>
                  Email *
                  <input
                    className={styles.formInput}
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={255}
                    value={createForm.email}
                    onChange={(event) =>
                      updateCreateForm("email", event.target.value)
                    }
                  />
                </label>

                <label className={styles.formField}>
                  Teléfono
                  <input
                    className={styles.formInput}
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    value={createForm.phone ?? ""}
                    onChange={(event) =>
                      updateCreateForm("phone", event.target.value)
                    }
                  />
                </label>

                <label className={styles.formField}>
                  Username *
                  <input
                    className={styles.formInput}
                    type="text"
                    autoComplete="username"
                    required
                    minLength={3}
                    maxLength={100}
                    value={createForm.username}
                    onChange={(event) =>
                      updateCreateForm("username", event.target.value)
                    }
                  />
                </label>

                <label className={styles.formField}>
                  Carnet (11 dígitos)
                  <input
                    className={styles.formInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    pattern="[0-9]{11}"
                    title="Introduce exactamente 11 dígitos."
                    value={createForm.carnet ?? ""}
                    onChange={(event) =>
                      updateCreateForm("carnet", event.target.value)
                    }
                  />
                </label>

                <label className={styles.activeCheckbox}>
                  <input
                    type="checkbox"
                    checked={createForm.active ?? true}
                    onChange={(event) =>
                      updateCreateForm("active", event.target.checked)
                    }
                  />
                  <span>Gestor activo</span>
                </label>
              </div>

              <div className={styles.createFormActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={creating}
                  onClick={closeCreateForm}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={creating || !canManage}
                >
                  {creating ? "Guardando..." : "Guardar gestor"}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.summary}>
          <span>
            Total de gestores: <strong>{managers.length}</strong>
          </span>

          <span>
            Resultados: <strong>{filteredManagers.length}</strong>
          </span>
        </div>

        {loading ? (
          <div className={styles.message}>
            Cargando gestores...
          </div>
        ) : error && managers.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No se pudieron mostrar los gestores</h3>
            <p>
              Comprueba la sesión y los permisos, e inténtalo de nuevo.
            </p>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void loadManagers()}
            >
              Reintentar
            </button>
          </div>
        ) : managers.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No hay gestores registrados</h3>
            <p>
              Cuando existan gestores, aparecerán en esta tabla.
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.managersTable}>
              <thead>
                <tr>
                  <th>{renderSortHeader("ID", "id")}</th>
                  <th>{renderSortHeader("Código de gestor", "code")}</th>
                  <th>{renderSortHeader("Nombre completo", "name")}</th>
                  <th>{renderSortHeader("Teléfono", "phone")}</th>
                  <th>{renderSortHeader("Email", "email")}</th>
                  <th>{renderSortHeader("Clientes", "customers")}</th>
                  <th>{renderSortHeader("Estado", "active")}</th>
                  <th>Acciones</th>
                </tr>

                <tr className={styles.filtersRow}>
                  <th>
                    {renderSearchInput("id", "Buscar por ID", "Buscar ID")}
                  </th>
                  <th>
                    {renderSearchInput(
                      "code",
                      "Buscar por código",
                      "Buscar código"
                    )}
                  </th>
                  <th>
                    {renderSearchInput(
                      "name",
                      "Buscar por nombre",
                      "Buscar nombre"
                    )}
                  </th>
                  <th>
                    {renderSearchInput(
                      "phone",
                      "Buscar por teléfono",
                      "Buscar teléfono"
                    )}
                  </th>
                  <th>
                    {renderSearchInput(
                      "email",
                      "Buscar por email",
                      "Buscar email"
                    )}
                  </th>
                  <th>
                    {renderSearchInput(
                      "customers",
                      "Buscar por cantidad de clientes",
                      "Buscar cantidad"
                    )}
                  </th>
                  <th />
                  <th />
                </tr>
              </thead>

              <tbody>
                {sortedManagers.map((manager) => (
                  <tr key={manager.id}>
                    <td className={styles.idCell}>{manager.id}</td>

                    <td>
                      <strong>
                        {manager.manager_code || "Pendiente"}
                      </strong>
                    </td>

                    <td className={styles.nameCell}>
                      {manager.full_name}
                    </td>

                    <td>{manager.phone || "—"}</td>
                    <td>{manager.email || "—"}</td>

                    <td>
                      <span className={styles.customerCount}>
                        {manager.customer_count ?? 0}
                      </span>
                    </td>

                    <td>
                      {canManage ? (
                        <button
                          type="button"
                          className={tableStyles.toggle}
                          data-active={manager.active}
                          onClick={() =>
                            void handleToggleManager(manager)
                          }
                          disabled={updatingManagerId !== null}
                          aria-label={
                            manager.active
                              ? `Desactivar ${manager.full_name}`
                              : `Activar ${manager.full_name}`
                          }
                          aria-pressed={manager.active}
                        >
                          <span className={tableStyles.toggleTrack}>
                            <span className={tableStyles.toggleThumb} />
                          </span>

                          <span className={tableStyles.toggleLabel}>
                            {updatingManagerId === manager.id
                              ? "Guardando..."
                              : manager.active
                                ? "Activo"
                                : "Inactivo"}
                          </span>
                        </button>
                      ) : (
                        <span>
                          {manager.active ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() =>
                            router.push(
                              `/admin/managers/${encodeURIComponent(manager.id)}`
                            )
                          }
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          className={styles.actionButton}
                          disabled={!canManage}
                          onClick={() => {
                            alert(
                              "El formulario de edición se añadirá en el siguiente paso."
                            );
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          disabled
                          title="La eliminación se habilitará cuando el backend proteja las relaciones."
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredManagers.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.noResults}>
                      No hay gestores que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
