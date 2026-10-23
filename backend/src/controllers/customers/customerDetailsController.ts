import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  getCustomerDetails,
} from "../../services/customers/customerDetailsService";

import {
  customerIdParamsSchema,
} from "../../validators/customers/customerValidator";

export async function getCustomerDetailsController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    customerIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del cliente no es válido.",
      details:
        paramsResult.error.issues,
    });
  }

  try {
    const result =
      await getCustomerDetails(
        paramsResult.data.id
      );

    if (!result) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message:
          "El cliente no existe.",
      });
    }

    return reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error:
        "CustomerDetailsError",
      message:
        "No se pudo obtener el detalle del cliente.",
    });
  }
}