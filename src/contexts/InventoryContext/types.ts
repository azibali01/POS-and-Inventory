/**
 * Inventory Context Types
 *
 * Type definitions for inventory management including products,
 * categories, and colors.
 */

export interface InventoryItem {
  _id: string;
  itemName?: string;
  category?: string;
  unit?: string;
  color?: string;
  thickness?: number;
  salesRate?: number;
  openingStock?: number;
  minimumStockLevel?: number;
  description?: string;
  stock?: number;
  lastUpdated?: string;
  quantity?: number;
  brand?: string;
  costPrice?: number;
  discount?: number;
}

export interface Category {
  id?: string | number;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface Color {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  hex?: string;
  metadata?: Record<string, unknown>;
}

export interface InventoryContextType {
  // Inventory/Products
  inventory: InventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  loadInventory: () => Promise<InventoryItem[]>;

  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  loadCategories: () => Promise<Category[]>;

  // Colors
  colors: Color[];
  colorsLoading: boolean;
  colorsError: string | null;
  setColors: React.Dispatch<React.SetStateAction<Color[]>>;
  loadColors: () => Promise<Color[]>;
}
