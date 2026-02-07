/**
 * Sale Invoice Helper Functions
 * 
 * Shared logic for creating sale invoices from various sources:
 * - Manual invoice creation
 * - Quotation imports
 * - Sale returns
 */

import type { SaleRecordPayload } from "../../../lib/api";
import type { SalesPayload } from "../../../components/sales/SalesDocShell";

/**
 * Customer information that can be in various formats
 */
type CustomerInput =
  | string
  | { _id?: string | number; name: string }
  | { _id: string; name: string };

type InventoryItem = {
  _id?: string | number;
  itemName?: string;
  category?: string;
  supplier?: string;
  supplierName?: string;
  brand?: string;
  salesRate?: number;
  color?: string;
  thickness?: number | string;
  openingStock?: number;
  minimumStockLevel?: number;
  unit?: string;
};

type SaleItem = {
  _id?: string | number;
  itemName?: string;
  category?: string;
  supplier?: string;
  brand?: string;
  salesRate?: number;
  color?: string;
  thickness?: number | string;
  openingStock?: number;
  minimumStockLevel?: number;
  quantity?: number;
  unit?: string;
  discount?: number;
  discountAmount?: number;
  length?: number;
  totalGrossAmount?: number;
  totalNetAmount?: number;
  metadata?: Record<string, unknown>;
};

/**
 * Normalize customer input into a consistent customer object
 */
export function normalizeCustomer(
  customer: CustomerInput | undefined,
  customers: Array<{ _id: string; name: string }>
): { _id: string; name: string } | undefined {
  if (!customer) return undefined;

  // If customer is a string (ID), find in the list
  if (typeof customer === "string") {
    const found = customers.find((c) => String(c._id) === customer);
    if (found) return found;
    // Fallback: use the string as both ID and name
    return { _id: customer, name: customer };
  }

  // If customer is an object with name
  if (typeof customer === "object" && "name" in customer) {
    const id =
      "_id" in customer && customer._id
        ? String(customer._id)
        : customer.name;
    return {
      _id: typeof id === "string" ? id : String(id),
      name: customer.name,
    };
  }

  return undefined;
}

/**
 * Map sale items to inventory products
 */
export function mapSaleItems(
  items: SalesPayload["items"],
  inventory: InventoryItem[]
): SaleItem[] {
  if (!items) return [];

  return items.map((it) => {
    const inv = inventory.find(
      (p) =>
        String(p._id) === String(it._id) ||
        String(p.itemName) === String(it.itemName)
    );

    return {
      _id: inv?._id,
      itemName: inv?.itemName ?? it.itemName,
      category: inv?.category ?? "",
      supplier:
        (inv as any)?.supplier ?? (inv as any)?.supplierName ?? undefined,
      brand: inv?.brand ?? undefined,
      salesRate: Number(inv?.salesRate ?? it.salesRate ?? 0),
      color: it.color ?? inv?.color ?? "",
      thickness: it.thickness ?? inv?.thickness ?? undefined,
      openingStock: Number(inv?.openingStock ?? 0),
      minimumStockLevel: Number(inv?.minimumStockLevel ?? 0),
      quantity: Number(it.quantity ?? 0),
      unit: it.unit ?? inv?.unit ?? undefined,
      discount: Number(it.discount ?? 0),
      discountAmount: Number(it.discountAmount ?? 0),
      length: it.length ?? undefined,
      metadata: { price: it.salesRate ?? undefined },
    } as SaleItem;
  });
}

/**
 * Sanitize mapped products to ensure proper types
 */
export function sanitizeProducts(products: SaleItem[]): Array<Omit<SaleItem, 'thickness'> & { thickness?: number }> {
  return products.map((item) => ({
    ...item,
    thickness:
      typeof item.thickness === "string"
        ? isNaN(Number(item.thickness))
          ? undefined
          : Number(item.thickness)
        : item.thickness,
    discount: item.discount ?? 0,
    discountAmount: item.discountAmount ?? 0,
    quantity: item.quantity ?? 0,
    salesRate: item.salesRate ?? 0,
    totalGrossAmount: item.totalGrossAmount ?? 0,
    totalNetAmount: item.totalNetAmount ?? 0,
  }));
}

/**
 * Build Sale API Payload from SalesPayload
 */
export function buildSaleApiPayload(
  payload: SalesPayload,
  invoiceNumber: string,
  inventory: InventoryItem[],
  customers: Array<{ _id: string; name: string }>,
  metadata?: Record<string, unknown>
): SaleRecordPayload {
  const invoiceDate = payload.docDate || new Date().toISOString();
  const customer = normalizeCustomer(payload.customer, customers);
  const products = mapSaleItems(payload.items, inventory);
  const mappedProducts = sanitizeProducts(products);

  return {
    invoiceNumber,
    invoiceDate,
    items: mappedProducts,
    subTotal: Math.floor(payload.totals?.subTotal ?? 0),
    totalGrossAmount: Math.floor(payload.totals?.totalGrossAmount ?? 0),
    totalNetAmount: Math.floor(payload.totals?.totalNetAmount ?? 0),
    discount: 0,
    totalDiscount: Math.floor(payload.totals?.totalDiscountAmount ?? 0),
    // Backend DTO expects Customer object (not null/undefined)
    customer: customer ?? ({} as any),
    paymentMethod: undefined,
    length: payload.items?.length ?? 0,
    metadata: metadata ?? { source: "manual" },
  };
}
