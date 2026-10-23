"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  uploadBrandLogo,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";
import { useAdminAccess } from "@/app/admin/layout";
import commonStyles from "../styles/AdminCommon.module.css";
import tableStyles from "../styles/AdminTable.module.css";
import styles from "./Brands.module.css";

type Brand = {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type BrandForm = {
  name: string;
  description: string;
  logo_url: string;
  logo_file: File | null;
};

type Filters = {
  name: string;
  description: string;
};
type BrandSortKey = "name" | "description" | "active";
type SortDirection = "asc" | "desc";
const emptyForm: BrandForm = {
  name: "",
  description: "",
  logo_url: "",
  logo_file: null,
};

const emptyFilters: Filters = {
  name: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

export default function BrandsPage() {
  const [sortKey, setSortKey] =
    useState<BrandSortKey>("name");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");
  const { hasPermission } = useAdminAccess();

  const canManageBrands =
    hasPermission("brands.manage");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingBrandId, setEditingBrandId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<BrandForm>(emptyForm);

  const [filters, setFilters] =
    useState<Filters>(emptyFilters);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBrands, setSelectedBrands] =
    useState<number[]>([]);

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

async function loadBrands() {
  try {
    setError("");

    const accessToken = getAdminAccessToken();

    const result = await getBrands(accessToken);

    setBrands(
      Array.isArray(result?.data)
        ? result.data
        : []
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las marcas."
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadBrands();
  }, []);

  function handleChange(
    field: keyof BrandForm,
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
function handleSort(key: BrandSortKey) {
  if (sortKey === key) {
    setSortDirection((current) =>
      current === "asc" ? "desc" : "asc"
    );
  } else {
    setSortKey(key);
    setSortDirection("asc");
  }
}

function getSortIndicator(key: BrandSortKey) {
  if (sortKey !== key) {
    return "↕";
  }

  return sortDirection === "asc" ? "↑" : "↓";
}
 function getAccessToken() {
  return getAdminAccessToken();
}

  function handleNewBrand() {
    setEditingBrandId(null);
    setForm(emptyForm);
    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleEditBrand(brand: Brand) {
    setEditingBrandId(brand.id);

    setForm({
      name: brand.name,
      description: brand.description || "",
      logo_url: brand.logo_url || "",
      logo_file: null,
    });

    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingBrandId(null);
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

      const brandData = {
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        logo_url:
          form.logo_url.trim() || null,
      };

      if (!brandData.name) {
        throw new Error(
          "El nombre de la marca es obligatorio."
        );
      }

      let savedBrand;

      if (editingBrandId !== null) {
        savedBrand = await updateBrand(
          accessToken,
          editingBrandId,
          brandData
        );
      } else {
        savedBrand = await createBrand(
          accessToken,
          {
            ...brandData,
            active: true,
          }
        );
      }

      const brandId = savedBrand?.data?.id;

      if (form.logo_file && brandId) {
        await uploadBrandLogo(
          accessToken,
          brandId,
          form.logo_file
        );
      }

      setForm(emptyForm);
      setEditingBrandId(null);
      setShowForm(false);

      await loadBrands();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la marca."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleBrand(
    brand: Brand
  ) {
    try {
      setError("");

      const accessToken = getAccessToken();

      await updateBrand(
        accessToken,
        brand.id,
        {
          active: !brand.active,
        }
      );

      setOpenMenuId(null);

      await loadBrands();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado de la marca."
      );
    }
  }

  async function handleDeleteBrand(
    brand: Brand
  ) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la marca "${brand.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const accessToken = getAccessToken();

      await deleteBrand(
        accessToken,
        brand.id
      );

      setSelectedBrands((current) =>
        current.filter(
          (id) => id !== brand.id
        )
      );

      setOpenMenuId(null);

      await loadBrands();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la marca."
      );
    }
  }

  function handleSelectBrand(
    brandId: number
  ) {
    setSelectedBrands((current) => {
      if (current.includes(brandId)) {
        return current.filter(
          (id) => id !== brandId
        );
      }

      return [...current, brandId];
    });
  }

  function handleSelectAll() {
    const currentPageIds =
      paginatedBrands.map(
        (brand) => brand.id
      );

    const allSelected =
      currentPageIds.length > 0 &&
      currentPageIds.every((id) =>
        selectedBrands.includes(id)
      );

    if (allSelected) {
      setSelectedBrands((current) =>
        current.filter(
          (id) =>
            !currentPageIds.includes(id)
        )
      );
    } else {
      setSelectedBrands((current) => [
        ...current,
        ...currentPageIds.filter(
          (id) => !current.includes(id)
        ),
      ]);
    }
  }

  const filteredBrands = useMemo(() => {
    const nameFilter =
      filters.name.trim().toLowerCase();

    const descriptionFilter =
      filters.description
        .trim()
        .toLowerCase();

    return brands.filter((brand) => {
      const nameMatches =
        !nameFilter ||
        brand.name
          .toLowerCase()
          .includes(nameFilter);

      const descriptionMatches =
        !descriptionFilter ||
        (brand.description || "")
          .toLowerCase()
          .includes(descriptionFilter);

      return (
        nameMatches &&
        descriptionMatches
      );
    });
  }, [brands, filters]);

  const sortedBrands = useMemo(() => {
    return [...filteredBrands].sort((a, b) => {
      let comparison = 0;

      if (sortKey === "active") {
        comparison = Number(a.active) - Number(b.active);
      } else {
        const valueA = a[sortKey] ?? "";
        const valueB = b[sortKey] ?? "";

        comparison = String(valueA).localeCompare(
          String(valueB),
          "es",
          {
            numeric: true,
            sensitivity: "base",
          }
        );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [filteredBrands, sortKey, sortDirection]);
  
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBrands.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedBrands = sortedBrands.slice(
      (safeCurrentPage - 1) * ITEMS_PER_PAGE,
      safeCurrentPage * ITEMS_PER_PAGE
    );

  const pageStart =
    filteredBrands.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const pageEnd = Math.min(
    safeCurrentPage *
      ITEMS_PER_PAGE,
    filteredBrands.length
  );

  const currentPageIds =
    paginatedBrands.map(
      (brand) => brand.id
    );

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedBrands.includes(id)
    );

  const someCurrentPageSelected =
    currentPageIds.some((id) =>
      selectedBrands.includes(id)
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

  return (
    <DashboardShell>
      <div className={commonStyles.page}>
        <div className={commonStyles.pageHeader}>
          <div>
            <h1>Marcas</h1>

            <p>
              Gestión de marcas de
              DRL Electronik.
            </p>
          </div>

          {!showForm && canManageBrands && (
            <button
              type="button"
              className={
                commonStyles.primaryButton
              }
              onClick={handleNewBrand}
            >
              + Nueva marca
            </button>
          )}
        </div>

        {showForm && canManageBrands && (
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
                  {editingBrandId !==
                  null
                    ? "Editar marca"
                    : "Nueva marca"}
                </h2>

                <p>
                  Completa los datos
                  de la marca.
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
                    Nombre de la marca
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
                    maxLength={200}
                    required
                  />
                </div>

                <div
                  className={
                    commonStyles.field
                  }
                >
                  <label>
                    Logo de la marca
                  </label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0] ??
                        null;

                      setForm((current) => ({
                        ...current,
                        logo_file: file,
                      }));
                    }}
                  />

                  {!form.logo_file &&
                    form.logo_url && (
                      <div
                        className={
                          styles.logoPreviewContainer
                        }
                      >
                        <p
                          className={
                            styles.logoPreviewLabel
                          }
                        >
                          Logo actual
                        </p>

                        <img
                          src={form.logo_url}
                          alt="Logo actual"
                          className={
                            styles.formLogoPreview
                          }
                        />
                      </div>
                    )}

                  {form.logo_file && (
                    <div
                      className={
                        styles.logoPreviewContainer
                      }
                    >
                      <img
                        src={URL.createObjectURL(
                          form.logo_file
                        )}
                        alt="Vista previa del logo"
                        className={
                          styles.formLogoPreview
                        }
                      />
                    </div>
                  )}
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
                    maxLength={1000}
                    rows={4}
                  />
                </div>
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
                    : editingBrandId !==
                        null
                      ? "Actualizar marca"
                      : "Guardar marca"}
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
            Cargando marcas...
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
          brands.length === 0 && (
            <div
              className={
                commonStyles.emptyState
              }
            >
              <h2>
                No hay marcas
                registradas
              </h2>

              <p>
                Comienza agregando
                la primera marca de
                DRL Electronik.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          brands.length > 0 && (
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
                    Listado de Marcas
                  </h2>

                  <span>
                    {
                      filteredBrands.length
                    }{" "}
                    {filteredBrands.length ===
                    1
                      ? "marca"
                      : "marcas"}
                  </span>
                </div>
              </div>

              <div
                className={
                  tableStyles.tableWrapper
                }
              >
                <table className={`${tableStyles.table} ${styles.brandTable}`}>
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
                          aria-label="Seleccionar todas las marcas"
                        />
                      </th>

                      <th>
                        <div
                          className={
                            tableStyles.columnTitle
                          }
                        >
                          Logo
                        </div>
                      </th>

                      <th aria-sort={
                        sortKey === "name"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }>
                        <button
                          type="button"
                          onClick={() => handleSort("name")}
                          style={{
                            border: 0,
                            background: "transparent",
                            cursor: "pointer",
                            font: "inherit",
                            fontWeight: 600,
                            padding: 0,
                          }}
                        >
                          Marca {getSortIndicator("name")}
                        </button>

                        <input
                          type="text"
                          className={tableStyles.filterInput}
                          placeholder="Filtrar"
                          value={filters.name}
                          onChange={(event) =>
                            handleFilterChange("name", event.target.value)
                          }
                        />
                      </th>

                      <th aria-sort={
                          sortKey === "description"
                            ? sortDirection === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }>
                          <button
                            type="button"
                            onClick={() => handleSort("description")}
                            style={{
                              border: 0,
                              background: "transparent",
                              cursor: "pointer",
                              font: "inherit",
                              fontWeight: 600,
                              padding: 0,
                            }}
                          >
                            Descripción {getSortIndicator("description")}
                          </button>

                          <input
                            type="text"
                            className={tableStyles.filterInput}
                            placeholder="Filtrar"
                            value={filters.description}
                            onChange={(event) =>
                              handleFilterChange("description", event.target.value)
                            }
                          />
                        </th>

                        <th aria-sort={
                        sortKey === "active"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }>
                        <button
                          type="button"
                          onClick={() => handleSort("active")}
                          style={{
                            border: 0,
                            background: "transparent",
                            cursor: "pointer",
                            font: "inherit",
                            fontWeight: 600,
                            padding: 0,
                          }}
                        >
                          Estado {getSortIndicator("active")}
                        </button>
                      </th>

                      {canManageBrands && (
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
                    {paginatedBrands.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={canManageBrands ? 6 : 5}
                          className={
                            tableStyles.noResults
                          }
                        >
                          No se encontraron
                          marcas con esos
                          filtros.
                        </td>
                      </tr>
                    )}

                    {paginatedBrands.map(
                      (brand) => (
                        <tr
                          key={
                            brand.id
                          }
                        >
                          <td
                            className={
                              tableStyles.checkboxColumn
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(
                                brand.id
                              )}
                              onChange={() =>
                                handleSelectBrand(
                                  brand.id
                                )
                              }
                              aria-label={`Seleccionar ${brand.name}`}
                            />
                          </td>

                          <td>
                            {brand.logo_url ? (
                              <img
                                src={brand.logo_url}
                                alt={`Logo de ${brand.name}`}
                                className={
                                  styles.tableLogo
                                }
                              />
                            ) : (
                              <span
                                className={
                                  styles.noLogo
                                }
                              >
                                —
                              </span>
                            )}
                          </td>

                          <td>
                            <div
                              className={
                                styles.companyCell
                              }
                            >
                              <strong>
                                {brand.name}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                styles.descriptionCell
                              }
                            >
                              {brand.description ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            {canManageBrands ? (
                              <button
                                type="button"
                                className={
                                  tableStyles.toggle
                                }
                                data-active={
                                  brand.active
                                }
                                onClick={() =>
                                  handleToggleBrand(
                                    brand
                                  )
                                }
                                aria-label={
                                  brand.active
                                    ? `Desactivar ${brand.name}`
                                    : `Activar ${brand.name}`
                                }
                                aria-pressed={
                                  brand.active
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
                                  {brand.active
                                    ? "Activo"
                                    : "Inactivo"}
                                </span>
                              </button>
                            ) : (
                              <span>
                                {brand.active
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>
                            )}
                          </td>

                          {canManageBrands && (
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
                                      brand.id
                                      ? null
                                      : brand.id
                                  )
                                }
                                aria-label={`Acciones de ${brand.name}`}
                                aria-expanded={
                                  openMenuId ===
                                  brand.id
                                }
                              >
                                <span />
                                <span />
                                <span />
                              </button>

                              {openMenuId ===
                                brand.id && (
                                <div
                                  className={
                                    tableStyles.actionMenu
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditBrand(
                                        brand
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
                                      handleDeleteBrand(
                                        brand
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
                    filteredBrands.length
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