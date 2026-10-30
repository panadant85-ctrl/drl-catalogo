"use client";

import { FormEvent, useMemo, useState, useEffect, } from "react";
import { useStorefront } from "@/components/storefront/StorefrontProvider";
import {
  createCustomerOrder,
  getCustomerProfile,
} from "@/lib/api";

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
  onUpdateCartQuantity: (
    productId: number,
    quantity: number,
    variant?: string | null
  ) => Promise<void>;
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
  onUpdateCartQuantity,
}: CheckoutProps) {
  const { clearCartGlobal } = useStorefront();
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const [accessToken, setAccessToken] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "delivery" | "pickup"
  >("delivery");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Record<string, unknown> | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);
  const [cartClearWarning, setCartClearWarning] = useState("");
  const [customerProfile, setCustomerProfile] =
    useState<Record<string, unknown> | null>(null);

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

useEffect(() => {
  let cancelled = false;

  async function loadCustomerProfile() {
    try {
      const savedSession = localStorage.getItem(
        "drl_electronik_session"
      );

      if (!savedSession) {
        if (!cancelled) {
          setErrorMessage(
            "Inicia sesión para realizar tu pedido."
          );
        }
        return;
      }

      const session = JSON.parse(savedSession);

      const token =
        session?.session?.accessToken ??
        session?.accessToken;

      if (!token) {
        if (!cancelled) {
          setErrorMessage(
            "Tu sesión no es válida. Inicia sesión nuevamente."
          );
        }
        return;
      }

      const result = await getCustomerProfile(token);

      if (cancelled) return;

      const customer = result?.data ?? result;

      setAccessToken(token);
      setCustomerProfile(customer);

      setForm((current) => ({
        ...current,
        firstName:
          customer.first_name ?? current.firstName,
        lastName:
          [
            customer.last_name_1,
            customer.last_name_2,
          ]
            .filter(Boolean)
            .join(" ") || current.lastName,
        identification:
          customer.identification ?? current.identification,
        phone: customer.phone ?? current.phone,
        email: customer.email ?? current.email,
        province:
          customer.province || current.province || "La Habana",
        municipality:
          customer.municipality ?? current.municipality,
        address:
          customer.address ?? current.address,
      }));
    } catch (error) {
      if (!cancelled) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo cargar tu perfil."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingProfile(false);
      }
    }
  }

  loadCustomerProfile();

  return () => {
    cancelled = true;
  };
}, []);

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setErrorMessage("");

  if (submitting) return;

  if (cart.length === 0) {
    setErrorMessage("El carrito está vacío.");
    return;
  }

  if (!accessToken) {
    setErrorMessage(
      "Inicia sesión nuevamente para realizar tu pedido."
    );
    return;
  }

  const isDelivery = deliveryMethod === "delivery";

  if (
    isDelivery &&
    (!form.address.trim() ||
      !form.municipality.trim() ||
      !form.province.trim())
  ) {
    setErrorMessage(
      "Completa la provincia, el municipio y la dirección de entrega."
    );
    return;
  }

  const fullAddress = isDelivery
    ? [
        form.address.trim(),
        form.municipality.trim(),
        form.province.trim(),
        form.reference.trim()
          ? `Referencia: ${form.reference.trim()}`
          : "",
      ]
          .filter(Boolean)
          .join(", ")
    : null;

  if (fullAddress && fullAddress.length > 500) {
    setErrorMessage(
      "La dirección completa supera los 500 caracteres. Acórtala para continuar."
    );
    return;
  }

  // Copia independiente para la confirmación, el PDF y WhatsApp.
  const itemsSnapshot: CartItem[] = cart.map((item) => ({
    product: { ...item.product },
    quantity: item.quantity,
  }));

  setSubmitting(true);

  try {
    const result = await createCustomerOrder(accessToken, {
      delivery: isDelivery,
      address: fullAddress,
      notes: form.notes.trim() || null,
      items: itemsSnapshot.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        variant: item.product.variant ?? null,
      })),
    });

    const order = result?.data;

    if (!order) {
      throw new Error(
        "El servidor no devolvió la información del pedido."
      );
    }

    // El pedido ya se creó: conservar su información.
    setConfirmedItems(itemsSnapshot);
    setCreatedOrder(order);
    setOrderNumber(
      String(order.order_number ?? order.id ?? "")
    );
    setSubmitted(true);

    // Vaciar el carrito es una operación separada.
    // Si falla, NO considerar fallida la creación del pedido.
    /*try {
      await clearCartGlobal();
      setCartClearWarning("");
    } catch (clearError) {
      console.error(
        "El pedido se creó, pero no se pudo vaciar el carrito:",
        clearError
      );

      setCartClearWarning(
        "Tu pedido se creó correctamente, pero no pudimos vaciar el carrito. No vuelvas a confirmar el mismo pedido. Puedes regresar a la tienda y verificar el carrito."
      );
    }*/
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "No se pudo crear el pedido. Inténtalo nuevamente."
    );
  } finally {
    setSubmitting(false);
  }
}

  
function handleWhatsApp() {
  const confirmedOrderNumber =
    orderNumber || String(createdOrder?.id ?? "");

  const confirmedTotal = Number(
  createdOrder?.total ??
    confirmedItems.reduce(
      (total, item) =>
        total +
        Number(item.product.price ?? 0) * item.quantity,
      0
    )
);

  const productLines = confirmedItems.map((item) => {
  const price = Number(item.product.price ?? 0);
  const itemTotal = price * item.quantity;

      return [
        `- ${item.product.name}`,
        item.product.variant
          ? `  Variante: ${item.product.variant}`
          : "",
        `  Cantidad: ${item.quantity}`,
        `  Precio unitario: $${price.toFixed(2)}`,
        `  Importe: $${itemTotal.toFixed(2)}`,
      ]
        .filter(Boolean)
        .join("\n");
    });

  const address =
    deliveryMethod === "delivery"
      ? [
          form.address.trim(),
          form.municipality.trim(),
          form.province.trim(),
          form.reference.trim()
            ? `Referencia: ${form.reference.trim()}`
            : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "Recogida en tienda";

  const message = [
    "DRL ELECTRONIK",
    "RESUMEN DE PEDIDO",
    "",
    `Pedido: ${confirmedOrderNumber}`,
    `Cliente: ${form.firstName} ${form.lastName}`,
    `Teléfono: ${form.phone}`,
    `Correo: ${form.email}`,
    "",
    "PRODUCTOS:",
    ...productLines,
    "",
    `Total confirmado: $${confirmedTotal.toFixed(2)}`,
    `Modalidad: ${
      deliveryMethod === "delivery"
        ? "Mensajería"
        : "Recogida en tienda"
    }`,
    `Dirección: ${address}`,
    form.notes.trim()
      ? `Observaciones: ${form.notes.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappUrl =
    `https://wa.me/5353020309?text=${encodeURIComponent(message)}`;

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

  if (submitted) {
    const confirmedTotal = Number(
      createdOrder?.total ??
        confirmedItems.reduce(
          (total, item) =>
            total +
            Number(item.product.price ?? 0) * item.quantity,
          0
        )
    );

    const confirmedOrderNumber =
      orderNumber || "Pendiente de verificar";

    const confirmedItemsCount = confirmedItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

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
              ¡Pedido creado correctamente!
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-500">
              Tu pedido ya está registrado en nuestro sistema.
              Guarda el número para consultar o identificar tu pedido.
            </p>

            <div className="mt-8 rounded-2xl bg-neutral-50 p-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-500">
                  Número de pedido
                </span>

                <span className="font-black text-neutral-900">
                  {confirmedOrderNumber}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-neutral-200 pt-4">
                <span className="text-sm text-neutral-500">
                  Productos
                </span>

                <span className="font-bold text-neutral-900">
                  {confirmedItemsCount}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-neutral-200 pt-4">
                <span className="text-sm text-neutral-500">
                  Entrega
                </span>

                <span className="text-right font-bold text-neutral-900">
                  {deliveryMethod === "delivery"
                    ? "Mensajería"
                    : "Recogida en tienda"}
                </span>
              </div>

              {deliveryMethod === "delivery" && (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <span className="text-sm text-neutral-500">
                    Dirección
                  </span>

                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {[
                      form.address,
                      form.municipality,
                      form.province,
                      form.reference
                        ? `Referencia: ${form.reference}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <h2 className="font-bold text-neutral-900">
                    Datos del cliente
                  </h2>

                  <p className="mt-2 text-sm text-neutral-700">
                    Nombre: {form.firstName} {form.lastName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-700">
                    Teléfono: {form.phone}
                  </p>
                  <p className="mt-1 text-sm text-neutral-700">
                    Correo: {form.email}
                  </p>
                </div>

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <h2 className="font-bold text-neutral-900">
                    Detalle de productos
                  </h2>

                  <div className="mt-3 space-y-3">
                    {confirmedItems.map((item, index) => {
                      const price = Number(item.product.price ?? 0);
                      const itemTotal = price * item.quantity;

                      return (
                        <div
                          key={`${item.product.id}-${item.product.variant ?? ""}-${index}`}
                          className="border-b border-neutral-200 pb-3"
                        >
                          <p className="font-semibold text-neutral-900">
                            {item.product.name}
                          </p>

                          {item.product.variant && (
                            <p className="text-sm text-neutral-600">
                              Variante: {item.product.variant}
                            </p>
                          )}

                          <p className="mt-1 text-sm text-neutral-700">
                            Cantidad: {item.quantity}
                          </p>

                          <p className="text-sm text-neutral-700">
                            Precio unitario: ${price.toFixed(2)}
                          </p>

                          <p className="text-sm font-bold text-neutral-900">
                            Importe: ${itemTotal.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {form.notes.trim() && (
                  <div className="mt-4 border-t border-neutral-200 pt-4">
                    <p className="font-bold text-neutral-900">
                      Observaciones
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                      {form.notes}
                    </p>
                  </div>
                )}

              <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
                <span className="font-bold text-neutral-900">
                  Total confirmado
                </span>

                <span className="text-xl font-black text-red-600">
                  ${confirmedTotal.toFixed(2)}
                </span>
              </div>
            </div>
            {cartClearWarning && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800"
              >
                {cartClearWarning}
              </div>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-8 w-full rounded-xl border border-neutral-300 px-7 py-3.5 text-sm font-bold text-neutral-800 transition hover:bg-neutral-50"
            >
              Imprimir o guardar como PDF
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="mt-3 w-full rounded-xl bg-green-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-green-700"
            >
              Enviar pedido por WhatsApp
            </button>
            <button
              type="button"
              onClick={onBackToStore}
              className="mt-3 w-full rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
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
            
            {/* Método de entrega y dirección */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-black text-neutral-900">
                  ¿Cómo deseas recibir tu pedido?
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Selecciona la opción que prefieras.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                    deliveryMethod === "delivery"
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryMethod === "delivery"}
                    onChange={() => setDeliveryMethod("delivery")}
                    className="mt-1 accent-red-600"
                  />

                  <span>
                    <span className="block font-bold text-neutral-900">
                      Mensajería
                    </span>
                    <span className="mt-1 block text-sm text-neutral-500">
                      Recibe tu pedido en la dirección indicada.
                    </span>
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                    deliveryMethod === "pickup"
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="mt-1 accent-red-600"
                  />

                  <span>
                    <span className="block font-bold text-neutral-900">
                      Recogida en tienda
                    </span>
                    <span className="mt-1 block text-sm text-neutral-500">
                      Recoge tu pedido personalmente en la tienda.
                    </span>
                  </span>
                </label>
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="mt-7 border-t border-neutral-100 pt-7">
                  <h3 className="mb-5 font-bold text-neutral-900">
                    Dirección de entrega
                  </h3>

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
                          updateField("municipality", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      >
                        <option value="">Selecciona tu municipio</option>

                        {municipalities.map((municipality) => (
                          <option key={municipality} value={municipality}>
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
                        onChange={(value) => updateField("address", value)}
                        placeholder="Calle, número, entre calles..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field
                        label="Referencia"
                        value={form.reference}
                        onChange={(value) => updateField("reference", value)}
                        placeholder="Punto de referencia cercano"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                    <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
                      Has seleccionado la recogida en tienda. No necesitas completar una dirección de entrega.
                    </div>
                  )}
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
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}
            {/* Botón */}
            <button
              type="submit"
              disabled={cart.length === 0 || submitting || loadingProfile}
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

              {submitting ? "Procesando pedido..." : "Confirmar pedido"}
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
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Disminuir cantidad de ${item.product.name}`}
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                onUpdateCartQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.product.variant ?? null
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-lg font-bold text-neutral-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>

                            <span className="min-w-6 text-center text-sm font-bold text-neutral-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Aumentar cantidad de ${item.product.name}`}
                              disabled={
                                item.product.stock != null &&
                                item.quantity >= Number(item.product.stock)
                              }
                              onClick={() =>
                                onUpdateCartQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.product.variant ?? null
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-lg font-bold text-neutral-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

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