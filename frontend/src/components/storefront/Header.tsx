"use client";

import { useEffect, useState, type FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  loginCustomer,
  registerCustomer,
} from "@/lib/api";

import { useStorefront } from "./StorefrontProvider";

export default function Header() {
  const {
    searchQuery,
    setSearchQuery,
    cartCount,
    loggedIn,
    setLoggedIn,
  } = useStorefront();

  const router = useRouter();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const [accountOpen, setAccountOpen] = useState(false);

  // LOGIN
  const [loginCredential, setLoginCredential] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // USUARIO
  const [profileEmail, setProfileEmail] = useState("");
  const [userInitials, setUserInitials] = useState("PR");
  const [userFullName, setUserFullName] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // REGISTRO
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMethod, setRegisterMethod] = useState<
    "email" | "phone"
  >("email");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] =
    useState("");

  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");

  function handleSearch(value: string) {
    setLocalSearch(value);
    setSearchQuery(value);
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  }

  function normalizePhone(value: string) {
    return value.replace(/[\s().-]/g, "");
  }

  function isValidInternationalPhone(value: string) {
    return /^\+[1-9]\d{7,14}$/.test(
      normalizePhone(value)
    );
  }

  function calculateInitials(fullName: string) {
    if (!fullName.trim()) {
      return "PR";
    }

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name: string) => name.charAt(0))
      .join("")
      .toUpperCase();
  }

  useEffect(() => {
    const savedSession = localStorage.getItem(
      "drl_electronik_session"
    );

    if (!savedSession) {
      return;
    }

    try {
      const sessionData = JSON.parse(savedSession);

      if (sessionData?.user?.id) {
        setLoggedIn(true);

        setProfileEmail(
          sessionData?.user?.email ||
            sessionData?.user?.phone ||
            ""
        );

        const fullName =
          sessionData?.user?.user_metadata?.full_name ||
          sessionData?.user?.user_metadata?.name ||
          "";

        setUserFullName(fullName);

        if (fullName.trim()) {
          setUserInitials(
            calculateInitials(fullName)
          );
        }
      }
    } catch (error) {
      console.error(
        "No se pudo leer la sesión:",
        error
      );
    }
  }, [setLoggedIn]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const credential = loginCredential.trim();

      if (!credential) {
        throw new Error(
          "Introduce tu correo electrónico o número de teléfono."
        );
      }

      const isEmail = credential.includes("@");

      if (isEmail && !isValidEmail(credential)) {
        throw new Error(
          "Introduce un correo electrónico válido."
        );
      }

      if (!isEmail && !isValidInternationalPhone(credential)) {
        throw new Error(
          "Introduce un número de teléfono válido con código internacional. Ejemplo: +5355555555"
        );
      }

      const data = await loginCustomer(
        isEmail
          ? {
              email: credential,
              password: loginPassword,
            }
          : {
              phone: normalizePhone(credential),
              password: loginPassword,
            }
      );

      localStorage.setItem(
        "drl_electronik_session",
        JSON.stringify(data)
      );

      setLoggedIn(true);

      setProfileEmail(
        data?.user?.email ||
          data?.user?.phone ||
          credential
      );

      const fullName =
        data?.user?.user_metadata?.full_name ||
        data?.user?.user_metadata?.name ||
        "";

      setUserFullName(fullName);

      if (fullName.trim()) {
        setUserInitials(
          calculateInitials(fullName)
        );
      } else {
        setUserInitials("PR");
      }

      setUserMenuOpen(false);
      setAccountOpen(false);

      setLoginCredential("");
      setLoginPassword("");
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function openRegister(method: "email" | "phone") {
    setRegisterMethod(method);

    setRegisterEmail("");
    setRegisterPhone("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");

    setRegisterError("");
    setRegisterSuccess("");

    setAccountOpen(false);
    setRegisterOpen(true);
  }

  async function handleRegister() {
    setRegisterError("");
    setRegisterSuccess("");

    const password = registerPassword;
    const confirmPassword =
      registerConfirmPassword;

    if (registerMethod === "email") {
      if (!isValidEmail(registerEmail)) {
        setRegisterError(
          "Introduce un correo electrónico válido."
        );
        return;
      }
    }

    if (registerMethod === "phone") {
      if (!isValidInternationalPhone(registerPhone)) {
        setRegisterError(
          "Introduce un número de teléfono válido con código internacional. Ejemplo: +5355555555"
        );
        return;
      }
    }

    if (password.length < 8) {
      setRegisterError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    setRegisterLoading(true);

    try {
      const result = await registerCustomer(
        registerMethod === "email"
          ? {
              email: registerEmail.trim(),
              password,
              confirmPassword,
            }
          : {
              phone: normalizePhone(registerPhone),
              password,
              confirmPassword,
            }
      );

      /*
       * El backend puede devolver una sesión
       * inmediatamente después del registro.
       *
       * Si existe, la guardamos igual que hacemos
       * después del login.
       */
      if (result?.user?.id) {
        localStorage.setItem(
          "drl_electronik_session",
          JSON.stringify(result)
        );

        setLoggedIn(true);

        setProfileEmail(
          result?.user?.email ||
            result?.user?.phone ||
            (registerMethod === "email"
              ? registerEmail.trim()
              : normalizePhone(registerPhone))
        );

        const fullName =
          result?.user?.user_metadata?.full_name ||
          result?.user?.user_metadata?.name ||
          "";

        setUserFullName(fullName);

        if (fullName.trim()) {
          setUserInitials(
            calculateInitials(fullName)
          );
        } else {
          setUserInitials("PR");
        }
      }

      setRegisterSuccess(
        result?.message ||
          "Cuenta creada correctamente."
      );

      /*
       * Dejamos un pequeño momento para mostrar
       * el mensaje y después vamos al catálogo.
       */
      setTimeout(() => {
        setRegisterOpen(false);

        setRegisterEmail("");
        setRegisterPhone("");
        setRegisterPassword("");
        setRegisterConfirmPassword("");
        setRegisterError("");
        setRegisterSuccess("");

        router.push("/");
      }, 700);
    } catch (error) {
      setRegisterError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta."
      );
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Barra superior */}
      <div className="bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6">
          <span>Bienvenido a DRL Electronik</span>

          <div className="hidden items-center gap-6 sm:flex">
            <span>Compra segura</span>
            <span>Atención al cliente</span>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-sm font-black text-white shadow-sm">
                DRL
              </div>

              <div className="hidden sm:block">
                <div className="text-lg font-black leading-none tracking-tight text-neutral-900">
                  DRL
                </div>

                <div className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  Electronik
                </div>
              </div>
            </div>
          </Link>

          {/* Categorías */}
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:text-red-600 lg:flex"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
            </svg>

            Categorías

            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Buscador desktop */}
          <div className="hidden flex-1 md:block">
            <div className="relative mx-auto max-w-2xl">
              <input
                type="search"
                value={localSearch}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Buscar productos..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3.5 pl-5 pr-14 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
              />

              <button
                type="button"
                aria-label="Buscar productos"
                onClick={() => {
                  document
                    .getElementById("catalogo")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* CUENTA / AVATAR */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (loggedIn) {
                  setUserMenuOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (loggedIn) {
                  setUserMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                aria-label="Mi cuenta"
                onClick={() => {
                  if (!loggedIn) {
                    setLoginError("");
                    setLoginCredential("");
                    setLoginPassword("");
                    setAccountOpen(true);
                  } else {
                    setUserMenuOpen(
                      (open) => !open
                    );
                  }
                }}
                className="flex h-11 items-center gap-2 rounded-xl px-2 text-neutral-700 transition hover:bg-neutral-100 sm:px-3"
              >
                {loggedIn ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
                      {userInitials || "PR"}
                    </div>

                    <div className="text-neutral-800">
                      <span className="hidden max-w-[160px] truncate text-[8px] lg:block">
                        HOLA, {userFullName || "Cliente"}
                      </span>

                      <span className="hidden max-w-[160px] truncate text-[14px] font-semibold lg:block">
                        PEDIDOS Y CUENTAS
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                      />
                      <path d="M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
                    </svg>

                    <span className="hidden text-sm font-semibold lg:block">
                      Cuenta
                    </span>
                  </>
                )}
              </button>

              {/* Fondo visual */}
              {loggedIn && userMenuOpen && (
                <div
                  className="pointer-events-none fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px]"
                  aria-hidden="true"
                />
              )}

              {/* Menú usuario */}
              {loggedIn && userMenuOpen && (
                <div className="absolute right-0 top-12 z-[9999] w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                  <div className="border-b border-neutral-100 px-5 py-4">
                    <p className="text-sm font-bold text-neutral-900">
                      {userFullName || "Cliente"}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {profileEmail ||
                        "Cuenta DRL Electronik"}
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                      className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Mi perfil
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/orders");
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-red-600"
                    >
                      Mis pedidos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/cart");
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-red-600"
                    >
                      Mi carrito
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(
                          "drl_electronik_session"
                        );

                        setLoggedIn(false);
                        setUserMenuOpen(false);
                        setUserFullName("");
                        setUserInitials("PR");
                        setProfileEmail("");
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Favoritos */}
            <button
              type="button"
              aria-label="Favoritos"
              className="hidden h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition hover:bg-neutral-100 sm:flex"
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

            {/* Carrito */}
            <button
              type="button"
              aria-label="Carrito"
              onClick={() => {
                setUserMenuOpen(false);
                router.push("/cart");
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition hover:bg-neutral-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />

                <circle
                  cx="10"
                  cy="20"
                  r="1.3"
                />

                <circle
                  cx="18"
                  cy="20"
                  r="1.3"
                />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <input
              type="search"
              value={localSearch}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              placeholder="Buscar productos..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-4 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white"
            />

            <button
              type="button"
              aria-label="Buscar"
              onClick={() => {
                document
                  .getElementById("catalogo")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-red-600 text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="border-t border-neutral-100">
        <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto px-4 sm:px-6">
          <Link
            href="/"
            className="relative whitespace-nowrap py-4 text-sm font-bold text-red-600"
          >
            Inicio

            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-red-600" />
          </Link>

          <Link
            href="#catalogo"
            className="whitespace-nowrap py-4 text-sm font-semibold text-neutral-600 transition hover:text-red-600"
          >
            Catálogo
          </Link>

          <Link
            href="#destacados"
            className="whitespace-nowrap py-4 text-sm font-semibold text-neutral-600 transition hover:text-red-600"
          >
            Destacados
          </Link>

          <Link
            href="#ofertas"
            className="whitespace-nowrap py-4 text-sm font-semibold text-neutral-600 transition hover:text-red-600"
          >
            Ofertas
          </Link>

          <Link
            href="#contacto"
            className="whitespace-nowrap py-4 text-sm font-semibold text-neutral-600 transition hover:text-red-600"
          >
            Contacto
          </Link>
        </div>
      </nav>

      {/* ====================================================== */}
      {/* MODAL LOGIN / REGISTRO */}
      {/* ====================================================== */}

      {accountOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          {/* Fondo */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() =>
              setAccountOpen(false)
            }
            className="absolute inset-0 bg-black/55"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
            {/* Cerrar */}
            <button
              type="button"
              onClick={() =>
                setAccountOpen(false)
              }
              className="absolute right-4 top-3 z-20 flex h-9 w-9 items-center justify-center text-2xl text-neutral-800 transition hover:text-red-600"
              aria-label="Cerrar"
            >
              ×
            </button>

            {/* Encabezado */}
            <div className="px-6 pb-5 pt-7 text-center">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Mi cuenta
              </h2>

              <div className="mt-1 flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V6Zm5 11H9v-5h6v5Z" />
                </svg>

                Todos los datos están protegidos
              </div>
            </div>

            {/* Contenido */}
            <div className="flex flex-col border-t border-neutral-100 md:flex-row">
              {/* LOGIN */}
              <div className="w-full border-b border-neutral-200 px-8 py-7 md:w-1/2 md:border-b-0 md:border-r">
                <h3 className="text-base font-medium text-neutral-900">
                  Inicia sesión con tu cuenta
                </h3>

                <form
                  onSubmit={handleLogin}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="login-credential"
                      className="mb-2 block text-sm font-semibold text-neutral-700"
                    >
                      Correo electrónico o teléfono
                    </label>

                    <input
                      id="login-credential"
                      type="text"
                      value={loginCredential}
                      onChange={(event) =>
                        setLoginCredential(
                          event.target.value
                        )
                      }
                      placeholder="correo@ejemplo.com o +5355555555"
                      autoComplete="username"
                      required
                      className="w-full rounded-xl border border-neutral-400 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="mb-2 block text-sm font-semibold text-neutral-700"
                    >
                      Contraseña
                    </label>

                    <input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(event) =>
                        setLoginPassword(
                          event.target.value
                        )
                      }
                      placeholder="Contraseña"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-neutral-400 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  {loginError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full rounded-full bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loginLoading
                      ? "Iniciando sesión..."
                      : "Iniciar sesión"}
                  </button>
                </form>
              </div>

              {/* REGISTRO / REDES */}
              <div className="w-full px-8 py-7 md:w-1/2">
                <h3 className="text-base font-medium text-neutral-900">
                  Crea tu cuenta
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  Puedes registrarte usando tu correo electrónico o tu número de teléfono.
                </p>

                <div className="mt-6 space-y-3">
                  {/* EMAIL */}
                  <button
                    type="button"
                    onClick={() =>
                      openRegister("email")
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-500 px-5 py-3 text-sm text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="m4 7 8 6 8-6" />
                    </svg>

                    Crear cuenta con Email
                  </button>

                  {/* TELEFONO */}
                  <button
                    type="button"
                    onClick={() =>
                      openRegister("phone")
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-500 px-5 py-3 text-sm text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="7"
                        y="3"
                        width="10"
                        height="18"
                        rx="2"
                      />

                      <path d="M10 18h4" />
                    </svg>

                    Crear cuenta con teléfono
                  </button>

                  {/* GOOGLE */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-500 px-5 py-3 text-sm text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <span className="text-lg font-bold text-blue-600">
                      G
                    </span>

                    Continuar con Google
                  </button>

                  {/* FACEBOOK */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-500 px-5 py-3 text-sm text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      f
                    </span>

                    Continuar con Facebook
                  </button>

                  {/* APPLE */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-500 px-5 py-3 text-sm text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <span className="text-lg">
                      
                    </span>

                    Continuar con Apple
                  </button>
                </div>
              </div>
            </div>

            {/* Pie */}
            <div className="border-t border-neutral-100 px-6 py-5 text-center text-xs text-neutral-500">
              Al iniciar sesión o continuar, aceptas nuestros{" "}
              <button
                type="button"
                className="font-semibold text-blue-700 hover:underline"
              >
                Términos de uso
              </button>{" "}
              y{" "}
              <button
                type="button"
                className="font-semibold text-blue-700 hover:underline"
              >
                Política de privacidad
              </button>
              .
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* MODAL REGISTRO */}
      {/* ====================================================== */}

      {registerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          {/* Fondo */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() =>
              setRegisterOpen(false)
            }
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            {/* Encabezado */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  DRL Electronik
                </p>

                <h2 className="mt-1 text-2xl font-black text-neutral-900">
                  Crear cuenta
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Regístrate para realizar tus compras y consultar tus pedidos.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRegisterOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            {/* Método */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setRegisterMethod("email");
                  setRegisterError("");
                  setRegisterSuccess("");
                }}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  registerMethod === "email"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Correo electrónico
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisterMethod("phone");
                  setRegisterError("");
                  setRegisterSuccess("");
                }}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  registerMethod === "phone"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Teléfono
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleRegister();
              }}
              className="space-y-5"
            >
              {/* EMAIL */}
              {registerMethod === "email" && (
                <div>
                  <label
                    htmlFor="register-email"
                    className="mb-1.5 block text-sm font-semibold text-neutral-700"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(event) =>
                      setRegisterEmail(
                        event.target.value
                      )
                    }
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              )}

              {/* TELEFONO */}
              {registerMethod === "phone" && (
                <div>
                  <label
                    htmlFor="register-phone"
                    className="mb-1.5 block text-sm font-semibold text-neutral-700"
                  >
                    Número de teléfono
                  </label>

                  <input
                    id="register-phone"
                    type="tel"
                    value={registerPhone}
                    onChange={(event) =>
                      setRegisterPhone(
                        event.target.value
                      )
                    }
                    required
                    autoComplete="tel"
                    autoFocus
                    placeholder="+5355555555"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  />

                  <p className="mt-2 text-xs text-neutral-500">
                    Utiliza el código internacional. Ejemplo: +5355555555
                  </p>
                </div>
              )}

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-1.5 block text-sm font-semibold text-neutral-700"
                >
                  Contraseña
                </label>

                <input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(event) =>
                    setRegisterPassword(
                      event.target.value
                    )
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-1.5 block text-sm font-semibold text-neutral-700"
                >
                  Confirmar contraseña
                </label>

                <input
                  id="register-confirm-password"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(event) =>
                    setRegisterConfirmPassword(
                      event.target.value
                    )
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                />
              </div>

              {/* ERROR */}
              {registerError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {registerError}
                </div>
              )}

              {/* ÉXITO */}
              {registerSuccess && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {registerSuccess}
                </div>
              )}

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerLoading
                  ? "Creando cuenta..."
                  : "Crear cuenta"}
              </button>

              {/* LOGIN */}
              <p className="text-center text-sm text-neutral-600">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setRegisterOpen(false);

                    setLoginError("");
                    setLoginCredential("");
                    setLoginPassword("");

                    setAccountOpen(true);
                  }}
                  className="font-semibold text-red-600 hover:text-red-700"
                >
                  Iniciar sesión
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}