"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";


import {
  createProduct,
  updateProduct,
  uploadProductImage,
  getBrands,
  getCategories,
  getSuppliers,
  type CreateProductData,
  type UpdateProductData,
} from "@/lib/api";


import { getAdminAccessToken } from "@/lib/adminSession";

import "./ProductForm.css";

type JsonObject = Record<string, unknown>;

type KeyValueRow = {
  id: number;
  key: string;
  value: string;
};

type ProductFormProduct = {
  id: number;

  name: string;

  brand?: string | null;
  brand_id?: number | null;

  model?: string | null;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  supplier_id?: number | null;

  price: number;
  cost: number;
  vip_price?: number | null;

  stock: number;

  description?: string | null;

  features?: JsonObject | null;
  technical_specs?: JsonObject | null;
  images?: string[] | null;

  family_id?: number | null;
  variant?: string | null;

  active: boolean;
  stock_disabled_by_inventory?: boolean;
  manager_commission: number;
};

type ProductFormProps = {
  onSaved: () => void;
  onCancel: () => void;
  product?: ProductFormProduct | null;
};

type Brand = {
  id: number;
  name: string;
  active?: boolean;
};

type Category = {
  id: number;
  name: string;
  active?: boolean;
};

type Supplier = {
  id: number;
  company_name: string;
  nit?: string | null;
  active?: boolean;
};

function objectToRows(
  object: JsonObject | null | undefined
): KeyValueRow[] {
  if (!object || typeof object !== "object") {
    return [];
  }

  return Object.entries(object).map(
    ([key, value], index) => ({
      id: Date.now() + index,
      key,
      value:
        typeof value === "string"
          ? value
          : String(value ?? ""),
    })
  );
}

function rowsToObject(
  rows: KeyValueRow[]
): JsonObject {
  const result: JsonObject = {};

  for (const row of rows) {
    const key = row.key.trim();

    if (!key) {
      continue;
    }

    result[key] = row.value;
  }

  return result;
}

