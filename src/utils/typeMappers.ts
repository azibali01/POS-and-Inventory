/**
 * Type Mappers - Convert between API Payload types and Context Business types
 * 
 * The hook layer uses *Payload types that mirror the API response,
 * while contexts use normalized business types with guaranteed non-nullable fields.
 * These mappers bridge that gap.
 */

import type {
  CustomerPayload,
  SaleRecordPayload,
  QuotationRecordPayload,
  SupplierPayload,
  PurchaseRecordPayload,
  ExpensePayload,
  ColorPayload,
  GRNRecordPayload,
  PurchaseReturnRecordPayload,
  PurchaseInvoiceRecordPayload,
  ReceiptVoucherPayload,
  PaymentVoucherPayload,
} from "../api";
import type { Customer } from "../types";
import type { Supplier } from "../components/purchase/SupplierForm";
// Import from context-specific type definitions to avoid conflicts
import type {
  SaleRecord,
  QuotationRecord,
} from "../contexts/SalesContext/types";

// ===== CUSTOMER MAPPERS =====

/**
 * Convert CustomerPayload to Customer
 * Normalizes _id to always be a non-nullable string
 */
export function toCustomer(payload: CustomerPayload): Customer {
  return {
    ...payload,
    _id: String(payload._id || payload.id || ""),
    name: payload.name || "",
    openingAmount: payload.openingAmount ?? 0,
    creditLimit: payload.creditLimit ?? 0,
    paymentType: normalizePaymentType(payload.paymentType),
    createdAt: payload.createdAt,
  } as Customer;
}

/**
 * Convert array of CustomerPayload to Customer[]
 */
export function toCustomers(payloads: CustomerPayload[]): Customer[] {
  return payloads.map(toCustomer);
}

// ===== SALES MAPPERS =====

/**
 * Convert SaleRecordPayload to SaleRecord (using SalesContext type)
 * Adds the required fields expected by SalesContext
 */
export function toSaleRecord(payload: SaleRecordPayload): SaleRecord {
  // Normalize customer field
  let customer: SaleRecord["customer"];
  if (payload.customer) {
    if (Array.isArray(payload.customer)) {
      customer = payload.customer[0] ? toCustomer(payload.customer[0]) : null;
    } else {
      customer = toCustomer(payload.customer);
    }
  } else {
    customer = null;
  }

  return {
    ...payload,
    id: payload.id || payload.invoiceNumber || String(Date.now()),
    customer,
  } as unknown as SaleRecord;
}

/**
 * Convert array of SaleRecordPayload to SaleRecord[]
 */
export function toSaleRecords(payloads: SaleRecordPayload[]): SaleRecord[] {
  return payloads.map(toSaleRecord);
}

/**
 * Convert QuotationRecordPayload to QuotationRecord
 * Normalizes customer field format
 */
export function toQuotationRecord(
  payload: QuotationRecordPayload
): QuotationRecord {
  // Normalize customer field - QuotationRecord expects Customer | Customer[] | undefined
  let customer: Customer | Customer[] | undefined;
  
  if (Array.isArray(payload.customer)) {
    const mapped = payload.customer.map(toCustomer);
    customer = mapped.length === 1 ? mapped[0] : mapped;
  } else if (payload.customer) {
    customer = toCustomer(payload.customer as CustomerPayload);
  }

  return {
    ...payload,
    customer,
  } as QuotationRecord;
}

/**
 * Convert array of QuotationRecordPayload to QuotationRecord[]
 */
export function toQuotationRecords(
  payloads: QuotationRecordPayload[]
): QuotationRecord[] {
  return payloads.map(toQuotationRecord);
}

// ===== SUPPLIER MAPPERS =====

/**
 * Convert SupplierPayload to Supplier
 * Normalizes _id to always be a non-nullable string
 */
export function toSupplier(payload: SupplierPayload): Supplier {
  return {
    ...payload,
    _id: String(payload._id || payload.id || ""),
    name: payload.name || "",
    openingBalance: payload.openingBalance ?? 0,
    currentBalance: payload.currentBalance ?? payload.openingBalance ?? 0,
  } as Supplier;
}

