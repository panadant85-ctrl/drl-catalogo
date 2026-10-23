
import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  uploadProductImage,
} from "../../repositories/products/productImageRepository";

import { randomUUID } from "node:crypto";

import {
  appendProductImage,
  findProductById,
} from "../../repositories/products/productRepository";

type ProductImageParams = {
  id: string;
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getExtension(
  filename: string,
  contentType: string
): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  // Se utiliza el tipo MIME validado,
  // no la extensión proporcionada por el usuario.
  return extensions[contentType] ??
    filename.split(".").pop()?.toLowerCase() ??
    "webp";
}

export async function uploadProductImageController(
  request: FastifyRequest<{
    Params: ProductImageParams;
  }>,
  reply: FastifyReply
) {
  try {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return reply.code(400).send({
        message: "El ID del producto no es válido.",
      });
    }

    const product = await findProductById(id);

    if (!product) {
      return reply.code(404).send({
        message: "El producto no existe.",
      });
    }

    const file = await request.file();

    if (!file) {
      return reply.code(400).send({
        message: "Debes seleccionar una imagen.",
      });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return reply.code(400).send({
        message: "Solo se permiten imágenes JPG, PNG o WEBP.",
      });
    }

    const fileBuffer = await file.toBuffer();

    if (fileBuffer.length === 0) {
      return reply.code(400).send({
        message: "El archivo está vacío.",
      });
    }

    if (fileBuffer.length > MAX_IMAGE_SIZE) {
      return reply.code(413).send({
        message: "La imagen no puede superar los 5 MB.",
      });
    }

    const extension = getExtension(
      file.filename,
      file.mimetype
    );

    const filePath =
     `products/${id}/${Date.now()}-${randomUUID()}.${extension}`;

    const imageUrl = await uploadProductImage(
      filePath,
      fileBuffer,
      file.mimetype
    );

    await appendProductImage(id, imageUrl);

    return reply.code(201).send({
      message: "Imagen subida correctamente.",
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    request.log.error(
      { err: error },
      "Error al subir imagen del producto"
    );

    return reply.code(500).send({
      message: "No se pudo subir la imagen del producto.",
    });
  }
}
