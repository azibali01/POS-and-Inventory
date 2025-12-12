/**
 * Accounts Context Types
 *
 * Type definitions for accounting operations including
 * receipt vouchers and payment vouchers.
 */

export interface ReceiptVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string | Date;
  receivedFrom: string;
  amount: number;
  referenceNumber?: string;
  paymentMode: string;
  remarks?: string;
}

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string | Date;
  paidTo: string;
  amount: number;
  referenceNumber?: string;
  paymentMode: string;
  remarks?: string;
}

export interface AccountsContextType {
  // Receipt Vouchers
  receiptVouchers: ReceiptVoucher[];
  receiptVouchersLoading: boolean;
  receiptVouchersError: string | null;
  setReceiptVouchers: React.Dispatch<React.SetStateAction<ReceiptVoucher[]>>;
  loadReceiptVouchers: () => Promise<ReceiptVoucher[]>;

  // Payment Vouchers
  paymentVouchers: PaymentVoucher[];
  paymentVouchersLoading: boolean;
  paymentVouchersError: string | null;
  setPaymentVouchers: React.Dispatch<React.SetStateAction<PaymentVoucher[]>>;
  loadPaymentVouchers: () => Promise<PaymentVoucher[]>;
}
