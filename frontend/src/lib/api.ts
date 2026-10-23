const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ADMIN_SESSION_KEY =
  "drl_electronik_admin_session";

async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const response = await fetch(input, init);

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_SESSION_KEY);

      window.location.replace("/admin/login");
    }

    throw new Error(
      "La sesión administrativa ha expirado."
    );
  }

  return response;
}

export async function getProducts() {
  const response = await fetch(`${API_URL}/api/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  return response.json();
}

export async function getAdminProducts(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/products/admin`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudieron obtener los productos."
    );
  }

  return result;
}


export type Customer = {
  id: number;
  full_name: string;
  first_name?: string | null;
  last_name_1?: string | null;
  last_name_2?: string | null;
  identification: string | null;
  email: string | null;
  phone: string | null;
  province?: string | null;
  municipality?: string | null;
  address?: string | null;
  manager_id?: string | null;
};

export type OrderStatus =
  | "nuevo"
  | "confirmado"
  | "preparando"
  | "entregado"
  | "cancelado";

export type OrderSourceType = "direct" | "manager";

export type Order = {
  id: number;
  order_number: string;
  customer_id: number;
  manager_id: string | null;
  source_type: OrderSourceType;
  delivery: boolean;
  address: string | null;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  commission_total: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  variant: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  commission_unit: number;
  commission_total: number;
};


export type CreateProductData = {
  name: string;

  brand_id: number;
  supplier_id: number;
  category_id: number;

  brand?: string | null;
  model?: string | null;

  // Se generan automáticamente en el backend.
  category?: string | null;

  price: number;
  cost: number;
  vip_price?: number | null;

  stock: number;

  description?: string | null;

  features?: Record<string, unknown> | null;
  technical_specs?: Record<string, unknown> | null;
  images?: string[] | null;

  family_id?: number | null;
  variant?: string | null;

  active?: boolean;

  manager_commission: number;
};


export type UpdateProductData = Partial<
  CreateProductData
>;

export async function uploadProductImage(
  accessToken: string,
  productId: number,
  file: File
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await adminFetch(
    `${API_URL}/api/products/${productId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo subir la imagen del producto."
    );
  }

  return result.data.url as string;
}

export async function createProduct(
  accessToken: string,
  data: CreateProductData
) {
  const response = await adminFetch(
    `${API_URL}/api/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo crear el producto."
    );
  }

  return result;
}

export async function updateProduct(
  accessToken: string,
  id: number,
  data: UpdateProductData
) {
  const response = await adminFetch(
    `${API_URL}/api/products/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar el producto."
    );
  }

  return result;
}

export async function updateProductStatus(
  accessToken: string,
  id: number,
  active: boolean
) {
  const response = await adminFetch(
    `${API_URL}/api/products/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        active,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar el estado del producto."
    );
  }

  return result;
}

export async function deleteProduct(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/products/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo eliminar el producto."
    );
  }

  return result;
}

export async function loginCustomer(data: {
  email?: string;
  phone?: string;
  password: string;
}) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  console.log("RESPUESTA RAW LOGIN:", result);

  if (!response.ok) {
    throw new Error(
      result?.message || "No se pudo iniciar sesión."
    );
  }

  return result;
}

export async function checkAdminAccess(
  accessToken: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/admin`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo verificar el acceso administrativo."
    );
  }

  return data;
}

export async function refreshCustomerSession(
  refreshToken: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo renovar la sesión."
    );
  }

  return data;
}

export async function registerCustomer(data: {
  email?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo crear la cuenta."
    );
  }

  return result;
}

export async function getCustomerProfile(
  accessToken: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el perfil."
    );
  }

  return data;
}




export async function updateCustomerProfile(
  accessToken: string,
  data: {
    first_name: string;
    last_name_1: string;
    last_name_2: string;
    identification?: string | null;
    email?: string | null;
    phone?: string | null;
    province?: string | null;
    municipality?: string | null;
    address?: string | null;
  }
) {
  const full_name = [
    data.first_name.trim(),
    data.last_name_1.trim(),
    data.last_name_2.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...data,
        full_name,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudieron actualizar los datos."
    );
  }

  return result;
}




export async function getCustomerCart(
  accessToken: string
) {
  const response = await fetch(
    `${API_URL}/api/cart`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el carrito."
    );
  }

  return data;
}

export async function addCustomerCartItem(
  accessToken: string,
  productId: number,
  quantity: number,
  variant: string | null
) {
  const response = await fetch(
    `${API_URL}/api/cart`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo agregar el producto al carrito."
    );
  }

  return data;
}

export async function updateCustomerCartItem(
  accessToken: string,
  productId: number,
  quantity: number,
  variant: string | null
) {
  const response = await fetch(
    `${API_URL}/api/cart`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo actualizar el carrito."
    );
  }

  return data;
}

export async function removeCustomerCartItem(
  accessToken: string,
  productId: number,
  variant: string | null
) {
  const response = await fetch(
    `${API_URL}/api/cart`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        variant,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo eliminar el producto del carrito."
    );
  }

  return data;
}

export async function clearCustomerCart(
  accessToken: string
) {
  const response = await fetch(
    `${API_URL}/api/cart/all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo vaciar el carrito."
    );
  }

  return data;
}

