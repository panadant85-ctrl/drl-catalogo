  import type {
    FastifyReply,
    FastifyRequest,
  } from "fastify";

  import {
    productIdParamsSchema,
    createProductSchema,
    updateProductSchema,
    updateProductStatusSchema,
  } from "../../validators/products/productValidator";

  import { isAdmin } from "../../middlewares/permissions";
 import type { Product } from "../../types/product";

 import {
  getActiveProducts,
  getAllProducts,
  getProductById,
  createNewProduct,
  updateExistingProduct,
  changeProductStatus,
  removeProduct,
} from "../../services/products/productService";

  import type { 
      CreateProductInput,
      UpdateProductInput,
  } from "../../validators/products/productValidator";

type PublicProduct = Omit<
      Product,
      "cost" | "manager_commission"
    >;

    function toPublicProduct(
      product: Product
    ): PublicProduct {
      const {
        cost,
        manager_commission,
        ...publicProduct
      } = product;

      // Los valores internos se excluyen deliberadamente.
      void cost;
      void manager_commission;

      return publicProduct;
    }
  export async function createProductController(
    request: FastifyRequest<{
      Body: CreateProductInput;
    }>,
    reply: FastifyReply
  ) {
    const result =
      createProductSchema.safeParse(
        request.body
      );

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "Los datos del producto no son válidos.",
        details: result.error.issues,
      });
    }

    const product = await createNewProduct(
      result.data
    );

    const admin = await isAdmin(request);

    return reply.status(201).send({
      success: true,
      message: "Producto creado correctamente.",
      data: admin
        ? product
        : toPublicProduct(product),
    });
  }

export async function getProductsController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const products = await getActiveProducts();

  return reply.send({
    success: true,
    data: products.map(toPublicProduct),
  });
}
 export async function getAllProductsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const products = await getAllProducts();
  const admin = await isAdmin(request);

  return reply.send({
    success: true,
    data: admin
      ? products
      : products.map(toPublicProduct),
  });
}

  export async function getProductByIdController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "Bad Request",
        message: "El ID del producto no es válido.",
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: "El producto no existe.",
      });
    }

    return reply.send({
      success: true,
      data: toPublicProduct(product),
    });
  }
  export async function updateProductController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
      Body: UpdateProductInput;
    }>,
    reply: FastifyReply
  ) {
    const paramsResult =
      productIdParamsSchema.safeParse(
        request.params
      );

    if (!paramsResult.success) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "El ID del producto no es válido.",
        details: paramsResult.error.issues,
      });
    }

    const bodyResult =
      updateProductSchema.safeParse(
        request.body
      );

    if (!bodyResult.success) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "Los datos del producto no son válidos.",
        details: bodyResult.error.issues,
      });
    }

    const product =
      await updateExistingProduct(
        paramsResult.data.id,
        bodyResult.data
      );

    if (!product) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message:
          "El producto no existe.",
      });
    }

    return reply.send({
      success: true,
      message:
        "Producto actualizado correctamente.",
      data: product,
    });
  }
  export async function updateProductStatusController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
      Body: {
        active: boolean;
      };
    }>,
    reply: FastifyReply
  ) {
    const paramsResult =
      productIdParamsSchema.safeParse(
        request.params
      );

    if (!paramsResult.success) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "El ID del producto no es válido.",
        details: paramsResult.error.issues,
      });
    }

    const bodyResult =
      updateProductStatusSchema.safeParse(
        request.body
      );

    if (!bodyResult.success) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "El estado del producto no es válido.",
        details: bodyResult.error.issues,
      });
    }

    const product =
      await changeProductStatus(
        paramsResult.data.id,
        bodyResult.data.active
      );

    if (!product) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message:
          "El producto no existe.",
      });
    }

    return reply.send({
      success: true,
      message: product.active
        ? "Producto activado correctamente."
        : "Producto desactivado correctamente.",
      data: product,
    });
  }
  export async function deleteProductController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const result =
      productIdParamsSchema.safeParse(
        request.params
      );

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "El ID del producto no es válido.",
        details: result.error.issues,
      });
    }

    const product = await removeProduct(
      result.data.id
    );

    if (!product) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message:
          "El producto no existe.",
      });
    }

    return reply.send({
      success: true,
      message:
        "Producto eliminado correctamente.",
      data: product,
    });
  }