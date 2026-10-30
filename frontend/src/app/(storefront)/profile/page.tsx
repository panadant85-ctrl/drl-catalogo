"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCustomerProfile,
  updateCustomerProfile,
  linkCustomerToManager,
} from "@/lib/api";

type CustomerProfile = {
  id?: number;
  full_name?: string | null;
  first_name?: string | null;
  last_name_1?: string | null;
  last_name_2?: string | null;
  identification?: string | null;
  email?: string | null;
  phone?: string | null;
  province?: string | null;
  municipality?: string | null;
  address?: string | null;
  manager_id?: string | null;
};

type CustomerOrderItem = {
  id: number;
  product_id?: number;
  product_name?: string | null;
  name?: string | null;
  quantity: number;
  price?: number | string | null;
  unit_price?: number | string | null;
  variant?: string | null;
  product?: {
    name?: string | null;
    images?: string[] | null;
  } | null;
};

type CustomerOrder = {
  id: number;
  order_number?: string | null;
  created_at?: string | null;
  status?: string | null;
  total?: number | string | null;
  total_amount?: number | string | null;
  items?: CustomerOrderItem[];
};

type MenuItem = {
  label: string;
  icon: string;
  section?: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Tus pedidos",
    icon: "orders",
    section: "orders",
  },
  {
    label: "Tus reseñas",
    icon: "reviews",
    section: "reviews",
  },
  {
    label: "Tu perfil",
    icon: "profile",
    section: "profile",
  },
  {
    label: "Cupones y ofertas",
    icon: "coupons",
    section: "coupons",
  },
  {
    label: "Saldo de crédito",
    icon: "credit",
    section: "credit",
  },
  {
    label: "Tiendas que sigues",
    icon: "stores",
    section: "stores",
  },
  {
    label: "Historial de navegación",
    icon: "history",
    section: "history",
  },
  {
    label: "Direcciones",
    icon: "address",
    section: "address",
  },
  {
    label: "País/región e idioma",
    icon: "language",
    section: "language",
  },
  {
    label: "Métodos de pago",
    icon: "payment",
    section: "payment",
  },
  {
    label: "Seguridad de la cuenta",
    icon: "security",
    section: "security",
  },
  {
    label: "Permisos",
    icon: "permissions",
    section: "permissions",
  },
  {
    label: "Notificaciones",
    icon: "notifications",
    section: "notifications",
  },
];

const HAVANA_MUNICIPALITIES = [
  "Arroyo Naranjo",
  "Boyeros",
  "Centro Habana",
  "Cerro",
  "Cotorro",
  "Diez de Octubre",
  "Guanabacoa",
  "Habana del Este",
  "Habana Vieja",
  "La Lisa",
  "Marianao",
  "Playa",
  "Plaza de la Revolución",
  "Regla",
  "San Miguel del Padrón",
];

function getAccessToken() {
  const savedSession = localStorage.getItem(
    "drl_electronik_session"
  );

  if (!savedSession) {
    return null;
  }

  try {
    const sessionData = JSON.parse(savedSession);

    return (
      sessionData?.session?.accessToken ||
      null
    );
  } catch {
    return null;
  }
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "DR";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[1].charAt(0)
  ).toUpperCase();
}

