import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Purchase Return Payload Type
 * Represents the API response/request format for purchase returns
 */
export interface PurchaseReturnRecordPayload {
  _id?: string | number;
  id?: string;
  returnNumber: string;
  returnDate: string | Date;
  items: any[]; // InventoryItemPayload[] Would require importing from inventoryService
  supplier?: string;
  supplierId?: string;
  linkedPoId?: string;
  subtotal: number;
  total: number;
  reason?: string;
}

/**
 * Purchase Return Service
 * Handles all purchase return-related API calls
 */
export const purchaseReturnService = {
  /**
   * Get all purchase returns
   */
  async getAll(): Promise<PurchaseReturnRecordPayload[]> {
    const { data } = await axiosClient.get<PurchaseReturnRecordPayload[]>(
      ENDPOINTS.PURCHASE_RETURNS
    );
    return data;
  },

  /**
   * Get purchase return by ID
   */
  async getById(id: string): Promise<PurchaseReturnRecordPayload> {
    const { data } = await axiosClient.get<PurchaseReturnRecordPayload>(
      `${ENDPOINTS.PURCHASE_RETURNS}/${id}`
    );
    return data;
  },

  /**
   * Create a new purchase return
   */
  async create(
    payload: PurchaseReturnRecordPayload
  ): Promise<PurchaseReturnRecordPayload> {
    const { data } = await axiosClient.post<PurchaseReturnRecordPayload>(
      ENDPOINTS.PURCHASE_RETURNS,
      payload
    );
    return data;
  },

  /**
   * Update purchase return by ID
   */
  async update(id: string | number, payload: Partial<PurchaseReturnRecordPayload>) {
    const { data } = await axiosClient.put(
      `${ENDPOINTS.PURCHASE_RETURNS}/${id}`,
      payload
    );
    return data;
  },

  /**
   * Delete purchase return by ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.PURCHASE_RETURNS}/${id}`);
  },
};
