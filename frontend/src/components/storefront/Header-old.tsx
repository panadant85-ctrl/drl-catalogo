"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loginCustomer,
  getCustomerProfile,
  registerCustomer,
} from "@/lib/api";

import { useStorefront } from "./StorefrontProvider";
import { useRouter } from "next/navigation";



export default function Header() {
  const {
     searchQuery,
    setSearchQuery,
    cartCount,
    cartOpen,
    setCartOpen,
    loggedIn,
    setLoggedIn,
  } = useStorefront(); 

  const router = useRouter();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [accountOpen, setAccountOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [userInitials, setUserInitials] = useState("PR");
  const [userFullName, setUserFullName] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [registerOpen, setRegisterOpen] = useState(false);

const [registerFirstName, setRegisterFirstName] = useState("");
const [registerLastName, setRegisterLastName] = useState("");
const [registerIdentification, setRegisterIdentification] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPhone, setRegisterPhone] = useState("");
const [registerProvince, setRegisterProvince] = useState("La Habana");
const [registerMunicipality, setRegisterMunicipality] = useState("");
const [registerAddress, setRegisterAddress] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

const [registerError, setRegisterError] = useState("");
const [registerLoading, setRegisterLoading] = useState(false);
const [registerSuccess, setRegisterSuccess] = useState("");

const [emailRegisterMode, setEmailRegisterMode] =
  useState(false);

const [emailRegisterStep, setEmailRegisterStep] =
  useState<"email" | "password">("email");

const [registerEmailPassword, setRegisterEmailPassword] =
  useState("");
  
  function handleSearch(value: string) {
  setLocalSearch(value);
  setSearchQuery(value);
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
                setProfileEmail(sessionData?.user?.email || email);
                const fullName =
                  sessionData?.user?.user_metadata?.full_name ||
                  sessionData?.user?.user_metadata?.name ||
                  "";
                  setUserFullName(fullName);
                  console.log("NOMBRE RECIBIDO PARA AVATAR:", fullName);

                if (fullName.trim()) {
                  const initials = fullName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((name: string) => name.charAt(0))
                    .join("")
                    .toUpperCase();

                    console.log("INICIALES CALCULADAS:", initials);

                  setUserInitials(initials);
                }
              }
            } catch (error) {
              console.error(
                "No se pudo leer la sesión:",
                error
              );
            }
          }, []);

  async function handleLogin(
      event: React.FormEvent<HTMLFormElement>
    ) 
    {
      console.log("INTENTO DE LOGIN");
      event.preventDefault();

      setLoginError("");
      setLoginLoading(true);

      try {
        console.log("ENVIANDO LOGIN AL BACKEND", email);
        const data = await loginCustomer(
          
          email,
          password
        );

        console.log("RESPUESTA DEL LOGIN:", data);
        
        console.log("LOGIN CORRECTO:", data);

        localStorage.setItem(
          "drl_electronik_session",
          JSON.stringify(data)
        );
        setLoggedIn(true);

        setProfileEmail(
                data?.user?.email || email
              );

        /* */

        const fullName =
              data?.user?.user_metadata?.full_name ||
              data?.user?.user_metadata?.name ||
              "";
              setUserFullName(fullName);
            console.log("NOMBRE RECIBIDO PARA AVATAR:", fullName);

            if (fullName.trim()) {
              const initials = fullName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((name: string) => name.charAt(0))
                .join("")
                .toUpperCase();

              console.log("INICIALES CALCULADAS:", initials);

              setUserInitials(initials);
            }

        /* */
        
        setLoggedIn(true);
        setUserMenuOpen(false);
        setAccountOpen(false);
        
        setPassword("");
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
    
    /** */
    function isValidEmail(value: string) 
    {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          value.trim()
        );
      }

      function handleContinueWithEmail() {
        if (!isValidEmail(email)) {
          return;
        }

        setLoginError("");
        setEmailRegisterStep("password");
        setRegisterEmailPassword("");
    }
    /** */
    const handleRegister = async () => {
          setRegisterError("");
          setRegisterSuccess("");
          setRegisterLoading(true);

          try {
            const result = await registerCustomer({
              firstName: registerFirstName,
              lastName: registerLastName,
              identification: registerIdentification,
              email: registerEmail,
              phone: registerPhone,
              province: registerProvince,
              municipality: registerMunicipality,
              address: registerAddress,
              password: registerPassword,
              confirmPassword: registerConfirmPassword,
            });

            setRegisterSuccess(
              result?.message ||
                "Cuenta creada correctamente."
            );

            setRegisterFirstName("");
            setRegisterLastName("");
            setRegisterIdentification("");
            setRegisterEmail("");
            setRegisterPhone("");
            setRegisterProvince("La Habana");
            setRegisterMunicipality("");
            setRegisterAddress("");
            setRegisterPassword("");
            setRegisterConfirmPassword("");
          } catch (error) {
            setRegisterError(
              error instanceof Error
                ? error.message
                : "No se pudo crear la cuenta."
            );
          } finally {
            setRegisterLoading(false);
          }
        };
  async function handleOpenProfile() 
    {
        setProfileError("");
        setProfileLoading(true);
        setUserMenuOpen(false);

        try {
          const savedSession = localStorage.getItem(
            "drl_electronik_session"
          );

          if (!savedSession) {
            throw new Error(
              "No hay una sesión activa."
            );
          }

          const sessionData = JSON.parse(
            savedSession
          );

          const accessToken =
            sessionData?.session?.accessToken;

          if (!accessToken) {
            throw new Error(
              "La sesión no contiene un token válido."
            );
          }

          const data = await getCustomerProfile(
            accessToken
          );

          console.log(
            "PERFIL DEL CLIENTE:",
            data
          );

          setCustomerProfile(data?.data || null);
          setProfileOpen(true);
        } catch (error) {
          console.error(
            "ERROR CARGANDO PERFIL:",
            error
          );

          setProfileError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el perfil."
          );

          setProfileOpen(true);
        } finally {
          setProfileLoading(false);
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
          <Link href="/" className="shrink-0">
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
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
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
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3.5 pl-5 pr-14 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
              />

              <button
                type="button"
                aria-label="Buscar productos"
                onClick={() => {
                  document
                    .getElementById("catalogo")
                    ?.scrollIntoView({ behavior: "smooth" });
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
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
           
               {/* FONDO OSCURO */}
{loggedIn && userMenuOpen && (
  <div
    className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px]"
    aria-hidden="true"
  />
)}

{/* CUENTA / AVATAR + MENÚ */}
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
        setAccountOpen(true);
      }
    }}
    className="flex h-11 items-center gap-2 rounded-xl px-2 text-neutral-700 transition hover:bg-neutral-100 sm:px-3"
  >
    {loggedIn ? (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
          {userInitials}
        </div>

        <span className="max-w-[160px] truncate text-sm font-semibold text-neutral-800">
          {userFullName}
        </span>
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
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
        </svg>

        <span className="hidden text-sm font-semibold lg:block">
          Cuenta
        </span>
      </>
    )}
  </button>

  {loggedIn && userMenuOpen && (
    <div className="absolute right-0 top-11 z-[9999] w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
          Mi cuenta
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-neutral-900">
          {profileEmail}
        </p>
      </div>

      <div className="p-2">
        <Link
          href="/profile"
          onClick={() => setUserMenuOpen(false)}
          className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
        >
          Mi perfil
        </Link>

        <button
          type="button"
          className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
        >
          Mis pedidos
        </button>

        <button
          type="button"
          onClick={() => {
            setUserMenuOpen(false);
            router.push("/cart");
          }}
          className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
        >
          Mi carrito
        </button>
      </div>

      <div className="border-t border-neutral-100 p-2">
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("drl_electronik_session");
            setLoggedIn(false);
            setUserMenuOpen(false);
            setProfileEmail("");
            setUserFullName("");
            setEmail("");
            setPassword("");
          }}
          className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )}
