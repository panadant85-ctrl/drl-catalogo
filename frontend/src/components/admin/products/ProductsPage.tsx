"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  checkAdminAccess,
  getAdminProducts,
  updateProductStatus,
  deleteProduct,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";

import {
  hasAdminPermission,
  type AdminAccess,
} from "@/lib/adminPermissions";

import ProductForm from "./ProductForm";

import styles from "./ProductsPage.module.css";

type Product = {
  id: number;
  name: string;

  brand?: string | null;
  brand_id?: number | null;

  model?: string | null;
  sku?: string | null;

  category?: string | null;

  supplier_id?: number | null;

  price: number;
  cost: number;
  vip_price?: number | null;

  stock: number;

  description?: string | null;

  barcode?: string | null;

  features?: Record<string, unknown> | null;
  technical_specs?: Record<string, unknown> | null;
  images?: string[] | null;

  family_id?: number | null;
  variant?: string | null;

  active: boolean;

  manager_commission: number;
};

type SortKey =
  | "name"
  | "sku"
  | "brand"
  | "category"
  | "cost"
  | "price"
  | "vip_price"
  | "manager_commission"
  | "stock"
  | "active";

type SortDirection = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [access, setAccess] =
    useState<AdminAccess | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadingAccess, setLoadingAccess] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [viewingProduct, setViewingProduct] =
    useState<Product | null>(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">(
      "all"
    );

  const [sortKey, setSortKey] =
    useState<SortKey>("name");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const canManageProducts =
    hasAdminPermission(
      access,
      "products.manage"
    );

  const isAdmin = access?.isAdmin === true;

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const token = getAdminAccessToken();

      if (!token) {
        setProducts([]);
        setError(
          "No se encontró la sesión administrativa."
        );
        return;
      }

      const result =
        await getAdminProducts(token);

      const data = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setProducts(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAccess() {
    try {
      setLoadingAccess(true);

      const token = getAdminAccessToken();

      if (!token) {
        setAccess(null);
        return;
      }

      const result =
        await checkAdminAccess(token);

      setAccess(result);
    } catch (err) {
      console.error(err);
      setAccess(null);
    } finally {
      setLoadingAccess(false);
    }
  }

  useEffect(() => {
    loadAccess();
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      if (
        statusFilter === "active" &&
        !product.active
      ) {
        return false;
      }

      if (
        statusFilter === "inactive" &&
        product.active
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        product.name,
        product.brand,
        product.model,
        product.sku,
        product.category,
        product.variant,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }, [products, search, statusFilter]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  function getSortIndicator(key: SortKey) {
    if (sortKey !== key) {
      return "↕";
    }

    return sortDirection === "asc" ? "↑" : "↓";
  }

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Mantener los valores vacíos al final, en ambas direcciones.
      const aIsEmpty = aValue === null || aValue === undefined || aValue === "";
      const bIsEmpty = bValue === null || bValue === undefined || bValue === "";

      if (aIsEmpty && bIsEmpty) return 0;
      if (aIsEmpty) return 1;
      if (bIsEmpty) return -1;

      let comparison = 0;

      if (typeof aValue === "number" || typeof bValue === "number") {
        comparison = Number(aValue) - Number(bValue);
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
  }, [filteredProducts, sortKey, sortDirection]);

  function formatMoney(
    value: number | null | undefined
  ) {
    return `$${Number(value ?? 0).toFixed(2)}`;
  }

  function getStockClass(stock: number) {
    if (stock <= 0) {
      return `${styles.productsStock} ${styles.productsStockDanger}`;
    }

    if (stock <= 5) {
      return `${styles.productsStock} ${styles.productsStockWarning}`;
    }

    return styles.productsStock;
  }

  function handleNewProduct() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function handleEditProduct(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleViewProduct(product: Product) {
    setViewingProduct(product);
  }

  function handleProductSaved() {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  }

  async function handleToggleProductStatus(
    product: Product
  ) {
    const token = getAdminAccessToken();

    if (!token) {
      setError(
        "No se encontró la sesión administrativa."
      );
      return;
    }

    const newStatus = !product.active;

    const actionText = newStatus
      ? "activar"
      : "desactivar";

    const confirmed = window.confirm(
      `¿Seguro que deseas ${actionText} el producto "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await updateProductStatus(
        token,
        product.id,
        newStatus
      );

      await loadProducts();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : `No se pudo ${actionText} el producto.`
      );
    }
  }

  async function handleDeleteProduct(
    product: Product
  ) {
    const token = getAdminAccessToken();

    if (!token) {
      setError(
        "No se encontró la sesión administrativa."
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar definitivamente el producto "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProduct(
        token,
        product.id
      );

      await loadProducts();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el producto."
      );
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  return (
    <DashboardShell
      title="Productos"
      subtitle="Administración del catálogo de productos"
    >
      <div className={styles.productsPage}>
        {showForm ? (
          <ProductForm
            product={editingProduct}
            onSaved={handleProductSaved}
            onCancel={handleCancelForm}
          />
        ) : (
          <>
            <div className={styles.productsToolbar}>
              <div className={styles.productsSearch}>
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar por nombre, SKU, modelo, marca..."
                />
              </div>

              <div className={styles.productsFilter}>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | "active"
                        | "inactive"
                    )
                  }
                >
                  <option value="all">
                    Todos los productos
                  </option>

                  <option value="active">
                    Activos
                  </option>

                  <option value="inactive">
                    Inactivos
                  </option>
                </select>
              </div>

              {canManageProducts && (
                <button
                  type="button"
                  className={
                    styles.productsPrimaryButton
                  }
                  onClick={handleNewProduct}
                >
                  + Nuevo producto
                </button>
              )}
            </div>

            {!loadingAccess &&
              !access && (
                <div
                  className={`${styles.productsMessage} ${styles.productsMessageWarning}`}
                >
                  No se pudo verificar el acceso
                  administrativo.
                </div>
              )}

            {error && (
              <div
                className={`${styles.productsMessage} ${styles.productsMessageError}`}
              >
                {error}
              </div>
            )}

            {loading ? (
              <div className={styles.productsMessage}>
                Cargando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={styles.productsEmpty}>
                <h3>
                  No hay productos para mostrar
                </h3>

                <p>
                  No se encontraron productos con
                  los filtros actuales.
                </p>
              </div>
            ) : (
              <div
                className={
                  styles.productsTableContainer
                }
              >
                <table className={styles.productsTable}>
                  <thead>
                    <tr>
                      {(
                        [
                          ["name", "Producto"],
                          ["sku", "SKU"],
                          ["brand", "Marca"],
                          ["category", "Categoría"],
                          ["cost", "Costo"],
                          ["price", "Precio"],
                          ["vip_price", "Precio VIP"],
                          ["manager_commission", "Comisión"],
                          ["stock", "Stock"],
                          ["active", "Estado"],
                        ] as [SortKey, string][]
                      ).map(([key, label]) => (
                        <th
                          key={key}
                          aria-sort={
                            sortKey === key
                              ? sortDirection === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            type="button"
                            className={styles.productsSortButton}
                            onClick={() => handleSort(key)}
                            aria-label={`Ordenar por ${label}`}
                          >
                            {label}
                            <span aria-hidden="true">
                              {getSortIndicator(key)}
                            </span>
                          </button>
                        </th>
                      ))}
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedProducts.map(
                      (product) => (
                        <tr key={product.id}>
                          <td>
                            <div
                              className={
                                styles.productsName
                              }
                            >
                              {product.name}
                            </div>

                            {product.model && (
                              <div
                                className={
                                  styles.productsSecondary
                                }
                              >
                                Modelo:{" "}
                                {product.model}
                              </div>
                            )}

                            {product.variant && (
                              <div
                                className={
                                  styles.productsSecondary
                                }
                              >
                                Variante:{" "}
                                {product.variant}
                              </div>
                            )}
                          </td>

                          <td>
                            {product.sku || "—"}
                          </td>

                          <td>
                            {product.brand || "—"}
                          </td>

                          <td>
                            {product.category || "—"}
                          </td>

                          <td>
                            {formatMoney(
                              product.cost
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatMoney(
                                product.price
                              )}
                            </strong>
                          </td>

                          <td>
                            {product.vip_price !==
                              null &&
                            product.vip_price !==
                              undefined
                              ? formatMoney(
                                  product.vip_price
                                )
                              : "—"}
                          </td>

                          <td>
                            {formatMoney(
                              product.manager_commission
                            )}
                          </td>

                          <td>
                            <span
                              className={getStockClass(
                                product.stock
                              )}
                            >
                              {product.stock}
                            </span>
                          </td>

                          <td>
                            {product.active ? (
                              <span
                                className={`${styles.productsStatus} ${styles.productsStatusActive}`}
                              >
                                Activo
                              </span>
                            ) : (
                              <span
                                className={`${styles.productsStatus} ${styles.productsStatusInactive}`}
                              >
                                Inactivo
                              </span>
                            )}
                          </td>

                          <td>
                            <div
                              className={
                                styles.productsActions
                              }
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewProduct(
                                    product
                                  )
                                }
                              >
                                Ver
                              </button>

                              {isAdmin && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditProduct(
                                        product
                                      )
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleProductStatus(
                                        product
                                      )
                                    }
                                  >
                                    {product.active
                                      ? "Desactivar"
                                      : "Activar"}
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      styles.productsDeleteButton
                                    }
                                    onClick={() =>
                                      handleDeleteProduct(
                                        product
                                      )
                                    }
                                  >
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div
              className={styles.productsSummary}
            >
              <span>
                Productos encontrados:{" "}
                <strong>
                  {filteredProducts.length}
                </strong>
              </span>

              {!loadingAccess && (
                <span>
                  Permiso de gestión:{" "}
                  <strong>
                    {canManageProducts
                      ? "Sí"
                      : "Solo lectura"}
                  </strong>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {viewingProduct && (
        <div
          className={
            styles.productsModalOverlay
          }
          onClick={() =>
            setViewingProduct(null)
          }
        >
          <div
            className={styles.productsModal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.productsModalHeader
              }
            >
              <div>
                <p
                  className={
                    styles.productsModalKicker
                  }
                >
                  Detalle del producto
                </p>

                <h2>
                  {viewingProduct.name}
                </h2>
              </div>

              <button
                type="button"
                className={
                  styles.productsModalClose
                }
                onClick={() =>
                  setViewingProduct(null)
                }
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div
              className={
                styles.productsModalBody
              }
            >
              <div
                className={
                  styles.productsDetailGrid
                }
              >
                <div>
                  <span>ID del producto</span>
                  <strong>{viewingProduct.id}</strong>
                </div>

                <div>
                  <span>ID del proveedor</span>
                  <strong>{viewingProduct.supplier_id ?? "—"}</strong>
                </div>
                
                <div>
                  <span>Marca</span>
                  <strong>
                    {viewingProduct.brand ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Modelo</span>
                  <strong>
                    {viewingProduct.model ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>SKU</span>
                  <strong>
                    {viewingProduct.sku ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Código de barras</span>
                  <strong>{viewingProduct.barcode || "—"}</strong>
                </div>

                <div>
                  <span>Categoría</span>
                  <strong>
                    {viewingProduct.category ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Variante</span>
                  <strong>
                    {viewingProduct.variant ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Stock</span>
                  <strong>
                    {viewingProduct.stock}
                  </strong>
                </div>
                {isAdmin && (
                <div>
                  <span>Costo</span>
                  <strong>
                    {formatMoney(
                      viewingProduct.cost
                    )}
                  </strong>
                </div>)}

                <div>
                  <span>Precio</span>
                  <strong>
                    {formatMoney(
                      viewingProduct.price
                    )}
                  </strong>
                </div>

                <div>
                  <span>Precio VIP</span>
                  <strong>
                    {viewingProduct.vip_price !==
                      null &&
                    viewingProduct.vip_price !==
                      undefined
                      ? formatMoney(
                          viewingProduct.vip_price
                        )
                      : "—"}
                  </strong>
                </div>
                
                <div>
                  <span>Comisión</span>
                  <strong>
                    {formatMoney(
                      viewingProduct.manager_commission
                    )}
                  </strong>
                </div>

                <div>
                  <span>Estado</span>
                  <strong>
                    {viewingProduct.active
                      ? "Activo"
                      : "Inactivo"}
                  </strong>
                </div>

                <div>
                  <span>Familia</span>
                  <strong>
                    {viewingProduct.family_id ??
                      "—"}
                  </strong>
                </div>
              </div>

              {viewingProduct.description && (
                <div
                  className={
                    styles.productsDetailSection
                  }
                >
                  <span>Descripción</span>

                  <p>
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {viewingProduct.features &&
                Object.keys(
                  viewingProduct.features
                ).length > 0 && (
                  <div
                    className={
                      styles.productsDetailSection
                    }
                  >
                    <span>
                      Características
                    </span>

                    <div
                      className={
                        styles.productsJsonGrid
                      }
                    >
                      {Object.entries(
                        viewingProduct.features
                      ).map(([key, value]) => (
                        <div key={key}>
                          <small>{key}</small>

                          <strong>
                            {String(value)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {viewingProduct.technical_specs &&
                Object.keys(
                  viewingProduct.technical_specs
                ).length > 0 && (
                  <div
                    className={
                      styles.productsDetailSection
                    }
                  >
                    <span>
                      Especificaciones técnicas
                    </span>

                    <div
                      className={
                        styles.productsJsonGrid
                      }
                    >
                      {Object.entries(
                        viewingProduct.technical_specs
                      ).map(([key, value]) => (
                        <div key={key}>
                          <small>{key}</small>

                          <strong>
                            {String(value)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {Array.isArray(
                viewingProduct.images
              ) &&
                viewingProduct.images.length >
                  0 && (
                  <div
                    className={
                      styles.productsDetailSection
                    }
                  >
                    <span>Imágenes</span>

                    <div
                      className={
                        styles.productsImagesGrid
                      }
                    >
                      {viewingProduct.images.map(
                        (image, index) => (
                          <img
                            key={`${image}-${index}`}
                            src={image}
                            alt={`${viewingProduct.name} ${
                              index + 1
                            }`}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div
              className={
                styles.productsModalFooter
              }
            >
              <button
                type="button"
                onClick={() =>
                  setViewingProduct(null)
                }
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}