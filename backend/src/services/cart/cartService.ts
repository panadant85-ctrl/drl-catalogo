import {
  findCartItems,
  findCartItem,
  createCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart,
} from "../../repositories/cart/cartRepository";

import { findProductById } from "../../repositories/products/productRepository";

export async function getCustomerCart(
  authUserId: string
) {
  return findCartItems(authUserId);
}

export async function addItemToCart(
  authUserId: string,
  productId: number,
  quantity: number,
  variant: string | null
) {
  if (quantity <= 0) {
    throw new Error(
      "La cantidad debe ser mayor que cero."
    );
  }

  const product =
    await findProductById(productId);

  if (!product) {
    throw new Error(
      "El producto no existe."
    );
  }

  if (!product.active) {
    throw new Error(
      "El producto no está activo."
    );
  }

  const stock =
    Number(product.stock) || 0;

  if (stock <= 0) {
    throw new Error(
      `El producto "${product.name}" no tiene stock disponible.`
    );
  }

  const existingItem =
    await findCartItem(
      authUserId,
      productId,
      variant
    );

  const newQuantity =
    (existingItem?.quantity ?? 0) +
    quantity;

  if (newQuantity > stock) {
    throw new Error(
      `Stock insuficiente para "${product.name}". Disponible: ${stock}.`
    );
  }

  if (existingItem) {
    return updateCartItemQuantity(
      authUserId,
      productId,
      variant,
      newQuantity
    );
  }

  return createCartItem(
    authUserId,
    productId,
    quantity,
    variant
  );
}

export async function updateCustomerCartItem(
  authUserId: string,
  productId: number,
  quantity: number,
  variant: string | null
) {
  if (quantity <= 0) {
    throw new Error(
      "La cantidad debe ser mayor que cero."
    );
  }

  const product =
    await findProductById(productId);

  if (!product) {
    throw new Error(
      "El producto no existe."
    );
  }

  const stock =
    Number(product.stock) || 0;

  if (quantity > stock) {
    throw new Error(
      `Stock insuficiente para "${product.name}". Disponible: ${stock}.`
    );
  }

  return updateCartItemQuantity(
    authUserId,
    productId,
    variant,
    quantity
  );
}

export async function removeItemFromCart(
  authUserId: string,
  productId: number,
  variant: string | null
) {
  return deleteCartItem(
    authUserId,
    productId,
    variant
  );
}

export async function clearCustomerCart(
  authUserId: string
) {
  return clearCart(authUserId);
}