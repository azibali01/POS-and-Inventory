/**
 * Bill Calculation Utilities
 * Business logic for calculating totals, discounts, and amounts
 */

export interface LineItem {
  _id?: string | number;
  itemName?: string;
  unit: string;
  discount?: number;
  discountAmount?: number;
  salesRate?: number;
  color?: string;
  openingStock?: number;
  quantity?: number;
  thickness?: number;
  amount: number;
  length?: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  brand?: string;
}

export interface BillSummary {
  subtotal: number;
  totalGrossAmount: number;
  totalDiscountAmount: number;
  totalNetAmount: number;
  itemCount: number;
}

/**
 * Calculate item total based on Length × Quantity × Rate
 * @param length - Length in feet/meters (supports decimals)
 * @param quantity - Quantity
 * @param rate - Rate per unit
 * @returns Total amount (rounded to 2 decimals)
 */
export function calculateItemTotal(
  length: number,
  quantity: number,
  rate: number
): number {
  const total = length * quantity * rate;
  return parseFloat(total.toFixed(2));
}

/**
 * Calculate gross amount for a single line item
 */
export function calculateGrossAmount(item: {
  length?: number;
  quantity?: number;
  salesRate?: number;
}): number {
  const length = Number(item.length || 0);
  const quantity = Number(item.quantity || 0);
  const rate = Number(item.salesRate || 0);
  return parseFloat((length * quantity * rate).toFixed(2));
}

/**
 * Calculate discount amount from percentage
 */
export function calculateDiscountAmount(
  gross: number,
  discountPercent: number
): number {
  const amount = (discountPercent / 100) * gross;
  return parseFloat(amount.toFixed(2));
}

/**
 * Calculate discount percentage from amount
 */
export function calculateDiscountPercent(
  gross: number,
  discountAmount: number
): number {
  if (gross === 0) return 0;
  const percent = (discountAmount / gross) * 100;
  return parseFloat(percent.toFixed(2));
}

/**
 * Calculate net amount (Gross - Discount)
 */
export function calculateNetAmount(
  gross: number,
  discountAmount: number
): number {
  const net = gross - discountAmount;
  return parseFloat(Math.max(0, net).toFixed(2));
}

/**
 * Calculate bill summary from line items
 */
export function calculateBillSummary(items: LineItem[]): BillSummary {
  const subtotal = items.reduce((sum, item) => {
    const length = Number(item.length || 0);
    const quantity = Number(item.quantity || 0);
    const rate = Number(item.salesRate || 0);
    return sum + length * quantity * rate;
  }, 0);

  const totalDiscountAmount = items.reduce((sum, item) => {
    return sum + Number(item.discountAmount || 0);
  }, 0);

  const totalNetAmount = subtotal - totalDiscountAmount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalGrossAmount: parseFloat(subtotal.toFixed(2)),
    totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
    totalNetAmount: parseFloat(Math.max(0, totalNetAmount).toFixed(2)),
    itemCount: items.length,
  };
}

/**
 * Calculate pending amount (Total - Received)
 */
export function calculatePendingAmount(
  total: number,
  received: number
): number {
  const pending = total - received;
  return parseFloat(Math.max(0, pending).toFixed(2));
}
