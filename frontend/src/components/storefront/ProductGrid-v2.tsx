"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";

type Product = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  price?: number | null;
  stock?: number | null;
  description?: string | null;
  images?: string[] | null;
  family_id?: number | null;
  variant?: string | null;
};

type ProductGridProps = {
  products: Product[];
  searchQuery?: string;
  onAddToCart?: (product: Product) => void;
};

export default function ProductGrid({
  products,
  searchQuery = "",
  onAddToCart,
}: ProductGridProps) {
  const [search, setSearch] = useState(searchQuery);
  const [category, setCategory] = useState("Todos");
  const [availability, setAvailability] = useState("Todos");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  /*
   * Mientras terminamos las pruebas de inventario/pedidos,
   * ocultamos los productos temporales utilizados durante las pruebas.
   */

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(
        (value): value is string => Boolean(value)
      );

    return [
      "Todos",
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, "es", {
          sensitivity: "base",
        })
      ),
    ];
  }, [products]);

    const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    /*
     * Primero identificamos las familias.
     * Si una variante coincide con la búsqueda,
     * mostramos la familia completa para que el selector
     * pueda ofrecer todas sus variantes.
     */
    const familyGroups = new Map<string, Product[]>();

    products.forEach((product) => {
      const familyKey =
        product.family_id !== null &&
        product.family_id !== undefined
          ? String(product.family_id)
          : `product-${product.id}`;

      const currentGroup = familyGroups.get(familyKey) || [];

      currentGroup.push(product);
      familyGroups.set(familyKey, currentGroup);
    });

    const result: Product[] = [];

    familyGroups.forEach((familyProducts) => {
      /*
       * Buscamos si la familia tiene al menos una variante
       * que coincida con el texto introducido.
       */
      const familyMatchesSearch =
        !searchValue ||
        familyProducts.some((product) =>
          [
            product.name,
            product.brand,
            product.model,
            product.sku,
            product.category,
            product.description,
            product.variant,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchValue)
            )
        );

      if (!familyMatchesSearch) {
        return;
      }

      /*
       * La categoría sigue filtrándose normalmente.
       */
      const matchesCategory =
        category === "Todos" ||
        familyProducts.some(
          (product) => product.category === category
        );

      if (!matchesCategory) {
        return;
      }

      /*
       * La disponibilidad se evalúa sobre la familia.
       *
       * Disponible = al menos una variante tiene stock.
       * Agotado = ninguna variante tiene stock.
       */
      const familyHasStock = familyProducts.some(
        (product) => Number(product.stock ?? 0) > 0
      );

      const matchesAvailability =
        availability === "Todos" ||
        (availability === "Disponible" &&
          familyHasStock) ||
        (availability === "Agotado" &&
          !familyHasStock);

      if (!matchesAvailability) {
        return;
      }

      /*
       * Agregamos TODAS las variantes de la familia.
       * Esto permite que ProductCard reciba el array completo.
       */
      result.push(...familyProducts);
    });

    /*
     * Ordenamos después de construir las familias.
     */
    if (sort === "price-asc") {
      result.sort(
        (a, b) =>
          Number(a.price ?? 0) -
          Number(b.price ?? 0)
      );
    }

    if (sort === "price-desc") {
      result.sort(
        (a, b) =>
          Number(b.price ?? 0) -
          Number(a.price ?? 0)
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "es",
          {
            sensitivity: "base",
          }
        )
      );
    }

    return result;
  }, [
    products,
    search,
    category,
    availability,
    sort,
  ]);

    const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();

    filteredProducts.forEach((product) => {
       const familyKey =
          product.family_id !== null &&
          product.family_id !== undefined
            ? String(product.family_id)
            : `product-${product.id}`;

        const currentGroup = groups.get(familyKey) || [];

        currentGroup.push(product);
        groups.set(familyKey, currentGroup);
    });

    return Array.from(groups.values()).map((variants) => ({
        product: variants[0],
        variants,
    }));
    }, [filteredProducts]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "Todos" ||
    availability !== "Todos" ||
    sort !== "default";

  function clearFilters() {
    setSearch("");
    setCategory("Todos");
    setAvailability("Todos");
    setSort("default");
  }

  return (
    <section>
      {/* =====================================
          CABECERA DEL CATÁLOGO
      ====================================== */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
            Catálogo DRL Electronik
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
            Productos
          </h2>
        </div>

        <p className="text-sm text-neutral-500">
          <span className="font-bold text-neutral-900">
            {filteredProducts.length}
          </span>{" "}
          productos encontrados
        </p>
      </div>

      {/* =====================================
          FILTROS
      ====================================== */}
      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Buscador */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar productos, marcas, modelos o SKU..."
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-12 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </div>

          {/* Selectores */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Categoría */}
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "Todos"
                    ? "Todas las categorías"
                    : item}
                </option>
              ))}
            </select>

            {/* Disponibilidad */}
            <select
              value={availability}
              onChange={(event) =>
                setAvailability(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            >
              <option value="Todos">
                Disponibilidad
              </option>
              <option value="Disponible">
                Disponible
              </option>
              <option value="Agotado">
                Agotado
              </option>
            </select>

            {/* Orden */}
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            >
              <option value="default">
                Ordenar por
              </option>

              <option value="price-asc">
                Precio: menor a mayor
              </option>

              <option value="price-desc">
                Precio: mayor a menor
              </option>

              <option value="name">
                Nombre A-Z
              </option>
            </select>
          </div>

          {/* Información filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
            <p className="text-sm text-neutral-500">
              Mostrando{" "}
              <span className="font-bold text-neutral-900">
                {filteredProducts.length}
              </span>{" "}
              de{" "}
              <span className="font-bold text-neutral-900">
                {products.length}
              </span>{" "}
              productos
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 15H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>

                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================
          PRODUCTOS
      ====================================== */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />

              <path d="m16 16 5 5" />

              <path d="M8.5 11h5" />
            </svg>
          </div>

          <h3 className="mt-5 text-lg font-bold text-neutral-900">
            No encontramos productos
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Prueba con otro término de búsqueda
            o modifica los filtros seleccionados.
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {groupedProducts.map(
            ({ product, variants }) => (
                <ProductCard
                key={product.id}
                product={product}
                variants={variants}
                onAddToCart={onAddToCart}
                />
            )
            )}
        </div>
      )}
    </section>
  );
}