import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "DRL Electronik API",
        description:
          "API principal del sistema ecommerce DRL Electronik",
        version: "1.0.0",
      },

      servers: [
        {
          url: "http://localhost:4000",
          description: "Servidor local",
        },
      ],
      components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      tags: [
        {
          name: "Auth",
          description: "Autenticación y sesiones",
        },
        {
          name: "Products",
          description: "Gestión de productos",
        },
        {
          name: "Categories",
          description: "Categorías de productos",
        },
        {
          name: "Customers",
          description: "Gestión de clientes",
        },
        {
          name: "Managers",
          description: "Gestores comerciales",
        },
        {
          name: "Orders",
          description: "Pedidos y órdenes",
        },
        {
          name: "Dashboard",
          description: "Indicadores del sistema",
        },
        {
          name: "Reports",
          description: "Reportes y estadísticas",
        },
        {
          name: "Roles",
          description: "Roles y permisos",
        },
        {
          name: "Settings",
          description: "Configuración del sistema",
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });
});