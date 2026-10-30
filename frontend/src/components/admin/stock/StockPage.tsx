"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  getAdminProducts,
  updateProduct,
} from "@/lib/api";

type AdminProduct = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  price?: number | null;
  stock?: number | null;
  images?: string[] | null;
  active?: boolean;
};

type StockAdjustment = {
  value: string;
  saving: boolean;
  error: string | null;
};

const EMPTY_ADJUSTMENT: StockAdjustment = {
  value: "",
  saving: false,
  error: null,
};

export default function StockPage() {
  const [products, setProducts] = useState<
    AdminProduct[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  
    type SortColumn = "name" | "category" | "price" | "stock";

    const [sortColumn, setSortColumn] =
    useState<SortColumn>("name");

    const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("asc");

    function handleSort(column: SortColumn) {
    if (sortColumn === column) {
        setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
        );
    } else {
        setSortColumn(column);
        setSortDirection("asc");
    }
    }

  const [adjustments, setAdjustments] = useState<
    Record<number, StockAdjustment>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const savedSession = localStorage.getItem(
        "drl_electronik_admin_session"
      );

      try {
        const sessionData = JSON.parse(
          savedSession || "{}"
        );

        const accessToken =
          sessionData?.accessToken;

        if (!accessToken) {
          throw new Error(
            "No hay sesión administrativa activa."
          );
        }

        const result = await getAdminProducts(
          accessToken
        );

        const list = Array.isArray(result?.data)
          ? result.data
          : [];

        if (cancelled) {
          return;
        }

        setProducts(list);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el inventario."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  
const filteredProducts = useMemo(() => {
  const searchValue = search.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const stock = Number(product.stock ?? 0);

    const matchesFilter =
      filter === "todos" ||
      (filter === "bajo" && stock > 0 && stock <= 3) ||
      (filter === "agotado" && stock === 0);

    if (!matchesFilter) {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    return [
      product.name,
      product.brand,
      product.model,
      product.sku,
      product.category,
    ]
      .filter((value) => value !== null && value !== undefined)
      .some((value) =>
        String(value).toLowerCase().includes(searchValue)
      );
  });

  return [...filtered].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === "name") {
      comparison = String(a.name ?? "").localeCompare(
        String(b.name ?? ""),
        "es",
        { sensitivity: "base", numeric: true }
      );
    } else if (sortColumn === "category") {
      comparison = String(a.category ?? "").localeCompare(
        String(b.category ?? ""),
        "es",
        { sensitivity: "base", numeric: true }
      );
    } else if (sortColumn === "price") {
      comparison =
        Number(a.price ?? 0) - Number(b.price ?? 0);
    } else if (sortColumn === "stock") {
      comparison =
        Number(a.stock ?? 0) - Number(b.stock ?? 0);
    }

    return sortDirection === "asc"
      ? comparison
      : -comparison;
  });
}, [products, search, filter, sortColumn, sortDirection]);


  function startEdit(product: AdminProduct) {
    setAdjustments((current) => ({
      ...current,

      [product.id]: {
        ...EMPTY_ADJUSTMENT,

        value: String(product.stock ?? 0),
      },
    }));
  }

  function cancelEdit(productId: number) {
    setAdjustments((current) => {
      const next = { ...current };

      delete next[productId];

      return next;
    });
  }

  
async function saveStock(product: AdminProduct) {
  const adjustment = adjustments[product.id];

  if (!adjustment || adjustment.saving) {
    return;
  }

  const parsed = Number(adjustment.value);

  if (
    adjustment.value.trim() === "" ||
    !Number.isInteger(parsed) ||
    parsed < 0
  ) {
    setAdjustments((current) => ({
      ...current,
      [product.id]: {
        ...current[product.id],
        error:
          "Ingresa un número entero mayor o igual a cero.",
      },
    }));

    return;
  }

  setAdjustments((current) => ({
    ...current,
    [product.id]: {
      ...current[product.id],
      saving: true,
      error: null,
    },
  }));

  try {
    const savedSession = localStorage.getItem(
      "drl_electronik_admin_session"
    );

    const sessionData = JSON.parse(savedSession || "{}");
    const accessToken = sessionData?.accessToken;

    if (!accessToken) {
      throw new Error(
        "No hay sesión administrativa activa."
      );
    }

    const result = await updateProduct(
      accessToken,
      product.id,
      { stock: parsed }
    );

    const savedProduct = result?.data;

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              ...(savedProduct ?? {}),
              stock: parsed,
            }
          : item
      )
    );

    setAdjustments((current) => {
      const next = { ...current };
      delete next[product.id];
      return next;
    });
  } catch (err) {
    setAdjustments((current) => ({
      ...current,
      [product.id]: {
        ...current[product.id],
        saving: false,
        error:
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el stock.",
      },
    }));
  }
}

  
    const totalUnits = useMemo(() => {
    return products.reduce(
        (total, product) =>
        total + Number(product.stock ?? 0),
        0
    );
    }, [products]);

    const outOfStock = useMemo(() => {
    return products.filter(
        (product) => Number(product.stock ?? 0) === 0
    ).length;
    }, [products]);

    const lowStock = useMemo(() => {
    return products.filter((product) => {
        const stock = Number(product.stock ?? 0);
        return stock > 0 && stock <= 3;
    }).length;
    }, [products]);

  const inputClass =
    "h-10 w-24 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50";

  const statCardClass =
    "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm";

