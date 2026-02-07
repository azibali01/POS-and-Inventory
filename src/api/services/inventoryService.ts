import { axiosClient, unwrapPaginated, type PaginatedResponse } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";
import type { InventoryItemPayload } from "./salesService";

/**
 * Color Payload
 */
export interface ColorPayload {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  hex?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Category Payload
 */
export interface CategoryPayload {
  _id?: string | number;
  id?: string | number;
  name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Inventory/Product Service
 * Handles all inventory and product-related API calls
 */
export const inventoryService = {
  /**
   * Get all products/inventory
   */
  async getAll() {
    const candidates = ["/products"];
    for (const path of candidates) {
      try {
        const { data } = await axiosClient.get<
          InventoryItemPayload[] | PaginatedResponse<InventoryItemPayload>
        >(path, { params: { limit: 10000 } });
        return unwrapPaginated(data);
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        const status = error?.response?.status;
        if (status && status === 404) continue;
        throw error;
      }
    }
    // nothing found — return empty list to keep app usable
    return [] as InventoryItemPayload[];
  },

  /**
   * Get product by ID
   */
  async getById(id: string | number) {
    const { data } = await axiosClient.get(
      `${ENDPOINTS.PRODUCTS}/${String(id)}`
    );
    return data;
  },

  /**
   * Create a new product
   */
  async create(item: InventoryItemPayload) {
    const { data } = await axiosClient.post<InventoryItemPayload>(
      ENDPOINTS.PRODUCTS,
      item
    );
    return data;
  },

  /**
   * Update product by ID
   */
  async update(id: string | number, patch: Partial<InventoryItemPayload>) {
    const { data } = await axiosClient.put<InventoryItemPayload>(
      `${ENDPOINTS.PRODUCTS}/${String(id)}`,
      patch
    );
    return data;
  },

  /**
   * Delete product by ID
   */
  async delete(id: string | number) {
    const { data} = await axiosClient.delete(
      `${ENDPOINTS.PRODUCTS}/${String(id)}`
    );
    return data;
  },
};

/**
 * Color Service
 */
export const colorService = {
  /**
   * Get all colors
   */
  async getAll() {
    const { data } = await axiosClient.get<ColorPayload[]>(ENDPOINTS.COLORS);
    return data;
  },

  /**
   * Create a new color
   */
  async create(payload: ColorPayload) {
    const { data } = await axiosClient.post<ColorPayload>(
      ENDPOINTS.COLORS,
      payload
    );
    return data;
  },

  /**
   * Update color by ID
   */
  async update(id: string | number, payload: Partial<ColorPayload>) {
    const { data } = await axiosClient.put<ColorPayload>(
      `${ENDPOINTS.COLORS}/${id}`,
      payload
    );
    return data;
  },

  /**
   * Delete color by ID
   */
  async delete(id: string | number) {
    const { data } = await axiosClient.delete(`${ENDPOINTS.COLORS}/${id}`);
    return data;
  },
};

/**
 * Category Service
 */
export const categoryService = {
  /**
   * Get all categories
   */
  async getAll() {
    const { data } = await axiosClient.get<CategoryPayload[]>(
      ENDPOINTS.CATEGORIES
    );
    return data;
  },

  /**
   * Create a new category
   */
  async create(payload: CategoryPayload) {
    const { data } = await axiosClient.post<CategoryPayload>(
      ENDPOINTS.CATEGORIES,
      payload
    );
    return data;
  },

  /**
   * Update category by ID
   */
  async update(id: string | number, payload: Partial<CategoryPayload>) {
    const { data } = await axiosClient.put<CategoryPayload>(
      `${ENDPOINTS.CATEGORIES}/${id}`,
      payload
    );
    return data;
  },

  /**
   * Delete category by ID
   */
  async delete(id: string | number) {
    const { data } = await axiosClient.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
    return data;
  },
};
