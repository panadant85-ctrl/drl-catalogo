
"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";
import { useAdminAccess } from "@/app/admin/layout";
import styles from "./Suppliers.module.css";
import commonStyles from "../styles/AdminCommon.module.css";
import tableStyles from "../styles/AdminTable.module.css";

type Supplier = {
  id: number;
  company_name: string;
  nit: string;
  address: string;
  phone: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type SupplierForm = {
  company_name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
};

type Filters = {
  company_name: string;
  nit: string;
  contact: string;
  address: string;
};

const emptyForm: SupplierForm = {
  company_name: "",
  nit: "",
  address: "",
  phone: "",
  email: "",
};

const emptyFilters: Filters = {
  company_name: "",
  nit: "",
  contact: "",
  address: "",
};

const ITEMS_PER_PAGE = 10;
type SortField =
  | "company_name"
  | "nit"
  | "contact"
  | "address"
  | "active";

type SortDirection = "asc" | "desc";
export default function SuppliersPage() {
   const { hasPermission } = useAdminAccess();

  const canManageSuppliers =
    hasPermission("suppliers.manage");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingSupplierId, setEditingSupplierId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<SupplierForm>(emptyForm);

  const [filters, setFilters] =
    useState<Filters>(emptyFilters);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] =
    useState<SortField>("company_name");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  }

  function renderSortLabel(
    label: string,
    field: SortField
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
        className={tableStyles.columnTitle}
        onClick={() => handleSort(field)}
        aria-label={`Ordenar por ${label}, ${
          sortField === field
            ? sortDirection === "asc"
              ? "actualmente ascendente"
              : "actualmente descendente"
            : "ascendente"
        }`}
        style={{
          border: 0,
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          font: "inherit",
          fontWeight: 600,
        }}
      >
        {label} {indicator}
      </button>
    );
  }
  const [selectedSuppliers, setSelectedSuppliers] =
    useState<number[]>([]);

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

 async function loadSuppliers() {
  try {
    setError("");

    const accessToken = getAdminAccessToken();

    const result = await getSuppliers(accessToken);

    setSuppliers(
      Array.isArray(result?.data)
        ? result.data
        : []
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los proveedores."
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadSuppliers();
  }, []);

  function handleChange(
    field: keyof SupplierForm,
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

  function getAccessToken() {
  return getAdminAccessToken();
}

  function handleNewSupplier() {
    setEditingSupplierId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function handleEditSupplier(
    supplier: Supplier
  ) {
    setEditingSupplierId(supplier.id);

    setForm({
      company_name: supplier.company_name,
      nit: supplier.nit,
      address: supplier.address,
      phone: supplier.phone || "",
      email: supplier.email || "",
    });

    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingSupplierId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const accessToken = getAccessToken();

      const supplierData = {
        company_name: form.company_name.trim(),
        nit: form.nit.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      };

      if (editingSupplierId !== null) {
        await updateSupplier(
          accessToken,
          editingSupplierId,
          supplierData
        );
      } else {
        await createSupplier(
          accessToken,
          {
            ...supplierData,
            active: true,
          }
        );
      }

      setForm(emptyForm);
      setEditingSupplierId(null);
      setShowForm(false);

      await loadSuppliers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el proveedor."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSupplier(
    supplier: Supplier
  ) {
    try {
      setError("");

      const accessToken = getAccessToken();

      await updateSupplier(
        accessToken,
        supplier.id,
        {
          active: !supplier.active,
        }
      );

      setOpenMenuId(null);

      await loadSuppliers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del proveedor."
      );
    }
  }

  async function handleDeleteSupplier(
    supplier: Supplier
  ) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el proveedor "${supplier.company_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const accessToken = getAccessToken();

      await deleteSupplier(
        accessToken,
        supplier.id
      );

      setSelectedSuppliers((current) =>
        current.filter((id) => id !== supplier.id)
      );

      setOpenMenuId(null);

      await loadSuppliers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el proveedor."
      );
    }
  }

  function handleSelectSupplier(
    supplierId: number
  ) {
    setSelectedSuppliers((current) => {
      if (current.includes(supplierId)) {
        return current.filter(
          (id) => id !== supplierId
        );
      }

      return [...current, supplierId];
    });
  }

  function handleSelectAll() {
    const currentPageIds = paginatedSuppliers.map(
      (supplier) => supplier.id
    );

    const allSelected = currentPageIds.every(
      (id) => selectedSuppliers.includes(id)
    );

    if (allSelected) {
      setSelectedSuppliers((current) =>
        current.filter(
          (id) => !currentPageIds.includes(id)
        )
      );
    } else {
      setSelectedSuppliers((current) => [
        ...current,
        ...currentPageIds.filter(
          (id) => !current.includes(id)
        ),
      ]);
    }
  }

  const filteredSuppliers = useMemo(() => {
    const companyFilter =
      filters.company_name
        .trim()
        .toLowerCase();

    const nitFilter =
      filters.nit.trim().toLowerCase();

    const contactFilter =
      filters.contact.trim().toLowerCase();

    const addressFilter =
      filters.address.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const companyMatches =
        !companyFilter ||
        supplier.company_name
          .toLowerCase()
          .includes(companyFilter);

      const nitMatches =
        !nitFilter ||
        supplier.nit
          .toLowerCase()
          .includes(nitFilter);

      const contact =
        `${supplier.phone || ""} ${
          supplier.email || ""
        }`.toLowerCase();

      const contactMatches =
        !contactFilter ||
        contact.includes(contactFilter);

      const addressMatches =
        !addressFilter ||
        supplier.address
          .toLowerCase()
          .includes(addressFilter);

      return (
        companyMatches &&
        nitMatches &&
        contactMatches &&
        addressMatches
      );
    });
  }, [suppliers, filters]);

  const sortedSuppliers = useMemo(() => {
      return [...filteredSuppliers].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case "company_name":
            comparison = a.company_name.localeCompare(
              b.company_name,
              "es",
              { sensitivity: "base", numeric: true }
            );
            break;

          case "nit":
            comparison = a.nit.localeCompare(
              b.nit,
              "es",
              { sensitivity: "base", numeric: true }
            );
            break;

          case "contact": {
            const contactA =
              `${a.phone || ""} ${a.email || ""}`.trim();

            const contactB =
              `${b.phone || ""} ${b.email || ""}`.trim();

            comparison = contactA.localeCompare(
              contactB,
              "es",
              { sensitivity: "base", numeric: true }
            );
            break;
          }

          case "address":
            comparison = a.address.localeCompare(
              b.address,
              "es",
              { sensitivity: "base", numeric: true }
            );
            break;

          case "active":
            comparison = Number(a.active) - Number(b.active);
            break;
        }

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      });
    }, [filteredSuppliers, sortField, sortDirection]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedSuppliers.length / ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedSuppliers =
    sortedSuppliers.slice(
      (safeCurrentPage - 1) * ITEMS_PER_PAGE,
      safeCurrentPage * ITEMS_PER_PAGE
    );

  const pageStart =
    filteredSuppliers.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const pageEnd = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredSuppliers.length
  );

  const currentPageIds = paginatedSuppliers.map(
    (supplier) => supplier.id
  );

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedSuppliers.includes(id)
    );

  const someCurrentPageSelected =
    currentPageIds.some((id) =>
      selectedSuppliers.includes(id)
    );

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
    setOpenMenuId(null);
  }

  function handleViewContract(
    supplier: Supplier
  ) {
    setOpenMenuId(null);

    window.alert(
      `El contrato PDF de "${supplier.company_name}" estará disponible aquí cuando conectemos el almacenamiento de contratos.`
    );
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
      startPage + maxVisiblePages - 1
    );

    if (
      endPage - startPage + 1 <
      maxVisiblePages
    ) {
      startPage = Math.max(
        1,
        endPage - maxVisiblePages + 1
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

  return (
    <DashboardShell>
      <div className={commonStyles.page}>
        <div className={commonStyles.pageHeader}>
          <div>
            <h1>Proveedores</h1>

            <p>
              Gestión de proveedores de DRL Electronik.
            </p>
          </div>

          {!showForm && canManageSuppliers && (
            <button
              type="button"
              className={commonStyles.primaryButton}
              onClick={handleNewSupplier}
            >
              + Nuevo proveedor
            </button>
          )}
        </div>

        {showForm && canManageSuppliers && (
          <section className={commonStyles.formCard}>
            <div className={commonStyles.formHeader}>
              <div>
                <h2>
                  {editingSupplierId !== null
                    ? "Editar proveedor"
                    : "Nuevo proveedor"}
                </h2>

                <p>
                  Completa los datos del proveedor.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={commonStyles.form}
            >
              <div className={commonStyles.formGrid}>
                <div className={commonStyles.field}>
                  <label>
                    Nombre de la empresa
                  </label>

                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(event) =>
                      handleChange(
                        "company_name",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className={commonStyles.field}>
                  <label>NIT</label>

                  <input
                    type="text"
                    value={form.nit}
                    onChange={(event) =>
                      handleChange(
                        "nit",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className={commonStyles.fieldFull}>
                  <label>Dirección</label>

                  <input
                    type="text"
                    value={form.address}
                    onChange={(event) =>
                      handleChange(
                        "address",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className={commonStyles.field}>
                  <label>Teléfono</label>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className={commonStyles.field}>
                  <label>Email</label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className={commonStyles.formActions}>
                <button
                  type="submit"
                  className={commonStyles.primaryButton}
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingSupplierId !== null
                      ? "Actualizar proveedor"
                      : "Guardar proveedor"}
                </button>

                <button
                  type="button"
                  className={commonStyles.secondaryButton}
                  onClick={handleCancelForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {loading && (
          <div className={commonStyles.message}>
            Cargando proveedores...
          </div>
        )}

        {error && (
          <div className={commonStyles.error}>
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          suppliers.length === 0 && (
            <div className={commonStyles.emptyState}>
              <h2>
                No hay proveedores registrados
              </h2>

              <p>
                Comienza agregando el primer proveedor
                de DRL Electronik.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          suppliers.length > 0 && (
            <section className={tableStyles.tableCard}>
              <div className={tableStyles.tableHeader}>
                <div>
                  <h2>
                    Listado de proveedores
                  </h2>

                  <span>
                    {filteredSuppliers.length}{" "}
                    {filteredSuppliers.length === 1
                      ? "proveedor"
                      : "proveedores"}
                  </span>
                </div>
              </div>

              <div className={tableStyles.tableWrapper}>
                <table className={tableStyles.table}>
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
                          aria-label="Seleccionar todos"
                        />
                      </th>

                      <th>
                        {renderSortLabel("Empresa", "company_name")}

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.company_name
                          }
                          onChange={(event) =>
                            handleFilterChange(
                              "company_name",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        {renderSortLabel("NIT", "nit")}

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={filters.nit}
                          onChange={(event) =>
                            handleFilterChange(
                              "nit",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        {renderSortLabel("Contacto", "contact")}

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={filters.contact}
                          onChange={(event) =>
                            handleFilterChange(
                              "contact",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        {renderSortLabel("Dirección", "address")}

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={filters.address}
                          onChange={(event) =>
                            handleFilterChange(
                              "address",
                              event.target.value
                            )
                          }
                        />
                      </th>

                      <th>
                        {renderSortLabel("Estado", "active")}
                      </th>

                      {canManageSuppliers && (
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
                    {paginatedSuppliers.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={canManageSuppliers ? 7 : 6}
                          className={
                            tableStyles.noResults
                          }
                        >
                          No se encontraron
                          proveedores con esos
                          filtros.
                        </td>
                      </tr>
                    )}

                    {paginatedSuppliers.map(
                      (supplier) => (
                        <tr key={supplier.id}>
                          <td
                            className={
                              tableStyles.checkboxColumn
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedSuppliers.includes(
                                supplier.id
                              )}
                              onChange={() =>
                                handleSelectSupplier(
                                  supplier.id
                                )
                              }
                              aria-label={`Seleccionar ${supplier.company_name}`}
                            />
                          </td>

                          <td>
                            <div
                              className={
                                styles.companyCell
                              }
                            >
                              <strong>
                                {
                                  supplier.company_name
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            {supplier.nit}
                          </td>

                          <td>
                            <div
                              className={
                                styles.contactCell
                              }
                            >
                              <span>
                                {supplier.phone ||
                                  "—"}
                              </span>

                              <span>
                                {supplier.email ||
                                  "—"}
                              </span>
                            </div>
                          </td>

                          <td>
                            {supplier.address}
                          </td>

                          <td>
                            {canManageSuppliers ? (
                              <button
                                type="button"
                                className={
                                  tableStyles.toggle
                                }
                                data-active={
                                  supplier.active
                                }
                                onClick={() =>
                                  handleToggleSupplier(
                                    supplier
                                  )
                                }
                                aria-label={
                                  supplier.active
                                    ? `Desactivar ${supplier.company_name}`
                                    : `Activar ${supplier.company_name}`
                                }
                                aria-pressed={
                                  supplier.active
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
                                  {supplier.active
                                    ? "Activo"
                                    : "Inactivo"}
                                </span>
                              </button>
                            ) : (
                              <span>
                                {supplier.active
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>
                            )}
                          </td>
                          {canManageSuppliers && (
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
                                      supplier.id
                                      ? null
                                      : supplier.id
                                  )
                                }
                                aria-label={`Acciones de ${supplier.company_name}`}
                                aria-expanded={
                                  openMenuId ===
                                  supplier.id
                                }
                              >
                                <span />
                                <span />
                                <span />
                              </button>

                              {openMenuId ===
                                supplier.id && (
                                <div
                                  className={
                                    tableStyles.actionMenu
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditSupplier(
                                        supplier
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

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteSupplier(
                                        supplier
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

                                  <div
                                    className={
                                      styles.menuSeparator
                                    }
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewContract(
                                        supplier
                                      )
                                    }
                                  >
                                    <span
                                      className={
                                        tableStyles.menuIcon
                                      }
                                    >
                                      ▣
                                    </span>

                                    <span>
                                      Ver contrato PDF
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className={tableStyles.pagination}
              >
                <div
                  className={
                    tableStyles.paginationInfo
                  }
                >
                  Mostrando {pageStart}–{pageEnd} de{" "}
                  {filteredSuppliers.length}
                </div>

                <div
                  className={
                    tableStyles.paginationControls
                  }
                >
                  <button
                    type="button"
                    className={
                      commonStyles.pageArrow
                    }
                    onClick={() =>
                      handlePageChange(
                        safeCurrentPage - 1
                      )
                    }
                    disabled={
                      safeCurrentPage === 1
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
                        className={`${commonStyles.pageNumber} ${
                          page ===
                          safeCurrentPage
                            ? commonStyles.pageNumberActive
                            : ""
                        }`}
                        onClick={() =>
                          handlePageChange(page)
                        }
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className={
                      commonStyles.pageArrow
                    }
                    onClick={() =>
                      handlePageChange(
                        safeCurrentPage + 1
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
