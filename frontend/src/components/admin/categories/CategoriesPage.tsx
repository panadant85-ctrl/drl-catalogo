"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";
import { useAdminAccess } from "@/app/admin/layout";
import styles from "./Categories.module.css";
import commonStyles from "../styles/AdminCommon.module.css";
import tableStyles from "../styles/AdminTable.module.css";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  active: boolean;
  position: number;
  product_count: number;
  created_at: string;
  updated_at: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  position: string;
};

type Filters = {
  name: string;
  slug: string;
  description: string;
};

type CategorySortKey =
  | "name"
  | "slug"
  | "description"
  | "product_count"
  | "position"
  | "active";

type SortDirection = "asc" | "desc";

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  parent_id: "",
  position: "0",
};

const emptyFilters: Filters = {
  name: "",
  slug: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
   const { hasPermission } = useAdminAccess();

    const canManageCategories =
      hasPermission("categories.manage");
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(emptyForm);

  const [filters, setFilters] =
    useState<Filters>(emptyFilters);

  const [sortKey, setSortKey] =
    useState<CategorySortKey>("position");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategories, setSelectedCategories] =
    useState<number[]>([]);

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

 async function loadCategories() {
  try {
    setError("");

    const accessToken = getAdminAccessToken();

    const result = await getCategories(accessToken);

    setCategories(
      Array.isArray(result?.data)
        ? result.data
        : []
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las categorías."
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadCategories();
  }, []);

  function handleChange(
    field: keyof CategoryForm,
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

  function handleNewCategory() {
    setEditingCategoryId(null);
    setForm(emptyForm);
    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleEditCategory(
    category: Category
  ) {
    setEditingCategoryId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description:
        category.description || "",
      parent_id:
        category.parent_id !== null
          ? String(category.parent_id)
          : "",
      position: String(category.position),
    });

    setError("");
    setOpenMenuId(null);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingCategoryId(null);
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

      const accessToken =
        getAccessToken();

      const name = form.name.trim();
      const slug = form.slug.trim();
      const description =
        form.description.trim();

      if (!name) {
        throw new Error(
          "El nombre de la categoría es obligatorio."
        );
      }

      if (!slug) {
        throw new Error(
          "El slug de la categoría es obligatorio."
        );
      }

      const position =
        Number(form.position);

      if (
        !Number.isInteger(position) ||
        position < 0
      ) {
        throw new Error(
          "La posición debe ser un número entero mayor o igual a 0."
        );
      }

      const parentId =
        form.parent_id
          ? Number(form.parent_id)
          : null;

      if (
        parentId !== null &&
        (!Number.isInteger(parentId) ||
          parentId <= 0)
      ) {
        throw new Error(
          "La categoría padre seleccionada no es válida."
        );
      }

      if (
        editingCategoryId !== null &&
        parentId === editingCategoryId
      ) {
        throw new Error(
          "Una categoría no puede ser su propia categoría padre."
        );
      }

      const categoryData = {
        name,
        slug,
        description:
          description || null,
        parent_id: parentId,
        position,
      };

      if (
        editingCategoryId !== null
      ) {
        await updateCategory(
          accessToken,
          editingCategoryId,
          categoryData
        );
      } else {
        await createCategory(
          accessToken,
          {
            ...categoryData,
            active: true,
          }
        );
      }

      setForm(emptyForm);
      setEditingCategoryId(null);
      setShowForm(false);

      await loadCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la categoría."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCategory(
    category: Category
  ) {
    try {
      setError("");

      const accessToken =
        getAccessToken();

      await updateCategory(
        accessToken,
        category.id,
        {
          active: !category.active,
        }
      );

      setOpenMenuId(null);

      await loadCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado de la categoría."
      );
    }
  }

  async function handleDeleteCategory(
    category: Category
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar la categoría "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const accessToken =
        getAccessToken();

      await deleteCategory(
        accessToken,
        category.id
      );

      setSelectedCategories(
        (current) =>
          current.filter(
            (id) => id !== category.id
          )
      );

      setOpenMenuId(null);

      await loadCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la categoría."
      );
    }
  }

  function handleSelectCategory(
    categoryId: number
  ) {
    setSelectedCategories(
      (current) => {
        if (
          current.includes(categoryId)
        ) {
          return current.filter(
            (id) => id !== categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  }

  function handleSelectAll() {
    const currentPageIds =
      paginatedCategories.map(
        (category) =>
          category.id
      );

    const allSelected =
      currentPageIds.length > 0 &&
      currentPageIds.every(
        (id) =>
          selectedCategories.includes(id)
      );

    if (allSelected) {
      setSelectedCategories(
        (current) =>
          current.filter(
            (id) =>
              !currentPageIds.includes(id)
          )
      );
    } else {
      setSelectedCategories(
        (current) => [
          ...current,
          ...currentPageIds.filter(
            (id) =>
              !current.includes(id)
          ),
        ]
      );
    }
  }

  const filteredCategories =
    useMemo(() => {
      const nameFilter =
        filters.name
          .trim()
          .toLowerCase();

      const slugFilter =
        filters.slug
          .trim()
          .toLowerCase();

      const descriptionFilter =
        filters.description
          .trim()
          .toLowerCase();

      return categories.filter(
        (category) => {
          const nameMatches =
            !nameFilter ||
            category.name
              .toLowerCase()
              .includes(nameFilter);

          const slugMatches =
            !slugFilter ||
            category.slug
              .toLowerCase()
              .includes(slugFilter);

          const descriptionMatches =
            !descriptionFilter ||
            (
              category.description ||
              ""
            )
              .toLowerCase()
              .includes(
                descriptionFilter
              );

          return (
            nameMatches &&
            slugMatches &&
            descriptionMatches
          );
        }
      );
    }, [categories, filters]);

  function handleSort(key: CategorySortKey) {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
      setCurrentPage(1);
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
    setCurrentPage(1);
  }

  function getSortIndicator(key: CategorySortKey) {
    if (sortKey !== key) {
      return "↕";
    }

    return sortDirection === "asc" ? "↑" : "↓";
  }

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      const aIsEmpty =
        aValue === null ||
        aValue === undefined ||
        aValue === "";

      const bIsEmpty =
        bValue === null ||
        bValue === undefined ||
        bValue === "";

      if (aIsEmpty && bIsEmpty) return 0;
      if (aIsEmpty) return 1;
      if (bIsEmpty) return -1;

      let comparison = 0;

      if (
        typeof aValue === "number" &&
        typeof bValue === "number"
      ) {
        comparison = aValue - bValue;
      } else if (
        typeof aValue === "boolean" &&
        typeof bValue === "boolean"
      ) {
        comparison = Number(aValue) - Number(bValue);
      } else {
        comparison = String(aValue).localeCompare(
          String(bValue),
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
  }, [filteredCategories, sortKey, sortDirection]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredCategories.length /
          ITEMS_PER_PAGE
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedCategories =
    sortedCategories.slice(
      (safeCurrentPage - 1) *
        ITEMS_PER_PAGE,
      safeCurrentPage *
        ITEMS_PER_PAGE
    );

  const pageStart =
    filteredCategories.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const pageEnd = Math.min(
    safeCurrentPage *
      ITEMS_PER_PAGE,
    filteredCategories.length
  );

  const currentPageIds =
    paginatedCategories.map(
      (category) =>
        category.id
    );

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every(
      (id) =>
        selectedCategories.includes(id)
    );

  const someCurrentPageSelected =
    currentPageIds.some(
      (id) =>
        selectedCategories.includes(id)
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

    let startPage =
      Math.max(
        1,
        safeCurrentPage - 2
      );

    let endPage =
      Math.min(
        totalPages,
        startPage +
          maxVisiblePages -
          1
      );

    if (
      endPage - startPage + 1 <
      maxVisiblePages
    ) {
      startPage =
        Math.max(
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
            <h1>
              Categorías
            </h1>

            <p>
              Gestión de categorías de
              DRL Electronik.
            </p>
          </div>

          {!showForm && canManageCategories && (
            <button
              type="button"
              className={commonStyles.primaryButton}
              onClick={
                handleNewCategory
              }
            >
              + Nueva categoría
            </button>
          )}
        </div>

        {showForm && canManageCategories && (
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
                  {editingCategoryId !==
                  null
                    ? "Editar categoría"
                    : "Nueva categoría"}
                </h2>

                <p>
                  Completa los datos de
                  la categoría.
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
                    Nombre de la categoría
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "name",
                        event.target
                          .value
                      )
                    }
                    maxLength={200}
                    required
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Slug
                  </label>

                  <input
                    type="text"
                    value={form.slug}
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "slug",
                        event.target
                          .value
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )
                      )
                    }
                    maxLength={200}
                    required
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Categoría padre
                  </label>

                  <select
                    value={
                      form.parent_id
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "parent_id",
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Sin categoría
                      padre
                    </option>

                    {categories
                      .filter(
                        (category) =>
                          category.id !==
                          editingCategoryId
                      )
                      .map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                  </select>
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Posición
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.position
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "position",
                        event.target
                          .value
                      )
                    }
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
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "description",
                        event.target
                          .value
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
                  className={commonStyles.primaryButton}
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingCategoryId !==
                        null
                      ? "Actualizar categoría"
                      : "Guardar categoría"}
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
            Cargando categorías...
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
          categories.length === 0 && (
            <div
              className={
                commonStyles.emptyState
              }
            >
              <h2>
                No hay categorías
                registradas
              </h2>

              <p>
                Comienza agregando la
                primera categoría de
                DRL Electronik.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          categories.length > 0 && (
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
                    Listado de categorías
                  </h2>

                  <span>
                    {
                      filteredCategories.length
                    }{" "}
                    {filteredCategories.length ===
                    1
                      ? "categoría"
                      : "categorías"}
                  </span>
                </div>
              </div>

              <div
                className={
                  tableStyles.tableWrapper
                }
              >
                <table
                  className={
                    tableStyles.table
                  }
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
                          ref={(
                            element
                          ) => {
                            if (
                              element
                            ) {
                              element.indeterminate =
                                !allCurrentPageSelected &&
                                someCurrentPageSelected;
                            }
                          }}
                          onChange={
                            handleSelectAll
                          }
                          aria-label="Seleccionar todas las categorías"
                        />
                      </th>

                      <th>
                        <button
                          type="button"
                          className={tableStyles.columnTitle}
                          onClick={() => handleSort("name")}
                          aria-label={`Ordenar por Categoría`}
                          aria-sort={sortKey === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          style={{
                            all: "unset",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Categoría
                          <span aria-hidden="true">
                            {getSortIndicator("name")}
                          </span>
                        </button>

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.name
                          }
                          onChange={(
                            event
                          ) =>
                            handleFilterChange(
                              "name",
                              event.target
                                .value
                            )
                          }
                        />
                      </th>

                      <th>
                        <button
                          type="button"
                          className={tableStyles.columnTitle}
                          onClick={() => handleSort("slug")}
                          aria-label={`Ordenar por Slug`}
                          aria-sort={sortKey === "slug" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          style={{
                            all: "unset",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Slug
                          <span aria-hidden="true">
                            {getSortIndicator("slug")}
                          </span>
                        </button>

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.slug
                          }
                          onChange={(
                            event
                          ) =>
                            handleFilterChange(
                              "slug",
                              event.target
                                .value
                            )
                          }
                        />
                      </th>

                      <th>
                        <button
                          type="button"
                          className={tableStyles.columnTitle}
                          onClick={() => handleSort("description")}
                          aria-label={`Ordenar por Descripción`}
                          aria-sort={sortKey === "description" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          style={{
                            all: "unset",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Descripción
                          <span aria-hidden="true">
                            {getSortIndicator("description")}
                          </span>
                        </button>

                        <input
                          type="text"
                          className={
                            tableStyles.filterInput
                          }
                          placeholder="Filtrar"
                          value={
                            filters.description
                          }
                          onChange={(
                            event
                          ) =>
                            handleFilterChange(
                              "description",
                              event.target
                                .value
                            )
                          }
                        />
                      </th>

                      <th>
                        <button
                          type="button"
                          className={tableStyles.columnTitle}
                          onClick={() => handleSort("product_count")}
                          aria-label={`Ordenar por Productos`}
                          aria-sort={sortKey === "product_count" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          style={{
                            all: "unset",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Productos
                          <span aria-hidden="true">
                            {getSortIndicator("product_count")}
                          </span>
                        </button>
                      </th>

                      <th>
                        <button
                          type="button"
                          className={tableStyles.columnTitle}
                          onClick={() => handleSort("position")}
                          aria-label={`Ordenar por Posición`}
                          aria-sort={sortKey === "position" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          style={{
                            all: "unset",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Posición
                          <span aria-hidden="true">
                            {getSortIndicator("position")}
                          </span>
                        </button>
                      </th>

                      <th>
                        <button
                          type="button"
                          className={tableStyles.columnTitle}
                          onClick={() => handleSort("active")}
                          aria-label={`Ordenar por Estado`}
                          aria-sort={sortKey === "active" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          style={{
                            all: "unset",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Estado
                          <span aria-hidden="true">
                            {getSortIndicator("active")}
                          </span>
                        </button>
                      </th>

                      {canManageCategories && (
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
                    {paginatedCategories.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={canManageCategories ? 8 : 7}
                          className={
                            tableStyles.noResults
                          }
                        >
                          No se encontraron
                          categorías con esos
                          filtros.
                        </td>
                      </tr>
                    )}

                    {paginatedCategories.map(
                      (category) => (
                        <tr
                          key={
                            category.id
                          }
                        >
                          <td
                            className={
                              tableStyles.checkboxColumn
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(
                                category.id
                              )}
                              onChange={() =>
                                handleSelectCategory(
                                  category.id
                                )
                              }
                              aria-label={`Seleccionar ${category.name}`}
                            />
                          </td>

                          <td>
                            <div
                              className={
                                tableStyles.companyCell
                              }
                            >
                              <strong>
                                {
                                  category.name
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                tableStyles.categorySlug
                              }
                            >
                              {
                                category.slug
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                tableStyles.descriptionCell
                              }
                            >
                              {category.description ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                tableStyles.productCount
                              }
                            >
                              {
                                category.product_count
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                tableStyles.positionValue
                              }
                            >
                              {
                                category.position
                              }
                            </span>
                          </td>

                          <td>
                            {canManageCategories ? (
                                <button
                                  type="button"
                                  className={tableStyles.toggle}
                                  data-active={category.active}
                                  onClick={() =>
                                    handleToggleCategory(category)
                                  }
                                  aria-label={
                                    category.active
                                      ? `Desactivar ${category.name}`
                                      : `Activar ${category.name}`
                                  }
                                  aria-pressed={category.active}
                                >
                                  <span
                                    className={tableStyles.toggleTrack}
                                  >
                                    <span
                                      className={tableStyles.toggleThumb}
                                    />
                                  </span>

                                  <span
                                    className={tableStyles.toggleLabel}
                                  >
                                    {category.active
                                      ? "Activo"
                                      : "Inactivo"}
                                  </span>
                                </button>
                              ) : (
                                <span>
                                  {category.active
                                    ? "Activo"
                                    : "Inactivo"}
                                </span>
                              )}
                          </td>
                          {canManageCategories && (
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
                                      category.id
                                      ? null
                                      : category.id
                                  )
                                }
                                aria-label={`Acciones de ${category.name}`}
                                aria-expanded={
                                  openMenuId ===
                                  category.id
                                }
                              >
                                <span />
                                <span />
                                <span />
                              </button>

                              {openMenuId ===
                                category.id && (
                                <div
                                  className={
                                    tableStyles.actionMenu
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditCategory(
                                        category
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
                                      handleDeleteCategory(
                                        category
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
                    filteredCategories.length
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