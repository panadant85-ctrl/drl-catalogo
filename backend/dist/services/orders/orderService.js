"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = getOrders;
exports.getOrdersByCustomerId = getOrdersByCustomerId;
exports.getOrderById = getOrderById;
exports.createNewOrder = createNewOrder;
exports.createNewPosOrder = createNewPosOrder;
exports.changeOrderStatus = changeOrderStatus;
exports.removeOrder = removeOrder;
const orderRepository_1 = require("../../repositories/orders/orderRepository");
const supabase_1 = require("../../config/supabase");
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(10000 + Math.random() * 90000);
    return `DRL-${year}${month}${day}-${random}`;
}
async function getOrders(request) {
    return (0, orderRepository_1.findOrders)(request);
}
/*
export async function getOrdersByCustomerId(
  customerId: number
) {
  const orders = await findOrdersByCustomerId(
    customerId
  );

  return Promise.all(
    orders.map(async (order) => {
      const items = await findOrderItems(order.id);

      return {
        order,
        items,
      };
    })
  );
}*/
async function getOrdersByCustomerId(customerId) {
    const orders = await (0, orderRepository_1.findOrdersByCustomerId)(customerId);
    return Promise.all(orders.map(async (order) => {
        const items = await (0, orderRepository_1.findOrderItems)(order.id);
        return {
            ...order,
            items,
        };
    }));
}
async function getOrderById(id, request) {
    const order = await (0, orderRepository_1.findOrderById)(id, request);
    if (!order)
        return null;
    let managerName = null;
    let managerCode = null;
    let customerName = null;
    const { data: customer, error: customerError } = await supabase_1.supabaseAdmin
        .from("customers")
        .select("first_name, last_name_1, last_name_2, full_name")
        .eq("id", order.customer_id)
        .maybeSingle();
    if (customerError)
        throw customerError;
    customerName = customer
        ? [
            customer.first_name,
            customer.last_name_1,
            customer.last_name_2,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || customer.full_name || null
        : null;
    if (order.manager_id) {
        const { data: manager, error } = await supabase_1.supabaseAdmin
            .from("managers")
            .select("full_name, manager_code")
            .eq("id", order.manager_id)
            .maybeSingle();
        if (error)
            throw error;
        managerName = manager?.full_name ?? null;
        managerCode = manager?.manager_code ?? null;
    }
    const items = await (0, orderRepository_1.findOrderItems)(id, request);
    return {
        order: {
            ...order,
            manager_name: managerName,
            manager_code: managerCode,
            customer_name: customerName,
        },
        items,
    };
}
async function createNewOrder(input) {
    /*
     * Validaciones de negocio
     */
    if (input.source_type === "manager" &&
        !input.manager_id) {
        throw new Error("Los pedidos de gestor requieren manager_id.");
    }
    if (input.source_type === "direct" &&
        input.manager_id) {
        throw new Error("Un pedido directo no puede tener manager_id.");
    }
    if (input.delivery &&
        !input.address?.trim()) {
        throw new Error("La dirección es obligatoria cuando el pedido requiere entrega.");
    }
    /*
     * Verificar cliente
     */
    const { data: customer, error: customerError, } = await supabase_1.supabaseAdmin
        .from("customers")
        .select("id")
        .eq("id", input.customer_id)
        .maybeSingle();
    if (customerError) {
        throw customerError;
    }
    if (!customer) {
        throw new Error("El cliente indicado no existe.");
    }
    /*
     * Verificar gestor
     */
    if (input.manager_id) {
        const { data: manager, error: managerError, } = await supabase_1.supabaseAdmin
            .from("managers")
            .select("id")
            .eq("id", input.manager_id)
            .maybeSingle();
        if (managerError) {
            throw managerError;
        }
        if (!manager) {
            throw new Error("El gestor indicado no existe.");
        }
    }
    /*
     * Obtener productos reales desde Supabase.
     * El cliente NO controla precio ni comisión.
     */
    const productIds = [
        ...new Set(input.items.map((item) => item.product_id)),
    ];
    const { data: products, error: productsError, } = await supabase_1.supabase
        .from("products")
        .select("id,name,stock,price,active,variant,manager_commission")
        .in("id", productIds);
    if (productsError) {
        throw productsError;
    }
    const productMap = new Map((products ?? []).map((product) => [
        product.id,
        product,
    ]));
    /*
     * Validar el stock total solicitado por producto.
     * Los colores comparten el stock del producto principal.
     */
    const requestedQuantityByProduct = new Map();
    for (const item of input.items) {
        const currentQuantity = requestedQuantityByProduct.get(item.product_id) ?? 0;
        requestedQuantityByProduct.set(item.product_id, currentQuantity + item.quantity);
    }
    /*
     * Construir items y calcular totales
     */
    let total = 0;
    let commissionTotal = 0;
    const calculatedItems = input.items.map((inputItem) => {
        const product = productMap.get(inputItem.product_id);
        if (!product) {
            throw new Error(`El producto ${inputItem.product_id} no existe.`);
        }
        if (!product.active) {
            throw new Error(`El producto "${product.name}" no está activo.`);
        }
        const unitPrice = Number(product.price) || 0;
        if (unitPrice <= 0) {
            throw new Error(`El producto "${product.name}" no tiene un precio válido.`);
        }
        /*
        * Validación de stock
        */
        const stock = Number(product.stock) || 0;
        if (stock <= 0) {
            throw new Error(`El producto "${product.name}" no tiene stock disponible.`);
        }
        const requestedQuantity = requestedQuantityByProduct.get(product.id) ?? 0;
        if (requestedQuantity > stock) {
            throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${stock}. Solicitado en total: ${requestedQuantity}.`);
        }
        /*
        * Cálculo del subtotal
        */
        const subtotal = unitPrice * inputItem.quantity;
        /*
        * La comisión solamente aplica a pedidos
        * provenientes de gestores.
        */
        const commissionUnit = input.source_type === "manager"
            ? Number(product.manager_commission) || 0
            : 0;
        const itemCommission = commissionUnit *
            inputItem.quantity;
        total += subtotal;
        commissionTotal += itemCommission;
        return {
            product_id: product.id,
            product_name: product.name,
            variant: inputItem.variant ??
                product.variant ??
                null,
            unit_price: unitPrice,
            quantity: inputItem.quantity,
            subtotal,
            commission_unit: commissionUnit,
            commission_total: itemCommission,
        };
    });
    /*
    * Crear pedido
    */
    const orderNumber = generateOrderNumber();
    const orderId = await (0, orderRepository_1.createOrderAtomic)({
        order_number: orderNumber,
        customer_id: input.customer_id,
        manager_id: input.manager_id ?? null,
        source_type: input.source_type,
        delivery: input.delivery,
        address: input.address ?? null,
        notes: input.notes ?? null,
        total,
        status: "nuevo",
        commission_total: commissionTotal,
    }, calculatedItems);
    const createdOrder = await (0, orderRepository_1.findOrderById)(orderId);
    if (!createdOrder) {
        throw new Error("El pedido fue creado pero no pudo recuperarse.");
    }
    const createdItems = await (0, orderRepository_1.findOrderItems)(orderId);
    return {
        order: createdOrder,
        items: createdItems,
    };
}
async function createNewPosOrder(input) {
    /*
    * 1. Verificar que el cliente existe
    */
    const { data: customer, error: customerError } = await supabase_1.supabase
        .from("customers")
        .select("id, manager_id")
        .eq("id", input.customer_id)
        .maybeSingle();
    if (customerError) {
        throw customerError;
    }
    if (!customer) {
        throw new Error("El cliente indicado no existe.");
    }
    /*
    * 2. Obtener los productos desde la base de datos
    */
    const productIds = [
        ...new Set(input.items.map((item) => item.product_id)),
    ];
    const { data: products, error: productsError } = await supabase_1.supabase
        .from("products")
        .select("id,name,stock,price,active,variant,manager_commission")
        .in("id", productIds);
    if (productsError) {
        throw productsError;
    }
    const productMap = new Map((products ?? []).map((product) => [
        product.id,
        product,
    ]));
    /*
    * 3. Calcular la venta utilizando
    *    precios y stock reales de la BD
    */
    let total = 0;
    const calculatedItems = input.items.map((inputItem) => {
        const product = productMap.get(inputItem.product_id);
        if (!product) {
            throw new Error(`El producto ${inputItem.product_id} no existe.`);
        }
        if (!product.active) {
            throw new Error(`El producto "${product.name}" no está activo.`);
        }
        const unitPrice = Number(product.price) || 0;
        if (unitPrice <= 0) {
            throw new Error(`El producto "${product.name}" no tiene un precio válido.`);
        }
        const stock = Number(product.stock) || 0;
        if (stock <= 0) {
            throw new Error(`El producto "${product.name}" no tiene stock disponible.`);
        }
        if (inputItem.quantity > stock) {
            throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${stock}. Solicitado: ${inputItem.quantity}.`);
        }
        const subtotal = unitPrice *
            inputItem.quantity;
        total += subtotal;
        const commissionUnit = Number(product.manager_commission) || 0;
        const commissionTotal = commissionUnit * inputItem.quantity;
        return {
            product_id: product.id,
            product_name: product.name,
            variant: inputItem.variant ??
                product.variant ??
                null,
            unit_price: unitPrice,
            quantity: inputItem.quantity,
            subtotal,
            commission_unit: commissionUnit,
            commission_total: commissionTotal,
        };
    });
    /*
    * 4. Generar número de venta
    */
    const orderNumber = generateOrderNumber();
    /*
      * 4.1 calculo de la comision
      */
    const commissionTotal = calculatedItems.reduce((sum, item) => sum + item.commission_total, 0);
    /*
    * 5. Crear venta POS
    *
    * Una venta física ya cobrada y entregada
    * queda directamente como "entregado".
    */
    const orderId = await (0, orderRepository_1.createOrderAtomic)({
        order_number: orderNumber,
        customer_id: input.customer_id,
        manager_id: customer.manager_id ?? null,
        source_type: customer.manager_id
            ? "manager"
            : "direct",
        delivery: false,
        address: null,
        notes: input.notes ?? null,
        total,
        status: "entregado",
        commission_total: commissionTotal,
    }, calculatedItems);
    /*
    * 6. Recuperar la venta creada
    */
    const createdOrder = await (0, orderRepository_1.findOrderById)(orderId);
    if (!createdOrder) {
        throw new Error("La venta fue creada pero no pudo recuperarse.");
    }
    const createdItems = await (0, orderRepository_1.findOrderItems)(orderId);
    return {
        order: createdOrder,
        items: createdItems,
    };
}
async function changeOrderStatus(id, status) {
    return (0, orderRepository_1.updateOrderStatus)(id, status);
}
async function removeOrder(id) {
    return (0, orderRepository_1.deleteOrder)(id);
}
