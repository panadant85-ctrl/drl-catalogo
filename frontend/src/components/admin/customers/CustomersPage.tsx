"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";
import {
createCustomer,
deleteCustomer,
getCustomers,
updateCustomer,
changeCustomerPassword,
} from "@/lib/api";
import Link from "next/link";

import { getAdminAccessToken } from "@/lib/adminSession";
import commonStyles from "../styles/AdminCommon.module.css";
import tableStyles from "../styles/AdminTable.module.css";

type Customer = {
id: number;
first_name: string;
last_name_1: string;
last_name_2: string;
full_name: string;
identification: string;
email?: string | null;
phone?: string | null;
province?: string | null;
municipality?: string | null;
address?: string | null;
orders_count?: number;
source_type?: "direct" | "manager";
manager_id?: string | null;
auth_user_id?: string | null;
};

type CustomerForm = {
first_name: string;
last_name_1: string;
last_name_2: string;
identification: string;
email: string;
phone: string;
province: string;
municipality: string;
address: string;
};

const emptyForm: CustomerForm = {
first_name: "",
last_name_1: "",
last_name_2: "",
identification: "",
email: "",
phone: "",
province: "",
municipality: "",
address: "",
};

export default function CustomersPage() {
  const getCustomerOrigin = (customer: Customer) => {
  if (customer.source_type === "manager") {
    return {
      label: "Gestor",
      className:
        "bg-blue-50 text-blue-700 border border-blue-200",
    };
  }

  return {
    label: "Directo",
    className:
      "bg-gray-50 text-gray-700 border border-gray-200",
  };
};

const getAccountStatus = (customer: Customer) => {
  if (customer.auth_user_id) {
    return {
      label: "Con cuenta",
      className:
        "bg-green-50 text-green-700 border border-green-200",
    };
  }

  return {
    label: "Sin cuenta",
    className:
      "bg-orange-50 text-orange-700 border border-orange-200",
  };
};

const [newPassword, setNewPassword] = useState("");
const [customers, setCustomers] = useState<Customer[]>([]);
const [search, setSearch] = useState("");
const [ordersSort, setOrdersSort] = useState<
  "desc" | "asc"
>("desc");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [showForm, setShowForm] = useState(false);
const [editingCustomer, setEditingCustomer] =
useState<Customer | null>(null);

const [form, setForm] =
useState<CustomerForm>(emptyForm);

async function loadCustomers() {
try {
setLoading(true);
setError("");

  const accessToken = getAdminAccessToken();

  if (!accessToken) {
    throw new Error(
      "No se encontró la sesión administrativa."
    );
  }

  const result = await getCustomers(accessToken);

  setCustomers(
    Array.isArray(result?.data)
      ? result.data
      : []
  );
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "No se pudieron cargar los clientes."
  );
} finally {
  setLoading(false);
}

}

useEffect(() => {
loadCustomers();
}, []);

const filteredCustomers = useMemo(() => {
  const term = search.trim().toLowerCase();

  const filtered = customers.filter((customer) => {
    if (!term) {
      return true;
    }

    return [
      customer.full_name,
      customer.first_name,
      customer.last_name_1,
      customer.last_name_2,
      customer.identification,
      customer.email,
      customer.phone,
      customer.province,
      customer.municipality,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(term)
      );
  });

  return [...filtered].sort((a, b) => {
    const countA = a.orders_count ?? 0;
    const countB = b.orders_count ?? 0;

    return ordersSort === "desc"
      ? countB - countA
      : countA - countB;
  });
}, [customers, search, ordersSort]);

function openCreateForm() {
  setNewPassword("");
setEditingCustomer(null);
setForm(emptyForm);
setError("");
setSuccess("");
setShowForm(true);
}

function openEditForm(customer: Customer) {
setEditingCustomer(customer);

setForm({
  first_name:
    customer.first_name || "",
  last_name_1:
    customer.last_name_1 || "",
  last_name_2:
    customer.last_name_2 || "",
  identification:
    customer.identification || "",
  email:
    customer.email || "",
  phone:
    customer.phone || "",
  province:
    customer.province || "",
  municipality:
    customer.municipality || "",
  address:
    customer.address || "",
});

setError("");
setSuccess("");
setNewPassword("");
setShowForm(true);

}

function closeForm() {
if (saving) return;

setShowForm(false);
setNewPassword("");
setEditingCustomer(null);
setForm(emptyForm);

}

