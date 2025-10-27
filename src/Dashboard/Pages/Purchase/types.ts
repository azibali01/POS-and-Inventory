export type PurchaseLineItem = {
  id: string;
  productId: string;
  productName: string;
  code?: string;
  unit?: string;
  quantity: number;
  rate: number;
  // price source for the per-line price (old/new/manual)
  rateSource?: "old" | "new" | "manual";
  // per-line metadata requested by user
  colorId?: string;
  color?: string;
  thickness?: string;
  length?: string | number;
  // amounts
  grossAmount: number; // quantity * rate
  percent?: number; // percentage discount
  discountAmount: number; // absolute discount
  netAmount: number; // gross - discount
  taxRate?: number;
  amount: number; // net + tax
};

export type PurchaseLineItems = PurchaseLineItem[];
