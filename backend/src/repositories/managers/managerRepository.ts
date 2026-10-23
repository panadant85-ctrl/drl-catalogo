
import { supabaseAdmin } from "../../config/supabase";
import type { Manager } from "../../types/managers/manager";
import type {
  CreateManagerInput,
  UpdateManagerInput,
} from "../../validators/managers/managerValidator";

const managerSelect = `
  id,
  full_name,
  email,
  phone,
  slug,
  commission_rate,
  active,
  created_at,
  username,
  carnet,
  avatar_url,
  manager_code,
  auth_user_id
`;

type ManagerWithCustomerCount = Manager & {
  customer_count: number;
};

export async function findManagers(): Promise<
  ManagerWithCustomerCount[]
> {
  const [
    { data: managers, error: managersError },
    { data: customers, error: customersError },
  ] = await Promise.all([
    supabaseAdmin
      .from("managers")
      .select(managerSelect)
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("customers")
      .select("manager_id"),
  ]);

  if (managersError) {
    throw new Error(
      `No se pudieron obtener los gestores: ${managersError.message}`
    );
  }

  if (customersError) {
    throw new Error(
      `No se pudo calcular la cantidad de clientes: ${customersError.message}`
    );
  }

  const customerCounts = new Map<string, number>();

  for (const customer of customers ?? []) {
    if (!customer.manager_id) {
      continue;
    }

    const managerId = String(customer.manager_id);

    customerCounts.set(
      managerId,
      (customerCounts.get(managerId) ?? 0) + 1
    );
  }

  return (managers ?? []).map((manager) => ({
    ...manager,
    customer_count:
      customerCounts.get(String(manager.id)) ?? 0,
  })) as ManagerWithCustomerCount[];
}


export async function findManagerById(
  id: string
): Promise<Manager | null> {
  const { data, error } = await supabaseAdmin
    .from("managers")
    .select(managerSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo obtener el gestor: ${error.message}`
    );
  }

  return data as Manager | null;
}


export async function findManagerByCode(
  managerCode: string
): Promise<Manager | null> {
  const { data, error } = await supabaseAdmin
    .from("managers")
    .select(managerSelect)
    .eq("manager_code", managerCode.trim())
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo buscar el gestor por código: ${error.message}`
    );
  }

  return data as Manager | null;
}


export async function findManagerByAuthUserId(
  authUserId: string
): Promise<Manager | null> {
  const { data, error } = await supabaseAdmin
    .from("managers")
    .select(managerSelect)
    .eq("id", authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo obtener el perfil del gestor: ${error.message}`
    );
  }

  return data as Manager | null;
}


export async function findManagerByUsername(
  username: string
): Promise<Manager | null> {
  const { data, error } = await supabaseAdmin
    .from("managers")
    .select(managerSelect)
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo verificar el username: ${error.message}`
    );
  }

  return data as Manager | null;
}

export async function findManagerByEmail(
  email: string
): Promise<Manager | null> {
  const { data, error } = await supabaseAdmin
    .from("managers")
    .select(managerSelect)
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo verificar el email: ${error.message}`
    );
  }

  return data as Manager | null;
}


export async function createManager(
  input: CreateManagerInput
): Promise<Manager> {
  // 1. Generar el código visible del gestor.
  const { data: code, error: codeError } =
    await supabaseAdmin.rpc("generate_manager_code");

  if (codeError || typeof code !== "string") {
    throw new Error(
      `No se pudo generar el código del gestor: ${
        codeError?.message ?? "Respuesta inválida"
      }`
    );
  }

  // 2. Generar el ID del gestor.
  const managerId = crypto.randomUUID();

  // 3. Obtener las iniciales del nombre completo.
  const initials = input.full_name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toLowerCase();

  // 4. Construir el slug con las iniciales y el ID del gestor.
  const slug = `${initials}-${managerId}`;

  // 5. Crear el registro.
  const { data, error } = await supabaseAdmin
    .from("managers")
    .insert({
      id: managerId,
      full_name: input.full_name,
      email: input.email,
      phone: input.phone ?? null,
      slug,
      commission_rate: input.commission_rate ?? 0,
      active: input.active ?? true,
      username: input.username,
      carnet: input.carnet ?? null,
      avatar_url: input.avatar_url ?? null,
      manager_code: code,
      auth_user_id: null,
    })
    .select(managerSelect)
    .single();

  if (error) {
    throw new Error(
      `No se pudo crear el gestor: ${error.message}`
    );
  }

  return data as Manager;
}


export async function updateManager(
  id: string,
  input: UpdateManagerInput
): Promise<Manager> {
  const { data, error } = await supabaseAdmin
    .from("managers")
    .update(input)
    .eq("id", id)
    .select(managerSelect)
    .single();

  if (error) {
    throw new Error(
      `No se pudo actualizar el gestor: ${error.message}`
    );
  }

  return data as Manager;
}

export async function deleteManager(
  id: string
): Promise<Manager> {
  const existing = await findManagerById(id);

  if (!existing) {
    throw new Error("Gestor no encontrado.");
  }

  const { error } = await supabaseAdmin
    .from("managers")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `No se pudo eliminar el gestor: ${error.message}`
    );
  }

  return existing;
}
