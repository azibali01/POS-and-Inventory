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
};
