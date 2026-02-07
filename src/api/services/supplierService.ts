import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Supplier Payload Type
 * Represents the API response/request format for suppliers
 */
export interface SupplierPayload {
  _id?: string | number;
  id?: string | number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  openingBalance?: number;
  paymentType?: "Credit" | "Debit";
  currentBalance?: number;
  createdAt?: string | Date;
}

/**
 * Supplier Service
 * Handles all supplier-related API calls
 */
export const supplierService = {
  /**
   * Get all suppliers
   */
  async getAll(): Promise<SupplierPayload[]> {
    const { data } = await axiosClient.get<SupplierPayload[]>(
      ENDPOINTS.SUPPLIERS
    );
    return data;
  },

  /**
   * Get supplier by ID
   */
  async getById(id: string | number): Promise<SupplierPayload> {
    const { data } = await axiosClient.get<SupplierPayload>(
      `${ENDPOINTS.SUPPLIERS}/${String(id)}`
    );
    return data;
  },

  /**
   * Create a new supplier
   */
  async create(payload: SupplierPayload): Promise<SupplierPayload> {
    const { data } = await axiosClient.post<SupplierPayload>(
      ENDPOINTS.SUPPLIERS,
      payload
    );
    return data;
  },

  /**
   * Update supplier by ID
   */
  async update(
    id: string | number,
    patch: Partial<SupplierPayload>
  ): Promise<SupplierPayload> {
    const { data } = await axiosClient.put<SupplierPayload>(
      `${ENDPOINTS.SUPPLIERS}/${String(id)}`,
      patch
    );
    return data;
  },

  /**
   * Delete supplier by ID
   */
  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.SUPPLIERS}/${String(id)}`);
  },
};
