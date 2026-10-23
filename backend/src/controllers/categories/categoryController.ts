import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  createNewCategory,
  getCategories,
  getCategoryById,
  removeCategory,
  updateExistingCategory,
} from "../../services/categories/categoryService";

import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/categories/categoryValidator";

export async function listCategories(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const categories = await getCategories();

  return reply.send({
    data: categories,
  });
}

export async function getCategory(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } =
    categoryIdSchema.parse(
      request.params
    );

  const category =
    await getCategoryById(id);

  if (!category) {
    return reply.code(404).send({
      message:
        "La categoría no existe.",
    });
  }

  return reply.send({
    data: category,
  });
}

export async function createCategoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const input =
    createCategorySchema.parse(
      request.body
    );

  const category =
    await createNewCategory(input);

  return reply.code(201).send({
    message:
      "Categoría creada correctamente.",
    data: category,
  });
}

export async function updateCategoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } =
    categoryIdSchema.parse(
      request.params
    );

  const input =
    updateCategorySchema.parse(
      request.body
    );

  const category =
    await updateExistingCategory(
      id,
      input
    );

  if (!category) {
    return reply.code(404).send({
      message:
        "La categoría no existe.",
    });
  }

  return reply.send({
    message:
      "Categoría actualizada correctamente.",
    data: category,
  });
}

export async function deleteCategoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } =
    categoryIdSchema.parse(
      request.params
    );

  const category =
    await removeCategory(id);

  if (!category) {
    return reply.code(404).send({
      message:
        "La categoría no existe.",
    });
  }

  return reply.send({
    message:
      "Categoría eliminada correctamente.",
    data: category,
  });
}