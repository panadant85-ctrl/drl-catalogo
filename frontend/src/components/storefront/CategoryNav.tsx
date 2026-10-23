"use client";

const categories = [
  {
    name: "Todos",
    target: "catalogo",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: "Electrodomésticos",
    target: "categoria-electrodomesticos",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h3" />
      </svg>
    ),
  },
  {
    name: "Ferretería",
    target: "categoria-ferreteria",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m14 6 4 4" />
        <path d="m13 7-8 8a2.8 2.8 0 0 0 4 4l8-8" />
        <path d="m16 3 5 5-3 3-5-5z" />
      </svg>
    ),
  },
  {
    name: "Iluminación",
    target: "categoria-iluminacion",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8.5 14.5C7.5 13.5 7 12.1 7 10.5a5 5 0 0 1 10 0c0 1.6-.5 3-1.5 4-.7.7-1.2 1.5-1.3 2.5h-4.4c-.1-1-.6-1.8-1.3-2.5Z" />
      </svg>
    ),
  },
  {
    name: "Hogar",
    target: "categoria-hogar",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    name: "Electricidad",
    target: "categoria-electricidad",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M13 2 4 13h6l-1 9 9-12h-6z" />
      </svg>
    ),
  },
];

export default function CategoryNav() {
  function goToCategory(target: string) {
    const element = document.getElementById(target);

    if (!element) {
      console.warn(
        `No existe el destino: #${target}`
      );
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-2 overflow-x-auto py-4">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() =>
                goToCategory(category.target)
              }
              className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition group-hover:bg-red-100 group-hover:text-red-600">
                <span className="h-5 w-5">
                  {category.icon}
                </span>
              </span>

              <span>{category.name}</span>

              {category.name !== "Todos" && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-neutral-300 transition group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}