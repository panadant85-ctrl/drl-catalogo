"use client";

import { useEffect, useRef, useState } from "react";
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
  features?: string[] | null;
  images?: string[] | null;
};

type CategoryCarouselProps = {
  category: string;
  categories?: string[];
  products: Product[];
  onAddToCart?: (product: Product) => void;
};

export default function CategoryCarousel({
  category,
  categories = [],
  products,
  onAddToCart,
}: CategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  // IMPORTANTE:
  // useState está dentro del componente.
  const [isPaused, setIsPaused] = useState(false);

  const targets = categories.map((item) =>
    item.toLowerCase().trim()
  );

  const categoryProducts = products.filter((product) => {
    const productCategory = String(product.category || "")
      .toLowerCase()
      .trim();

    return targets.includes(productCategory);
  });

  function updateButtons() {
    const element = carouselRef.current;

    if (!element) return;

    const maxScroll =
      element.scrollWidth - element.clientWidth;

    setCanGoBack(element.scrollLeft > 5);
    setCanGoNext(element.scrollLeft < maxScroll - 5);
  }

  useEffect(() => {
    updateButtons();

    const element = carouselRef.current;

    if (!element) return;

    element.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    return () => {
      element.removeEventListener(
        "scroll",
        updateButtons
      );

      window.removeEventListener(
        "resize",
        updateButtons
      );
    };
  }, [categoryProducts.length]);

  // CARRUSEL AUTOMÁTICO
  useEffect(() => {
    if (categoryProducts.length <= 5 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      const element = carouselRef.current;

      if (!element) return;

      const maxScroll =
        element.scrollWidth - element.clientWidth;

      const reachedEnd =
        element.scrollLeft >= maxScroll - 10;

      if (reachedEnd) {
        element.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        element.scrollBy({
          left: element.clientWidth,
          behavior: "smooth",
        });
      }
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, [categoryProducts.length, isPaused]);

  function scrollNext() {
    const element = carouselRef.current;

    if (!element) return;

    element.scrollBy({
      left: element.clientWidth,
      behavior: "smooth",
    });
  }

  function scrollPrevious() {
    const element = carouselRef.current;

    if (!element) return;

    element.scrollBy({
      left: -element.clientWidth,
      behavior: "smooth",
    });
  }

  if (categoryProducts.length === 0) {
    return null;
  }

  return (
    <section
      id={`categoria-${category
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")}`}
      className="scroll-mt-32 border-b border-neutral-100 bg-white py-14"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* ENCABEZADO */}
        <div className="mb-7 flex items-end justify-between gap-4">

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Categoría
            </p>

            <h2 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl">
              {category}
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Descubre nuestros productos destacados.
            </p>
          </div>

          {/* FLECHAS */}
          <div className="flex shrink-0 gap-2">

            <button
              type="button"
              onClick={scrollPrevious}
              disabled={!canGoBack}
              aria-label={`Productos anteriores de ${category}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={scrollNext}
              disabled={!canGoNext}
              aria-label={`Siguientes productos de ${category}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

          </div>
        </div>

        {/* CARRUSEL */}
        <div className="relative">

          <div
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categoryProducts.map((product) => (
              <div
                key={product.id}
                className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[31.5%] xl:w-[19%]"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>

        </div>

        {/* INFORMACIÓN */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400">
          <span>
            {categoryProducts.length} productos
          </span>

          <span>•</span>

          <span>
            Desliza para explorar
          </span>
        </div>
        {/* CATÁLOGO COMPLETO DE LA CATEGORÍA */}
        <div className="mt-12 border-t border-neutral-100 pt-10">

          <div className="mb-7">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Catálogo completo
            </p>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
                Todos los productos de {category}
              </h3>

              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-500">
                {categoryProducts.length} productos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categoryProducts.map((product) => (
              <ProductCard
                key={`catalog-${product.id}`}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}