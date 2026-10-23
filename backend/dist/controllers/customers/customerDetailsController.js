"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerDetailsController = getCustomerDetailsController;
const customerDetailsService_1 = require("../../services/customers/customerDetailsService");
const customerValidator_1 = require("../../validators/customers/customerValidator");
async function getCustomerDetailsController(request, reply) {
    const paramsResult = customerValidator_1.customerIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del cliente no es válido.",
            details: paramsResult.error.issues,
        });
    }
    try {
        const result = await (0, customerDetailsService_1.getCustomerDetails)(paramsResult.data.id);
        if (!result) {
            return reply.status(404).send({
                success: false,
                statusCode: 404,
                error: "Not Found",
                message: "El cliente no existe.",
            });
        }
        return reply.send({
            success: true,
            data: result,
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "CustomerDetailsError",
            message: "No se pudo obtener el detalle del cliente.",
        });
    }
}