export async function getSuppliers(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/suppliers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener los proveedores."
    );
  }

  return data;
}

export async function createSupplier(
  accessToken: string,
  data: {
    company_name: string;
    nit: string;
    address: string;
    phone?: string | null;
    email?: string | null;
    active?: boolean;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/suppliers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo crear el proveedor."
    );
  }

  return result;
}

export async function updateSupplier(
  accessToken: string,
  id: number,
  data: {
    company_name?: string;
    nit?: string;
    address?: string;
    phone?: string | null;
    email?: string | null;
    active?: boolean;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/suppliers/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar el proveedor."
    );
  }

  return result;
}

export async function deleteSupplier(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/suppliers/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo eliminar el proveedor."
    );
  }

  return result;
}

export async function getCustomers(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/customers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener los clientes."
    );
  }

  return data;
}

export async function getCustomerById(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/customers/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el cliente."
    );
  }

  return data;
}
export async function getCustomerDetails(
  accessToken: string,
  id: number
) {
  const response = await fetch(
    `${API_URL}/api/customers/${id}/details`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el detalle del cliente."
    );
  }

  return data;
}

export async function createCustomer(
  accessToken: string,
  data: {
    first_name: string;
    last_name_1: string;
    last_name_2: string;
    identification: string;
    email?: string | null;
    phone?: string | null;
    province?: string | null;
    municipality?: string | null;
    address?: string | null;
    source_type?: "direct" | "manager";
    manager_id?: string | null;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/customers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo crear el cliente."
    );
  }

  return result;
}

export async function updateCustomer(
  accessToken: string,
  id: number,
  data: {
    first_name?: string;
    last_name_1?: string;
    last_name_2?: string;
    identification?: string;
    email?: string | null;
    phone?: string | null;
    province?: string | null;
    municipality?: string | null;
    address?: string | null;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/customers/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar el cliente."
    );
  }

  return result;
}


export async function changeCustomerPassword(
  accessToken: string,
  id: number,
  password: string
) {
  const response = await adminFetch(
    `${API_URL}/api/customers/${id}/password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo cambiar la contraseña."
    );
  }

  return result;
}


export async function deleteCustomer(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/customers/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo eliminar el cliente."
    );
  }

  return result;
}

export async function getBrands(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/brands`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener las marcas."
    );
  }

  return data;
}

export async function createBrand(
  accessToken: string,
  data: {
    name: string;
    description?: string | null;
    logo_url?: string | null;
    active?: boolean;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/brands`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo crear la marca."
    );
  }

  return result;
}

export async function updateBrand(
  accessToken: string,
  id: number,
  data: {
    name?: string;
    description?: string | null;
    logo_url?: string | null;
    active?: boolean;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/brands/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar la marca."
    );
  }

  return result;
}

export async function deleteBrand(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/brands/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo eliminar la marca."
    );
  }

  return result;
}

export async function uploadBrandLogo(
  accessToken: string,
  id: number,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await adminFetch(
    `${API_URL}/api/brands/${id}/logo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo subir el logo de la marca."
    );
  }

  return data;
}

export async function getCategories(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/categories`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener las categorías."
    );
  }

  return data;
}

export async function createCategory(
  accessToken: string,
  input: {
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: number | null;
    active?: boolean;
    position?: number;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/categories`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo crear la categoría."
    );
  }

  return data;
}

export async function updateCategory(
  accessToken: string,
  id: number,
  input: {
    name?: string;
    slug?: string;
    description?: string | null;
    parent_id?: number | null;
    active?: boolean;
    position?: number;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/categories/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo actualizar la categoría."
    );
  }

  return data;
}

export async function deleteCategory(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/categories/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo eliminar la categoría."
    );
  }

  return data;
}

export async function getRoles(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/roles`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener los roles."
    );
  }

  return data;
}

export async function getRoleById(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/roles/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el rol."
    );
  }

  return data;
}

export async function createRole(
  accessToken: string,
  data: {
    code: string;
    name: string;
    description?: string | null;
    permissions: string[];
    active?: boolean;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/roles`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo crear el rol."
    );
  }

  return result;
}

export async function updateRole(
  accessToken: string,
  id: number,
  data: {
    code?: string;
    name?: string;
    description?: string | null;
    permissions?: string[];
    active?: boolean;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/roles/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar el rol."
    );
  }

  return result;
}

export async function deleteRole(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/roles/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo eliminar el rol."
    );
  }

  return result;
}

export async function getUsers(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/users`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener los usuarios."
    );
  }

  return data;
}

export async function getUserById(
  accessToken: string,
  id: string
) {
  const response = await adminFetch(
    `${API_URL}/api/users/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el usuario."
    );
  }

  return data;
}