</div>
           
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
                <circle cx="10" cy="20" r="1.3" />
                <circle cx="18" cy="20" r="1.3" />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                    {cartCount > 99 ? "99+" : cartCount}
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
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Buscar productos..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-4 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:bg-white"
            />

            <button
              type="button"
              aria-label="Buscar"
              onClick={() => {
                document
                  .getElementById("catalogo")
                  ?.scrollIntoView({ behavior: "smooth" });
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
                <circle cx="11" cy="11" r="7" />
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
        {accountOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
                      {/* Fondo */}
                      <button
                        type="button"
                        aria-label="Cerrar"
                        onClick={() => setAccountOpen(false)}
                        className="absolute inset-0 bg-black/55"
                      />

                      {/* Modal */}
                      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
                        {/* Cerrar */}
                        <button
                          type="button"
                          onClick={() => setAccountOpen(false)}
                          className="absolute right-4 top-3 z-20 flex h-9 w-9 items-center justify-center text-2xl text-neutral-800 transition hover:text-red-600"
                          aria-label="Cerrar"
                        >
                          ×
                        </button>
                      
                        {/* Encabezado */}
                        <div className="px-6 pb-5 pt-7 text-center">
                          <h2 className="text-2xl font-semibold text-neutral-900">
                            Iniciar sesión
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
                       

                        {/* Contenido DEL MODAL*/}
                        <div className="flex flex-col border-t border-neutral-100 md:flex-row">

                          {/* PARTE IZQUIERDA DEL MODAL */}
                        <div className="w-full border-b border-neutral-200 px-8 py-7 md:w-1/2 md:border-b-0 md:border-r">

                          {!emailRegisterMode ? (
                            <>
                              <h3 className="text-base font-medium text-neutral-900">
                                Inicia sesión con tu cuenta
                              </h3>

                              <form
                                onSubmit={handleLogin}
                                className="mt-6 space-y-4"
                              >
                                {/* USUARIO / EMAIL */}
                                <div>
                                  <label
                                    htmlFor="login-email"
                                    className="mb-2 block text-sm font-semibold text-neutral-700"
                                  >
                                    Usuario
                                  </label>

                                  <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                      setEmail(event.target.value)
                                    }
                                    placeholder="Correo electrónico"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-neutral-400 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                  />
                                </div>

                                {/* CONTRASEÑA */}
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
                                    value={password}
                                    onChange={(event) =>
                                      setPassword(event.target.value)
                                    }
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                    required
                                    className="w-full rounded-xl border border-neutral-400 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                  />
                                </div>

                                {/* ERROR */}
                                {loginError && (
                                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {loginError}
                                  </div>
                                )}

                                {/* BOTÓN */}
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

                              <div className="mt-5 flex justify-center gap-4 text-xs text-neutral-500">
                                <button
                                  type="button"
                                  className="transition hover:text-red-600"
                                >
                                  Eliminar cuenta
                                </button>

                                <span>|</span>

                                <button
                                  type="button"
                                  className="transition hover:text-red-600"
                                >
                                  ¿Problemas al iniciar sesión?
                                </button>
                              </div>
                            </>
                          ) : emailRegisterStep === "email" ? (
                            <>
                              <h3 className="text-base font-medium text-neutral-900">
                                Crear cuenta
                              </h3>

                              <div className="mt-6 space-y-4">
                                <div>
                                  <label
                                    htmlFor="register-email-step"
                                    className="mb-2 block text-sm font-semibold text-neutral-700"
                                  >
                                    Email
                                  </label>

                                  <input
                                    id="register-email-step"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                      setEmail(event.target.value)
                                    }
                                    placeholder="Correo electrónico"
                                    autoComplete="email"
                                    autoFocus
                                    className="w-full rounded-xl border border-neutral-400 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={handleContinueWithEmail}
                                  disabled={!isValidEmail(email)}
                                  className="w-full rounded-full bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                                >
                                  Continuar
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h3 className="text-base font-medium text-neutral-900">
                                Crear cuenta
                              </h3>

                              <div className="mt-6 space-y-4">
                                <div>
                                  <label
                                    htmlFor="register-email-password"
                                    className="mb-2 block text-sm font-semibold text-neutral-700"
                                  >
                                    Contraseña
                                  </label>

                                  <input
                                    id="register-email-password"
                                    type="password"
                                    value={registerEmailPassword}
                                    onChange={(event) =>
                                      setRegisterEmailPassword(event.target.value)
                                    }
                                    placeholder="Crea una contraseña"
                                    autoComplete="new-password"
                                    autoFocus
                                    className="w-full rounded-xl border border-neutral-400 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRegisterEmail(email);
                                    setRegisterPassword(registerEmailPassword);
                                    setRegisterConfirmPassword(registerEmailPassword);

                                    setAccountOpen(false);
                                    setRegisterError("");
                                    setRegisterSuccess("");
                                    setRegisterOpen(true);
                                  }}
                                  disabled={registerEmailPassword.length < 8}
                                  className="w-full rounded-full bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                                >
                                  Registrarme
                                </button>
                              </div>
                            </>
                          )}

                        </div>

                          {/* NUEVA CUENTA PARTE DERECHA DEL MODAL */}
                          <div className="w-full px-8 py-7 md:w-1/2">
                            <h3 className="text-base font-medium text-neutral-900">
                              Regístrate/inicia sesión con otra cuenta
                            </h3>

                            <div className="mt-6 space-y-3">
                              {/* EMAIL */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEmailRegisterMode(true);
                                  setEmailRegisterStep("email");
                                  setEmail("");
                                  setRegisterEmailPassword("");
                                  setLoginError("");
                                }}
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

                                Continuar con Email
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

                              {/* TELEFONO */}
                              <button
                                type="button"
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

                                Continuar con Número de teléfono
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

          {registerOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
    <button
      type="button"
      aria-label="Cerrar"
      onClick={() => setRegisterOpen(false)}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    />

    <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
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
          onClick={() => setRegisterOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleRegister();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Nombre
            </label>

            <input
              type="text"
              value={registerFirstName}
              onChange={(event) =>
                setRegisterFirstName(event.target.value)
              }
              required
              autoComplete="given-name"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              placeholder="Nombre"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Apellidos
            </label>

            <input
              type="text"
              value={registerLastName}
              onChange={(event) =>
                setRegisterLastName(event.target.value)
              }
              required
              autoComplete="family-name"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              placeholder="Apellidos"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Carnet de identidad
            </label>

            <input
              type="text"
              value={registerIdentification}
              onChange={(event) =>
                setRegisterIdentification(event.target.value)
              }
              required
              inputMode="numeric"
              maxLength={11}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              placeholder="11 dígitos"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Teléfono
            </label>

            <input
              type="tel"
              value={registerPhone}
              onChange={(event) =>
                setRegisterPhone(event.target.value)
              }
              required
              inputMode="tel"
              maxLength={8}
              autoComplete="tel"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              placeholder="Ej. 53020309"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Correo electrónico
          </label>

          <input
            type="email"
            value={registerEmail}
            onChange={(event) =>
              setRegisterEmail(event.target.value)
            }
            required
            autoComplete="email"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Provincia
            </label>

            <input
              type="text"
              value={registerProvince}
              readOnly
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Municipio
            </label>

            <select
              value={registerMunicipality}
              onChange={(event) =>
                setRegisterMunicipality(event.target.value)
              }
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            >
              <option value="">
                Selecciona un municipio
              </option>

              <option value="Playa">
                Playa
              </option>

              <option value="Plaza de la Revolución">
                Plaza de la Revolución
              </option>

              <option value="Centro Habana">
                Centro Habana
              </option>

              <option value="La Habana Vieja">
                La Habana Vieja
              </option>

              <option value="Regla">
                Regla
              </option>

              <option value="La Habana del Este">
                La Habana del Este
              </option>

              <option value="Guanabacoa">
                Guanabacoa
              </option>

              <option value="San Miguel del Padrón">
                San Miguel del Padrón
              </option>

              <option value="Diez de Octubre">
                Diez de Octubre
              </option>

              <option value="Cerro">
                Cerro
              </option>

              <option value="Marianao">
                Marianao
              </option>

              <option value="La Lisa">
                La Lisa
              </option>

              <option value="Boyeros">
                Boyeros
              </option>

              <option value="Arroyo Naranjo">
                Arroyo Naranjo
              </option>

              <option value="Cotorro">
                Cotorro
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Dirección
          </label>

          <textarea
            value={registerAddress}
            onChange={(event) =>
              setRegisterAddress(event.target.value)
            }
            required
            rows={3}
            autoComplete="street-address"
            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            placeholder="Dirección completa"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Contraseña
            </label>

            <input
              type="password"
              value={registerPassword}
              onChange={(event) =>
                setRegisterPassword(event.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={registerConfirmPassword}
              onChange={(event) =>
                setRegisterConfirmPassword(event.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              placeholder="Repite la contraseña"
            />
          </div>
        </div>

        {registerError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {registerError}
          </div>
        )}

        {registerSuccess && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {registerSuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={registerLoading}
          className="w-full rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerLoading
            ? "Creando cuenta..."
            : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-neutral-600">
          ¿Ya tienes una cuenta?{" "}
          <button
            type="button"
            onClick={() => {
              setRegisterOpen(false);
              setLoginError("");
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

          {profileOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
    <button
      type="button"
      aria-label="Cerrar perfil"
      onClick={() => setProfileOpen(false)}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    />

    <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            Mi cuenta
          </p>

          <Link
            href="/profile"
            onClick={() => setUserMenuOpen(false)}
            className="block w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Mi perfil
          </Link>

          <p className="mt-2 text-sm text-neutral-500">
            Información de tu cuenta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setProfileOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          ✕
        </button>
      </div>

      {profileLoading && (
        <div className="rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm font-medium text-neutral-500">
          Cargando perfil...
        </div>
      )}

      {profileError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {profileError}
        </div>
      )}

          {!profileLoading &&
            !profileError &&
            customerProfile && (
              <div className="space-y-3">
                <div className="rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Nombre completo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {customerProfile.full_name || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Carnet
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {customerProfile.identification || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Correo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {customerProfile.email || profileEmail || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Teléfono
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {customerProfile.phone || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-neutral-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Provincia
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      {customerProfile.province || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Municipio
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      {customerProfile.municipality || "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Dirección
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {customerProfile.address || "—"}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    )}
    </header>
  );
}