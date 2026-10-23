import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createNewBrand,
  getBrandById,
  getBrands,
  saveBrandLogo,
  removeBrand,
  updateExistingBrand,
} from "../../services/brands/brandService";

import {
  brandIdSchema,
  createBrandSchema,
  updateBrandSchema,
} from "../../validators/brands/brandValidator";

export async function listBrands(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const brands = await getBrands();

  return reply.send({
    data: brands,
  });
}

export async function getBrand(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = brandIdSchema.parse(request.params);

  const brand = await getBrandById(id);

  if (!brand) {
    return reply.code(404).send({
      message: "La marca no existe.",
    });
  }

  return reply.send({
    data: brand,
  });
}

export async function createBrandController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const input = createBrandSchema.parse(request.body);

  const brand = await createNewBrand(input);

  return reply.code(201).send({
    message: "Marca creada correctamente.",
    data: brand,
  });
}

export async function updateBrandController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = brandIdSchema.parse(request.params);

  const input = updateBrandSchema.parse(request.body);

  const brand = await updateExistingBrand(id, input);

  if (!brand) {
    return reply.code(404).send({
      message: "La marca no existe.",
    });
  }

  return reply.send({
    message: "Marca actualizada correctamente.",
    data: brand,
  });
}

export async function deleteBrandController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = brandIdSchema.parse(request.params);

  const brand = await removeBrand(id);

  if (!brand) {
    return reply.code(404).send({
      message: "La marca no existe.",
    });
  }

  return reply.send({
    message: "Marca eliminada correctamente.",
    data: brand,
  });
}

export async function uploadBrandLogoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("=== UPLOAD BRAND LOGO ===");
    console.log("PARAMS:", request.params);
    console.log(
      "CONTENT-TYPE:",
      request.headers["content-type"]
    );

    const { id } = brandIdSchema.parse(
      request.params
    );

    const brand = await getBrandById(id);

    console.log("BRAND:", brand);

    if (!brand) {
      return reply.code(404).send({
        message: "La marca no existe.",
      });
    }

    const file = await request.file();

    console.log(
      "FILE:",
      file
        ? {
            filename: file.filename,
            mimetype: file.mimetype,
          }
        : null
    );

    if (!file) {
      return reply.code(400).send({
        message:
          "Debes seleccionar un archivo de imagen.",
      });
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return reply.code(400).send({
        message:
          "El archivo debe ser PNG, JPG, WEBP o SVG.",
      });
    }

    const fileBuffer = await file.toBuffer();

    console.log(
      "FILE SIZE:",
      fileBuffer.length
    );

    const extension =
      file.filename
        .split(".")
        .pop()
        ?.toLowerCase() || "png";

    const filePath =
      `brand-${id}-${Date.now()}.${extension}`;

    console.log(
      "FILE PATH:",
      filePath
    );

    const publicUrl = await saveBrandLogo(
      filePath,
      fileBuffer,
      file.mimetype
    );

    console.log(
      "PUBLIC URL:",
      publicUrl
    );

    const updatedBrand =
      await updateExistingBrand(id, {
        logo_url: publicUrl,
      });

    console.log(
      "UPDATED BRAND:",
      updatedBrand
    );

    return reply.send({
      message:
        "Logo de la marca actualizado correctamente.",
      data: updatedBrand,
    });
  } catch (error) {
    console.error(
      "=== ERROR UPLOAD BRAND LOGO ==="
    );
    console.error(error);

    return reply.code(500).send({
      message:
        "Error interno al subir el logo.",
    });
  }
}