export async function getUserRoles(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/users/roles`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener los roles."
    );
  }

  return data;
}

export async function getUserRole(
  accessToken: string,
  id: string
) {
  const response = await adminFetch(
    `${API_URL}/api/users/${id}/role`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el rol del usuario."
    );
  }

  return data;
}


export async function createUser(
  accessToken: string,
  data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    roleId: number;
    username?: string;
    carnet?: string;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "No se pudo crear el usuario."
    );
  }

  return result;
}


export async function updateUser(
  accessToken: string,
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    roleId?: number | null;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/users/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo actualizar el usuario."
    );
  }

  return result;
}

export async function updateUserStatus(
  accessToken: string,
  id: string,
  active: boolean
) {
  const response = await adminFetch(
    `${API_URL}/api/users/${id}/status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        active,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
      console.error(
        "ERROR updateUserStatus:",
        result
      );

      throw new Error(
        result?.message ||
          "No se pudo actualizar el estado del usuario."
      );
    }

  return result;
}

export async function deleteUser(
  accessToken: string,
  id: string
) {
  const response = await adminFetch(
    `${API_URL}/api/users/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo eliminar el usuario."
    );
  }

  return result;
}

export async function getOrders(
  accessToken: string
) {
  const response = await adminFetch(
    `${API_URL}/api/orders`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudieron obtener los pedidos."
    );
  }

  return data;
}

export async function getOrderById(
  accessToken: string,
  id: number
) {
  const response = await adminFetch(
    `${API_URL}/api/orders/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo obtener el pedido."
    );
  }

  return data;
}

export async function updateOrderStatus(
  accessToken: string,
  id: number,
  status:
    | "nuevo"
    | "confirmado"
    | "preparando"
    | "entregado"
    | "cancelado"
) {
  const response = await adminFetch(
    `${API_URL}/api/orders/${id}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "No se pudo actualizar el estado del pedido."
    );
  }

  return data;
}

export async function createPosOrder(
  accessToken: string,
  data: {
    customer_id: number;
    items: Array<{
      product_id: number;
      quantity: number;
      variant?: string | null;
    }>;
    notes?: string | null;
  }
) {
  const response = await adminFetch(
    `${API_URL}/api/orders/pos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
      throw new Error(
      result?.message ||
        `Error HTTP ${response.status} al registrar la venta POS.`
    );
  }

  return result;
}
export type ManagerData = {
  id: string;
  manager_code: string | null;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  slug: string;
  username: string;
  carnet: string | null;
  commission_rate: number;
  active: boolean;
  created_at: string;
  avatar_url: string | null;
};

export type CreateManagerData = {
  full_name: string;
  email: string;
  phone?: string | null;
  slug?: string;
  username: string;
  carnet?: string | null;
  commission_rate?: number;
  active?: boolean;
  avatar_url?: string | null;
};

export type UpdateManagerData = Partial<CreateManagerData>;

export async function getManagers(accessToken: string) {
  const response = await adminFetch(
    `${API_URL}/api/managers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "No se pudieron obtener los gestores."
    );
  }

  return data;
}

export async function getManagerById(
  accessToken: string,
  id: string
) {
  const response = await adminFetch(
    `${API_URL}/api/managers/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "No se pudo obtener el gestor."
    );
  }

  return data;
}

export async function createManager(
  accessToken: string,
  data: CreateManagerData
) {
  const response = await adminFetch(
    `${API_URL}/api/managers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "No se pudo crear el gestor."
    );
  }

  return result;
}

export async function updateManager(
  accessToken: string,
  id: string,
  data: UpdateManagerData
) {
  const response = await adminFetch(
    `${API_URL}/api/managers/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "No se pudo actualizar el gestor."
    );
  }

  return result;
}

export async function deleteManager(
  accessToken: string,
  id: string
) {
  const response = await adminFetch(
    `${API_URL}/api/managers/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "No se pudo eliminar el gestor."
    );
  }

  return result;
}


const MANAGER_SESSION_KEY =
  "drl_electronik_manager_session";

export type ManagerSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  expiresIn?: number;
};

export async function getMyManagerProfile(
  accessToken: string
) {
  const response = await fetch(
    `${API_URL}/api/managers/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo obtener el perfil del gestor."
    );
  }

  return result;
}

export async function getMyManagerCustomers(
  accessToken: string
) {
  const response = await fetch(
    `${API_URL}/api/managers/me/customers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudieron obtener los clientes del gestor."
    );
  }

  return result;
}


export async function getMyManagerCustomerOrders(
  accessToken: string,
  customerId: number
) {
  const response = await fetch(
    `${API_URL}/api/managers/me/customers/${customerId}/orders`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "No se pudieron obtener los pedidos del cliente."
    );
  }

  return result;
}

export function saveManagerSession(
  session: ManagerSession
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    MANAGER_SESSION_KEY,
    JSON.stringify(session)
  );
}

export function getManagerSession():
  ManagerSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession =
    localStorage.getItem(MANAGER_SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as ManagerSession;
  } catch {
    localStorage.removeItem(MANAGER_SESSION_KEY);
    return null;
  }
}

export function clearManagerSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(MANAGER_SESSION_KEY);
  }
}


export async function linkCustomerToManager(
  accessToken: string,
  managerCode: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/me/manager`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        manager_code: managerCode.trim(),
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "No se pudo vincular el gestor."
    );
  }

  return result;
}
