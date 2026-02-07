import { axiosClient, unwrapPaginated, type PaginatedResponse } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";
import { logger } from "@/lib/logger";

/**
 * Sales & Quotation Types
 */
export interface InventoryItemPayload {
  _id?: string | number;
  itemName?: string;
  description?: string;
  category?: string;
  thickness?: number;
  costPrice?: number;
  salesRate?: number;
  discountAmount?: number;
  totalGrossAmount?: number;
  totalNetAmount?: number;
  brand?: string;
  color?: string;
  discount?: number;
  length?: number;
  amount?: number;
  openingStock?: number;
  quantity?: number;
  minimumStockLevel?: number;
  minStock?: number;
  unit?: number | string;
  metadata?: Record<string, unknown>;
}

export type PaymentMethod = "Card" | "Cash";

export interface CustomerPayload {
  _id?: string | number;
  id?: string | number;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  openingAmount?: number;
  creditLimit?: number;
  paymentType?: "Credit" | "Debit";
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SaleRecordPayload {
  _id?: string | number;
  id?: string | number;
  invoiceNumber?: string;
  invoiceDate?: string;
  products?: InventoryItemPayload[];
  items?: InventoryItemPayload[];
  subTotal?: number;
  totalGrossAmount?: number;
  discount?: number;
  totalDiscount?: number;
  totalNetAmount?: number;
  quotationDate?: string;
  customer?: CustomerPayload | null;
  customerName?: string;
  paymentMethod?: PaymentMethod;
  length?: number;
  remarks?: string;
  metadata?: Record<string, unknown>;
  date?: string;
  amount?: number;
  status?: string;
  convertedInvoiceId?: string;
  convertedAt?: string;
}

export interface QuotationRecordPayload {
  quotationNumber?: string;
  products?: InventoryItemPayload[];
  subTotal?: number;
  totalGrossAmount?: number;
  totalNetAmount?: number;
  discount?: number;
  amount?: number;
  totalDiscount?: number;
  quotationDate?: string;
  customer?: CustomerPayload[];
  customerName?: string;
  validUntil?: string;
  status?: string;
  convertedInvoiceId?: string;
  convertedAt?: string;
  remarks?: string;
  length?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Sales Service
 * Handles all sales invoice-related API calls
 */
export const salesService = {
  /**
   * Get all sales invoices
   */
  async getAll() {
    const { data } = await axiosClient.get<
      SaleRecordPayload[] | PaginatedResponse<SaleRecordPayload>
    >(ENDPOINTS.SALES);
    return unwrapPaginated(data);
  },

  /**
   * Get sale by invoice number
   */
  async getByInvoiceNumber(invoiceNumber: string) {
    try {
      const { data } = await axiosClient.get(
        `${ENDPOINTS.SALES}/${encodeURIComponent(invoiceNumber)}`
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status === 404) {
        // Fallback: fetch all and find
        const { data } = await axiosClient.get<
          SaleRecordPayload[] | PaginatedResponse<SaleRecordPayload>
        >(ENDPOINTS.SALES);
        const allSales = unwrapPaginated(data);
        return (allSales || []).find(
          (s: SaleRecordPayload) =>
            String(s.invoiceNumber) === String(invoiceNumber)
        );
      }
      throw error;
    }
  },

  /**
   * Create a new sale invoice
   */
  async create(payload: SaleRecordPayload) {
    logger.log("salesService.create called with payload:", payload);
    try {
      const { data } = await axiosClient.post<SaleRecordPayload>(
        ENDPOINTS.SALES,
        payload
      );
      logger.log("salesService.create response data:", data);
      return data;
    } catch (error) {
      logger.error("salesService.create error:", error);
      throw error;
    }
  },

  /**
   * Update sale by invoice number
   */
  async updateByInvoiceNumber(
    invoiceNumber: string,
    patch: Partial<SaleRecordPayload>
  ) {
    try {
      const { data } = await axiosClient.put(
        `${ENDPOINTS.SALES}/${encodeURIComponent(invoiceNumber)}`,
        patch
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status !== 404) throw error;

      // Fallback: fetch and update by ID
      const sale = await salesService.getByInvoiceNumber(invoiceNumber);
      if (!sale) throw new Error(`Sale not found: ${invoiceNumber}`);
      const id = (sale as { _id?: string; id?: string })._id ?? (sale as { id?: string }).id;
      if (!id) throw new Error(`Sale has no valid ID: ${invoiceNumber}`);
      return salesService.updateById(id, patch);
    }
  },

  /**
   * Update sale by ID (fallback)
   */
  async updateById(id: string | number, patch: Partial<SaleRecordPayload>) {
    const { data } = await axiosClient.put(`${ENDPOINTS.SALES}/${String(id)}`, patch);
    return data;
  },

  /**
   * Delete sale by invoice number
   */
  async deleteByInvoiceNumber(invoiceNumber: string) {
    try {
      const { data } = await axiosClient.delete(
        `${ENDPOINTS.SALES}/${encodeURIComponent(invoiceNumber)}`
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status !== 404) throw error;

      // Fallback: fetch and delete by ID
      const sale = await salesService.getByInvoiceNumber(invoiceNumber);
      if (!sale) throw new Error(`Sale not found: ${invoiceNumber}`);
      const id = (sale as { _id?: string; id?: string })._id ?? (sale as { id?: string }).id;
      if (!id) throw new Error(`Sale has no valid ID: ${invoiceNumber}`);
      return salesService.deleteById(id);
    }
  },

  /**
   * Delete sale by ID (fallback)
   */
  async deleteById(id: string | number) {
    const { data } = await axiosClient.delete(`${ENDPOINTS.SALES}/${String(id)}`);
    return data;
  },
};

/**
 * Sale Return Service
 */
export const saleReturnService = {
  /**
   * Get all sale returns
   */
  async getAll() {
    const { data } = await axiosClient.get(ENDPOINTS.SALE_RETURNS);
    return data;
  },

  /**
   * Get sale return by invoice number
   */
  async getByInvoiceNumber(invoiceNumber: string) {
    try {
      const { data } = await axiosClient.get(
        `${ENDPOINTS.SALE_RETURNS}/${encodeURIComponent(invoiceNumber)}`
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status === 404) {
        // Fallback: fetch all and find
        const { data } = await axiosClient.get(ENDPOINTS.SALE_RETURNS);
        return (data || []).find(
          (r: { invoiceNumber?: string }) =>
            String(r.invoiceNumber) === String(invoiceNumber)
        );
      }
      throw error;
    }
  },

  /**
   * Create sale return
   */
  async create(payload: unknown) {
    const { data } = await axiosClient.post(ENDPOINTS.SALE_RETURNS, payload);
    return data;
  },

  /**
   * Update sale return by invoice number
   */
  async updateByInvoiceNumber(invoiceNumber: string, patch: unknown) {
    const { data } = await axiosClient.put(
      `${ENDPOINTS.SALE_RETURNS}/${encodeURIComponent(invoiceNumber)}`,
      patch
    );
    return data;
  },

  /**
   * Delete sale return by invoice number
   */
  async deleteByInvoiceNumber(invoiceNumber: string) {
    const { data} = await axiosClient.delete(
      `${ENDPOINTS.SALE_RETURNS}/${encodeURIComponent(invoiceNumber)}`
    );
    return data;
  },
};
