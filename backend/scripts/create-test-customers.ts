
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "../src/config/supabase";

const customers = [
  { first: "Carlos Alberto", last1: "Mendoza", last2: "Lopez" },
  { first: "Maria Elena", last1: "Rodriguez", last2: "Perez" },
  { first: "Jose Manuel", last1: "Perez", last2: "Diaz" },
  { first: "Ana Isabel", last1: "Fernandez", last2: "Cruz" },
  { first: "Luis Miguel", last1: "Gonzalez", last2: "Reyes" },
  { first: "Laura Beatriz", last1: "Torres", last2: "Garcia" },
  { first: "Roberto Carlos", last1: "Diaz", last2: "Martinez" },
  { first: "Daniela Sofia", last1: "Herrera", last2: "Vega" },
  { first: "Miguel Angel", last1: "Castro", last2: "Santos" },
  { first: "Patricia Elena", last1: "Suarez", last2: "Morales" },
];

async function main() {
  const { data, error } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (error) throw error;

  for (let i = 0; i < customers.length; i++) {
    const person = customers[i];
    const number = String(i + 1).padStart(2, "0");
    const email = `drl.test.cliente${number}@drl.test`;
    const fullName =
      `${person.first} ${person.last1} ${person.last2}`;

    let user = data.users.find(
      (item) => item.email?.toLowerCase() === email.toLowerCase()
    );

    if (user && user.user_metadata?.account_type !== "customer") {
      throw new Error(
        `El correo ${email} ya existe y no está marcado como cliente.`
      );
    }

    if (!user) {
      const password =
        `DrlTest-${randomBytes(8).toString("hex")}!`;

      const { data: created, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            account_type: "customer",
            full_name: fullName,
            first_name: person.first,
            last_name_1: person.last1,
            last_name_2: person.last2,
            carnet: `DRL-TEST-${number}`,
            phone: `555000${number}`,
            province: "La Habana",
            municipality: "Plaza de la Revolución",
            address: `Dirección de prueba ${number}`,
          },
        });

      if (createError) throw createError;
      if (!created.user) throw new Error(`No se creó ${email}`);

      user = created.user;

      console.log(
        `CUENTA CREADA: ${email} | Contraseña temporal: ${password}`
      );
    } else {
      console.log(`CUENTA YA EXISTENTE: ${email}`);
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (profileError) throw profileError;

    const profileData = {
      full_name: fullName,
      first_name: person.first,
      last_name_1: person.last1,
      last_name_2: person.last2,
      identification: `DRL-TEST-${number}`,
      email,
      phone: `555000${number}`,
      province: "La Habana",
      municipality: "Plaza de la Revolución",
      address: `Dirección de prueba ${number}`,
      auth_user_id: user.id,
      source_type: "direct",
      manager_id: null,
      is_vip: false,
    };

    if (profile) {
      const { error: updateError } = await supabaseAdmin
        .from("customers")
        .update(profileData)
        .eq("auth_user_id", user.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("customers")
        .insert(profileData);

      if (insertError) throw insertError;
    }

    console.log(`PERFIL VERIFICADO: ${fullName}`);
  }

  console.log("Proceso terminado.");
}

main().catch((error) => {
  console.error("ERROR:", error);
  process.exitCode = 1;
});
