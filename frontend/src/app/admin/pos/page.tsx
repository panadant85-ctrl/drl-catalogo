"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getCustomers,
  getProducts,
} from "@/lib/api";

import {
  getAdminAccessToken,
} from "@/lib/adminSession";

type Product = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  images?: string[] | null;
  family_id?: number | null;
  variant?: string | null;
  active: boolean;
};

type Customer = {
  id: number;
  full_name?: string | null;
  identification?: string | null;
  email?: string | null;
  phone?: string | null;
};

type PosCartItem = {
  product: Product;
  quantity: number;
};

export default function PosPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [cart, setCart] =
    useState<PosCartItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingCustomers, setLoadingCustomers] =
    useState(true);

  const [error, setError] =
    useState("");

  const [customerError, setCustomerError] =
    useState("");

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      setError("");

      try {
        const result =
          await getProducts();

        const productList =
          Array.isArray(result?.data)
            ? result.data
            : [];

        setProducts(productList);
      } catch (err) {
        console.error(
          "ERROR CARGANDO PRODUCTOS POS:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los productos."
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCustomers() {
      setLoadingCustomers(true);
      setCustomerError("");

      try {
        const accessToken =
          getAdminAccessToken();

        const result =
          await getCustomers(
            accessToken
          );

        const customerList =
          Array.isArray(result?.data)
            ? result.data
            : [];

        setCustomers(customerList);
      } catch (err) {
        console.error(
          "ERROR CARGANDO CLIENTES POS:",
          err
        );

        setCustomerError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los clientes."
        );
      } finally {
        setLoadingCustomers(false);
      }
    }

    loadCustomers();
  }, []);

  const filteredProducts =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return products;
      }

      return products.filter(
        (product) => {
          const name =
            product.name?.toLowerCase() ||
            "";

          const sku =
            product.sku?.toLowerCase() ||
            "";

          const model =
            product.model?.toLowerCase() ||
            "";

          const brand =
            product.brand?.toLowerCase() ||
            "";

          const variant =
            product.variant?.toLowerCase() ||
            "";

          return (
            name.includes(searchValue) ||
            sku.includes(searchValue) ||
            model.includes(searchValue) ||
            brand.includes(searchValue) ||
            variant.includes(searchValue)
          );
        }
      );
    }, [products, search]);

  const filteredCustomers =
    useMemo(() => {
      const searchValue =
        customerSearch
          .trim()
          .toLowerCase();

      if (!searchValue) {
        return customers;
      }

      return customers.filter(
        (customer) => {
          const name =
            customer.full_name
              ?.toLowerCase() || "";

          const identification =
            customer.identification
              ?.toLowerCase() || "";

          const email =
            customer.email
              ?.toLowerCase() || "";

          const phone =
            customer.phone
              ?.toLowerCase() || "";

          return (
            name.includes(searchValue) ||
            identification.includes(
              searchValue
            ) ||
            email.includes(searchValue) ||
            phone.includes(searchValue)
          );
        }
      );
    }, [
      customers,
      customerSearch,
    ]);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.product.price) *
          item.quantity,
      0
    );
  }, [cart]);

  function addToCart(
    product: Product
  ) {
    if (product.stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.product.id ===
            product.id
        );

      if (existingItem) {
        if (
          existingItem.quantity >=
          product.stock
        ) {
          return currentCart;
        }

        return currentCart.map(
          (item) =>
            item.product.id ===
            product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  function decreaseQuantity(
    productId: number
  ) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id ===
          productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function increaseQuantity(
    productId: number
  ) {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.product.id !==
          productId
        ) {
          return item;
        }

        if (
          item.quantity >=
          item.product.stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  }

  function removeFromCart(
    productId: number
  ) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.product.id !==
          productId
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function formatPrice(
    value: number
  ) {
    return new Intl.NumberFormat(
      "es-ES",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  function selectCustomer(
    customer: Customer
  ) {
    setSelectedCustomer(
      customer
    );
    setCustomerSearch("");
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setCustomerSearch("");
  }

  const cartQuantity =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  return (
    <main
      style={{
        padding: "24px",
        minHeight: "100vh",
        background: "#f5f6f8",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            POS — DRL Electronik
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#666",
            }}
          >
            Punto de venta para ventas
            físicas.
          </p>
        </div>

        {/* CLIENTE */}
        <section
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "20px",
              marginBottom:
                selectedCustomer
                  ? "14px"
                  : "16px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Cliente
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Selecciona el cliente
                para esta venta.
              </p>
            </div>

            {selectedCustomer && (
              <button
                type="button"
                onClick={
                  clearCustomer
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color: "#b42318",
                  cursor:
                    "pointer",
                  fontWeight: 600,
                }}
              >
                Cambiar cliente
              </button>
            )}
          </div>

          {selectedCustomer ? (
            <div
              style={{
                border:
                  "1px solid #b7e3ca",
                background:
                  "#f1fbf5",
                borderRadius: "8px",
                padding: "14px 16px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div>
                <strong
                  style={{
                    display:
                      "block",
                    fontSize:
                      "16px",
                  }}
                >
                  {selectedCustomer.full_name ||
                    "Sin nombre"}
                </strong>

                <div
                  style={{
                    marginTop:
                      "5px",
                    display:
                      "flex",
                    flexWrap:
                      "wrap",
                    gap: "12px",
                    color: "#666",
                    fontSize:
                      "13px",
                  }}
                >
                  {selectedCustomer
                    .identification && (
                    <span>
                      ID:{" "}
                      {
                        selectedCustomer.identification
                      }
                    </span>
                  )}

                  {selectedCustomer.phone && (
                    <span>
                      Tel:{" "}
                      {
                        selectedCustomer.phone
                      }
                    </span>
                  )}

                  {selectedCustomer.email && (
                    <span>
                      {
                        selectedCustomer.email
                      }
                    </span>
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#16834b",
                  fontWeight:
                    700,
                  whiteSpace:
                    "nowrap",
                }}
              >
                Cliente seleccionado
              </span>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={
                  customerSearch
                }
                onChange={(event) =>
                  setCustomerSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar por nombre, identificación, teléfono o email..."
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "11px 13px",
                  border:
                    "1px solid #d7dbe0",
                  borderRadius:
                    "8px",
                  outline:
                    "none",
                  fontSize:
                    "14px",
                }}
              />

              {loadingCustomers && (
                <div
                  style={{
                    padding:
                      "18px 5px",
                    color:
                      "#666",
                    fontSize:
                      "14px",
                  }}
                >
                  Cargando clientes...
                </div>
              )}

              {customerError &&
                !loadingCustomers && (
                  <div
                    style={{
                      marginTop:
                        "12px",
                      padding:
                        "12px",
                      borderRadius:
                        "8px",
                      background:
                        "#fff1f1",
                      color:
                        "#b42318",
                      border:
                        "1px solid #f3b7b7",
                    }}
                  >
                    {
                      customerError
                    }
                  </div>
                )}

              {!loadingCustomers &&
                !customerError && (
                  <div
                    style={{
                      marginTop:
                        "12px",
                      maxHeight:
                        "230px",
                      overflowY:
                        "auto",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius:
                        "8px",
                    }}
                  >
                    {filteredCustomers
                      .length ===
                    0 ? (
                      <div
                        style={{
                          padding:
                            "20px",
                          textAlign:
                            "center",
                          color:
                            "#777",
                          fontSize:
                            "14px",
                        }}
                      >
                        No se encontraron
                        clientes.
                      </div>
                    ) : (
                      filteredCustomers.map(
                        (customer) => (
                          <button
                            key={
                              customer.id
                            }
                            type="button"
                            onClick={() =>
                              selectCustomer(
                                customer
                              )
                            }
                            style={{
                              width:
                                "100%",
                              textAlign:
                                "left",
                              border:
                                "none",
                              borderBottom:
                                "1px solid #eee",
                              background:
                                "#fff",
                              padding:
                                "12px 14px",
                              cursor:
                                "pointer",
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                fontSize:
                                  "14px",
                              }}
                            >
                              {customer.full_name ||
                                "Sin nombre"}
                            </strong>

                            <div
                              style={{
                                display:
                                  "flex",
                                flexWrap:
                                  "wrap",
                                gap:
                                  "12px",
                                marginTop:
                                  "4px",
                                color:
                                  "#777",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {customer
                                .identification && (
                                <span>
                                  ID:{" "}
                                  {
                                    customer.identification
                                  }
                                </span>
                              )}

                              {customer.phone && (
                                <span>
                                  Tel:{" "}
                                  {
                                    customer.phone
                                  }
                                </span>
                              )}

                              {customer.email && (
                                <span>
                                  {
                                    customer.email
                                  }
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      )
                    )}
                  </div>
                )}
            </>
          )}
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 420px",
            gap: "24px",
            alignItems:
              "start",
          }}
        >
          {/* PRODUCTOS */}
          <section
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "16px",
                marginBottom:
                  "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "20px",
                  }}
                >
                  Productos
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#777",
                    fontSize:
                      "14px",
                  }}
                >
                  {
                    filteredProducts.length
                  }{" "}
                  producto
                  {filteredProducts.length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar nombre, SKU o modelo..."
                style={{
                  width:
                    "320px",
                  maxWidth:
                    "100%",
                  padding:
                    "11px 13px",
                  border:
                    "1px solid #d7dbe0",
                  borderRadius:
                    "8px",
                  outline:
                    "none",
                  fontSize:
                    "14px",
                }}
              />
            </div>

            {loadingProducts && (
              <div
                style={{
                  padding:
                    "40px 20px",
                  textAlign:
                    "center",
                  color:
                    "#666",
                }}
              >
                Cargando productos...
              </div>
            )}

            {error &&
              !loadingProducts && (
                <div
                  style={{
                    padding:
                      "16px",
                    borderRadius:
                      "8px",
                    background:
                      "#fff1f1",
                    color:
                      "#b42318",
                    border:
                      "1px solid #f3b7b7",
                  }}
                >
                  {error}
                </div>
              )}

            {!loadingProducts &&
              !error &&
              filteredProducts.length ===
                0 && (
                <div
                  style={{
                    padding:
                      "40px 20px",
                    textAlign:
                      "center",
                    color:
                      "#777",
                  }}
                >
                  No se encontraron
                  productos.
                </div>
              )}

            {!loadingProducts &&
              !error &&
              filteredProducts.length >
                0 && (
                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap:
                      "16px",
                  }}
                >
                  {filteredProducts.map(
                    (product) => {
                      const cartItem =
                        cart.find(
                          (item) =>
                            item.product
                              .id ===
                            product.id
                        );

                      const quantityInCart =
                        cartItem
                          ?.quantity ||
                        0;

                      const noStock =
                        product.stock <=
                        0;

                      const maxReached =
                        quantityInCart >=
                        product.stock;

                      return (
                        <article
                          key={
                            product.id
                          }
                          style={{
                            border:
                              "1px solid #e1e4e8",
                            borderRadius:
                              "10px",
                            padding:
                              "16px",
                            background:
                              "#fff",
                          }}
                        >
                          <div
                            style={{
                              height:
                                "110px",
                              background:
                                "#f4f5f7",
                              borderRadius:
                                "8px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              overflow:
                                "hidden",
                              marginBottom:
                                "12px",
                            }}
                          >
                            {product
                              .images
                              ?.length ? (
                              <img
                                src={
                                  product
                                    .images[0]
                                }
                                alt={
                                  product.name
                                }
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  objectFit:
                                    "contain",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  color:
                                    "#999",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                Sin imagen
                              </span>
                            )}
                          </div>

                          <h3
                            style={{
                              margin:
                                "0 0 8px",
                              fontSize:
                                "15px",
                              lineHeight:
                                "1.35",
                            }}
                          >
                            {
                              product.name
                            }
                          </h3>

                          {(product.brand ||
                            product.model ||
                            product.variant) && (
                            <p
                              style={{
                                margin:
                                  "0 0 8px",
                                color:
                                  "#666",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {[
                                product.brand,
                                product.model,
                                product.variant,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " · "
                                )}
                            </p>
                          )}

                          {product.sku && (
                            <p
                              style={{
                                margin:
                                  "0 0 8px",
                                color:
                                  "#888",
                                fontSize:
                                  "12px",
                              }}
                            >
                              SKU:{" "}
                              {
                                product.sku
                              }
                            </p>
                          )}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              gap:
                                "10px",
                              marginTop:
                                "12px",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  fontSize:
                                    "18px",
                                }}
                              >
                                $
                                {formatPrice(
                                  Number(
                                    product.price
                                  )
                                )}
                              </strong>

                              <div
                                style={{
                                  marginTop:
                                    "3px",
                                  fontSize:
                                    "12px",
                                  color:
                                    noStock
                                      ? "#b42318"
                                      : "#666",
                                }}
                              >
                                Stock:{" "}
                                {
                                  product.stock
                                }
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                              disabled={
                                noStock ||
                                maxReached
                              }
                              style={{
                                border:
                                  "none",
                                borderRadius:
                                  "7px",
                                padding:
                                  "9px 12px",
                                background:
                                  noStock ||
                                  maxReached
                                    ? "#d5d8dc"
                                    : "#25b36a",
                                color:
                                  "#fff",
                                cursor:
                                  noStock ||
                                  maxReached
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight:
                                  600,
                              }}
                            >
                              {noStock
                                ? "Sin stock"
                                : maxReached
                                ? "Máximo"
                                : quantityInCart >
                                  0
                                ? `Agregar +1 (${quantityInCart})`
                                : "Agregar"}
                            </button>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
          </section>

          {/* CARRITO POS */}
          <aside
            style={{
              background:
                "#fff",
              borderRadius:
                "12px",
              padding:
                "20px",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.08)",
              position:
                "sticky",
              top: "20px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "20px",
                  }}
                >
                  Carrito POS
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#777",
                    fontSize:
                      "14px",
                  }}
                >
                  {cartQuantity}{" "}
                  artículo
                  {cartQuantity ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              {cart.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    clearCart
                  }
                  style={{
                    border:
                      "none",
                    background:
                      "transparent",
                    color:
                      "#b42318",
                    cursor:
                      "pointer",
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                  }}
                >
                  Vaciar
                </button>
              )}
            </div>

            {cart.length ===
            0 ? (
              <div
                style={{
                  padding:
                    "40px 10px",
                  textAlign:
                    "center",
                  color:
                    "#888",
                  border:
                    "1px dashed #d5d8dc",
                  borderRadius:
                    "8px",
                }}
              >
                <p
                  style={{
                    margin:
                      0,
                    fontWeight:
                      600,
                  }}
                >
                  El carrito está
                  vacío.
                </p>

                <p
                  style={{
                    margin:
                      "8px 0 0",
                    fontSize:
                      "13px",
                  }}
                >
                  Selecciona productos
                  para comenzar la
                  venta.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "12px",
                  }}
                >
                  {cart.map(
                    (item) => {
                      const subtotal =
                        Number(
                          item.product
                            .price
                        ) *
                        item.quantity;

                      return (
                        <div
                          key={
                            item.product
                              .id
                          }
                          style={{
                            paddingBottom:
                              "12px",
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap:
                                "10px",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                minWidth:
                                  0,
                              }}
                            >
                              <strong
                                style={{
                                  display:
                                    "block",
                                  fontSize:
                                    "14px",
                                  lineHeight:
                                    "1.35",
                                }}
                              >
                                {
                                  item
                                    .product
                                    .name
                                }
                              </strong>

                              <span
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "3px",
                                  color:
                                    "#777",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                $
                                {formatPrice(
                                  Number(
                                    item
                                      .product
                                      .price
                                  )
                                )}{" "}
                                c/u
                              </span>
                            </div>

                            <strong
                              style={{
                                fontSize:
                                  "14px",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              $
                              {formatPrice(
                                subtotal
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              marginTop:
                                "10px",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "6px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item
                                      .product
                                      .id
                                  )
                                }
                                style={{
                                  width:
                                    "30px",
                                  height:
                                    "30px",
                                  border:
                                    "1px solid #d5d8dc",
                                  background:
                                    "#fff",
                                  borderRadius:
                                    "6px",
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "16px",
                                }}
                              >
                                −
                              </button>

                              <span
                                style={{
                                  minWidth:
                                    "28px",
                                  textAlign:
                                    "center",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  item.quantity
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item
                                      .product
                                      .id
                                  )
                                }
                                disabled={
                                  item.quantity >=
                                  item.product.stock
                                }
                                style={{
                                  width:
                                    "30px",
                                  height:
                                    "30px",
                                  border:
                                    "1px solid #d5d8dc",
                                  background:
                                    item.quantity >=
                                    item.product.stock
                                      ? "#eee"
                                      : "#fff",
                                  borderRadius:
                                    "6px",
                                  cursor:
                                    item.quantity >=
                                    item.product.stock
                                      ? "not-allowed"
                                      : "pointer",
                                  fontSize:
                                    "16px",
                                }}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  item
                                    .product
                                    .id
                                )
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#b42318",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div
                  style={{
                    marginTop:
                      "20px",
                    paddingTop:
                      "18px",
                    borderTop:
                      "2px solid #222",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "16px",
                        fontWeight:
                          600,
                      }}
                    >
                      TOTAL
                    </span>

                    <strong
                      style={{
                        fontSize:
                          "26px",
                      }}
                    >
                      $
                      {formatPrice(
                        total
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    disabled
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "18px",
                      padding:
                        "14px",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      background:
                        "#d5d8dc",
                      color:
                        "#777",
                      fontSize:
                        "16px",
                      fontWeight:
                        700,
                      cursor:
                        "not-allowed",
                    }}
                  >
                    COBRAR
                  </button>

                  <p
                    style={{
                      margin:
                        "10px 0 0",
                      textAlign:
                        "center",
                      color:
                        "#888",
                      fontSize:
                        "12px",
                    }}
                  >
                    El cobro se habilitará
                    en el siguiente paso.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}