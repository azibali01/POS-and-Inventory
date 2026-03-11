/**
 * API Services Barrel Export
 * Import services from a single location
 */

import {
  axiosClient,
  unwrapPaginated,
  type ListQueryParams,
  type PaginatedResponse,
} from "./client/axiosClient";
import { ENDPOINTS } from "./client/apiConfig";
import {
  salesService,
  saleReturnService,
  type CustomerPayload,
  type InventoryItemPayload,
  type PaymentMethod,
  type QuotationRecordPayload,
  type SaleRecordPayload,
} from "./services/salesService";
import { quotationService } from "./services/quotationService";
import { customerService } from "./services/customerService";
import {
  supplierService,
  type SupplierPayload,
} from "./services/supplierService";
import {
  inventoryService,
  type InventoryListQueryParams,
} from "./services/inventoryService";
import { colorService, type ColorPayload } from "./services/colorService";
import {
  categoryService,
  type CategoryPayload,
} from "./services/categoryService";
import {
  purchaseService,
  type PurchaseRecordPayload,
} from "./services/purchaseService";
import {
  purchaseInvoiceService,
  type PurchaseInvoiceRecordPayload,
} from "./services/purchaseInvoiceService";
import {
  purchaseReturnService,
  type PurchaseReturnRecordPayload,
} from "./services/purchaseReturnService";
import { grnService, type GRNRecordPayload } from "./services/grnService";
import { expenseService, type ExpensePayload } from "./services/expenseService";
import {
  receiptVoucherService,
  type ReceiptVoucherPayload,
} from "./services/receiptVoucherService";
import {
  paymentVoucherService,
  type PaymentVoucherPayload,
} from "./services/paymentVoucherService";
import {
  draftService,
  type DraftData,
  type DraftRecord,
} from "./services/draftService";
import { shiftService } from "./services/shiftService";

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
export { draftService } from "./services/draftService";
export { shiftService } from "./services/shiftService";

// Client & Config
export { axiosClient, unwrapPaginated, ENDPOINTS };
export type { ListQueryParams, PaginatedResponse };
export const api = axiosClient;

export const getSales = () => salesService.getAll();
export const createSale = (payload: SaleRecordPayload) =>
  salesService.create(payload);
export const updateSaleByNumber = (
  invoiceNumber: string,
  payload: Partial<SaleRecordPayload>,
) => salesService.updateByInvoiceNumber(invoiceNumber, payload);
export const deleteSaleByNumber = (invoiceNumber: string) =>
  salesService.deleteByInvoiceNumber(invoiceNumber);

export const getSaleReturns = () => saleReturnService.getAll();
export const createSaleReturn = (payload: Record<string, unknown>) =>
  saleReturnService.create(payload);
export const updateSaleReturn = (
  invoiceNumber: string,
  payload: Record<string, unknown>,
) => saleReturnService.updateByInvoiceNumber(invoiceNumber, payload);
export const deleteSaleReturn = (invoiceNumber: string) =>
  saleReturnService.deleteByInvoiceNumber(invoiceNumber);

export const getQuotations = () => quotationService.getAll();
export const createQuotation = (payload: QuotationRecordPayload) =>
  quotationService.create(payload);
export const updateQuotation = (
  quotationNumber: string,
  payload: Partial<QuotationRecordPayload>,
) => quotationService.updateByQuotationNumber(quotationNumber, payload);
export const deleteQuotation = (quotationNumber: string) =>
  quotationService.deleteByQuotationNumber(quotationNumber);

export const getCustomers = () => customerService.getAll();
export const createCustomer = (payload: CustomerPayload) =>
  customerService.create(payload);
export const updateCustomer = (
  id: string | number,
  payload: Partial<CustomerPayload>,
) => customerService.update(id, payload);
export const deleteCustomer = (id: string | number) =>
  customerService.delete(id);

export const getSuppliers = () => supplierService.getAll();
export const createSupplier = (payload: SupplierPayload) =>
  supplierService.create(payload);
export const updateSupplier = (
  id: string | number,
  payload: Partial<SupplierPayload>,
) => supplierService.update(id, payload);
export const deleteSupplier = (id: string | number) =>
  supplierService.delete(id);

export const getInventoryPage = (params: InventoryListQueryParams = {}) =>
  inventoryService.list(params);
export const getInventory = () => inventoryService.getAll();
export const createInventory = (payload: InventoryItemPayload) =>
  inventoryService.create(payload);
export const updateInventory = (
  id: string | number,
  payload: Partial<InventoryItemPayload>,
) => inventoryService.update(id, payload);
export const deleteInventory = (id: string | number) =>
  inventoryService.delete(id);

export const getColors = () => colorService.getAll();
export const createColor = (payload: ColorPayload) =>
  colorService.create(payload);
