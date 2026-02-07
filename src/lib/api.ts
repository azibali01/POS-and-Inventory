/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/only-throw-error, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unnecessary-type-conversion, @typescript-eslint/restrict-template-expressions, @typescript-eslint/prefer-promise-reject-errors */
import axios from "axios";
import { env } from "./env";
import { logger } from "./logger";
import { API_TIMEOUT, MAX_ITEMS_LIMIT } from "./constants";

// Create axios instance with environment-based configuration
export const api = axios.create({
  baseURL: env.API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function unwrapPaginated<T>(response: T[] | PaginatedResponse<T>): T[] {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as any).data)
  ) {
    return (response).data;
  }
  return Array.isArray(response) ? response : [];
}

// Request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    logger.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Attach token from localStorage if available (robust against React lifecycle timing)
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    logger.log(
      `API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      response.status
    );
    return response;
  },
  (error) => {
    logger.error("API Response Error:", error.response?.status, error.message);

    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      logger.warn("Unauthorized request - user may need to login again");
    } else if (error.response?.status === 404) {
      logger.warn("Resource not found:", error.config?.url);
    } else if (error.response?.status >= 500) {
      logger.error("Server error occurred");
    }

    return Promise.reject(error);
  }
);

// Delete receipt voucher by id
export async function deleteReceiptVoucher(id: string | number) {
  const { data } = await api.delete(`/reciept-voucher/${String(id)}`);
  return data;
}

// Update receipt voucher by id
export async function updateReceiptVoucher(
  id: string | number,
  patch: Partial<ReceiptVoucherPayload>
) {
  const { data } = await api.put(`/reciept-voucher/${String(id)}`, patch);
  return data;
}

// Print logic is handled on the frontend (window.print or custom print window)
// Fetch all receipt vouchers
export async function getAllReceiptVouchers() {
  const { data } = await api.get("/reciept-voucher");
  return data;
}
// Receipt Voucher API
export interface ReceiptVoucherPayload {
  voucherNumber: number | string;
  voucherDate: Date | string;
  receivedFrom: string;
  amount: number;
  referenceNumber: string;
  paymentMode: string;
  remarks?: string;
}

export async function createReceiptVoucher(payload: ReceiptVoucherPayload) {
  const { data } = await api.post("/reciept-voucher", payload);
  return data;
}

// --- Payment Voucher endpoints ---
export interface PaymentVoucherPayload {
  voucherNumber: number | string;
  voucherDate: Date | string;
  paidTo: string;
  amount: number;
  referenceNumber: string;
  paymentMode: string;
  remarks?: string;
}

export async function getAllPaymentVouchers() {
  const { data } = await api.get("/payment-voucher");
  return data;
}

export async function createPaymentVoucher(payload: PaymentVoucherPayload) {
  const { data } = await api.post("/payment-voucher", payload);
  return data;
}

// Get payment voucher by voucherNumber
export async function getPaymentVoucherByNumber(
  voucherNumber: string | number
) {
  const { data } = await api.get(
      `/payment-voucher/${encodeURIComponent(String(voucherNumber))}`
    );
  return data;
}

// Update payment voucher by voucherNumber
export async function updatePaymentVoucher(
  voucherNumber: string | number,
  patch: Partial<PaymentVoucherPayload>
) {
  const { data } = await api.put(
    `/payment-voucher/${encodeURIComponent(String(voucherNumber))}`,
    patch
  );
  return data;
}

// Delete payment voucher by voucherNumber
export async function deletePaymentVoucher(voucherNumber: string | number) {
  const { data } = await api.delete(
    `/payment-voucher/${encodeURIComponent(String(voucherNumber))}`
  );
  return data;
}
// --- Purchase Return endpoints (by returnNumber) ---
// Update purchase return by returnNumber
export async function updatePurchaseReturnByNumber(
  returnNumber: string,
  patch: Partial<PurchaseReturnRecordPayload>
) {
  try {
    const { data } = await api.put(
      `/purchase-returns/${encodeURIComponent(returnNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }
  // Fallback: fetch all and update by id if needed
  const returns = await getPurchaseReturns();
  const ret = (returns || []).find(
    (r: PurchaseReturnRecordPayload) => String(r.id) === String(returnNumber)
  );
  if (!ret) throw new Error(`Purchase return not found: ${returnNumber}`);
  const id = ret._id ?? ret.id;
  if (!id) throw new Error(`Purchase return has no valid ID: ${returnNumber}`);
  return updatePurchaseReturn(id, patch);
}

// Delete purchase return by returnNumber
export async function deletePurchaseReturnByNumber(returnNumber: string) {
  try {
    const { data } = await api.delete(
      `/purchase-returns/${encodeURIComponent(returnNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }
  // Fallback: fetch all and delete by id if needed
  const returns = await getPurchaseReturns();
  const ret = (returns || []).find(
    (r: PurchaseReturnRecordPayload) =>
      String(r.id ?? r._id) === String(returnNumber)
  );
  if (!ret) throw new Error(`Purchase return not found: ${returnNumber}`);
  const id = ret._id ?? ret.id;
  if (!id) throw new Error(`Purchase return has no valid ID: ${returnNumber}`);
  return deletePurchaseReturn(id);
}

// Update and delete by id (for fallback)
export async function updatePurchaseReturn(
  id: string | number,
  patch: Partial<PurchaseReturnRecordPayload>
) {
  const { data } = await api.put(`/purchase-returns/${String(id)}`, patch);
  return data;
}

export async function deletePurchaseReturn(id: string | number) {
  const { data } = await api.delete(`/purchase-returns/${String(id)}`);
  return data;
}
// --- Purchase Invoice Payload ---
export interface PurchaseInvoicePayload {
  purchaseInvoiceNumber: string;
  invoiceDate: string | Date;
  expectedDelivery?: string | Date;
  supplierId?: string;
  products: PurchaseLineItem[];
  remarks?: string;
  subTotal?: number;
  total?: number;
}
// --- Purchase Invoice endpoints (by purchaseInvoiceNumber) ---
// Get all purchase invoices
export async function getPurchaseInvoices() {
  const { data } = await api.get("/purchase-invoice");
  return data;
}

// Get purchase invoice by purchaseInvoiceNumber
export async function getPurchaseInvoiceByNumber(
  purchaseInvoiceNumber: string
) {
  try {
    const { data } = await api.get(
      `/purchase-invoice/${encodeURIComponent(purchaseInvoiceNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status === 404) {
      // fall through
    } else {
      throw error;
    }
  }
  // Fallback: fetch all and find
  const { data } = await api.get("/purchase-invoice");
  return (data || []).find(
    (p: { purchaseInvoiceNumber?: string | number }) =>
      String(p.purchaseInvoiceNumber) === String(purchaseInvoiceNumber)
  );
}

// Create purchase invoice
export async function createPurchaseInvoice(payload: PurchaseInvoicePayload) {
  const { data } = await api.post("/purchase-invoice", payload);
  return data;
}

// Update purchase invoice by purchaseInvoiceNumber
export async function updatePurchaseInvoiceByNumber(
  purchaseInvoiceNumber: string,
  patch: Partial<PurchaseRecordPayload>
) {
  try {
    const { data } = await api.put(
      `/purchase-invoice/${encodeURIComponent(purchaseInvoiceNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }
  // Fallback: fetch all and update by id if needed
  const p = await getPurchaseInvoiceByNumber(purchaseInvoiceNumber);
  if (!p)
    throw new Error(`Purchase invoice not found: ${purchaseInvoiceNumber}`);
  const invoice = p as { _id?: string; id?: string };
  const id = invoice._id ?? invoice.id;
  if (!id)
    throw new Error(
      `Purchase invoice has no valid ID: ${purchaseInvoiceNumber}`
    );
  return updatePurchaseInvoice(id, patch);
}

// Delete purchase invoice by purchaseInvoiceNumber
export async function deletePurchaseInvoiceByNumber(
  purchaseInvoiceNumber: string
) {
  try {
    const { data } = await api.delete(
      `/purchase-invoice/${encodeURIComponent(purchaseInvoiceNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }
  // Fallback: fetch all and delete by id if needed
  const p = await getPurchaseInvoiceByNumber(purchaseInvoiceNumber);
  if (!p)
    throw new Error(`Purchase invoice not found: ${purchaseInvoiceNumber}`);
  const invoice = p as { _id?: string; id?: string };
  const id = invoice._id ?? invoice.id;
  if (!id)
    throw new Error(
      `Purchase invoice has no valid ID: ${purchaseInvoiceNumber}`
    );
  return deletePurchaseInvoice(id);
}

// Update and delete by id (for fallback)
export async function updatePurchaseInvoice(
  id: string | number,
  patch: Partial<PurchaseRecordPayload>
) {
  const { data } = await api.put(`/purchase-invoice/${String(id)}`, patch);
  return data;
}

export async function deletePurchaseInvoice(id: string | number) {
  const { data } = await api.delete(`/purchase-invoice/${String(id)}`);
  return data;
}

// Dev-only request logger to help diagnose duplicate-request storms.
// This logs method+url and a stack trace so we can see which component/effect
// initiated the request. Disabled in production to avoid leaking internals.

// ==========================
// SALES

/**
 * Fetches all sales/invoices from the backend
 * @returns Promise resolving to array of sale records
 * @throws Error if the request fails
 */
export async function getAllSales() {
  const { data } = await api.get<
    SaleRecordPayload[] | PaginatedResponse<SaleRecordPayload>
  >("/sale-invoice");
  return unwrapPaginated(data);
}

// Backward compatibility alias
export const getSales = getAllSales;

// test

// Get all purchase orders
export async function getPurchases() {
  const { data } = await api.get<PurchaseRecordPayload[]>("/purchaseorder");
  return data;
}

// --- Purchase Order by poNumber endpoints ---
// Get purchase order by poNumber
export async function getPurchaseByNumber(poNumber: string) {
  try {
    const { data } = await api.get(
      `/purchaseorder/${encodeURIComponent(poNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status === 404) {
      // fall through
    } else {
      throw error;
    }
  }
  // Fallback: fetch all and find
  const { data } = await api.get<PurchaseRecordPayload[]>("/purchaseorder");
  return (data || []).find(
    (p: PurchaseRecordPayload) =>
      String(
        (p as PurchaseRecordPayload & { poNumber?: string | number }).poNumber
      ) === String(poNumber)
  );
}

// Update purchase order by poNumber
export async function updatePurchaseByNumber(
  poNumber: string,
  patch: Partial<PurchaseRecordPayload>
) {
  try {
    const { data } = await api.put(
      `/purchaseorder/${encodeURIComponent(poNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }
  // Fallback: fetch all and update by id if needed
  const p = await getPurchaseByNumber(poNumber);
  if (!p) throw new Error(`Purchase order not found: ${poNumber}`);
  const purchase = p as { _id?: string; id?: string };
  const id = purchase._id ?? purchase.id;
  if (!id) throw new Error(`Purchase order has no valid ID: ${poNumber}`);
  return updatePurchase(id, patch);
}

// Delete purchase order by poNumber
export async function deletePurchaseByNumber(poNumber: string) {
  try {
    const { data } = await api.delete(
      `/purchaseorder/${encodeURIComponent(poNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }
  // Fallback: fetch all and delete by id if needed
  const p = await getPurchaseByNumber(poNumber);
  if (!p) throw new Error(`Purchase order not found: ${poNumber}`);
  const purchase = p as { _id?: string; id?: string };
  const id = purchase._id ?? purchase.id;
  if (!id) throw new Error(`Purchase order has no valid ID: ${poNumber}`);
  return deletePurchase(id);
}

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
type paymentMethod = "Card" | "Cash";
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
  paymentMethod?: paymentMethod;
  length?: number;
  remarks?: string;
  metadata?: Record<string, unknown>;
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
  remarks?: string;
  length?: number;
  metadata?: Record<string, unknown>;
}

// --- Drafts (server-side autosave) ---
export interface DraftData {
  [key: string]: unknown;
}

export interface DraftRecord {
  _id?: string;
  key: string;
  data: DraftData;
  userId?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getDraftByKey(key: string, userId?: string) {
  try {
    const opts = userId ? { headers: { "x-user-id": userId } } : undefined;
    const { data } = await api.get<DraftRecord>(
      `/drafts/key/${encodeURIComponent(key)}`,
      opts
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Creates a new draft for auto-save functionality
 * @param payload - Draft data including key, data object, and optional metadata
 * @returns Promise resolving to created draft record
 */
export async function createDraft(payload: {
  key: string;
  data: DraftData;
  userId?: string;
  title?: string;
}) {
  const opts = payload.userId
    ? { headers: { "x-user-id": payload.userId } }
    : undefined;
  const { data } = await api.post<DraftRecord>(`/drafts`, payload, opts);
  return data;
}

/**
 * Updates an existing draft
 * @param id - Draft ID to update
 * @param patch - Fields to update (data and/or title)
 * @param userId - Optional user ID for authorization
 * @returns Promise resolving to updated draft record
 */
export async function updateDraft(
  id: string,
  patch: { data?: DraftData; title?: string },
  userId?: string
) {
  const opts = userId ? { headers: { "x-user-id": userId } } : undefined;
  const { data } = await api.put<DraftRecord>(`/drafts/${id}`, patch, opts);
  return data;
}

export async function deleteDraft(id: string, userId?: string) {
  const opts = userId ? { headers: { "x-user-id": userId } } : undefined;
  const { data } = await api.delete(`/drafts/${id}`, opts);
  return data;
}

export type PurchaseLineItem = {
  id: string;
  productName: string;
  quantity: number;
  rate: number;
  color?: string;
  thickness?: string;
  length?: string | number;
  amount?: number;
};

export type PurchaseLineItems = PurchaseLineItem[];

export interface PurchaseRecordPayload {
  _id?: string | number;
  id?: string | number;
  poNumber: string;
  poDate: Date;
  expectedDelivery?: Date;
  supplier?: Supplier; // Now stores the full supplier object
  products: PurchaseLineItem[];
  remarks?: string;
  subTotal?: number;
  total?: number;
}
export interface GRNRecordPayload {
  id?: string | number;
  items: {
    inventoryId?: string | number;
    sku?: string | number;
    quantity: number;
    unitPrice?: number;
    metadata?: Record<string, unknown>;
  }[];
  subtotal?: number;
  totalAmount?: number;
  grnDate?: string;
  grnNumber?: string;
  receivedAt?: string;
  supplierId?: string | number;
  metadata?: Record<string, unknown>;
}

export interface PurchaseReturnRecordPayload {
  _id?: string | number;
  id?: string | number;
  items: {
    inventoryId?: string | number;
    sku?: string | number;
    quantity: number;
    unitPrice?: number;
    metadata?: Record<string, unknown>;
  }[];
  total?: number;
  date?: string;
  supplierId?: string | number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface ExpensePayload {
  _id?: string | number;
  id?: string | number;
  expenseNumber?: string;
  amount: number;
  date?: string | Date;
  categoryType?:
    | "Rent"
    | "Utilities"
    | "Transportation"
    | "Salary"
    | "Maintenance"
    | "Other";
  description?: string;
  reference?: string;
  paymentMethod?: paymentMethod;
  remarks?: string;
  metadata?: Record<string, unknown>;
}

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

export interface ColorPayload {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  hex?: string;
  metadata?: Record<string, unknown>;
}

export interface CategoryPayload {
  _id?: string | number;
  id?: string | number;
  name: string;
  metadata?: Record<string, unknown>;
}

// Read endpoints
export async function getInventory() {
  const candidates = ["/products"];
  for (const path of candidates) {
    try {
      const { data } = await api.get<
        InventoryItemPayload[] | PaginatedResponse<InventoryItemPayload>
      >(path, { params: { limit: MAX_ITEMS_LIMIT } });
      return unwrapPaginated(data);
    } catch (err: unknown) {
      // if server returned 404, try the next candidate; otherwise rethrow
      const error = err as { response?: { status?: number } };
      const status = error && error.response && error.response.status;
      if (status && status === 404) continue;
      throw error;
    }
  }
  // nothing found — return empty list to keep app usable
  return [] as InventoryItemPayload[];
}

// Quotations read endpoint
export async function getQuotations() {
  const { data } = await api.get<QuotationRecordPayload[]>("/quotations");
  return data;
}

export async function getGRNs() {
  const { data } = await api.get<GRNRecordPayload[]>("/grns");
  return data;
}

export async function getPurchaseReturns() {
  const { data } = await api.get<PurchaseReturnRecordPayload[]>(
    "/purchase-returns"
  );
  return data;
}

export async function getExpenses() {
  const { data } = await api.get<ExpensePayload[]>("/expenses");
  return data;
}

// ==========================
// CUSTOMERS

/**
 * Fetches all customers from the backend
 * @returns Promise resolving to array of customer records
 */
export async function getCustomers() {
  const { data } = await api.get<CustomerPayload[]>("/customers");
  return data;
}

// Colors endpoints
export async function getColors() {
  const { data } = await api.get<ColorPayload[]>("/colors");
  return data;
}

export async function createColor(payload: ColorPayload) {
  const { data } = await api.post<ColorPayload>("/colors", payload);
  return data;
}

export async function updateColor(
  id: string | number,
  payload: Partial<ColorPayload>
) {
  const { data } = await api.put<ColorPayload>(`/colors/${id}`, payload);
  return data;
}

export async function deleteColor(id: string | number) {
  const { data } = await api.delete(`/colors/${id}`);
  return data;
}

export async function getCategories() {
  const { data } = await api.get<CategoryPayload[]>("/categories");
  return data;
}

// Create endpoints
export async function createInventory(item: InventoryItemPayload) {
  const { data } = await api.post<InventoryItemPayload>("/products", item);
  return data;
}

/**
 * Creates a new sale/invoice
 * @param payload - Sale data including items, customer, and totals
 * @returns Promise resolving to created sale record
 */
export async function createSale(payload: SaleRecordPayload) {
  logger.log("createSale called with payload:", payload);
  try {
    const { data } = await api.post<SaleRecordPayload>("/sale-invoice", payload);
    logger.log("createSale response data:", data);
    return data;
  } catch (error) {
    logger.error("createSale error:", error);
    throw error;
  }
}

// Create a quotation as a separate resource. Backends that support
// quotations should expose a `/quotations` POST endpoint. We keep the
// same payload shape as `createSale` for compatibility.
export async function createQuotation(payload: QuotationRecordPayload) {
  logger.log("createQuotation called with payload:", payload);
  try {
    const { data } = await api.post<QuotationRecordPayload>("/quotations", payload);
    logger.log("createQuotation response data:", data);
    return data;
  } catch (error) {
    logger.error("createQuotation error:", error);
    throw error;
  }
}

// Sale Return endpoints - uses dedicated /sale-return with invoiceNumber-based operations
export async function getSaleReturns() {
  const { data } = await api.get("/sale-return");
  return data;
}

export async function getSaleReturnByNumber(invoiceNumber: string) {
  try {
    const { data } = await api.get(
      `/sale-return/${encodeURIComponent(invoiceNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error && error.response && error.response.status;
    if (status && status === 404) {
      // Fallback: fetch all and find
      const { data } = await api.get<SaleRecordPayload[]>("/sale-return");
      return (data || []).find(
        (s: SaleRecordPayload) =>
          String(s.invoiceNumber) === String(invoiceNumber)
      );
    }
    throw error;
  }
}

export async function createSaleReturn(payload: SaleRecordPayload) {
  const { data } = await api.post<SaleRecordPayload>("/sale-return", payload);
  return data;
}

export async function updateSaleReturn(
  invoiceNumber: string,
  patch: Partial<SaleRecordPayload>
) {
  const { data } = await api.put<SaleRecordPayload>(
    `/sale-return/${encodeURIComponent(invoiceNumber)}`,
    patch
  );
  return data;
}

export async function deleteSaleReturn(invoiceNumber: string) {
  const { data } = await api.delete(
    `/sale-return/${encodeURIComponent(invoiceNumber)}`
  );
  return data;
}
// create purchase endpoint
export async function createPurchase(payload: PurchaseRecordPayload) {
  const { data } = await api.post<PurchaseRecordPayload>("/purchaseorder", payload);
  return data;
}

export async function createGRN(payload: GRNRecordPayload) {
  const { data } = await api.post<GRNRecordPayload>("/grns", payload);
  return data;
}

export async function createPurchaseReturn(
  payload: PurchaseReturnRecordPayload
) {
  const { data } = await api.post<PurchaseReturnRecordPayload>("/purchase-returns", payload);
  return data;
}

export async function createExpense(payload: ExpensePayload) {
  const { data } = await api.post<ExpensePayload>("/expenses", payload);
  return data;
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await api.post<CategoryPayload>("/categories", payload);
  return data;
}

// Update endpoints
export async function updateInventory(
  id: string,
  patch: Partial<InventoryItemPayload>
) {
  const { data } = await api.put<InventoryItemPayload>(
    `/products/${id}`,
    patch
  );
  return data;
}

export async function updateExpense(
  expenseNumber: string,
  patch: Partial<ExpensePayload>
) {
  const { data } = await api.put<ExpensePayload>(`/expenses/${expenseNumber}`, patch);
  return data;
}

export async function updateCategory(
  id: string | number,
  patch: Partial<CategoryPayload>
) {
  const { data } = await api.put<CategoryPayload>(`/categories/${String(id)}`, patch);
  return data;
}

// Customer endpoints

/**
 * Creates a new customer
 * @param payload - Customer data including name, contact, and opening balance
 * @returns Promise resolving to created customer record
 */
export async function createCustomer(payload: CustomerPayload) {
  const { data } = await api.post<CustomerPayload>("/customers", payload);
  return data;
}

export async function updateCustomer(
  id: string | number,
  patch: Partial<CustomerPayload>
) {
  const { data } = await api.put<CustomerPayload>(`/customers/${String(id)}`, patch);
  return data;
}

export async function deleteCustomer(id: string | number) {
  if (!id || id === "undefined") {
    throw new Error(`Invalid customer ID: ${id}`);
  }
  const { data } = await api.delete(`/customers/${String(id)}`);
  return data;
}

// Supplier endpoints
import type { Supplier } from "../components/purchase/SupplierForm";

export async function getSuppliers() {
  const { data } = await api.get<Supplier[]>("/suppliers");
  return data;
}

export async function createSupplier(payload: Partial<Supplier>) {
  const { data } = await api.post<Supplier>("/suppliers", payload);
  return data;
}

export async function updateSupplier(
  id: string | number,
  patch: Partial<Supplier>
) {
  const { data } = await api.put<Supplier>(`/suppliers/${String(id)}`, patch);
  return data;
}

export async function deleteSupplier(id: string | number) {
  if (!id || id === "undefined") {
    throw new Error(`Invalid supplier ID: ${id}`);
  }
  const { data } = await api.delete(`/suppliers/${String(id)}`);
  return data;
}

// Sales endpoints - primary functions work with invoiceNumber
export async function updateSale(
  invoiceNumber: string,
  patch: Partial<SaleRecordPayload>
) {
  // Try dedicated number-based endpoint first
  try {
    const { data } = await api.put(
      `/sale-invoice/number/${encodeURIComponent(invoiceNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Try query param approach
  try {
    const { data } = await api.put(
      `/sale-invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Fallback: find by invoiceNumber then update by ID
  const sale = await getSaleByNumber(invoiceNumber);
  if (!sale) throw new Error(`Sale not found: ${invoiceNumber}`);
  const saleRecord = sale as { _id?: string; id?: string };
  const id = saleRecord._id ?? saleRecord.id;
  if (!id) throw new Error(`Sale has no valid ID: ${invoiceNumber}`);
  const { data } = await api.put(`/sale-invoice/${String(id)}`, patch);
  return data;
}

/**
 * Deletes a sale by invoice number
 * @param invoiceNumber - Invoice number to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteSale(invoiceNumber: string) {
  // Try dedicated number-based endpoint first

  try {
    const { data } = await api.delete(
      `/sale-invoice/${encodeURIComponent(invoiceNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Fallback: find by invoiceNumber then delete by ID
  const sale = await getSaleByNumber(invoiceNumber);
  if (!sale) throw new Error(`Sale not found: ${invoiceNumber}`);
  const saleRecord = sale as { _id?: string; id?: string };
  const id = saleRecord._id ?? saleRecord.id;
  if (!id) throw new Error(`Sale has no valid ID: ${invoiceNumber}`);
  const { data } = await api.delete(`/sale-invoice/${id}`);
  return data;
}

// Helpers to operate on invoiceNumber (human-friendly number) when backends
// expose the resource by that identifier. These helpers mirror the quotation
// helpers and try multiple fallbacks so the frontend can prefer invoiceNumber
// while remaining tolerant to different server implementations.
export async function getSaleByNumber(invoiceNumber: string) {
  // Try a dedicated endpoint first
  try {
    const { data } = await api.get(
      `/sale-invoice/number/${encodeURIComponent(invoiceNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status === 404) {
      // fall through
    } else {
      throw error;
    }
  }

  // Try query-style lookup
  try {
    const { data } = await api.get<
      SaleRecordPayload[] | { data: SaleRecordPayload[] }
    >(`/sale-invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);
    if (Array.isArray(data)) return data[0];
    return (
      (data as { data: SaleRecordPayload[] }).data ??
      (data as unknown as SaleRecordPayload[])
    );
  } catch {
    // final fallback: fetch all and find
    const { data } = await api.get<SaleRecordPayload[]>("/sale-invoice");
    return (data || []).find(
      (s: SaleRecordPayload) =>
        String(s.invoiceNumber) === String(invoiceNumber)
    );
  }
}

// Get sale by invoiceNumber (primary method)
export async function getSale(invoiceNumber: string) {
  return getSaleByNumber(invoiceNumber);
}

// Legacy alias functions for backward compatibility
export const updateSaleByNumber = updateSale;
export const deleteSaleByNumber = deleteSale;

// Quotations endpoints
export async function updateQuotation(
  id: string | number,
  patch: Partial<QuotationRecordPayload>
) {
  const { data } = await api.put(`/quotations/${String(id)}`, patch);
  return data;
}

export async function deleteQuotation(id: string | number) {
  const { data } = await api.delete(`/quotations/${String(id)}`);
  return data;
}

// Helpers to operate on quotationNumber (human-friendly number) when backends
// expose the resource by that identifier. These helpers try multiple fallbacks
// so the frontend can prefer quotationNumber while remaining tolerant to
// server implementations that still require Mongo _id.
export async function getQuotationByNumber(quotationNumber: string) {
  // Try a dedicated endpoint first
  try {
    const { data } = await api.get(
      `/quotations/number/${encodeURIComponent(quotationNumber)}`
    );
    return data as QuotationRecordPayload;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status === 404) {
      // fall through to next attempt
    } else {
      // other error - rethrow
      throw error;
    }
  }

  // Try query-style lookup
  try {
    const { data } = await api.get<
      QuotationRecordPayload[] | { data: QuotationRecordPayload[] }
    >(`/quotations?quotationNumber=${encodeURIComponent(quotationNumber)}`);
    // data can be single object or array
    if (Array.isArray(data)) return data[0];
    return (
      (data as { data: QuotationRecordPayload[] }).data ??
      (data as unknown as QuotationRecordPayload[])
    );
  } catch {
    // final fallback: fetch all and find
    const { data } = await api.get<QuotationRecordPayload[]>("/quotations");
    return (data || []).find(
      (q) => String(q.quotationNumber) === String(quotationNumber)
    );
  }
}

export async function updateQuotationByNumber(
  quotationNumber: string,
  patch: Partial<QuotationRecordPayload>
) {
  // Try dedicated number-based endpoint
  try {
    const { data } = await api.put(
      `/quotations/number/${encodeURIComponent(quotationNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Try query param
  try {
    const { data } = await api.put(
      `/quotations?quotationNumber=${encodeURIComponent(quotationNumber)}`,
      patch
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Last resort: map quotationNumber -> id then call updateQuotation
  const q = await getQuotationByNumber(quotationNumber);
  if (!q) throw new Error(`Quotation not found: ${quotationNumber}`);
  const quotation = q as { _id?: string; id?: string };
  const id = quotation._id ?? quotation.id;
  if (!id) throw new Error(`Quotation has no valid ID: ${quotationNumber}`);
  return updateQuotation(id, patch);
}

export async function deleteQuotationByNumber(quotationNumber: string) {
  // Try dedicated number-based endpoint
  try {
    const { data } = await api.delete(
      `/quotations/number/${encodeURIComponent(quotationNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Try query param
  try {
    const { data } = await api.delete(
      `/quotations?quotationNumber=${encodeURIComponent(quotationNumber)}`
    );
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    const status = error.response?.status;
    if (status && status !== 404) throw error;
  }

  // Last resort: map to id
  const q = await getQuotationByNumber(quotationNumber);
  if (!q) throw new Error(`Quotation not found: ${quotationNumber}`);
  const quotation = q as { _id?: string; id?: string };
  const id = quotation._id ?? quotation.id;
  if (!id) throw new Error(`Quotation has no valid ID: ${quotationNumber}`);
  return deleteQuotation(id);
}

// update Purchase endpoints
export async function updatePurchase(
  id: string | number,
  patch: Partial<PurchaseRecordPayload>
) {
  const { data } = await api.put<PurchaseRecordPayload>(`/purchases/${String(id)}`, patch);
  return data;
}
// Delete endpoints of purchase order
export async function deletePurchase(id: string | number) {
  const { data } = await api.delete(`/purchases/${String(id)}`);
  return data;
}

// Delete endpoints
export async function deleteInventory(id: string | number) {
  // Keep path consistent with create/get/update which use `/products`.
  const { data } = await api.delete(`/products/${String(id)}`);
  return data;
}

export async function deleteExpense(expenseNumber: string | number) {
  const { data } = await api.delete(`/expenses/${String(expenseNumber)}`);
  return data;
}

export async function deleteCategory(_id: string) {
  const { data } = await api.delete(`/categories/${_id}`);
  return data;
}

export default api;