export default function ProductForm({
  onSaved,
  onCancel,
  product,
}: ProductFormProps) {
  

  const [name, setName] = useState("");

  const [brandId, setBrandId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [model, setModel] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [managerCommission, setManagerCommission] =
    useState("");

  const [stock, setStock] = useState("0");

  const [familyId, setFamilyId] = useState("");
  const [variant, setVariant] = useState("");

  const [description, setDescription] =
    useState("");

  const [features, setFeatures] =
    useState<KeyValueRow[]>([]);

  const [technicalSpecs, setTechnicalSpecs] =
    useState<KeyValueRow[]>([]);

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] =
    useState<Category[]>([]);
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loadingCatalogs, setLoadingCatalogs] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editingProductId = product?.id ?? createdProductId;
  const isEditing = editingProductId !== null;
  
  useEffect(() => {
    if (!product) {
      setName("");
      setBrandId("");
      setSupplierId("");
      setCategoryId("");
      setModel("");
      setSku("");
      setBarcode("");
      setCost("");
      setPrice("");
      setVipPrice("");
      setStock("0");
      setDescription("");
      setFamilyId("");
      setVariant("");
      setFeatures([]);
      setTechnicalSpecs([]);
      setImages([]);
      setCreatedProductId(null);
      setImageFiles([]);
      setActive(true);
      setManagerCommission("");

      return;
    }

    setName(product.name ?? "");

    setBrandId(
      product.brand_id !== null &&
      product.brand_id !== undefined
        ? String(product.brand_id)
        : ""
    );

    setSupplierId(
      product.supplier_id !== null &&
      product.supplier_id !== undefined
        ? String(product.supplier_id)
        : ""
    );

    setModel(product.model ?? "");
    setSku(product.sku ?? "");
    setBarcode(product.barcode ?? "");

    setCost(
      product.cost !== null &&
      product.cost !== undefined
        ? String(product.cost)
        : ""
    );

    setPrice(
      product.price !== null &&
      product.price !== undefined
        ? String(product.price)
        : ""
    );

    setVipPrice(
      product.vip_price !== null &&
      product.vip_price !== undefined
        ? String(product.vip_price)
        : ""
    );

    setStock(
      product.stock !== null &&
      product.stock !== undefined
        ? String(product.stock)
        : "0"
    );

    setDescription(product.description ?? "");

    setFamilyId(
      product.family_id !== null &&
      product.family_id !== undefined
        ? String(product.family_id)
        : ""
    );

    setVariant(product.variant ?? "");

    setActive(product.active);

    setManagerCommission(
      product.manager_commission !== null &&
      product.manager_commission !== undefined
        ? String(product.manager_commission)
        : "0"
    );

    setFeatures(
      objectToRows(product.features)
    );

    setTechnicalSpecs(
      objectToRows(product.technical_specs)
    );

    setImages(
      Array.isArray(product.images)
        ? product.images
        : []
    );
  }, [product]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogs() {
      try {
        setLoadingCatalogs(true);
        setError("");

        const accessToken =
          getAdminAccessToken();

        if (!accessToken) {
          throw new Error(
            "La sesión administrativa ha expirado."
          );
        }

        const [
          brandsResponse,
          categoriesResponse,
          suppliersResponse,
        ] = await Promise.all([
          getBrands(accessToken),
          getCategories(accessToken),
          getSuppliers(accessToken),
        ]);

        if (cancelled) {
          return;
        }

        const loadedBrands: Brand[] =
          Array.isArray(brandsResponse)
            ? brandsResponse
            : Array.isArray(brandsResponse?.data)
              ? brandsResponse.data
              : [];

        const loadedCategories: Category[] =
          Array.isArray(categoriesResponse)
            ? categoriesResponse
            : Array.isArray(categoriesResponse?.data)
              ? categoriesResponse.data
              : [];

        const loadedSuppliers: Supplier[] =
          Array.isArray(suppliersResponse)
            ? suppliersResponse
            : Array.isArray(suppliersResponse?.data)
              ? suppliersResponse.data
              : [];

        setBrands(loadedBrands);
        setCategories(loadedCategories);
        setSuppliers(loadedSuppliers);

        if (product?.category) {
          const matchingCategory =
            loadedCategories.find(
              (category) =>
                category.name
                  .trim()
                  .toLowerCase() ===
                product.category
                  ?.trim()
                  .toLowerCase()
            );

          if (matchingCategory) {
            setCategoryId(
              String(matchingCategory.id)
            );
          }
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los catálogos."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCatalogs(false);
        }
      }
    }

    loadCatalogs();

    return () => {
      cancelled = true;
    };
  }, [product]);

  
  useEffect(() => {
    const previewUrls = imageFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviewUrls(previewUrls);

    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageFiles]);

  function addFeature() {
    setFeatures((current) => [
      ...current,
      {
        id: Date.now(),
        key: "",
        value: "",
      },
    ]);
  }

  function removeFeature(id: number) {
    setFeatures((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function updateFeature(
    id: number,
    field: "key" | "value",
    value: string
  ) {
    setFeatures((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addTechnicalSpec() {
    setTechnicalSpecs((current) => [
      ...current,
      {
        id: Date.now(),
        key: "",
        value: "",
      },
    ]);
  }

  function removeTechnicalSpec(id: number) {
    setTechnicalSpecs((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function updateTechnicalSpec(
    id: number,
    field: "key" | "value",
    value: string
  ) {
    setTechnicalSpecs((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  
  function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      event.currentTarget.files ?? []
    );

    const validFiles: File[] = [];
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    const maxSize = 5 * 1024 * 1024;

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Solo se permiten imágenes JPG, PNG o WEBP."
        );
        continue;
      }

      if (file.size === 0 || file.size > maxSize) {
        setError(
          "Cada imagen debe tener un tamaño mayor que 0 y no superar los 5 MB."
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setImageFiles((current) => [
        ...current,
        ...validFiles,
      ]);
    }

    event.currentTarget.value = "";
  }

  function removeImageFile(index: number) {
    setImageFiles((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "El nombre del producto es obligatorio."
      );
      return;
    }

    if (!brandId) {
      setError("Debes seleccionar una marca.");
      return;
    }

    if (!supplierId) {
      setError(
        "Debes seleccionar un proveedor."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Debes seleccionar una categoría."
      );
      return;
    }

    if (
      cost === "" ||
      !Number.isFinite(Number(cost)) ||
      Number(cost) < 0
    ) {
      setError(
        "El costo debe ser un número igual o mayor que cero."
      );
      return;
    }

    if (
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      setError(
        "El precio normal debe ser un número igual o mayor que cero."
      );
      return;
    }

    if (
      vipPrice !== "" &&
      (!Number.isFinite(Number(vipPrice)) ||
        Number(vipPrice) < 0)
    ) {
      setError(
        "El precio VIP debe ser un número igual o mayor que cero."
      );
      return;
    }

    if (
      managerCommission === "" ||
      !Number.isFinite(
        Number(managerCommission)
      ) ||
      Number(managerCommission) < 0
    ) {
      setError(
        "La comisión debe ser un número igual o mayor que cero."
      );
      return;
    }

    if (
      stock === "" ||
      !Number.isFinite(Number(stock)) ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      setError(
        "El stock debe ser un número entero igual o mayor que cero."
      );
      return;
    }

    const featureKeys = features
      .map((item) => item.key.trim())
      .filter(Boolean);

    if (
      new Set(featureKeys).size !==
      featureKeys.length
    ) {
      setError(
        "No puede haber dos características con el mismo nombre."
      );
      return;
    }

    const technicalKeys = technicalSpecs
      .map((item) => item.key.trim())
      .filter(Boolean);

    if (
      new Set(technicalKeys).size !==
      technicalKeys.length
    ) {
      setError(
        "No puede haber dos especificaciones técnicas con el mismo nombre."
      );
      return;
    }

    try {
      setSaving(true);

      const accessToken =
        getAdminAccessToken();

      if (!accessToken) {
        throw new Error(
          "La sesión administrativa ha expirado."
        );
      }

      const cleanedImages = images
        .map((image) => image.trim())
        .filter(Boolean);

      const data: CreateProductData = {
        name: name.trim(),

        brand_id: Number(brandId),
        supplier_id: Number(supplierId),
        category_id: Number(categoryId),

        model: model.trim()
          ? model.trim()
          : null,

        cost: Number(cost),
        price: Number(price),

        vip_price:
          vipPrice.trim() !== ""
            ? Number(vipPrice)
            : null,

        stock: Number(stock),

        description:
          description.trim() !== ""
            ? description.trim()
            : null,

        features:
          rowsToObject(features),

        technical_specs:
          rowsToObject(technicalSpecs),

        images: cleanedImages,

        family_id:
          familyId.trim() !== ""
            ? Number(familyId)
            : null,

        variant:
          variant.trim() !== ""
            ? variant.trim()
            : null,

        active,

        manager_commission:
          Number(managerCommission),
      };

      
let productId = editingProductId;

if (productId !== null) {
  const updateData: UpdateProductData = {
    ...data,
    images: cleanedImages,
  };

  await updateProduct(
    accessToken,
    productId,
    updateData
  );
} else {
  const response = await createProduct(
    accessToken,
    {
      ...data,
      images: [],
    }
  );

  const newProductId = Number(response?.data?.id);

  if (
    !Number.isSafeInteger(newProductId) ||
    newProductId <= 0
  ) {
    throw new Error(
      "El producto se creó, pero no se recibió su ID. Comprueba el catálogo antes de volver a crearlo."
    );
  }

  productId = newProductId;
  setCreatedProductId(newProductId);

  setSku(response?.data?.sku ?? "");
  setBarcode(response?.data?.barcode ?? "");
}

for (const file of [...imageFiles]) {
  const imageUrl = await uploadProductImage(
    accessToken,
    productId,
    file
  );

  setImages((current) =>
    current.includes(imageUrl)
      ? current
      : [...current, imageUrl]
  );

  setImageFiles((current) =>
    current.filter((currentFile) => currentFile !== file)
  );
}


      onSaved();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "No se pudo actualizar el producto."
            : "No se pudo crear el producto."
      );
    } finally {
      setSaving(false);
    }
  }

  const catalogsReady =
    !loadingCatalogs &&
    brands.length > 0 &&
    categories.length > 0 &&
    suppliers.length > 0;
  
    const selectedImageCount = imageFiles.length;
  
  return (
    <div className="product-form-wrapper">
      <div className="product-form-header">
        <div>
          <h2>
            {isEditing
              ? "Editar producto"
              : "Nuevo producto"}
          </h2>

          <p>
            {isEditing
              ? "Modifica la información comercial y de inventario del producto."
              : "Introduce la información comercial y de inventario del producto."}
          </p>
        </div>

        <button
          type="button"
          className="product-form-close"
          onClick={onCancel}
          disabled={saving}
        >
          ×
        </button>
      </div>

      {loadingCatalogs && (
        <div className="product-form-loading">
          Cargando proveedores, marcas y categorías...
        </div>
      )}

      {!loadingCatalogs &&
        !catalogsReady &&
        !error && (
          <div className="product-form-warning">
            Debes tener al menos un proveedor, una
            marca y una categoría creados antes de
            registrar un producto.
          </div>
        )}

      {error && (
        <div className="product-form-error">
          {error}
        </div>
      )}

      <form
        className="product-form"
        onSubmit={handleSubmit}
      >

          <section className="product-form-section">
              <h3>Imágenes del producto</h3>

              <p className="product-form-help">
                Selecciona una o varias imágenes JPG, PNG o WEBP.
                Tamaño máximo: 5 MB por imagen.
              </p>

              <div className="product-form-image-upload">
                <input
                  id="product-images"
                  className="product-form-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelection}
                  disabled={saving}
                />

                <label
                  htmlFor="product-images"
                  className={`product-form-image-button${saving ? " is-disabled" : ""}`}
                >
                  <span>＋</span>
                  Seleccionar imágenes
                </label>

                <small>
                  {selectedImageCount === 0
                    ? "Ningún archivo nuevo seleccionado"
                    : selectedImageCount === 1
                      ? "1 imagen seleccionada"
                      : `${selectedImageCount} imágenes seleccionadas`}
                </small>
              </div>

              {images.length === 0 && imageFiles.length === 0 ? (
                <div className="product-form-empty-list">
                  No hay imágenes agregadas.
                </div>
              ) : (
                <div className="product-form-image-grid">
                  {images.map((image, index) => (
                    <div className="product-form-image-card" key={`saved-${image}-${index}`}>
                      <div className="product-form-image-preview">
                        <img src={image} alt={`Imagen guardada ${index + 1}`}/>
                      </div>
                      <div className="product-form-image-card-info">
                        <small>Imagen guardada</small>

                        <button
                          type="button"
                          className="product-form-remove"
                          onClick={() => removeImage(index)}
                          disabled={saving}
                        >
                          Eliminar
                        </button>
                      </div>
                      
                    </div>
                  ))}

                  {imageFiles.map((file, index) => (
                    <div className="product-form-image-card" key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
                      <div className="product-form-image-preview">
                        <img src={imagePreviewUrls[index]} alt={`Vista previa ${file.name}`}/>
                      </div>
                      <div className="product-form-image-card-info">
                        <small>{file.name}</small>

                        <button
                          type="button"
                          className="product-form-remove"
                          onClick={() => removeImageFile(index)}
                          disabled={saving}
                        >
                          Quitar
                        </button>
                     </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

        <section className="product-form-section">
          <h3>Información básica</h3>

          <div className="product-form-grid">
            <div className="product-form-field product-form-field-full">
              <label htmlFor="product-name">
                Nombre *
              </label>

              <input
                id="product-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Nombre del producto"
                disabled={saving}
                required
              />
            </div>
              
              
            <div className="product-form-field">
              <label htmlFor="product-supplier">
                Proveedor *
              </label>

              <select
                id="product-supplier"
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(event.target.value)
                }
                disabled={
                  saving || loadingCatalogs
                }
                required
              >
                <option value="">
                  Seleccionar proveedor
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.company_name}
                    {supplier.nit
                      ? ` — ${supplier.nit}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-form-field">
              <label htmlFor="product-brand">
                Marca *
              </label>

              <select
                id="product-brand"
                value={brandId}
                onChange={(event) =>
                  setBrandId(event.target.value)
                }
                disabled={
                  saving || loadingCatalogs
                }
                required
              >
                <option value="">
                  Seleccionar marca
                </option>

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-form-field">
              <label htmlFor="product-category">
                Categoría *
              </label>

              <select
                id="product-category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                disabled={
                  saving || loadingCatalogs
                }
                required
              >
                <option value="">
                  Seleccionar categoría
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-form-field">
              <label htmlFor="product-model">
                Modelo
              </label>

              <input
                id="product-model"
                value={model}
                onChange={(event) =>
                  setModel(event.target.value)
                }
                placeholder="Modelo"
                disabled={saving}
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-family">
                Familia
              </label>

              <input
                id="product-family"
                type="number"
                min="1"
                value={familyId}
                onChange={(event) =>
                  setFamilyId(event.target.value)
                }
                placeholder="ID de familia"
                disabled={saving}
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-variant">
                Variante
              </label>

              <input
                id="product-variant"
                value={variant}
                onChange={(event) =>
                  setVariant(event.target.value)
                }
                placeholder="Ej. 30 L, 50 L"
                disabled={saving}
              />
            </div>
          </div>
        </section>

        <section className="product-form-section">
          <h3>Información comercial</h3>

          <div className="product-form-grid product-form-commercial-grid">
            <div className="product-form-field">
              <label htmlFor="product-cost">
                Costo *
              </label>

              <input
                id="product-cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(event) =>
                  setCost(event.target.value)
                }
                placeholder="0.00"
                disabled={saving}
                required
              />

              <small>
                Costo de adquisición.
              </small>
            </div>

            <div className="product-form-field">
              <label htmlFor="product-price">
                Precio normal *
              </label>

              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="0.00"
                disabled={saving}
                required
              />

              <small>
                Precio habitual de venta.
              </small>
            </div>

            <div className="product-form-field">
              <label htmlFor="product-vip-price">
                Precio VIP
              </label>

              <input
                id="product-vip-price"
                type="number"
                min="0"
                step="0.01"
                value={vipPrice}
                onChange={(event) =>
                  setVipPrice(event.target.value)
                }
                placeholder="Opcional"
                disabled={saving}
              />

              <small>
                Precio fijo para clientes VIP.
              </small>
            </div>

            <div className="product-form-field">
              <label htmlFor="product-commission">
                Comisión por unidad
              </label>

              <input
                id="product-commission"
                type="number"
                min="0"
                step="0.01"
                value={managerCommission}
                onChange={(event) =>
                  setManagerCommission(
                    event.target.value
                  )
                }
                placeholder="0.00"
                disabled={saving}
              />

              <small>
                Comisión fija del gestor por unidad.
              </small>
            </div>
          </div>
        </section>

        <section className="product-form-section">
          <h3>Inventario</h3>

          <div className="product-form-grid">
            <div className="product-form-field">
              <label htmlFor="product-stock">
                Stock *
              </label>

              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => {
                    const newStock = event.target.value;

                    setStock(newStock);

                    if (
                      product?.stock_disabled_by_inventory &&
                      Number(newStock) > 0
                    ) {
                      setActive(true);
                    }
                  }}
                disabled={saving}
                required
              />
            </div>

            <div className="product-form-field product-form-active">
              <label>Estado</label>

              <label className="product-form-checkbox">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(
                      event.target.checked
                    )
                  }
                  disabled={saving}
                />

                <span>
                  Producto activo
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="product-form-section">
          <h3>Características</h3>

          <p className="product-form-help">
            Agrega características comerciales o
            descriptivas del producto.
          </p>

          {features.length === 0 ? (
            <div className="product-form-empty-list">
              No hay características agregadas.
            </div>
          ) : (
            <div className="product-form-dynamic-list">
              {features.map((feature) => (
                <div
                  className="product-form-dynamic-row"
                  key={feature.id}
                >
                  <input
                    value={feature.key}
                    onChange={(event) =>
                      updateFeature(
                        feature.id,
                        "key",
                        event.target.value
                      )
                    }
                    placeholder="Característica"
                    disabled={saving}
                  />

                  <input
                    value={feature.value}
                    onChange={(event) =>
                      updateFeature(
                        feature.id,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Valor"
                    disabled={saving}
                  />

                  <button
                    type="button"
                    className="product-form-remove"
                    onClick={() =>
                      removeFeature(feature.id)
                    }
                    disabled={saving}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="product-form-add"
            onClick={addFeature}
            disabled={saving}
          >
            + Agregar característica
          </button>
        </section>

        <section className="product-form-section">
          <h3>Especificaciones técnicas</h3>

          <p className="product-form-help">
            Agrega las especificaciones técnicas
            propias del producto.
          </p>

          {technicalSpecs.length === 0 ? (
            <div className="product-form-empty-list">
              No hay especificaciones técnicas
              agregadas.
            </div>
          ) : (
            <div className="product-form-dynamic-list">
              {technicalSpecs.map((spec) => (
                <div
                  className="product-form-dynamic-row"
                  key={spec.id}
                >
                  <input
                    value={spec.key}
                    onChange={(event) =>
                      updateTechnicalSpec(
                        spec.id,
                        "key",
                        event.target.value
                      )
                    }
                    placeholder="Especificación"
                    disabled={saving}
                  />

                  <input
                    value={spec.value}
                    onChange={(event) =>
                      updateTechnicalSpec(
                        spec.id,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Valor"
                    disabled={saving}
                  />

                  <button
                    type="button"
                    className="product-form-remove"
                    onClick={() =>
                      removeTechnicalSpec(spec.id)
                    }
                    disabled={saving}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="product-form-add"
            onClick={addTechnicalSpec}
            disabled={saving}
          >
            + Agregar especificación
          </button>
        </section>

       

        <section className="product-form-section">
          <h3>Descripción</h3>

          <div className="product-form-field">
            <label htmlFor="product-description">
              Descripción
            </label>

            <textarea
              id="product-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Descripción del producto..."
              rows={5}
              disabled={saving}
            />
          </div>
        </section>

        <div className="product-form-actions">
          <button
            type="button"
            className="product-form-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="product-form-save"
            disabled={
              saving ||
              loadingCatalogs ||
              !catalogsReady
            }
          >
            {saving
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar producto"}
          </button>
        </div>
      </form>

    </div>
  );
}