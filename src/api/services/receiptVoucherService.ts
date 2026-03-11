import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Receipt Voucher Payload Type
 * Represents the API response/request format for receipt vouchers
 */
export interface ReceiptVoucherPayload {
  _id?: string | number;
  id?: string;
  voucherNumber: string;
  voucherDate: string | Date;
  receivedFrom: string;
  amount: number;
  referenceNumber?: string;
  paymentMode: string;
  remarks?: string;
}

/**
 * Receipt Voucher Service
 * Handles all receipt voucher-related API calls
 */
export const receiptVoucherService = {
  /**
   * Get all receipt vouchers
   */
  async getAll(): Promise<ReceiptVoucherPayload[]> {
    const { data } = await axiosClient.get<ReceiptVoucherPayload[]>(
      ENDPOINTS.RECEIPT_VOUCHERS,
    );
    return data;
  },

  /**
   * Get receipt voucher by ID
   */
  async getById(id: string): Promise<ReceiptVoucherPayload> {
    const { data } = await axiosClient.get<ReceiptVoucherPayload>(
      `${ENDPOINTS.RECEIPT_VOUCHERS}/${id}`,
    );
    return data;
  },

  /**
   * Create a new receipt voucher
   */
  async create(payload: ReceiptVoucherPayload): Promise<ReceiptVoucherPayload> {
    const { data } = await axiosClient.post<ReceiptVoucherPayload>(
      ENDPOINTS.RECEIPT_VOUCHERS,
      payload,
    );
    return data;
  },

  /**
   * Update receipt voucher by ID or voucher number
   */
  async update(
    id: string | number,
    payload: Partial<ReceiptVoucherPayload>,
  ): Promise<ReceiptVoucherPayload> {
    const { data } = await axiosClient.put<ReceiptVoucherPayload>(
      `${ENDPOINTS.RECEIPT_VOUCHERS}/${String(id)}`,
      payload,
    );
    return data;
  },

  /**
   * Delete receipt voucher by ID or voucher number
   */
  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.RECEIPT_VOUCHERS}/${String(id)}`);
  },
};
