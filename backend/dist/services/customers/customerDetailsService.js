"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerDetails = getCustomerDetails;
const customerDetailsRepository_1 = require("../../repositories/customers/customerDetailsRepository");
async function getCustomerDetails(customerId) {
    const customer = await (0, customerDetailsRepository_1.findCustomerDetailsBase)(customerId);
    if (!customer) {
        return null;
    }
    const orders = await (0, customerDetailsRepository_1.findOrdersByCustomerId)(customerId);
    const orderIds = orders.map((order) => order.id);
    const allItems = await (0, customerDetailsRepository_1.findOrderItemsByOrderIds)(orderIds);
    /*
     * Los pedidos cancelados permanecen visibles
     * en el historial, pero no cuentan como compras.
     */
    const validOrders = orders.filter((order) => order.status !== "cancelado");
    const validOrderIds = new Set(validOrders.map((order) => order.id));
    const purchaseItems = allItems.filter((item) => validOrderIds.has(item.order_id));
    /*
     * RESUMEN
     */
    const totalComprado = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const cantidadPedidos = validOrders.length;
    const ticketPromedio = cantidadPedidos > 0
        ? totalComprado /
            cantidadPedidos
        : 0;
    const ultimaCompra = validOrders.length > 0
        ? validOrders[0].created_at
        : null;
    /*
     * PRODUCTOS COMPRADOS
     */
    const productMap = new Map();
    for (const item of purchaseItems) {
        const key = `${item.product_id ?? "null"}|${item.product_name}|${item.variant ?? ""}`;
        const existing = productMap.get(key);
        if (existing) {
            existing.quantity +=
                Number(item.quantity || 0);
            existing.veces_comprado += 1;
            existing.total +=
                Number(item.subtotal || 0);
        }
        else {
            productMap.set(key, {
                product_id: item.product_id,
                product_name: item.product_name,
                variant: item.variant,
                quantity: Number(item.quantity || 0),
                veces_comprado: 1,
                total: Number(item.subtotal || 0),
            });
        }
    }
    const productosComprados = Array.from(productMap.values()).sort((a, b) => b.total - a.total);
    /*
     * EVOLUCIÓN DE COMPRAS
     *
     * Agrupamos por día.
     */
    const evolutionMap = new Map();
    for (const order of validOrders) {
        const date = order.created_at.slice(0, 10);
        const existing = evolutionMap.get(date);
        if (existing) {
            existing.total +=
                Number(order.total || 0);
            existing.pedidos += 1;
        }
        else {
            evolutionMap.set(date, {
                fecha: date,
                total: Number(order.total || 0),
                pedidos: 1,
            });
        }
    }
    const evolucionCompras = Array.from(evolutionMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
    /*
     * PEDIDOS CON SUS ITEMS
     */
    const itemsByOrder = new Map();
    for (const item of allItems) {
        const existing = itemsByOrder.get(item.order_id);
        if (existing) {
            existing.push(item);
        }
        else {
            itemsByOrder.set(item.order_id, [item]);
        }
    }
    const pedidos = orders.map((order) => ({
        ...order,
        items: itemsByOrder.get(order.id) ?? [],
    }));
    return {
        customer,
        resumen: {
            totalComprado,
            cantidadPedidos,
            ticketPromedio,
            ultimaCompra,
        },
        pedidos,
        productosComprados,
        evolucionCompras,
    };
}
