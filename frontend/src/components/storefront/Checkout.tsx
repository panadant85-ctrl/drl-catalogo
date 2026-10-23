"use client";

import { FormEvent, useMemo, useState } from "react";

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
  variant?: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type CheckoutProps = {
  cart: CartItem[];
  onBackToCart: () => void;
  onBackToStore: () => void;
};

type FormData = {
  firstName: string;
  lastName: string;
  identification: string;
  phone: string;
  email: string;
  province: string;
  municipality: string;
  address: string;
  reference: string;
  notes: string;
};

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  identification: "",
  phone: "",
  email: "",
  province: "La Habana",
  municipality: "",
  address: "",
  reference: "",
  notes: "",
};

const municipalities = [
  "Playa",
  "Plaza de la Revolución",
  "Centro Habana",
  "La Habana Vieja",
  "Regla",
  "La Habana del Este",
  "Guanabacoa",
  "San Miguel del Padrón",
  "Diez de Octubre",
  "Cerro",
  "Marianao",
  "La Lisa",
  "Boyeros",
  "Arroyo Naranjo",
  "Cotorro",
];

export default function Checkout({
  cart,
  onBackToCart,
  onBackToStore,
}: CheckoutProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return (
        total +
        Number(item.product.price || 0) * item.quantity
      );
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }, [cart]);

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cart.length === 0) {
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
          <div className="w-full rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m5 12 4.5 4.5L19 7" />
              </svg>
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-red-600">
              DRL Electronik
            </p>

            <h1 className="mt-3 text-3xl font-black text-neutral-900 sm:text-4xl">
              Datos preparados correctamente
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-500">
              Tu información y el resumen del pedido están
              listos para enviarse al sistema de pedidos.
            </p>

            <div className="mt-8 rounded-2xl bg-neutral-50 p-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                  Productos
                </span>

                <span className="font-bold text-neutral-900">
                  {totalItems}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
                <span className="font-bold text-neutral-900">
                  Total
                </span>

                <span className="text-xl font-black text-red-600">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToStore}
              className="mt-8 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Volver a la tienda
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header del checkout */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              DRL Electronik
            </p>

            <h1 className="mt-1 text-xl font-black text-neutral-900 sm:text-2xl">
              Finalizar compra
            </h1>
          </div>

          <button
            type="button"
            onClick={onBackToCart}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M19 12H5" />
              <path d="m11 18-6-6 6-6" />
            </svg>

            Volver al carrito
          </button>
          <button
                type="button"
                onClick={onBackToStore}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path d="M19 12H5" />
                    <path d="m11 18-6-6 6-6" />
                </svg>

                Volver al catálogo
           </button>
          
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* FORMULARIO */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Datos personales */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-black text-neutral-900">
                    Datos personales
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Información necesaria para procesar tu pedido.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nombre"
                  required
                  value={form.firstName}
                  onChange={(value) =>
                    updateField("firstName", value)
                  }
                  placeholder="Tu nombre"
                />

                <Field
                  label="Apellidos"
                  required
                  value={form.lastName}
                  onChange={(value) =>
                    updateField("lastName", value)
                  }
                  placeholder="Tus apellidos"
                />

                <Field
                  label="Carnet de identidad"
                  required
                  value={form.identification}
                  onChange={(value) =>
                    updateField(
                      "identification",
                      value.replace(/\D/g, "").slice(0, 11)
                    )
                  }
                  placeholder="11 dígitos"
                  inputMode="numeric"
                  maxLength={11}
                />

                <Field
                  label="Teléfono móvil"
                  required
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                  placeholder="5xxxxxxx"
                  inputMode="tel"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Correo electrónico"
                    required
                    type="email"
                    value={form.email}
                    onChange={(value) =>
                      updateField("email", value)
                    }
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
            </section>

            {/* Dirección */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2.3" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-black text-neutral-900">
                    Dirección de entrega
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Indica dónde deseas recibir tu pedido.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Provincia"
                  required
                  value={form.province}
                  onChange={() => {}}
                  disabled
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-800">
                    Municipio
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <select
                    required
                    value={form.municipality}
                    onChange={(event) =>
                      updateField(
                        "municipality",
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  >
                    <option value="">
                      Selecciona tu municipio
                    </option>

                    {municipalities.map((municipality) => (
                      <option
                        key={municipality}
                        value={municipality}
                      >
                        {municipality}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Dirección"
                    required
                    value={form.address}
                    onChange={(value) =>
                      updateField("address", value)
                    }
                    placeholder="Calle, número, entre calles..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Referencia"
                    value={form.reference}
                    onChange={(value) =>
                      updateField("reference", value)
                    }
                    placeholder="Punto de referencia cercano"
                  />
                </div>
              </div>
            </section>

            {/* Observaciones */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-black text-neutral-900">
                  Observaciones
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Información adicional para tu pedido.
                </p>
              </div>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                rows={5}
                placeholder="Escribe aquí cualquier indicación adicional..."
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </section>

            {/* Botón */}
            <button
              type="submit"
              disabled={cart.length === 0}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 12.5 10 17l9-10" />
              </svg>

              Confirmar pedido
            </button>
            <button
                type="button"
                onClick={onBackToStore}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path d="M19 12H5" />
                    <path d="m11 18-6-6 6-6" />
                </svg>

                Volver al catálogo
                </button>
          </form>

          {/* RESUMEN */}
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-6 py-5">
                <h2 className="text-lg font-black text-neutral-900">
                  Resumen del pedido
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "producto"
                    : "productos"}
                </p>
              </div>

              <div className="max-h-[500px] overflow-y-auto px-6">
                {cart.map((item) => {
                  const image =
                    Array.isArray(item.product.images) &&
                    item.product.images.length > 0
                      ? item.product.images[0]
                      : null;

                  const itemTotal =
                    Number(item.product.price || 0) *
                    item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-4 border-b border-neutral-100 py-5"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
                        {image ? (
                          <img
                            src={image}
                            alt={item.product.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-8 w-8 text-neutral-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="16"
                              rx="2"
                            />
                            <path d="m3 17 5-5 4 4 3-3 6 5" />
                          </svg>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-neutral-900">
                          {item.product.name}
                        </h3>

                        {item.product.variant && (
                          <p className="mt-1 text-xs text-neutral-500">
                            {item.product.variant}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-neutral-500">
                            Cantidad: {item.quantity}
                          </span>

                          <span className="text-sm font-black text-neutral-900">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 px-6 py-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-neutral-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">
                    Entrega
                  </span>

                  <span className="font-bold text-neutral-900">
                    Por confirmar
                  </span>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-black text-neutral-900">
                      Total
                    </span>

                    <span className="text-2xl font-black text-red-600">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex gap-3">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3 5 6v5c0 4.8 3 8 7 10 4-2 7-5.2 7-10V6l-7-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>

                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Compra segura
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Tus datos serán utilizados únicamente
                    para procesar y entregar tu pedido.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  type = "text",
  inputMode,
  maxLength,
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-neutral-800">
        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}
      </label>

      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
      />
    </div>
  );
}