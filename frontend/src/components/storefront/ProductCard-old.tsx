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
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  const price = Number(product.price || 0);
  const stock = Number(product.stock || 0);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl">
      {/* Imagen */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-neutral-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-7 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center text-neutral-300">
            <svg
              viewBox="0 0 24 24"
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="m3 17 5-5 4 4 3-3 6 5" />
            </svg>

            <span className="mt-2 text-xs">Sin imagen</span>
          </div>
        )}

        {/* Estado */}
        <div className="absolute left-4 top-4">
          {stock > 0 ? (
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm">
              Disponible
            </span>
          ) : (
            <span className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">
              Agotado
            </span>
          )}
        </div>

        {/* Favorito */}
        <button
          type="button"
          aria-label={`Agregar ${product.name} a favoritos`}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm transition-all hover:bg-red-600 hover:text-white"
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
      <div className="p-5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
          {product.category || "Producto"}
        </p>

        <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold leading-6 text-neutral-900">
          {product.name}
        </h3>

        {product.brand && (
          <p className="mt-2 text-sm text-neutral-500">
            {product.brand}
            {product.model ? ` · ${product.model}` : ""}
          </p>
        )}

        {product.sku && (
          <p className="mt-1 text-xs text-neutral-400">
            SKU: {product.sku}
          </p>
        )}

        {/* Precio */}
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-black tracking-tight text-neutral-900">
                ${price.toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {stock > 0
                  ? `${stock} unidades disponibles`
                  : "Consultar disponibilidad"}
              </p>
            </div>
            {/*carrito*/}
            <button
              type="button"
              disabled={stock <= 0}
              onClick={() => onAddToCart?.(product)}
              aria-label={`Añadir ${product.name} al carrito`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white transition-all hover:bg-red-700 hover:shadow-lg disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
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
    </article>
  );
}