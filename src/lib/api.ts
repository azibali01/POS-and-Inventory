import axios from "axios";

// Base axios instance - configure via Vite env VITE_API_BASE_URL or default to /api
export const api = axios.create({
  baseURL: "http://localhost:3000/",
});

// Dev-only request logger to help diagnose duplicate-request storms.
// This logs method+url and a stack trace so we can see which component/effect
// initiated the request. Disabled in production to avoid leaking internals.
if (import.meta.env.MODE !== "production") {
  try {
    api.interceptors.request.use((config) => {
      try {
        // lightweight trace capture
        const trace = new Error().stack || "";
        // eslint-disable-next-line no-console
        console.debug(
          `[api] ${config.method?.toUpperCase() || "GET"} ${
            config.url
          } — trace:`,
          trace.split("\n").slice(2, 8)
        );
      } catch (e) {
        /* ignore logging errors */
      }
      return config;
    });
  } catch (e) {
    /* ignore */
  }
}

// Minimal types (mirror DataContext shapes as needed)
export interface InventoryItemPayload {
  itemName?: string;
  description?: string;
  category?: string;
  thickness: number;
  salesRate: number;
  color?: string;
  openingStock: number;
  minimumStockLevel: number;
  quantity: number;
  unit?: number | string;
  metadata?: Record<string, unknown>;
}
export interface SaleRecordPayload {
  id?: string | number;
  // callers historically used `sku` for items; accept either `inventoryId` or `sku`
  items: {
    inventoryId?: string | number;
    sku?: string | number;
    quantity: number;
    unitPrice?: number;
    metadata?: Record<string, unknown>;
  }[];
  total?: number;
  date?: string;
  customerId?: string | number;
  customerName?: string;

  metadata?: Record<string, unknown>;
}
export interface PurchaseRecordPayload {
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
  metadata?: Record<string, unknown>;
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
  id?: string | number;
  amount: number;
  date?: string;
  category?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CustomerPayload {
  id?: string | number;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  openingAmount?: number;
  creditLimit?: number;
  paymentType?: "credit" | "debit";
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ColorPayload {
  id?: string | number;
  name: string;
  hex?: string;
  metadata?: Record<string, unknown>;
}

export interface CategoryPayload {
  id?: string | number;
  name: string;
  metadata?: Record<string, unknown>;
}

// Read endpoints
export async function getInventory() {
  // Try several common endpoints so the client is tolerant to backend path
  // differences during development. If the server responds with 404 for the
  // canonical `/products` path, try a few fallbacks before giving up.
  const candidates = ["/products"];
  for (const path of candidates) {
    try {
      const { data } = await api.get<InventoryItemPayload[]>(path);
      return data;
    } catch (err: any) {
      // if server returned 404, try the next candidate; otherwise rethrow
      const status = err && err.response && err.response.status;
      if (status && status === 404) continue;
      throw err;
    }
  }
  // nothing found — return empty list to keep app usable
  return [] as InventoryItemPayload[];
}

export async function getSales() {
  const { data } = await api.get<SaleRecordPayload[]>("/sale-invoice");
  return data;
}

export async function getPurchases() {
  const { data } = await api.get<PurchaseRecordPayload[]>("/purchases");
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

export async function getCustomers() {
  const { data } = await api.get<CustomerPayload[]>("/customers");
  return data;
}

// colors endpoint removed - colors are provided statically in the client

export async function getCategories() {
  const { data } = await api.get<CategoryPayload[]>("/categories");
  return data;
}

// Create endpoints
export async function createInventory(item: InventoryItemPayload) {
  const { data } = await api.post<InventoryItemPayload>("/products", item);
  return data as InventoryItemPayload;
}

export async function createSale(payload: SaleRecordPayload) {
  const { data } = await api.post("/sale-invoice", payload);
  return data;
}

export async function createPurchase(payload: PurchaseRecordPayload) {
  const { data } = await api.post("/purchases", payload);
  return data;
}

export async function createGRN(payload: GRNRecordPayload) {
  const { data } = await api.post("/grns", payload);
  return data;
}

export async function createPurchaseReturn(
  payload: PurchaseReturnRecordPayload
) {
  const { data } = await api.post("/purchase-returns", payload);
  return data;
}

export async function createExpense(payload: ExpensePayload) {
  const { data } = await api.post("/expenses", payload);
  return data;
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await api.post("/categories", payload);
  return data;
}

// Update endpoints
export async function updateInventory(
  id: string | number,
  patch: Partial<InventoryItemPayload>
) {
  // Backend uses `/products` as the canonical inventory collection. Use the
  // same base path for updates so create/get/update/delete stay consistent.
  const { data } = await api.put<InventoryItemPayload>(
    `/products/${id}`,
    patch
  );
  return data as InventoryItemPayload;
}

export async function updateExpense(
  id: string | number,
  patch: Partial<ExpensePayload>
) {
  const { data } = await api.put(`/expenses/${id}`, patch);
  return data;
}

export async function updateCategory(
  id: string | number,
  patch: Partial<CategoryPayload>
) {
  const { data } = await api.put(`/categories/${id}`, patch);
  return data;
}

// Customer endpoints
export async function createCustomer(payload: CustomerPayload) {
  const { data } = await api.post("/customers", payload);
  return data;
}

export async function updateCustomer(id: string | number, patch: any) {
  const { data } = await api.put(`/customers/${id}`, patch);
  return data;
}

export async function deleteCustomer(id: string | number) {
  if (!id || id === 'undefined') {
    throw new Error(`Invalid customer ID: ${id}`);
  }
  const { data } = await api.delete(`/customers/${id}`);
  return data;
}

// Sales endpoints
export async function updateSale(id: string | number, patch: any) {
  const { data } = await api.put(`/sale-invoice/${id}`, patch);
  return data;
}

export async function deleteSale(id: string | number) {
  const { data } = await api.delete(`/sale-invoice/${id}`);
  return data;
}

// Purchase endpoints
export async function updatePurchase(id: string | number, patch: any) {
  const { data } = await api.put(`/purchases/${id}`, patch);
  return data;
}

export async function deletePurchase(id: string | number) {
  const { data } = await api.delete(`/purchases/${id}`);
  return data;
}

// Delete endpoints
export async function deleteInventory(id: string | number) {
  // Keep path consistent with create/get/update which use `/products`.
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

export async function deleteExpense(id: string | number) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}

export async function deleteCategory(id: string | number) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}

export default api;
