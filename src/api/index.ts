/**
 * API Services Barrel Export
 * Import services from a single location
 */

// Sales & Quotations
export { salesService, saleReturnService } from "./services/salesService";
export { quotationService } from "./services/quotationService";

// Customers & Suppliers
export { customerService } from "./services/customerService";
export { supplierService } from "./services/supplierService";

// Inventory & Products
export { inventoryService } from "./services/inventoryService";
export { colorService } from "./services/colorService";
export { categoryService } from "./services/categoryService";

// Purchases
export { purchaseService } from "./services/purchaseService";
export { purchaseInvoiceService } from "./services/purchaseInvoiceService";
export { purchaseReturnService } from "./services/purchaseReturnService";
export { grnService } from "./services/grnService";

// Expenses & Vouchers
export { expenseService } from "./services/expenseService";
export { receiptVoucherService } from "./services/receiptVoucherService";
export { paymentVoucherService } from "./services/paymentVoucherService";

// Client & Config
export { axiosClient, unwrapPaginated } from "./client/axiosClient";
export { ENDPOINTS } from "./client/apiConfig";

// Re-export types - Sales & Customers
export type {
  InventoryItemPayload,
  PaymentMethod,
  CustomerPayload,
  SaleRecordPayload,
  QuotationRecordPayload,
} from "./services/salesService";

// Re-export types - Suppliers & Purchases
export type { SupplierPayload } from "./services/supplierService";
export type { PurchaseRecordPayload } from "./services/purchaseService";
export type { PurchaseInvoiceRecordPayload } from "./services/purchaseInvoiceService";
export type { PurchaseReturnRecordPayload } from "./services/purchaseReturnService";
export type { GRNRecordPayload } from "./services/grnService";

// Re-export types - Inventory & Products
export type { ColorPayload } from "./services/colorService";
export type { CategoryPayload } from "./services/categoryService";

// Re-export types - Expenses & Vouchers
export type { ExpensePayload } from "./services/expenseService";
export type { ReceiptVoucherPayload } from "./services/receiptVoucherService";
export type { PaymentVoucherPayload } from "./services/paymentVoucherService";
