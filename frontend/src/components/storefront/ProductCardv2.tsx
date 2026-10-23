"use client";
import { useEffect, useState } from "react";

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

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  variants?: Product[];
};

export default function ProductCard({
  
  product,
  onAddToCart,
  variants,
}: ProductCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.id);
       
  useEffect(() => {
              setSelectedVariantId(product.id);
            }, [product.id]);

  const selectedProduct =
          variants?.find(
                (item) => item.id === selectedVariantId
              ) || product;
  
  const image = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
      ? selectedProduct.images[0]
      : null;

  const price = Number(selectedProduct.price ?? 0);
  const stock = Number(selectedProduct.stock ?? 0);
  const available = stock > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
      {/* Imagen */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-b from-neutral-50 to-white sm:h-72">
        {image ? (
          <img
            src={image}
            alt={selectedProduct.name}
            loading="lazy"
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-neutral-300">
            <svg
              viewBox="0 0 24 24"
              className="h-14 w-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="m3 17 5-5 4 4 3-3 6 5" />
            </svg>

            <span className="mt-2 text-xs font-medium">
              Sin imagen
            </span>
          </div>
        )}

        {/* Estado */}
        <div className="absolute left-4 top-4">
          {available ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white px-3 py-1.5 text-[11px] font-bold text-green-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Disponible
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Favorito */}
        <button
          type="button"
          aria-label={"Agregar " + selectedProduct.name + " a favoritos"}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:border-red-200 hover:bg-red-600 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />
          </svg>
        </button>
      </div>

      {/* Información */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-600">
          {selectedProduct.category || "Producto"}
        </p>

        <h3 className="line-clamp-2 min-h-[3rem] text-[15px] font-extrabold leading-6 text-neutral-900 transition-colors group-hover:text-red-700">
          {selectedProduct.name}
        </h3>
        {variants && variants.length > 1 && (
            <div className="mt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Variante
                </p>

                <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                    <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                        selectedVariantId === variant.id
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-red-300 hover:text-red-600"
                    }`}
                    >
                    {variant.variant || variant.name}
                    </button>
                ))}
                </div>
            </div>
            )}

        {(selectedProduct.brand || selectedProduct.model) && (
          <p className="mt-2 line-clamp-1 text-sm font-medium text-neutral-500">
            {selectedProduct.brand}
            {selectedProduct.brand && selectedProduct.model ? " · " : ""}
            {selectedProduct.model}
          </p>
        )}

        {selectedProduct.sku && (
          <p className="mt-1 text-[11px] text-neutral-400">
            SKU: {selectedProduct.sku}
          </p>
        )}

        {/* Precio */}
        <div className="mt-auto pt-5">
          <div className="border-t border-neutral-100 pt-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Precio
                </p>

                <p className="mt-0.5 text-2xl font-black tracking-tight text-neutral-950">
                  ${price.toFixed(2)}
                </p>

                <p className="mt-1 text-[11px] text-neutral-500">
                  {available
                    ? stock === 1
                      ? "1 unidad disponible"
                      : stock + " unidades disponibles"
                    : "Consultar disponibilidad"}
                </p>
              </div>

              {/* Carrito */}
              <button
                type="button"
                disabled={!available}
                onClick={() => onAddToCart?.(selectedProduct)}
                aria-label={"Añadir " + selectedProduct.name + " al carrito"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
                  <circle cx="10" cy="20" r="1.3" />
                  <circle cx="18" cy="20" r="1.3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}