/**
 * Convert array of SupplierPayload to Supplier[]
 */
export function toSuppliers(payloads: SupplierPayload[]): Supplier[] {
  return payloads.map(toSupplier);
}

// ===== PURCHASE MAPPERS =====

/**
 * Convert PurchaseRecordPayload to PurchaseRecord
 * Pass-through mapper (types are already compatible)
 */
export function toPurchaseRecord(payload: PurchaseRecordPayload) {
  return {
    ...payload,
    id: payload.id || payload.poNumber,
  };
}

export function toPurchaseRecords(payloads: PurchaseRecordPayload[]) {
  return payloads.map(toPurchaseRecord);
}

// ===== EXPENSE MAPPERS =====

/**
 * Convert ExpensePayload to Expense
 * Pass-through mapper (types are already compatible)
 */
export function toExpense(payload: ExpensePayload) {
  return {
    ...payload,
    id: payload.id || payload.expenseNumber,
  };
}

export function toExpenses(payloads: ExpensePayload[]) {
  return payloads.map(toExpense);
}

// ===== COLOR & CATEGORY MAPPERS =====

/**
 * Convert ColorPayload to Color
 * Pass-through mapper
 */
export function toColor(payload: ColorPayload) {
  return payload;
}

export function toColors(payloads: ColorPayload[]) {
  return payloads;
}

/**
 * Categories are strings, no mapping needed
 */
export function toCategories(categories: string[]) {
  return categories;
}

// ===== GRN MAPPERS =====

/**
 * Convert GRNRecordPayload to GRNRecord
 * Pass-through mapper
 */
export function toGRNRecord(payload: GRNRecordPayload) {
  return {
    ...payload,
    id: payload.id || payload.grnNumber,
  };
}

export function toGRNRecords(payloads: GRNRecordPayload[]) {
  return payloads.map(toGRNRecord);
}

// ===== PURCHASE RETURN & INVOICE MAPPERS =====

/**
 * Convert PurchaseReturnRecordPayload to PurchaseReturnRecord
 * Pass-through mapper
 */
export function toPurchaseReturnRecord(payload: PurchaseReturnRecordPayload) {
  return {
    ...payload,
    id: payload.id || payload.returnNumber,
  };
}

export function toPurchaseReturnRecords(payloads: PurchaseReturnRecordPayload[]) {
  return payloads.map(toPurchaseReturnRecord);
}

/**
 * Convert PurchaseInvoiceRecordPayload to PurchaseInvoiceRecord
 * Pass-through mapper
 */
export function toPurchaseInvoiceRecord(payload: PurchaseInvoiceRecordPayload) {
  return payload;
}

export function toPurchaseInvoiceRecords(payloads: PurchaseInvoiceRecordPayload[]) {
  return payloads.map(toPurchaseInvoiceRecord);
}

// ===== VOUCHER MAPPERS =====

/**
 * Convert ReceiptVoucherPayload to ReceiptVoucher
 * Pass-through mapper
 */
export function toReceiptVoucher(payload: ReceiptVoucherPayload) {
  return {
    ...payload,
    id: payload.id || payload.voucherNumber,
  };
}

export function toReceiptVouchers(payloads: ReceiptVoucherPayload[]) {
  return payloads.map(toReceiptVoucher);
}

/**
 * Convert PaymentVoucherPayload to PaymentVoucher
 * Pass-through mapper
 */
export function toPaymentVoucher(payload: PaymentVoucherPayload) {
  return {
    ...payload,
    id: payload.id || payload.voucherNumber,
  };
}

export function toPaymentVouchers(payloads: PaymentVoucherPayload[]) {
  return payloads.map(toPaymentVoucher);
}

// ===== HELPER FUNCTIONS =====

/**
 * Helper: Normalize payment type to context expected format
 */
function normalizePaymentType(
  paymentType?: string
): "Credit" | "Debit" | undefined {
  if (!paymentType) return undefined;
  const lower = paymentType.toLowerCase();
  if (lower === "credit") return "Credit";
  if (lower === "debit") return "Debit";
  return undefined;
}