function MenuIcon({
  type,
}: {
  type: string;
}) {
  const common = "h-5 w-5 flex-none";

  switch (type) {
    case "orders":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="3"
          />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "reviews":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M12 3l2.7 5.5L21 9.4l-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.4l6.3-.9L12 3Z" />
        </svg>
      );

    case "profile":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
        </svg>
      );

    case "coupons":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z" />
          <path d="M9 9h6M9 15h6" />
        </svg>
      );

    case "credit":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
          />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );

    case "stores":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M4 10h16v10H4z" />
          <path d="M3 10l2-6h14l2 6" />
          <path d="M8 14h3v6H8z" />
        </svg>
      );

    case "history":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
          <path d="M3 12H1" />
        </svg>
      );

    case "address":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );

    case "language":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
      );

    case "payment":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
          />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );

    case "security":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M12 3l8 3v5c0 5.2-3.3 8.8-8 10-4.7-1.2-8-4.8-8-10V6l8-3Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );

    case "permissions":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M12 3l8 3v5c0 5.2-3.3 8.8-8 10-4.7-1.2-8-4.8-8-10V6l8-3Z" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      );

    case "notifications":
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
          <path d="M10 21h4" />
        </svg>
      );

    default:
      return null;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [managerCode, setManagerCode] = useState("");
  const [linkingManager, setLinkingManager] = useState(false);
  const [managerError, setManagerError] = useState("");
  const [managerSuccess, setManagerSuccess] = useState("");
  const [linkedManagerName, setLinkedManagerName] = useState("");
  const [profile, setProfile] =
    useState<CustomerProfile | null>(null);
  const [ordersRetry, setOrdersRetry] = useState(0);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  
  const [identification, setIdentification] =
    useState("");

  const [activeSection, setActiveSection] =
    useState("profile");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName1, setLastName1] =
    useState("");

  const [lastName2, setLastName2] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [province, setProvince] =
    useState("");

  const [municipality, setMunicipality] =
    useState("");

  const [address, setAddress] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      const accessToken = getAccessToken();

      if (!accessToken) {
        router.replace("/");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result =
          await getCustomerProfile(
            accessToken
          );

       const customer =
            result?.data ?? result;

          setProfile(customer);
          setIdentification(
              customer?.identification ?? ""
            );
          setFirstName(
            customer?.first_name ?? ""
          );

          setLastName1(
            customer?.last_name_1 ?? ""
          );

          setLastName2(
            customer?.last_name_2 ?? ""
          );

          setEmail(
            customer?.email ?? ""
          );

          setPhone(
            customer?.phone ?? ""
          );

          setProvince(
            customer?.province ?? ""
          );

          setMunicipality(
            customer?.municipality ?? ""
          );

          setAddress(
            customer?.address ?? ""
          );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar tu perfil."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  
useEffect(() => {
  if (activeSection !== "orders" || ordersLoaded) {
    return;
  }

  async function loadOrders() {
    const accessToken = getAccessToken();

    if (!accessToken) {
      router.replace("/");
      return;
    }

    try {
      setOrdersLoading(true);
      setOrdersError("");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/auth/me/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "No se pudieron cargar tus pedidos."
        );
      }

      setOrders(
        Array.isArray(result.data) ? result.data : []
      );

      setOrdersLoaded(true);
    } catch (err) {
      setOrdersError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar tus pedidos."
      );
    } finally {
      setOrdersLoading(false);
    }
  }

  loadOrders();
}, [activeSection, ordersLoaded, ordersRetry, router]);

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const accessToken = getAccessToken();

    if (!accessToken) {
      router.replace("/");
      return;
    }
    const cleanIdentification =
      identification.trim();
    const cleanFirstName =
      firstName.trim();

    const cleanLastName1 =
      lastName1.trim();

    const cleanLastName2 =
      lastName2.trim();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result =
        await updateCustomerProfile(
          accessToken,
          {
            first_name:
              cleanFirstName,

            last_name_1:
              cleanLastName1,

            last_name_2:
              cleanLastName2,

            identification:
              cleanIdentification || null,
            email:
              email.trim() || null,

            phone:
              phone.trim() || null,

            province:
              province.trim() || null,

            municipality:
              municipality.trim() || null,

            address:
              address.trim() || null,
          }
        );

      const updated =
        result?.data ?? result;

      setProfile(updated);
      setIdentification(
        updated?.identification ??
          cleanIdentification
      );
      setFirstName(
        updated?.first_name ??
          cleanFirstName
      );

      setLastName1(
        updated?.last_name_1 ??
          cleanLastName1
      );

      setLastName2(
        updated?.last_name_2 ??
          cleanLastName2
      );

      setEmail(
        updated?.email ??
          email.trim()
      );

      setPhone(
        updated?.phone ??
          phone.trim()
      );

      setProvince(
        updated?.province ??
          province.trim()
      );

      setMunicipality(
        updated?.municipality ??
          municipality.trim()
      );

      setAddress(
        updated?.address ??
          address.trim()
      );

      setSuccess(
        "Tus datos se actualizaron correctamente."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los cambios."
      );
    } finally {
      setSaving(false);
    }
  }

  