export const updateColor = (
  id: string | number,
  payload: Partial<ColorPayload>,
) => colorService.update(id, payload);
export const deleteColor = (id: string | number) => colorService.delete(id);

export const getCategories = () => categoryService.getAll();
export const createCategory = (payload: CategoryPayload) =>
  categoryService.create(payload);
export const updateCategory = (
  id: string | number,
  payload: Partial<CategoryPayload>,
) => categoryService.update(id, payload);
export const deleteCategory = (id: string | number) =>
  categoryService.delete(id);

export const getPurchases = () => purchaseService.getAll();
export const createPurchase = (payload: PurchaseRecordPayload) =>
  purchaseService.create(payload);
export const updatePurchase = (
  id: string | number,
  payload: Partial<PurchaseRecordPayload>,
) => purchaseService.update(id, payload);
export const updatePurchaseByNumber = updatePurchase;
export const deletePurchase = (id: string | number) =>
  purchaseService.delete(id);
export const deletePurchaseByNumber = deletePurchase;

export const getPurchaseInvoices = () => purchaseInvoiceService.getAll();
export const createPurchaseInvoice = (payload: PurchaseInvoiceRecordPayload) =>
  purchaseInvoiceService.create(payload);
export const updatePurchaseInvoice = (
  id: string | number,
  payload: Partial<PurchaseInvoiceRecordPayload>,
) => purchaseInvoiceService.update(id, payload);
export const deletePurchaseInvoice = (id: string | number) =>
  purchaseInvoiceService.delete(id);

export const getGRNs = () => grnService.getAll();
export const createGRN = (payload: GRNRecordPayload) =>
  grnService.create(payload);
export const updateGRN = (id: string, payload: Partial<GRNRecordPayload>) =>
  grnService.update(id, payload);
export const deleteGRN = (id: string) => grnService.delete(id);

export const getPurchaseReturns = () => purchaseReturnService.getAll();
export const createPurchaseReturn = (payload: PurchaseReturnRecordPayload) =>
  purchaseReturnService.create(payload);
export const updatePurchaseReturn = (
  id: string | number,
  payload: Partial<PurchaseReturnRecordPayload>,
) => purchaseReturnService.update(id, payload);
export const deletePurchaseReturn = (id: string | number) =>
  purchaseReturnService.delete(String(id));

export const getExpenses = () => expenseService.getAll();
export const createExpense = (payload: ExpensePayload) =>
  expenseService.create(payload);
export const updateExpense = (
  id: string | number,
  payload: Partial<ExpensePayload>,
) => expenseService.update(String(id), payload);
export const deleteExpense = (id: string | number) =>
  expenseService.delete(String(id));

export const getAllReceiptVouchers = () => receiptVoucherService.getAll();
export const createReceiptVoucher = (payload: ReceiptVoucherPayload) =>
  receiptVoucherService.create(payload);
export const updateReceiptVoucher = (
  id: string | number,
  payload: Partial<ReceiptVoucherPayload>,
) => receiptVoucherService.update(id, payload);
export const deleteReceiptVoucher = (id: string | number) =>
  receiptVoucherService.delete(id);

export const getAllPaymentVouchers = () => paymentVoucherService.getAll();
export const createPaymentVoucher = (payload: PaymentVoucherPayload) =>
  paymentVoucherService.create(payload);
export const updatePaymentVoucher = (
  id: string | number,
  payload: Partial<PaymentVoucherPayload>,
) => paymentVoucherService.update(id, payload);
export const deletePaymentVoucher = (id: string | number) =>
  paymentVoucherService.delete(id);

export const getDraftByKey = (key: string) => draftService.getByKey(key);
export const createDraft = (payload: { key: string; data: DraftData }) =>
  draftService.create(payload);
export const updateDraft = (
  id: string,
  payload: Partial<Pick<DraftRecord, "data">>,
) => draftService.update(id, payload);
export const deleteDraft = (id: string) => draftService.delete(id);

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
export type { InventoryListQueryParams } from "./services/inventoryService";

// Re-export types - Inventory & Products
export type { ColorPayload } from "./services/colorService";
export type { CategoryPayload } from "./services/categoryService";

// Re-export types - Expenses & Vouchers
export type { ExpensePayload } from "./services/expenseService";
export type { ReceiptVoucherPayload } from "./services/receiptVoucherService";
export type { PaymentVoucherPayload } from "./services/paymentVoucherService";
export type { DraftData, DraftRecord } from "./services/draftService";
export type {
  ActiveShiftResponse,
  CloseShiftPayload,
  OpenShiftPayload,
  ShiftSession,
} from "./services/shiftService";
export type { PurchaseInvoiceRecordPayload as PurchaseInvoicePayload } from "./services/purchaseInvoiceService";
