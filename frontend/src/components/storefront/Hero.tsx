export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(220,38,38,0.28),transparent_35%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            DRL Electronik
          </p>

          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tecnología para tu hogar y tu día a día.
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-300">
            Descubre nuestro catálogo de productos, encuentra lo que necesitas
            y compra de forma rápida y segura.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#catalogo"
              className="rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Ver catálogo
            </a>

            <a
              href="#destacados"
              className="rounded-xl border border-neutral-600 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/5"
            >
              Productos destacados
            </a>
          </div>
        </div>

        <div className="hidden md:flex md:justify-end">
          <div className="relative h-80 w-80">
            <div className="absolute inset-0 rounded-full bg-red-600/20 blur-3xl" />

            <div className="relative flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-red-600 text-4xl font-black text-white shadow-xl">
                  DRL
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-300">
                  Electronik
                </p>

                <p className="mt-2 text-xs text-neutral-500">
                  Tu tienda de confianza
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}