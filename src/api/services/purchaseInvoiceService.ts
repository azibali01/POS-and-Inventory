import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Purchase Invoice Payload Type
 * Represents the API response/request format for purchase invoices
 */
export interface PurchaseInvoiceRecordPayload {
  _id?: string | number;
  id?: string;
  purchaseInvoiceNumber: string;
  invoiceDate: string | Date;
  expectedDelivery?: string | Date;
  supplier?: any;
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
 * Purchase Invoice Service
 * Handles all purchase invoice-related API calls
 */
export const purchaseInvoiceService = {
  /**
   * Get all purchase invoices
   */
  async getAll(): Promise<PurchaseInvoiceRecordPayload[]> {
    const { data } = await axiosClient.get<PurchaseInvoiceRecordPayload[]>(
      ENDPOINTS.PURCHASE_INVOICES
    );
    return data;
  },

  /**
   * Get purchase invoice by ID
   */
  async getById(id: string): Promise<PurchaseInvoiceRecordPayload> {
    const { data} = await axiosClient.get<PurchaseInvoiceRecordPayload>(
      `${ENDPOINTS.PURCHASE_INVOICES}/${id}`
    );
    return data;
  },

  /**
   * Create a new purchase invoice
   */
  async create(
    payload: PurchaseInvoiceRecordPayload
  ): Promise<PurchaseInvoiceRecordPayload> {
    const { data } = await axiosClient.post<PurchaseInvoiceRecordPayload>(
      ENDPOINTS.PURCHASE_INVOICES,
      payload
    );
    return data;
  },

  /**
   * Update purchase invoice by ID or invoice number
   * Note: Backend likely expects ID, but hooks might pass number.
   * We will stick to ID as primary, or whatever backend supports.
   */
  async update(id: string | number, payload: Partial<PurchaseInvoiceRecordPayload>) {
    const { data } = await axiosClient.put(
      `${ENDPOINTS.PURCHASE_INVOICES}/${id}`,
      payload
    );
    return data;
  },

  /**
   * Delete purchase invoice by ID
   */
  async delete(id: string | number) {
    const { data } = await axiosClient.delete(
      `${ENDPOINTS.PURCHASE_INVOICES}/${id}`
    );
    return data;
  },
};
