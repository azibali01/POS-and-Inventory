import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Purchase Record Payload Type
 * Represents the API response/request format for purchase orders
 */
export interface PurchaseRecordPayload {
  _id?: string | number;
  id?: string;
  poNumber: string;
  poDate: string | Date;
  expectedDelivery?: string | Date;
  supplier?: any; // Can be Supplier object or just ID
  supplierId?: string;
  products: Array<{
    id: string;
    productName: string;
    quantity: number;
    rate: number;
    color?: string;
    thickness?: string;
    length?: string | number;
    amount?: number;
    inventoryId?: string;
    received?: number;
  }>;
  subTotal?: number;
  total: number;
  status?: string;
  remarks?: string;
  createdAt?: Date | string;
}

/**
 * Purchase Service
 * Handles all purchase order-related API calls
 */
export const purchaseService = {
  /**
   * Get all purchase orders
   */
  async getAll(): Promise<PurchaseRecordPayload[]> {
    const { data } = await axiosClient.get<PurchaseRecordPayload[]>(
      ENDPOINTS.PURCHASE_ORDERS
    );
    return data;
  },

  /**
   * Get purchase order by ID
   */
  async getById(id: string | number): Promise<PurchaseRecordPayload> {
    const { data } = await axiosClient.get<PurchaseRecordPayload>(
      `${ENDPOINTS.PURCHASE_ORDERS}/${String(id)}`
    );
    return data;
  },

  /**
   * Create a new purchase order
   */
  async create(payload: PurchaseRecordPayload): Promise<PurchaseRecordPayload> {
    const { data } = await axiosClient.post<PurchaseRecordPayload>(
      ENDPOINTS.PURCHASE_ORDERS,
      payload
    );
    return data;
  },

  /**
   * Update purchase order by ID
   */
  async update(
    id: string | number,
    patch: Partial<PurchaseRecordPayload>
  ): Promise<PurchaseRecordPayload> {
    const { data } = await axiosClient.put<PurchaseRecordPayload>(
      `${ENDPOINTS.PURCHASE_ORDERS}/${String(id)}`,
      patch
    );
    return data;
  },

  /**
   * Delete purchase order by ID
   */
  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.PURCHASE_ORDERS}/${String(id)}`);
  },
};
