import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * GRN (Goods Receipt Note) Payload Type
 * Represents the API response/request format for GRNs
 */
export interface GRNRecordPayload {
  _id?: string | number;
  id?: string;
  grnNumber: string;
  grnDate: string | Date;
  supplier?: string;
  supplierId?: string;
  supplierName?: string;
  linkedPoId?: string;
  items: Array<{
    sku: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  totalAmount: number;
  status?: string;
}

/**
 * GRN Service
 * Handles all GRN-related API calls
 */
export const grnService = {
  /**
   * Get all GRNs
   */
  async getAll(): Promise<GRNRecordPayload[]> {
    const { data } = await axiosClient.get<GRNRecordPayload[]>(ENDPOINTS.GRNS);
    return data;
  },

  /**
   * Get GRN by ID
   */
  async getById(id: string): Promise<GRNRecordPayload> {
    const { data } = await axiosClient.get<GRNRecordPayload>(
      `${ENDPOINTS.GRNS}/${id}`
    );
    return data;
  },

  /**
   * Create a new GRN
   */
  async create(payload: GRNRecordPayload): Promise<GRNRecordPayload> {
    const { data } = await axiosClient.post<GRNRecordPayload>(
      ENDPOINTS.GRNS,
      payload
    );
    return data;
  },

  /**
   * Update GRN by ID
   */
  async update(
    id: string,
    patch: Partial<GRNRecordPayload>
  ): Promise<GRNRecordPayload> {
    const { data } = await axiosClient.put<GRNRecordPayload>(
      `${ENDPOINTS.GRNS}/${id}`,
      patch
    );
    return data;
  },

  /**
   * Delete GRN by ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.GRNS}/${id}`);
  },
};
