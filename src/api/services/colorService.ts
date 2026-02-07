import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Color Payload Type
 * Represents the API response/request format for colors
 */
export interface ColorPayload {
  _id?: string | number;
  id?: string;
  name: string;
  description?: string;
}

/**
 * Color Service
 * Handles all color-related API calls
 */
export const colorService = {
  /**
   * Get all colors
   */
  async getAll(): Promise<ColorPayload[]> {
    const { data } = await axiosClient.get<ColorPayload[]>(ENDPOINTS.COLORS);
    return data;
  },

  /**
   * Get color by ID
   */
  async getById(id: string): Promise<ColorPayload> {
    const { data } = await axiosClient.get<ColorPayload>(
      `${ENDPOINTS.COLORS}/${id}`
    );
    return data;
  },

  /**
   * Create a new color
   */
  async create(payload: ColorPayload): Promise<ColorPayload> {
    const { data } = await axiosClient.post<ColorPayload>(
      ENDPOINTS.COLORS,
      payload
    );
    return data;
  },

  /**
   * Update color by ID
   */
  async update(id: string, patch: Partial<ColorPayload>): Promise<ColorPayload> {
    const { data } = await axiosClient.put<ColorPayload>(
      `${ENDPOINTS.COLORS}/${id}`,
      patch
    );
    return data;
  },

  /**
   * Delete color by ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.COLORS}/${id}`);
  },
};
