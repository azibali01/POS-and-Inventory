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

export type PurchaseRecord = {
  id: string;
  poNumber: string;
  poDate: string | Date;
  supplier: any; // Simplified for now, can be string or object
  supplierId?: string;
  products: PurchaseLineItem[];
  subTotal?: number;
  total?: number;
  status?: string;
  expectedDeliveryDate?: string | Date;
  remarks?: string;
  createdAt?: Date;
};

export type PurchaseReturnRecord = {
  id: string;
  returnNumber: string;
  returnDate: string | Date;
  supplier: string; // name
  supplierId: string;
  items: PurchaseLineItem[];
  subtotal: number;
  total: number;
  reason?: string;
  linkedPoId?: string;
};
