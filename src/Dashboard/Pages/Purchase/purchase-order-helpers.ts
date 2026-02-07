/**
 * Purchase Order Helper Functions
 * Extracted from PurchaseOrder.tsx to reduce code duplication and improve maintainability
 */

// Type definitions based on usage in PurchaseOrder.tsx
export interface PurchaseLineItem {
  id: string;
  productName: string;
  quantity: number;
  rate: number;
  amount?: number; // Optional to match ./types.ts
  color?: string;
  thickness?: string;
  length?: number | string;
  unit: string; // Required
  code?: string;
  productId: string; // Required
  percent?: number;
  grossAmount: number; // Required
  discountAmount?: number; // Optional
  netAmount: number; // Required
}

export interface PurchaseOrderPayload {
  poNumber: string;
  poDate: Date | string;
  expectedDelivery?: Date;
  supplierId?: string;
  products: PurchaseLineItem[];
  remarks?: string;
  subTotal?: number;
  total?: number;
}

export interface Supplier {
  _id: string;
  name: string;
  [key: string]: any;
}

/**
 * Normalize supplier from various input formats
 */
export function normalizePurchaseSupplier(
  inputSupplier: unknown,
  supplierId: string | undefined,
  suppliers: Supplier[]
): Supplier | undefined {
  // Try to find by ID first if provided
  if (supplierId) {
    const found = suppliers.find((s) => s._id === supplierId);
    if (found) return found;
  }

  // Try to resolve from input object
  if (inputSupplier && typeof inputSupplier === "object") {
    // If it has an _id, try to lookup in list
    if ("_id" in inputSupplier && typeof (inputSupplier as any)._id === "string") {
      const id = (inputSupplier as any)._id; // Keeping legacy cast for safety with unknown
      const found = suppliers.find((s) => s._id === id);
      if (found) return found;
    }
    // If it has a name, it might be a partial object or valid supplier
    if ("name" in inputSupplier) {
      return inputSupplier as Supplier;
    }
    // Deep check for nested supplierId
    if ("supplierId" in inputSupplier && typeof (inputSupplier as any).supplierId === "string") {
       const id = (inputSupplier as any).supplierId;
       const found = suppliers.find((s) => s._id === id);
       if (found) return found;
    }
  }

  return undefined;
}

/**
 * Map purchase order items for API and local state
 */
export function mapPurchaseOrderItems(items: PurchaseLineItem[]): any[] {
  return items.map((item) => ({
    id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
    productId: "", // Default empty as per original code
    productName: typeof item.productName === "string" ? item.productName : "",
    code: "",
    unit: typeof item.unit === "string" ? item.unit : "pcs",
    percent: 0,
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    rate: typeof item.rate === "number" ? item.rate : 0,
    color: typeof item.color === "string" ? item.color : "",
    grossAmount: 0,
    discountAmount: 0,
    netAmount: 0,
    thickness: typeof item.thickness === "string" ? item.thickness : (item.thickness || ""),
    length: typeof item.length === "string" || typeof item.length === "number" ? item.length : "",
    amount: typeof item.amount === "number" ? item.amount : 0,
  }));
}

/**
 * Build complete purchase order payload
 */
export function buildPurchaseOrderPayload(
  payload: PurchaseOrderPayload,
  supplier: Supplier | undefined
) {
  return {
    poNumber: payload.poNumber,
    poDate: payload.poDate instanceof Date ? payload.poDate : new Date(payload.poDate),
    expectedDelivery: payload.expectedDelivery,
    supplier: supplier,
    products: payload.products, 
    remarks: payload.remarks,
    subTotal: payload.subTotal,
    total: payload.total ?? payload.subTotal ?? 0,
  };
}


/**
 * Build local state object for optimistic updates
 */
export function buildLocalPurchaseOrder(
  payload: PurchaseOrderPayload,
  supplier: Supplier | undefined,
  id?: string,
  status: string = "Draft"
) {
  return {
    id: id || payload.poNumber,
    poNumber: payload.poNumber,
    poDate: payload.poDate,
    supplier: supplier,
    products: mapPurchaseOrderItems(payload.products),
    subTotal: payload.subTotal ?? 0,
    total: payload.total ?? payload.subTotal ?? 0,
    status: status,
    expectedDeliveryDate: payload.expectedDelivery,
    remarks: payload.remarks,
    createdAt: new Date(),
  };
}