return (
  <DashboardShell
    title="Inventario"
    subtitle="Consulta y ajusta las existencias de cada producto del catálogo"
  >
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
          Inventario
        </p>

        <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-950">
          Control de stock
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Consulta y ajusta las existencias de cada
          producto del catálogo.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={statCardClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Unidades totales
          </p>

          <p className="mt-1 text-3xl font-black text-neutral-950">
            {loading ? "—" : totalUnits}
          </p>
        </div>

        <div className={statCardClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Stock bajo (1-3)
          </p>

          <p className="mt-1 text-3xl font-black text-amber-600">
            {loading ? "—" : lowStock}
          </p>
        </div>

        <div className={statCardClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Agotados
          </p>

          <p className="mt-1 text-3xl font-black text-red-600">
            {loading ? "—" : outOfStock}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar por nombre, marca, SKU..."
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50 sm:max-w-sm"
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
        >
          <option value="todos">
            Todos los productos
          </option>

          <option value="bajo">
            Stock bajo (1-3)
          </option>

          <option value="agotado">Agotados</option>
        </select>
      </div>

      {/* Error general */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Tabla de inventario */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-5 py-14 text-center text-sm text-neutral-500">
            Cargando inventario...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-neutral-500">
            No se encontraron productos con los
            filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  
                <th className="px-5 py-3">
                <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-2 transition hover:text-red-600"
                >
                    Producto
                    <span className={sortColumn === "name" ? "text-red-600" : "text-neutral-300"}>
                    {sortColumn === "name"
                        ? sortDirection === "asc" ? "↑" : "↓"
                        : "↕"}
                    </span>
                </button>
                </th>

                <th className="px-5 py-3">
                <button
                    type="button"
                    onClick={() => handleSort("category")}
                    className="inline-flex items-center gap-2 transition hover:text-red-600"
                >
                    Categoría
                    <span className={sortColumn === "category" ? "text-red-600" : "text-neutral-300"}>
                    {sortColumn === "category"
                        ? sortDirection === "asc" ? "↑" : "↓"
                        : "↕"}
                    </span>
                </button>
                </th>

                <th className="px-5 py-3">
                <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="inline-flex items-center gap-2 transition hover:text-red-600"
                >
                    Precio
                    <span className={sortColumn === "price" ? "text-red-600" : "text-neutral-300"}>
                    {sortColumn === "price"
                        ? sortDirection === "asc" ? "↑" : "↓"
                        : "↕"}
                    </span>
                </button>
                </th>

                <th className="px-5 py-3">
                <button
                    type="button"
                    onClick={() => handleSort("stock")}
                    className="inline-flex items-center gap-2 transition hover:text-red-600"
                >
                    Stock actual
                    <span className={sortColumn === "stock" ? "text-red-600" : "text-neutral-300"}>
                    {sortColumn === "stock"
                        ? sortDirection === "asc" ? "↑" : "↓"
                        : "↕"}
                    </span>
                </button>
                </th>


                  <th className="px-5 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((product) => {
                  const stock = Number(
                    product.stock ?? 0
                  );

                  const adjustment =
                    adjustments[product.id];

                  const editing = Boolean(adjustment);

                  const badge =
                    stock === 0 ? (
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                        Agotado
                      </span>
                    ) : stock <= 3 ? (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                        Stock bajo
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                        Disponible
                      </span>
                    );

                  return (
                    <tr
                      key={product.id}
                      className="text-sm text-neutral-800 transition hover:bg-neutral-50"
                    >
                      <td className="px-5 py-3">
                        <p className="font-bold text-neutral-900">
                          {product.name}
                        </p>

                        <p className="mt-0.5 text-xs text-neutral-400">
                          {product.brand || "—"}
                          {product.model
                            ? ` · ${product.model}`
                            : ""}
                        </p>
                      </td>

                      <td className="px-5 py-3 text-xs text-neutral-500">
                        {product.category || "—"}
                      </td>

                      <td className="px-5 py-3 font-semibold">
                        $
                        {Number(
                          product.price ?? 0
                        ).toFixed(2)}
                      </td>

                      <td className="px-5 py-3">
                        {editing ? (
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                adjustment.value
                              }
                              onChange={(event) =>
                                setAdjustments(
                                  (current) => ({
                                    ...current,

                                    [product.id]: {
                                      ...current[
                                        product.id
                                      ],

                                      value:
                                        event.target
                                          .value,
                                    },
                                  })
                                )
                              }
                              aria-label={`Nuevo stock de ${product.name}`}
                              className={inputClass}
                            />

                            {adjustment.error && (
                              <p className="mt-1 max-w-[200px] text-xs font-medium text-red-600">
                                {adjustment.error}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-neutral-950">
                              {stock}
                            </span>

                            {badge}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {editing ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  saveStock(
                                    product
                                  )
                                }
                                disabled={
                                  adjustment.saving
                                }
                                className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {adjustment.saving
                                  ? "Guardando..."
                                  : "Guardar"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  cancelEdit(
                                    product.id
                                  )
                                }
                                disabled={
                                  adjustment.saving
                                }
                                className="rounded-lg border border-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(product)
                              }
                              className="rounded-lg border border-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              Ajustar stock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
       </div>
     </div>
    </DashboardShell>
  );
}
