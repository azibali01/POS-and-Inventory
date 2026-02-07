/**
 * Quotation Helper Functions
 * Extracted from Quotation.tsx to reduce code duplication and improve maintainability
 * Follows the same pattern as sale-invoice-helpers.ts
 */

import type {
  QuotationRecordPayload,
  InventoryItemPayload,
  CustomerPayload,
} from "../../../lib/api";
import type { SalesPayload } from "../../../components/sales/SalesDocShell";

/**
 * Normalize customer from payload
 * Handles both customer objects and customer IDs, finding the full customer record
 */
export function normalizeQuotationCustomer(
  customer: SalesPayload["customer"],
  customers: Array<{ _id: string; name: string }>
): CustomerPayload | undefined {
  if (!customer) return undefined;

  // If customer is already an object, return it
  if (typeof customer === "object" && customer !== null) {
    return customer as CustomerPayload;
  }

  // If customer is an ID, find the full customer object
  const found = customers.find((c) => String(c._id) === String(customer));
  return found as CustomerPayload | undefined;
}

/**
 * Map sales payload items to quotation products
 * Ensures proper type conversions and defaults
 */
export function mapQuotationProducts(
  items: SalesPayload["products"] | undefined
): InventoryItemPayload[] {
  if (!items) return [];

  return items.map((it) => ({
    _id: it._id ?? "",
    itemName: it.itemName ?? "",
    unit: it.unit ?? "",
    discount:
      typeof (it as { discount?: unknown }).discount === "number"
        ? Math.floor(Number((it as { discount?: number }).discount))
        : 0,
    discountAmount:
      typeof (it as { discountAmount?: unknown }).discountAmount === "number"
        ? Math.floor(
            Number((it as { discountAmount?: number }).discountAmount)
          )
        : 0,
    salesRate: Math.floor(it.salesRate ?? 0),
    color: it.color ?? "",
    openingStock: Math.floor(it.openingStock ?? 0),
    quantity: Math.floor(it.quantity ?? 0),
    thickness: Math.floor(it.thickness ?? 0),
    amount:
      typeof (it as { amount?: unknown }).amount === "number"
        ? Math.floor(Number((it as { amount?: number }).amount))
        : 0,
    length:
      typeof (it as { length?: unknown }).length === "number"
        ? Math.floor(Number((it as { length?: number }).length))
        : 0,
    totalGrossAmount:
      typeof (it as { totalGrossAmount?: unknown }).totalGrossAmount ===
      "number"
        ? Math.floor(
            Number((it as { totalGrossAmount?: number }).totalGrossAmount)
          )
        : 0,
    totalNetAmount:
      typeof (it as { totalNetAmount?: unknown }).totalNetAmount === "number"
        ? Math.floor(
            Number((it as { totalNetAmount?: number }).totalNetAmount)
          )
        : 0,
  }));
}

/**
 * Calculate gross amount from products
 * Sums up the total based on rate and quantity
 */
export function calculateGrossAmount(
  products: InventoryItemPayload[] | undefined
): number {
  if (!products) return 0;

  return products.reduce((sum, it) => {
    const rate = Number((it as InventoryItemPayload & { rate?: number }).rate) || 0;
    const quantity =
      Number((it as InventoryItemPayload & { quantity?: number }).quantity) || 0;
    return sum + rate * quantity;
  }, 0);
}

/**
 * Build complete quotation API payload
 * Consolidates all quotation data into the API-ready format
 */
export function buildQuotationPayload(
  payload: SalesPayload,
  quotationNumber: string,
  customers: Array<{ _id: string; name: string }>
): QuotationRecordPayload {
  const customer = normalizeQuotationCustomer(payload.customer, customers);
  const products = mapQuotationProducts(payload.products);
  const gross = calculateGrossAmount(payload.products);

  return {
    quotationNumber,
    products,
    quotationDate: payload.docDate ?? new Date().toISOString(),
    // Backend expects single customer object, not array
    customer: customer ?? {} as any,
    remarks: payload.remarks ?? "",
    subTotal: Math.floor(payload.totals?.subTotal ?? gross),
    totalGrossAmount: Math.floor(
      (payload as SalesPayload & { totalGrossAmount?: number })
        .totalGrossAmount ??
        payload.totals?.total ??
        gross
    ),
    totalDiscount:
      (
        payload as SalesPayload & {
          totalDiscount?: number;
          totalDiscountAmount?: number;
        }
      ).totalDiscount ??
      (
        payload as SalesPayload & {
          totalDiscount?: number;
          totalDiscountAmount?: number;
        }
      ).totalDiscountAmount ??
      0,
    length: payload.products?.length ?? 0,
  };
}

/**
 * Build temporary quotation row for optimistic UI updates
 * Creates a lightweight display object before server confirms the creation
 */
export function buildTempQuotationRow(
  payload: SalesPayload,
  quotationNumber: string,
  customer: CustomerPayload | undefined
): QuotationRecordPayload {
  const products = mapQuotationProducts(payload.products);
  const gross = calculateGrossAmount(payload.products);

  return {
    quotationNumber,
    products,
    quotationDate: payload.docDate ?? new Date().toISOString(),
    // Backend expects single customer object, not array
    customer: customer ?? {} as any,
    remarks: payload.remarks ?? "",
    subTotal: Math.floor(payload.totals?.subTotal ?? gross),
    totalGrossAmount: Math.floor(
      (payload as SalesPayload & { totalGrossAmount?: number })
        .totalGrossAmount ??
        payload.totals?.total ??
        gross
    ),
    totalDiscount:
      (
        payload as SalesPayload & {
          totalDiscount?: number;
          totalDiscountAmount?: number;
        }
      ).totalDiscount ??
      (
        payload as SalesPayload & {
          totalDiscount?: number;
          totalDiscountAmount?: number;
        }
      ).totalDiscountAmount ??
      0,
    length: payload.products?.length ?? 0,
  };
}
