import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Payment Voucher Payload Type
 * Represents the API response/request format for payment vouchers
 */
export interface PaymentVoucherPayload {
  _id?: string | number;
  id?: string;
  voucherNumber: string;
  voucherDate: string | Date;
  paidTo: string;
  amount: number;
  referenceNumber?: string;
  paymentMode: string;
  remarks?: string;
}

/**
 * Payment Voucher Service
 * Handles all payment voucher-related API calls
 */
export const paymentVoucherService = {
  /**
   * Get all payment vouchers
   */
  async getAll(): Promise<PaymentVoucherPayload[]> {
    const { data } = await axiosClient.get<PaymentVoucherPayload[]>(
      ENDPOINTS.PAYMENT_VOUCHERS,
    );
    return data;
  },

  /**
   * Get payment voucher by ID
   */
  async getById(id: string): Promise<PaymentVoucherPayload> {
    const { data } = await axiosClient.get<PaymentVoucherPayload>(
      `${ENDPOINTS.PAYMENT_VOUCHERS}/${id}`,
    );
    return data;
  },

  /**
   * Create a new payment voucher
   */
  async create(payload: PaymentVoucherPayload): Promise<PaymentVoucherPayload> {
    const { data } = await axiosClient.post<PaymentVoucherPayload>(
      ENDPOINTS.PAYMENT_VOUCHERS,
      payload,
    );
    return data;
  },

  /**
   * Update payment voucher by ID or voucher number
   */
  async update(
    id: string | number,
    payload: Partial<PaymentVoucherPayload>,
  ): Promise<PaymentVoucherPayload> {
    const { data } = await axiosClient.put<PaymentVoucherPayload>(
      `${ENDPOINTS.PAYMENT_VOUCHERS}/${String(id)}`,
      payload,
    );
    return data;
  },

  /**
   * Delete payment voucher by ID or voucher number
   */
  async delete(id: string | number): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.PAYMENT_VOUCHERS}/${String(id)}`);
  },
};