function updateField(
field: keyof CustomerForm,
value: string
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();

setError("");
setSuccess("");

if (!form.first_name.trim()) {
  setError("El nombre es obligatorio.");
  return;
}

if (!form.last_name_1.trim()) {
  setError(
    "El primer apellido es obligatorio."
  );
  return;
}

if (!form.last_name_2.trim()) {
  setError(
    "El segundo apellido es obligatorio."
  );
  return;
}

if (!form.identification.trim()) {
  setError(
    "La identificación es obligatoria."
  );
  return;
}

try {
  setSaving(true);

  const accessToken =
    getAdminAccessToken();

  if (!accessToken) {
    throw new Error(
      "No se encontró la sesión administrativa."
    );
  }

  const data = {
    first_name:
      form.first_name.trim(),

    last_name_1:
      form.last_name_1.trim(),

    last_name_2:
      form.last_name_2.trim(),

    identification:
      form.identification.trim(),

    email:
      form.email.trim()
        ? form.email.trim()
        : null,

    phone:
      form.phone.trim()
        ? form.phone.trim()
        : null,

    province:
      form.province.trim()
        ? form.province.trim()
        : null,

    municipality:
      form.municipality.trim()
        ? form.municipality.trim()
        : null,

    address:
      form.address.trim()
        ? form.address.trim()
        : null,
  };

 
if (editingCustomer) {
  await updateCustomer(
    accessToken,
    editingCustomer.id,
    data
  );

  if (newPassword.trim()) {
    if (newPassword.length < 8) {
      throw new Error(
        "La contraseña debe tener al menos 8 caracteres."
      );
    }

    if (!editingCustomer.auth_user_id) {
      throw new Error(
        "Este cliente no tiene una cuenta asociada."
      );
    }

    await changeCustomerPassword(
      accessToken,
      editingCustomer.id,
      newPassword
    );
  }

  setSuccess(
    newPassword
      ? "Cliente y contraseña actualizados correctamente."
      : "Cliente actualizado correctamente."
  );
} else {

  
    await createCustomer(
      accessToken,
      data
    );

    setSuccess(
      "Cliente creado correctamente."
    );
  }

  await loadCustomers();

  setShowForm(false);
  setEditingCustomer(null);
  setForm(emptyForm);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "No se pudo guardar el cliente."
  );
} finally {
  setSaving(false);
}

}

async function handleDelete(
customer: Customer
) {
const confirmed = window.confirm(
`¿Estás seguro de eliminar al cliente "${customer.full_name}"?`
);

if (!confirmed) {
  return;
}

try {
  setError("");
  setSuccess("");

  const accessToken =
    getAdminAccessToken();

  if (!accessToken) {
    throw new Error(
      "No se encontró la sesión administrativa."
    );
  }

  await deleteCustomer(
    accessToken,
    customer.id
  );

  setSuccess(
    "Cliente eliminado correctamente."
  );

  await loadCustomers();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "No se pudo eliminar el cliente."
  );
}

}

return ( <DashboardShell> <div className="p-6"> <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"> <div> <h1 className="text-2xl font-semibold text-gray-900">
Clientes </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gestión de clientes de DRL Electronik.
        </p>
      </div>

      <button
        type="button"
        onClick={openCreateForm}
        className={commonStyles.primaryButton}
      >
        + Nuevo cliente
      </button>
    </div>

    {error && (
      <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {success && (
      <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {success}
      </div>
    )}

    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar cliente..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
            />
          </div>

          <div className="text-sm text-gray-500">
            {filteredCustomers.length}{" "}
            cliente
            {filteredCustomers.length === 1
              ? ""
              : "s"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Cargando clientes...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-gray-700">
            No hay clientes para mostrar.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "No se encontraron clientes con esa búsqueda."
              : "Todavía no hay clientes registrados."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cliente
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Identificación
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Origen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cuenta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <button
                    type="button"
                    onClick={() =>
                      setOrdersSort((current) =>
                        current === "desc" ? "asc" : "desc"
                      )
                    }
                    className="inline-flex items-center gap-1 hover:text-gray-900"
                    title="Ordenar por cantidad de pedidos"
                  >
                    Pedidos
                    <span aria-hidden="true">
                      {ordersSort === "desc" ? "↓" : "↑"}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCustomers.map(
                (customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-medium text-gray-900">
                        {customer.full_name}
                      </div>

                      <div className="mt-0.5 text-xs text-gray-400">
                        ID #{customer.id}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {customer.identification}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>
                        {customer.phone ||
                          "—"}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {customer.email ||
                          "Sin email"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const origin = getCustomerOrigin(customer);

                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${origin.className}`}
                          >
                            {origin.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-4">
                      {(() => {
                        const account = getAccountStatus(customer);

                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${account.className}`}
                          >
                            {account.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>
                        {customer.municipality ||
                          "—"}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {customer.province ||
                          "Sin provincia"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-semibold text-gray-700">
                      {customer.orders_count ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-cyan-500 hover:bg-blue-50"
                        >
                          Ver
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              customer
                            )
                          }
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              customer
                            )
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {showForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCustomer
                  ? "Editar cliente"
                  : "Nuevo cliente"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Completa los datos del cliente.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="text-2xl leading-none text-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre
                </label>

                <input
                  type="text"
                  value={form.first_name}
                  onChange={(event) =>
                    updateField(
                      "first_name",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Primer apellido
                </label>

                <input
                  type="text"
                  value={form.last_name_1}
                  onChange={(event) =>
                    updateField(
                      "last_name_1",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Segundo apellido
                </label>

                <input
                  type="text"
                  value={form.last_name_2}
                  onChange={(event) =>
                    updateField(
                      "last_name_2",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Identificación
                </label>

                <input
                  type="text"
                  value={form.identification}
                  onChange={(event) =>
                    updateField(
                      "identification",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono
                </label>

                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Provincia
                </label>

                <input
                  type="text"
                  value={form.province}
                  onChange={(event) =>
                    updateField(
                      "province",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Municipio
                </label>

                <input
                  type="text"
                  value={form.municipality}
                  onChange={(event) =>
                    updateField(
                      "municipality",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Dirección
                </label>

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                />
                
                {editingCustomer?.auth_user_id && (
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nueva contraseña
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Dejar vacío para conservar la contraseña actual"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#25b36a] focus:ring-2 focus:ring-[#25b36a]/20"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Opcional. Solo se cambiará si introduces una nueva contraseña de al menos 8 caracteres.
                    </p>
                  </div>
                )}

              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className={commonStyles.primaryButton}
                >
                {saving
                  ? "Guardando..."
                  : editingCustomer
                  ? "Guardar cambios"
                  : "Crear cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
</DashboardShell>

);
}
