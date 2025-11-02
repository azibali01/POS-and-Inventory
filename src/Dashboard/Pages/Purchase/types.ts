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
