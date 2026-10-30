
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProducts } from "@/lib/api";
import { useStorefront } from "@/components/storefront/StorefrontProvider";

type Product = {
  id: number;
  name: string;
  brand?: string | null;
  brand_id?: number;
  model?: string | null;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  supplier_id?: number;
  supplier?: { company_name: string } | null;
  price?: number | null;
  vip_price?: number | null;
  stock?: number | null;
  description?: string | null;
  features?: Record<string, unknown> | null;
  technical_specs?: Record<string, unknown> | null;
  images?: string[] | null;
  family_id?: number | string | null;
  variant?: string | null;
  active?: boolean;
  stock_disabled_by_inventory?: boolean;
};

const formatPrice = (value: number) =>
  value.toLocaleString("es-PR", {
    style: "currency",
    currency: "USD",
  });

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${formatLabel(key)}: ${formatValue(item)}`)
      .join("; ");
  }

  return String(value);
}

function DetailTable({
  title,
  values,
}: {
  title: string;
  values: Record<string, unknown> | null | undefined;
}) {
  const entries = Object.entries(values ?? {}).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  if (entries.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-neutral-900">
        {title}
      </h2>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
        <dl className="divide-y divide-neutral-100">
          {entries.map(([key, value], index) => (
            <div
              key={key}
              className={`grid gap-2 px-4 py-3 sm:grid-cols-2 ${
                index % 2 === 0 ? "bg-white" : "bg-neutral-50"
              }`}
            >
              <dt className="text-sm font-semibold text-neutral-600">
                {formatLabel(key)}
              </dt>
              <dd className="break-words text-sm text-neutral-900">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const { addToCartGlobal } = useStorefront();

  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [selectedVariantId, setSelectedVariantId] =
    useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        if (!Number.isInteger(productId) || productId <= 0) {
          throw new Error("El identificador del producto no es válido.");
        }

        const response = await getProducts();
        const list: Product[] = Array.isArray(response?.data)
          ? response.data
          : [];

        const found = list.find(
          (item) => Number(item.id) === productId
        );

        if (!found) {
          throw new Error("No encontramos este producto en el catálogo.");
        }

        const familyProducts = found.family_id != null
          ? list.filter(
              (item) =>
                item.family_id != null &&
                String(item.family_id) === String(found.family_id)
            )
          : [];

        const availableVariants =
          familyProducts.length > 0 ? familyProducts : [found];

        if (cancelled) return;

        setProducts(list);
        setProduct(found);
        setVariants(availableVariants);
        setSelectedVariantId(found.id);
        setActiveImage(0);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el producto."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const selectedProduct =
    variants.find((item) => item.id === selectedVariantId) ?? product;

  const images = useMemo(
    () =>
      (selectedProduct?.images ?? []).filter(
        (image): image is string =>
          typeof image === "string" && image.trim().length > 0
      ),
    [selectedProduct?.images]
  );

  useEffect(() => {
    setActiveImage(0);
  }, [selectedVariantId]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];

    return products
      .filter((item) => {
        if (item.id === selectedProduct.id) return false;

        // Evita presentar otras variantes de la misma familia
        // como si fueran recomendaciones independientes.
        if (
          selectedProduct.family_id != null &&
          item.family_id != null &&
          String(item.family_id) === String(selectedProduct.family_id)
        ) {
          return false;
        }

        return (
          Boolean(selectedProduct.category) &&
          item.category?.toLowerCase() ===
            selectedProduct.category?.toLowerCase()
        );
      })
      .slice(0, 4);
  }, [products, selectedProduct]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <p className="animate-pulse text-neutral-500">
          Cargando información del producto...
        </p>
      </main>
    );
  }

  if (error || !product || !selectedProduct) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-extrabold">
          Producto no disponible
        </h1>
        <p className="mt-3 text-neutral-600">
          {error || "No encontramos este producto."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const stock = Number(selectedProduct.stock ?? 0);
  const price = Number(selectedProduct.price ?? 0);
  const available = stock > 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Ruta de navegación"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-500"
      >
        <Link href="/" className="hover:text-red-700">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        {selectedProduct.category && (
          <>
            <span>{selectedProduct.category}</span>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="font-semibold text-neutral-900">
          {selectedProduct.name}
        </span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galería */}
        <section className="min-w-0">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white">
            {images.length > 0 ? (
              <img
                src={images[activeImage] ?? images[0]}
                alt={selectedProduct.name}
                className="h-full w-full object-contain p-5 sm:p-8"
              />
            ) : (
              <div className="px-8 text-center text-neutral-400">
                <svg
                  viewBox="0 0 24 24"
                  className="mx-auto h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="m3 17 5-5 4 4 3-3 6 5" />
                </svg>
                <p className="mt-3">No hay imágenes disponibles</p>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage(
                      (current) =>
                        (current - 1 + images.length) % images.length
                    )
                  }
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 text-xl shadow-sm hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((current) => (current + 1) % images.length)
                  }
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 text-xl shadow-sm hover:bg-white"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white p-1 ${
                    activeImage === index
                      ? "border-red-600"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${selectedProduct.name}, imagen ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Información comercial */}
        <section className="min-w-0">
          {selectedProduct.category && (
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">
              {selectedProduct.category}
            </p>
          )}

          <h1 className="mt-2 text-3xl font-black leading-tight text-neutral-950 sm:text-4xl">
            {selectedProduct.name}
          </h1>

          {(selectedProduct.brand || selectedProduct.model) && (
            <p className="mt-3 text-neutral-600">
              {[selectedProduct.brand, selectedProduct.model]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <div className="mt-6 border-y border-neutral-200 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Precio
            </p>
            <p className="mt-1 text-4xl font-black tracking-tight text-neutral-950">
              {formatPrice(price)}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${
                available
                  ? stock <= 3
                    ? "bg-amber-50 text-amber-800"
                    : "bg-green-50 text-green-800"
                  : "bg-neutral-100 text-neutral-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  available
                    ? stock <= 3
                      ? "bg-amber-500"
                      : "bg-green-500"
                    : "bg-neutral-400"
                }`}
              />
              {!available
                ? "Agotado"
                : stock <= 3
                  ? `¡Pocas unidades! (${stock})`
                  : "Disponible"}
            </span>

            {selectedProduct.stock_disabled_by_inventory && (
              <span className="text-xs text-neutral-500">
                Inventario controlado por el sistema
              </span>
            )}
          </div>

          {variants.length > 1 && (
            <div className="mt-6">
              <label
                htmlFor="product-variant"
                className="mb-2 block text-sm font-bold text-neutral-800"
              >
                Seleccionar variante
              </label>
              <select
                id="product-variant"
                value={selectedProduct.id}
                onChange={(event) =>
                  setSelectedVariantId(Number(event.target.value))
                }
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.variant || variant.model || variant.name}
                    {" — "}
                    {formatPrice(Number(variant.price ?? 0))}
                    {" — "}
                    {Number(variant.stock ?? 0) > 0
                      ? `${variant.stock} disponibles`
                      : "Agotado"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-neutral-50 p-4 sm:grid-cols-2">
            {selectedProduct.brand && (
              <div>
                <dt className="text-xs text-neutral-500">Marca</dt>
                <dd className="mt-1 font-semibold text-neutral-900">
                  {selectedProduct.brand}
                </dd>
              </div>
            )}
            {selectedProduct.model && (
              <div>
                <dt className="text-xs text-neutral-500">Modelo</dt>
                <dd className="mt-1 font-semibold text-neutral-900">
                  {selectedProduct.model}
                </dd>
              </div>
            )}
            {selectedProduct.sku && (
              <div>
                <dt className="text-xs text-neutral-500">SKU</dt>
                <dd className="mt-1 break-all font-semibold text-neutral-900">
                  {selectedProduct.sku}
                </dd>
              </div>
            )}
            {selectedProduct.barcode && (
              <div>
                <dt className="text-xs text-neutral-500">Código de barras</dt>
                <dd className="mt-1 break-all font-semibold text-neutral-900">
                  {selectedProduct.barcode}
                </dd>
              </div>
            )}
            {selectedProduct.supplier?.company_name && (
              <div>
                <dt className="text-xs text-neutral-500">Proveedor</dt>
                <dd className="mt-1 font-semibold text-neutral-900">
                  {selectedProduct.supplier.company_name}
                </dd>
              </div>
            )}
          </dl>

          {selectedProduct.description && (
            <section className="mt-7">
              <h2 className="text-xl font-extrabold text-neutral-900">
                Descripción
              </h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-neutral-600">
                {selectedProduct.description}
              </p>
            </section>
          )}

          <button
            type="button"
            disabled={!available}
            onClick={() =>
              addToCartGlobal(
                selectedProduct,
                1,
                selectedProduct.variant ?? undefined
              )
            }
            className="mt-8 w-full rounded-xl bg-red-600 px-6 py-4 font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {available ? "Añadir al carrito" : "Producto agotado"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
            El pedido se prepara desde el catálogo. El pago y el cobro del
            punto de venta permanecen separados.
          </p>
        </section>
      </div>

      {/* Información técnica */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <DetailTable
          title="Características"
          values={selectedProduct.features}
        />
        <DetailTable
          title="Especificaciones técnicas"
          values={selectedProduct.technical_specs}
        />
      </div>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">
                También te puede interesar
              </p>
              <h2 className="mt-2 text-2xl font-black text-neutral-950">
                Productos relacionados
              </h2>
            </div>
            <Link
              href="/"
              className="text-sm font-bold text-red-700 hover:text-red-800"
            >
              Ver catálogo →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => {
              const itemImage = item.images?.find(
                (image) => typeof image === "string" && image.trim().length > 0
              );

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                >
                  <Link
                    href={`/producto/${item.id}`}
                    className="block"
                    aria-label={`Ver detalle de ${item.name}`}
                  >
                    <div className="flex aspect-square items-center justify-center bg-neutral-50 p-5">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-sm text-neutral-400">
                          Sin imagen
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                        {item.category || "Producto"}
                      </p>
                      <h3 className="mt-2 line-clamp-2 min-h-12 font-bold text-neutral-900 group-hover:text-red-700">
                        {item.name}
                      </h3>
                      {(item.brand || item.model) && (
                        <p className="mt-2 truncate text-sm text-neutral-500">
                          {[item.brand, item.model].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="mt-4 text-xl font-black text-neutral-950">
                        {formatPrice(Number(item.price ?? 0))}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
