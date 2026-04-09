type VariantLike = {
  sku?: string;
  thickness?: string;
  color?: string;
  length?: string;
  salesRate?: number;
  availableStock?: number;
  openingStock?: number;
};

type ProductLike = {
  _id?: string | number;
  itemName?: string;
  brand?: string;
  unit?: string;
  variants?: VariantLike[];
};

type LineItemLike = {
  productId?: string | number;
  productName?: string;
  itemName?: string;
  thickness?: string | number;
  color?: string;
  sku?: string;
  quantity?: number;
  rate?: number;
  salesRate?: number;
  length?: number | string;
  discount?: number;
  discountAmount?: number;
};

function normalizeVariantValue(
  value: string | number | undefined | null,
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function toProductId(value: string | number | undefined): string {
  return value == null ? "" : String(value);
}

export function getLineItemName(item: LineItemLike): string {
  return item.productName || item.itemName || "";
}

export function findSelectedProduct(
  products: ProductLike[],
  item: LineItemLike,
): ProductLike | null {
  const itemProductId = toProductId(item.productId);
  const itemName = getLineItemName(item).toLowerCase();

  return (
    products.find((product) => {
      const productId = toProductId(product._id);
      const productName = (product.itemName || "").toLowerCase();
      return (
        (itemProductId && productId === itemProductId) ||
        (!!itemName && productName === itemName)
      );
    }) || null
  );
}

export function getProductOptions(products: ProductLike[]) {
  return products
    .filter((product) => product._id != null && product.itemName)
    .map((product) => ({
      value: toProductId(product._id),
      label: product.itemName || "",
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getThicknessOptions(product: ProductLike | null) {
  if (!product?.variants?.length) return [];

  return Array.from(
    new Set(
      product.variants
        .map((variant) => (variant.thickness || "").trim())
        .filter(Boolean),
    ),
  )
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    )
    .map((thickness) => ({ value: thickness, label: thickness }));
}

export function getColorOptions(
  product: ProductLike | null,
  thickness: string,
) {
  if (!product?.variants?.length || !thickness) return [];

  const normalizedThickness = normalizeVariantValue(thickness);

  return Array.from(
    new Set(
      product.variants
        .filter(
          (variant) =>
            normalizeVariantValue(variant.thickness) === normalizedThickness,
        )
        .map((variant) => (variant.color || "").trim())
        .filter(Boolean),
    ),
  )
    .sort((left, right) => left.localeCompare(right))
    .map((color) => ({ value: color, label: color }));
}

export function getLengthOptions(
  product: ProductLike | null,
  thickness: string,
  color: string,
) {
  if (!product?.variants?.length || !thickness || !color) return [];

  const normalizedThickness = normalizeVariantValue(thickness);
  const normalizedColor = normalizeVariantValue(color);

  return Array.from(
    new Set(
      product.variants
        .filter(
          (variant) =>
            normalizeVariantValue(variant.thickness) === normalizedThickness &&
            normalizeVariantValue(variant.color) === normalizedColor,
        )
        .map((variant) => (variant.length || "").trim())
        .filter(Boolean),
    ),
  )
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    )
    .map((length) => ({ value: length, label: length }));
}

export function findSelectedVariant(
  product: ProductLike | null,
  thickness: string,
  color: string,
  length?: string,
  sku?: string,
) {
  if (!product?.variants?.length) return null;

  const normalizedThickness = normalizeVariantValue(thickness);
  const normalizedColor = normalizeVariantValue(color);
  const normalizedLength = normalizeVariantValue(length);

  if (sku) {
    const directMatch = product.variants.find((variant) => variant.sku === sku);
    if (directMatch) return directMatch;
  }

  return (
    product.variants.find(
      (variant) =>
        normalizeVariantValue(variant.thickness) === normalizedThickness &&
        normalizeVariantValue(variant.color) === normalizedColor &&
        normalizeVariantValue(variant.length) === normalizedLength,
    ) || null
  );
}

export function getVariantStock(variant: VariantLike | null): number {
  if (!variant) return 0;
  return variant.availableStock ?? variant.openingStock ?? 0;
}

export function calculateLineSubtotal(item: LineItemLike): number {
  const quantity = item.quantity || 0;
  const rate = item.salesRate ?? item.rate ?? 0;
  const rawLength = item.length;
  const length =
    typeof rawLength === "string" && rawLength === ""
      ? 1
      : Number(rawLength ?? 1) || 0;

  return quantity * rate * length;
}

export function calculateDiscountAmount(
  item: LineItemLike,
  subtotal: number,
): number {
  if (item.discountAmount != null) {
    return item.discountAmount || 0;
  }
  return subtotal * ((item.discount || 0) / 100);
}

export function hasIncompleteVariantSelection(item: LineItemLike): boolean {
  const hasProduct =
    !!toProductId(item.productId) || !!getLineItemName(item).trim();
  if (!hasProduct) return false;

  return (
    !String(item.thickness || "").trim() ||
    !(item.color || "").trim() ||
    !String(item.length || "").trim()
  );
}
