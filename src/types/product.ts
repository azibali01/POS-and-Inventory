export interface ProductVariant {
  _id?: string;
  sku: string;
  thickness: string;
  color: string;
  length: string;
  salesRate: number;
  purchasePrice?: number;
  openingStock?: number;
  availableStock?: number;
  minimumStockLevel?: number;
}

export interface ProductVariantInput extends Omit<ProductVariant, "sku"> {
  sku?: string;
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  unit: string;
  description?: string;
  brand?: string;
  variants: ProductVariant[];
  color?: string;
  thickness?: string | number;
  salesRate?: number;
  openingStock?: number;
  availableStock?: number;
  minimumStockLevel?: number;
  stock?: number;
  lastUpdated?: string;
  quantity?: number;
}

export interface InventoryItemInput extends Omit<
  InventoryItem,
  "_id" | "variants"
> {
  variants: ProductVariantInput[];
  _id?: string;
}
