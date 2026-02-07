import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Category Payload Type
 * Note: Categories are simple string-based entities in the backend
 */
export interface CategoryPayload {
  _id?: string;
  name: string;
}

/**
 * Category Service
 * Handles all category-related API calls
 */
export const categoryService = {
  /**
   * Get all categories
   * Returns an array of category names
   */
  async getAll(): Promise<string[]> {
    const { data } = await axiosClient.get<string[] | CategoryPayload[]>(
      ENDPOINTS.CATEGORIES
    );
    // Handle both array of strings and array of objects
    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === "string") {
        return data as string[];
      }
      return (data as CategoryPayload[]).map((c) => c.name);
    }
    return [];
  },

  /**
   * Create a new category
   */
  async create(name: string): Promise<void> {
    await axiosClient.post(ENDPOINTS.CATEGORIES, { name });
  },

  /**
   * Update category by name
   */
  async update(oldName: string, newName: string): Promise<void> {
    await axiosClient.put(`${ENDPOINTS.CATEGORIES}/${oldName}`, {
      name: newName,
    });
  },

  /**
   * Delete category by name
   */
  async delete(name: string): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.CATEGORIES}/${name}`);
  },
};
