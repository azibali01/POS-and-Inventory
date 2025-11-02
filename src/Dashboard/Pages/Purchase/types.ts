export type PurchaseLineItem = {
  id: string;
  productId: string;
  productName: string;
  code?: string;
  unit: string;
  percent?: number;
  quantity: number;
  rate: number;
  color?: string;
  grossAmount: number;
  discountAmount?: number;
  netAmount: number;
  thickness?: string;
  length?: string | number;
  amount?: number;
};

export type PurchaseLineItems = PurchaseLineItem[];
