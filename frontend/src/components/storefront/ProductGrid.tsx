"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";

type Product = {
  id: number;
  name: string;
  brand?: string | null;
  brand_id?: number | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  supplier_id?: number | null;
  supplier?: {
    company_name: string;
    } | null;
  price?: number | null;
  stock?: number | null;
  description?: string | null;
  images?: string[] | null;
  family_id?: number | string | null;
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
  const [brand, setBrand] = useState("Todas");
  const [supplier, setSupplier] = useState("Todos");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("Todos");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category?.trim())
      .filter((value): value is string => Boolean(value));

    return [
      "Todos",
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" })
      ),
    ];
  }, [products]);

  const brands = useMemo(() => {
    const values = products
      .map((product) => product.brand?.trim())
      .filter((value): value is string => Boolean(value));

    return [
      "Todas",
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" })
      ),
    ];
  }, [products]);

  const suppliers = useMemo(() => {
        const values = products
            .map((product) => ({
            id: product.supplier_id,
            name: product.supplier?.company_name?.trim(),
            }))
            .filter(
            (
                value
            ): value is { id: number; name: string } =>
                value.id !== null &&
                value.id !== undefined &&
                Number.isFinite(Number(value.id)) &&
                Boolean(value.name)
            );

        return Array.from(
            new Map(values.map((supplier) => [supplier.id, supplier])).values()
        ).sort((a, b) =>
            a.name.localeCompare(b.name, "es", {
            sensitivity: "base",
            })
        );
        }, [products]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const parsedMinPrice =
      minPrice.trim() === "" ? null : Number(minPrice);

    const parsedMaxPrice =
      maxPrice.trim() === "" ? null : Number(maxPrice);

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
            product.supplier_id,
          ]
            .filter(
              (value) => value !== null && value !== undefined
            )
            .some((value) =>
              String(value).toLowerCase().includes(searchValue)
            )
        );

      if (!familyMatchesSearch) return;

      const matchingVariants = familyProducts.filter((product) => {
        const matchesCategory =
          category === "Todos" || product.category === category;

        const matchesBrand =
          brand === "Todas" || product.brand?.trim() === brand;

        const matchesSupplier =
          supplier === "Todos" ||
          String(product.supplier_id ?? "") === supplier;

        const price = Number(product.price ?? 0);

        const matchesMinPrice =
          parsedMinPrice === null ||
          (Number.isFinite(parsedMinPrice) && price >= parsedMinPrice);

        const matchesMaxPrice =
          parsedMaxPrice === null ||
          (Number.isFinite(parsedMaxPrice) && price <= parsedMaxPrice);

        return (
          matchesCategory &&
          matchesBrand &&
          matchesSupplier &&
          matchesMinPrice &&
          matchesMaxPrice
        );
      });

      if (matchingVariants.length === 0) return;

      const familyHasStock = familyProducts.some(
        (product) => Number(product.stock ?? 0) > 0
      );

      const matchesAvailability =
        availability === "Todos" ||
        (availability === "Disponible" && familyHasStock) ||
        (availability === "Agotado" && !familyHasStock);

      if (!matchesAvailability) return;

      result.push(...matchingVariants);
    });

    if (sort === "price-asc") {
      result.sort(
        (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)
      );
    }

    if (sort === "price-desc") {
      result.sort(
        (a, b) => Number(b.price ?? 0) - Number(a.price ?? 0)
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name, "es", {
          sensitivity: "base",
        })
      );
    }

    return result;
  }, [
    products,
    search,
    category,
    brand,
    supplier,
    minPrice,
    maxPrice,
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
    brand !== "Todas" ||
    supplier !== "Todos" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    availability !== "Todos" ||
    sort !== "default";

  const invalidPriceRange =
    minPrice.trim() !== "" &&
    maxPrice.trim() !== "" &&
    Number(minPrice) > Number(maxPrice);

  function clearFilters() {
    setSearch("");
    setCategory("Todos");
    setBrand("Todas");
    setSupplier("Todos");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("Todos");
    setSort("default");
  }

  const selectClass =
    "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50";

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50";

  return (
    <section>
      {/* Cabecera del catálogo */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
            Catálogo DRL Electronik
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
            Productos
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Encuentra el producto que necesitas.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          <span className="font-bold text-neutral-900">
            {filteredProducts.length}
          </span>{" "}
          productos encontrados
        </p>
      </div>

      {/* Distribución: filtros a la izquierda y catálogo a la derecha */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        {/* BARRA LATERAL DE FILTROS */}
        <aside className="min-w-0 rounded-2xl border border-neutral-200 bg-white shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M4 7h16M7 12h10m-7 5h4" />
                <circle cx="8" cy="7" r="1.5" fill="white" />
                <circle cx="15" cy="12" r="1.5" fill="white" />
                <circle cx="12" cy="17" r="1.5" fill="white" />
              </svg>

              <h3 className="font-bold text-neutral-900">
                Filtros
              </h3>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-red-600 transition hover:text-red-700"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-5 p-5">
            {/* Búsqueda */}
            <div>
              <label
                htmlFor="catalog-search"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Buscar
              </label>

              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  id="catalog-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Producto, marca, SKU..."
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>
            </div>

            <div className="border-t border-neutral-100" />

            {/* Categoría */}
            <div>
              <label
                htmlFor="catalog-category"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Categoría
              </label>

              <select
                id="catalog-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={selectClass}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todos" ? "Todas las categorías" : item}
                  </option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label
                htmlFor="catalog-brand"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Marca
              </label>

              <select
                id="catalog-brand"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className={selectClass}
              >
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todas" ? "Todas las marcas" : item}
                  </option>
                ))}
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label
                htmlFor="catalog-supplier"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Proveedor
              </label>

              <select
                id="catalog-supplier"
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
                className={selectClass}
              >
                <option value="Todos">Todos los proveedores</option>
                    {suppliers.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                        {item.name}
                    </option>
                    ))}
              </select>

              <p className="mt-1.5 text-xs leading-5 text-neutral-400">
                Los proveedores se identifican por su número.
              </p>
            </div>

            <div className="border-t border-neutral-100" />

            {/* Rango de precios */}
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-neutral-800">
                Rango de precios
              </legend>

              <div className="grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className="mb-1.5 block text-xs text-neutral-500">
                    Mínimo
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="0.00"
                    aria-label="Precio mínimo"
                    className={inputClass}
                  />
                </label>

                <label className="min-w-0">
                  <span className="mb-1.5 block text-xs text-neutral-500">
                    Máximo
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="999.00"
                    aria-label="Precio máximo"
                    className={inputClass}
                  />
                </label>
              </div>

              {invalidPriceRange && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  El mínimo no puede superar el máximo.
                </p>
              )}
            </fieldset>

            <div className="border-t border-neutral-100" />

            {/* Disponibilidad */}
            <div>
              <label
                htmlFor="catalog-availability"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Disponibilidad
              </label>

              <select
                id="catalog-availability"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className={selectClass}
              >
                <option value="Todos">Todas</option>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label
                htmlFor="catalog-sort"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Ordenar por
              </label>

              <select
                id="catalog-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className={selectClass}
              >
                <option value="default">Predeterminado</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>

            {/* Botón para limpiar */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </aside>

        {/* ÁREA DEL CATÁLOGO */}
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-4">
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
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                Filtros aplicados
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 5 5" />
                  <path d="M8.5 11h5" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-neutral-900">
                No encontramos productos
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Prueba con otra búsqueda o modifica los filtros seleccionados.
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {groupedProducts.map(({ product, variants }) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variants={variants}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}