async function handleLinkManager(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const accessToken = getAccessToken();

  if (!accessToken) {
    router.replace("/");
    return;
  }

  if (profile?.manager_id) {
    setManagerError(
      "Tu cuenta ya tiene un gestor vinculado."
    );
    return;
  }

  if (!managerCode.trim()) {
    setManagerError(
      "Introduce el código del gestor."
    );
    return;
  }

  try {
    setLinkingManager(true);
    setManagerError("");
    setManagerSuccess("");

    const result = await linkCustomerToManager(
      accessToken,
      managerCode
    );

    const customer = result?.data?.customer;
    const manager = result?.data?.manager;

    setProfile((current) =>
      current
        ? {
            ...current,
            manager_id:
              customer?.manager_id ??
              manager?.id ??
              null,
          }
        : current
    );

    setLinkedManagerName(
      manager?.full_name ?? ""
    );

    setManagerCode("");

    setManagerSuccess(
      `Gestor vinculado correctamente${
        manager?.full_name
          ? `: ${manager.full_name}`
          : ""
      }.`
    );
  } catch (err) {
    setManagerError(
      err instanceof Error
        ? err.message
        : "No se pudo vincular el gestor."
    );
  } finally {
    setLinkingManager(false);
  }
}


  const displayName =
    profile?.full_name ||
    [
      firstName,
      lastName1,
      lastName2,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Mi cuenta";

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-5 w-40 rounded bg-neutral-100" />
            <div className="mt-8 h-10 w-72 rounded bg-neutral-100" />
            <div className="mt-10 h-80 rounded-2xl bg-neutral-50" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Link
              href="/"
              className="transition hover:text-red-600"
            >
              Inicio
            </Link>

            <span>›</span>

            <span className="text-neutral-500">
              Mi cuenta
            </span>

            <span>›</span>

            <span className="font-medium text-neutral-900">
              Perfil
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:flex-row lg:px-8">
        {/* SIDEBAR */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
            {menuItems.map((item) => {
              const active =
                activeSection === item.section;

              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => {
                    setActiveSection(
                      item.section ||
                        "profile"
                    );
                  }}
                  className={[
                    "flex w-full items-center gap-3 border-l-4 px-4 py-3.5 text-left text-sm transition",
                    active
                      ? "border-red-500 bg-red-50/60 font-semibold text-neutral-900"
                      : "border-transparent text-neutral-700 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  <MenuIcon type={item.icon} />

                  <span>
                    {item.label}
                  </span>

                  {item.section ===
                    "orders" && (
                    <span className="ml-auto text-neutral-400">
                      ›
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Carrito */}
          <button
            type="button"
            onClick={() => {
              router.push("/cart");
            }}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3.5 text-left text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
              <circle
                cx="10"
                cy="20"
                r="1"
              />
              <circle
                cx="18"
                cy="20"
                r="1"
              />
            </svg>

            Mi carrito
          </button>
        </aside>

        {/* CONTENIDO */}
        <section className="min-w-0 flex-1">
          {/* Cabecera */}
          <div className="border-b border-neutral-200 pb-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white">
                {getInitials(
                  displayName
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight">
                    {displayName}
                  </h1>

                  <span className="text-neutral-400">
                    ↗
                  </span>
                </div>

                <p className="mt-1 text-sm text-neutral-500">
                  {profile?.email ||
                    email ||
                    "Cuenta de cliente"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-green-600">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>

              Tu información y privacidad se
              mantienen seguras.
            </div>
          </div>

          {/* PERFIL */}
          {activeSection ===
            "profile" && (
            <div className="pt-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">
                  Tu perfil
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Administra tus datos personales
                  y de contacto.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {success}
                </div>
              )}

              <form
                onSubmit={handleSave}
                className="space-y-6"
              >
                {/* Nombres */}
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-700">
                      Nombre
                    </label>

                    <input
                      type="text"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(
                          event.target.value
                        )
                      }
                      required
                      autoComplete="given-name"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      placeholder="Nombre"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-700">
                      Primer apellido
                    </label>

                    <input
                      type="text"
                      value={lastName1}
                      onChange={(event) =>
                        setLastName1(
                          event.target.value
                        )
                      }
                      required
                      autoComplete="family-name"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      placeholder="Primer apellido"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-700">
                      Segundo apellido
                    </label>

                    <input
                      type="text"
                      value={lastName2}
                      onChange={(event) =>
                        setLastName2(
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      placeholder="Segundo apellido"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                {/* Teléfono + CI */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-700">
                      Teléfono
                    </label>

                    <input
                      type="text"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      placeholder="5XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-700">
                      Carnet de identidad
                    </label>

                    <input
                      type="text"
                      value={identification}
                      onChange={(event) =>
                        setIdentification(event.target.value)
                      }
                      maxLength={11}
                      autoComplete="off"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      placeholder="Introduce tu carnet de identidad"
                    />
                  </div>
                </div>
                {/* Ubicación */}
                <div className="grid gap-5 md:grid-cols-2">
                  <select
                    value={province}
                    onChange={(event) => {
                      setProvince(event.target.value);
                      setMunicipality("");
                    }}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  >
                    <option value="">
                      Selecciona una provincia
                    </option>
                    <option value="La Habana">
                      La Habana
                    </option>
                  </select>

                  <select
                    value={municipality}
                    onChange={(event) =>
                      setMunicipality(event.target.value)
                    }
                    required
                    disabled={!province}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-neutral-50"
                  >
                    <option value="">
                      Selecciona un municipio
                    </option>

                    {province === "La Habana" &&
                      HAVANA_MUNICIPALITIES.map((municipio) => (
                        <option
                          key={municipio}
                          value={municipio}
                        >
                          {municipio}
                        </option>
                      ))}
                  </select>
                </div>
                {/* Dirección */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">
                    Dirección
                  </label>

                  <textarea
                    value={address}
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    placeholder="Tu dirección"
                  />
                </div>

                <div className="flex justify-end border-t border-neutral-100 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          )}


{/* CUPONES Y OFERTAS */}
{activeSection === "coupons" && (
  <div className="pt-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold">
        Cupones y ofertas
      </h2>

      <p className="mt-2 text-sm text-neutral-500">
        Introduce el código de tu gestor para
        vincularlo a tu cuenta DRL Electronik.
      </p>
    </div>

    {profile?.manager_id ? (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </div>

          <div>
            <h3 className="font-bold text-green-800">
              Ya tienes un gestor vinculado
            </h3>

            <p className="mt-2 text-sm text-green-700">
              {linkedManagerName
                ? `Gestor: ${linkedManagerName}`
                : "Tu cuenta ya está vinculada a un gestor."}
            </p>

            <p className="mt-1 text-xs text-green-700">
              La vinculación no se puede cambiar
              desde esta sección.
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className="max-w-2xl rounded-2xl border border-neutral-200 p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold">
            Vincular código de gestor
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Si un gestor te proporcionó un código,
            introdúcelo aquí para asociarlo a tu
            cuenta.
          </p>
        </div>

        {managerError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {managerError}
          </div>
        )}

        {managerSuccess && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {managerSuccess}
          </div>
        )}

        <form
          onSubmit={handleLinkManager}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="manager-code"
              className="mb-2 block text-sm font-semibold text-neutral-700"
            >
              Código del gestor
            </label>

            <input
              id="manager-code"
              type="text"
              value={managerCode}
              onChange={(event) => {
                setManagerCode(event.target.value);
                setManagerError("");
                setManagerSuccess("");
              }}
              autoComplete="off"
              required
              maxLength={100}
              disabled={linkingManager}
              placeholder="Introduce el código"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm uppercase outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50 disabled:bg-neutral-50"
            />

            <p className="mt-2 text-xs text-neutral-400">
              Comprueba el código antes de confirmar.
              Una vez vinculado, no podrás cambiarlo
              desde aquí.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              linkingManager ||
              !managerCode.trim()
            }
            className="rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {linkingManager
              ? "Vinculando..."
              : "Vincular gestor"}
          </button>
        </form>
      </div>
    )}
  </div>
)}


{/* TUS PEDIDOS */}
{activeSection === "orders" && (
  <div className="pt-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold">
        Tus pedidos
      </h2>

      <p className="mt-2 text-sm text-neutral-500">
        Consulta tus compras, sus artículos y el estado de cada pedido.
      </p>
    </div>

    {ordersLoading && (
      <div className="rounded-2xl border border-neutral-200 p-8 text-center">
        <p className="text-sm text-neutral-500">
          Cargando tus pedidos...
        </p>
      </div>
    )}

    {ordersError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">
          {ordersError}
        </p>

        <button
          type="button"
          onClick={() => {
            setOrdersError("");
            setOrdersRetry((current) => current + 1);
          }}
          className="mt-3 text-sm font-bold text-red-700 underline"
        >
          Intentar nuevamente
        </button>
      </div>
    )}

    {!ordersLoading &&
      !ordersError &&
      ordersLoaded &&
      orders.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <MenuIcon type="orders" />
          </div>

          <h3 className="mt-4 text-lg font-bold">
            Todavía no tienes pedidos
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Cuando realices una compra, aparecerá aquí.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Explorar catálogo
          </Link>
        </div>
      )}

    {ordersLoaded &&
    !ordersLoading &&
    !ordersError &&
    orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => {
            const items = Array.isArray(order.items)
              ? order.items
              : [];

            const total = Number(
              order.total ?? order.total_amount ?? 0
            );

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-neutral-200"
              >
                <div className="flex flex-col gap-3 border-b border-neutral-100 bg-neutral-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold">
                      {order.order_number}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {order.created_at
                        ? new Date(
                            order.created_at
                          ).toLocaleDateString("es", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Fecha no disponible"}
                    </p>
                  </div>
                  <span
                    className={[
                      "w-fit rounded-full px-3 py-1.5 text-sm font-semibold",
                      order.status === "nuevo"
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : order.status === "confirmado"
                          ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                          : order.status === "preparando"
                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                            : order.status === "entregado"
                              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                              : order.status === "cancelado"
                                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                : "bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200",
                    ].join(" ")}
                  >
                    {order.status || "Estado pendiente"}
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  {items.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No hay artículos disponibles para mostrar.
                    </p>
                  ) : (
                    items.map((item, index) => {
                      const productName =
                        item.product_name ||
                        item.product?.name ||
                        item.name ||
                        (item.product_id
                          ? `Producto #${item.product_id}`
                          : "Producto");

                      const unitPrice = Number(
                        item.price ?? item.unit_price ?? 0
                      );

                      return (
                        <div
                          key={item.id ?? `${order.id}-${index}`}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-800">
                              {productName}
                            </p>

                            {item.variant && (
                              <p className="mt-1 text-xs text-neutral-500">
                                Variante: {item.variant}
                              </p>
                            )}

                            <p className="mt-1 text-sm text-neutral-500">
                              Cantidad: {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold">
                            {(unitPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })
                  )}

                  <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
                    <span className="font-semibold">
                      Total del pedido
                    </span>

                    <span className="text-lg font-black">
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
  </div>
)}

{/* OTRAS SECCIONES */}
{activeSection !== "profile" &&
  activeSection !== "coupons" && 
  activeSection !== "orders" && (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <MenuIcon
            type={
              menuItems.find(
                (item) =>
                  item.section === activeSection
              )?.icon || "profile"
            }
          />
        </div>

        <h2 className="mt-5 text-xl font-bold">
          {
            menuItems.find(
              (item) =>
                item.section === activeSection
            )?.label
          }
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Esta sección la implementaremos en el
          siguiente paso.
        </p>
      </div>
    </div>
  )}

          
        </section>
      </div>
    </main>
  );
}