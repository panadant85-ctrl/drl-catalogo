"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveProducts = findActiveProducts;
exports.findAllProducts = findAllProducts;
exports.findProductById = findProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.updateProductStatus = updateProductStatus;
exports.deleteProduct = deleteProduct;
exports.appendProductImage = appendProductImage;
const supabase_1 = require("../../config/supabase");
const node_crypto_1 = require("node:crypto");
async function findActiveProducts() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("products")
        .select("*")
        .eq("active", true)
        .order("id", { ascending: true });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
async function findAllProducts() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("products")
        .select("*")
        .order("id", { ascending: true });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
async function findProductById(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
/**
 * Genera un código de barras interno de 13 dígitos.
 * Calcula el dígito de control con el algoritmo EAN-13.
 */
function generateSKU(id) {
    return `DRL-${String(id).padStart(6, "0")}`;
}
function generateBarcode() {
    // Prefijo interno 200 + 9 dígitos aleatorios.
    const base = `200${String((0, node_crypto_1.randomInt)(0, 1_000_000_000)).padStart(9, "0")}`;
    const digits = base.split("").map(Number);
    const sum = digits.reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0);
    const checkDigit = (10 - (sum % 10)) % 10;
    return `${base}${checkDigit}`;
}
async function createProduct(input) {
    // 1. Validar la marca.
    const { data: brand, error: brandError } = await supabase_1.supabaseAdmin
        .from("brands")
        .select("id, name")
        .eq("id", input.brand_id)
        .maybeSingle();
    if (brandError)
        throw brandError;
    if (!brand) {
        throw new Error("La marca seleccionada no existe.");
    }
    // 2. Validar el proveedor.
    const { data: supplier, error: supplierError } = await supabase_1.supabaseAdmin
        .from("suppliers")
        .select("id")
        .eq("id", input.supplier_id)
        .maybeSingle();
    if (supplierError)
        throw supplierError;
    if (!supplier) {
        throw new Error("El proveedor seleccionado no existe.");
    }
    // 3. Validar la categoría.
    const { data: category, error: categoryError } = await supabase_1.supabaseAdmin
        .from("categories")
        .select("id, name")
        .eq("id", input.category_id)
        .maybeSingle();
    if (categoryError)
        throw categoryError;
    if (!category) {
        throw new Error("La categoría seleccionada no existe.");
    }
    // 4. Crear el producto sin los códigos.
    // Supabase generará el ID automáticamente.
    const { data: createdProduct, error: createError } = await supabase_1.supabaseAdmin
        .from("products")
        .insert({
        name: input.name,
        brand: brand.name,
        brand_id: input.brand_id,
        model: input.model ?? null,
        // Los códigos se generarán después del INSERT.
        sku: null,
        barcode: null,
        category: category.name,
        price: input.price,
        cost: input.cost,
        vip_price: input.vip_price ?? null,
        stock: input.stock,
        description: input.description ?? null,
        features: input.features ?? {},
        images: input.images ?? [],
        technical_specs: input.technical_specs ?? {},
        family_id: input.family_id ?? null,
        variant: input.variant ?? null,
        active: input.active,
        manager_commission: input.manager_commission,
        supplier_id: input.supplier_id,
    })
        .select("*")
        .single();
    if (createError)
        throw createError;
    if (!createdProduct) {
        throw new Error("No se pudo recuperar el producto creado.");
    }
    try {
        // 5. Generar y guardar los códigos.
        const sku = generateSKU(createdProduct.id);
        let productWithCodes = null;
        // Reintentar si el código de barras ya existe.
        for (let attempt = 0; attempt < 5; attempt++) {
            const barcode = generateBarcode();
            const { data: updatedProduct, error: updateError } = await supabase_1.supabaseAdmin
                .from("products")
                .update({
                sku,
                barcode,
            })
                .eq("id", createdProduct.id)
                .select("*")
                .single();
            if (!updateError && updatedProduct) {
                productWithCodes = updatedProduct;
                break;
            }
            const isBarcodeDuplicate = updateError?.code === "23505" &&
                updateError.message.includes("products_barcode_unique_idx");
            if (isBarcodeDuplicate) {
                continue;
            }
            throw updateError ??
                new Error("No se pudieron guardar los códigos del producto.");
        }
        if (!productWithCodes) {
            throw new Error("No se pudo generar un código de barras único después de 5 intentos.");
        }
        // 6. Crear la relación producto → categoría.
        const { error: relationError } = await supabase_1.supabaseAdmin
            .from("product_categories")
            .insert({
            product_id: createdProduct.id,
            category_id: input.category_id,
        });
        if (relationError) {
            throw relationError;
        }
        // 7. Devolver el producto con ambos códigos.
        return productWithCodes;
    }
    catch (error) {
        // Intentar limpiar los registros si falla el proceso.
        await supabase_1.supabaseAdmin
            .from("product_categories")
            .delete()
            .eq("product_id", createdProduct.id);
        await supabase_1.supabaseAdmin
            .from("products")
            .delete()
            .eq("id", createdProduct.id);
        throw error;
    }
}
async function updateProduct(id, input) {
    const updateData = {
        ...input,
    };
    // Los códigos se generan automáticamente al crear
    // el producto y no deben modificarse desde el formulario.
    delete updateData.sku;
    delete updateData.barcode;
    // Si cambia la marca, guardamos también el nombre compatible.
    if (input.brand_id !== undefined) {
        const { data: brand, error } = await supabase_1.supabaseAdmin
            .from("brands")
            .select("id, name")
            .eq("id", input.brand_id)
            .maybeSingle();
        if (error)
            throw error;
        if (!brand) {
            throw new Error("La marca seleccionada no existe.");
        }
        updateData.brand_id = input.brand_id;
        updateData.brand = brand.name;
    }
    // Si cambia el proveedor, verificamos que exista.
    if (input.supplier_id !== undefined) {
        const { data: supplier, error } = await supabase_1.supabaseAdmin
            .from("suppliers")
            .select("id")
            .eq("id", input.supplier_id)
            .maybeSingle();
        if (error)
            throw error;
        if (!supplier) {
            throw new Error("El proveedor seleccionado no existe.");
        }
        updateData.supplier_id = input.supplier_id;
    }
    // Si cambia la categoría, verificamos que exista.
    if (input.category_id !== undefined) {
        const { data: category, error } = await supabase_1.supabaseAdmin
            .from("categories")
            .select("id, name")
            .eq("id", input.category_id)
            .maybeSingle();
        if (error)
            throw error;
        if (!category) {
            throw new Error("La categoría seleccionada no existe.");
        }
        updateData.category_id = input.category_id;
        updateData.category = category.name;
    }
    // category_id solo se utiliza en product_categories.
    delete updateData.category_id;
    // No enviar valores undefined a Supabase.
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });
    // Normalizar campos opcionales antiguos.
    if (updateData.features === null) {
        updateData.features = {};
    }
    if (updateData.images === null) {
        updateData.images = [];
    }
    /*
     * Consultar el estado actual para determinar si el producto
     * fue desactivado automáticamente por falta de inventario.
     */
    const { data: currentProduct, error: currentError } = await supabase_1.supabaseAdmin
        .from("products")
        .select("stock, active, stock_disabled_by_inventory")
        .eq("id", id)
        .maybeSingle();
    if (currentError)
        throw currentError;
    if (!currentProduct) {
        return null;
    }
    const currentStock = Number(currentProduct.stock);
    const currentActive = currentProduct.active;
    const disabledByInventory = currentProduct.stock_disabled_by_inventory === true;
    const nextStock = updateData.stock !== undefined
        ? Number(updateData.stock)
        : currentStock;
    if (!Number.isInteger(nextStock) || nextStock < 0) {
        throw new Error("El stock debe ser un número entero igual o mayor que cero.");
    }
    /*
     * Gestionar el estado del producto según el inventario.
     */
    if (nextStock === 0) {
        // Sin existencias, nunca debe quedar activo.
        updateData.active = false;
        /*
         * Marcar como desactivación automática solamente cuando
         * el producto estaba activo antes de agotarse.
         *
         * Si ya estaba inactivo manualmente, preservar ese estado
         * y no marcarlo como agotado automáticamente.
         */
        updateData.stock_disabled_by_inventory =
            currentActive || disabledByInventory;
    }
    else if (disabledByInventory) {
        /*
         * Hay existencias nuevamente y el producto estaba
         * desactivado por inventario.
         *
         * Solo reactivar si el formulario no solicita
         * expresamente mantenerlo inactivo.
         */
        updateData.active = input.active === false
            ? false
            : true;
        updateData.stock_disabled_by_inventory = false;
    }
    else {
        /*
         * El producto no estaba desactivado automáticamente.
         * Respetar el estado enviado por el formulario.
         */
        updateData.stock_disabled_by_inventory = false;
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error)
        throw error;
    if (!data) {
        return null;
    }
    /*
     * Si se proporcionó una nueva categoría,
     * reemplazar la relación existente.
     */
    if (input.category_id !== undefined) {
        const { error: deleteRelationError } = await supabase_1.supabaseAdmin
            .from("product_categories")
            .delete()
            .eq("product_id", id);
        if (deleteRelationError) {
            throw deleteRelationError;
        }
        const { error: insertRelationError } = await supabase_1.supabaseAdmin
            .from("product_categories")
            .insert({
            product_id: id,
            category_id: input.category_id,
        });
        if (insertRelationError) {
            throw insertRelationError;
        }
    }
    return data;
}
async function updateProductStatus(id, active) {
    if (active) {
        const { data: product, error: productError } = await supabase_1.supabaseAdmin
            .from("products")
            .select("stock")
            .eq("id", id)
            .maybeSingle();
        if (productError) {
            throw productError;
        }
        if (!product) {
            return null;
        }
        if (Number(product.stock) <= 0) {
            throw new Error("No se puede activar un producto sin existencias.");
        }
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("products")
        .update({
        active,
        stock_disabled_by_inventory: false,
    })
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function deleteProduct(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function appendProductImage(id, imageUrl) {
    const { error } = await supabase_1.supabaseAdmin.rpc("append_product_image", {
        p_product_id: id,
        p_image_url: imageUrl,
    });
    if (error) {
        throw error;
    }
}
