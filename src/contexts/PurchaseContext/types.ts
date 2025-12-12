/**
 * Purchase Context Types
 *
 * Type definitions for purchase operations including orders,
 * invoices, returns, GRNs, and suppliers.
 */

import type { Supplier } from "../../components/purchase/SupplierForm";

export interface PurchaseLineItem {
  id: string;
  productName: string;
  quantity: number;
  rate: number;
  color?: string;
  thickness?: string;
  length?: string | number;
  amount?: number;
  inventoryId?: string;
  received?: number;
}

export interface PurchaseRecord {
  id?: string;
  poNumber: string;
  poDate: string | Date;
  expectedDelivery?: string | Date;
  supplier?: Supplier;
  products: PurchaseLineItem[];
  subTotal?: number;
  total: number;
  status?: string;
  remarks?: string;
  createdAt?: Date;
}

export interface PurchaseInvoiceRecord {
  id?: string;
  purchaseInvoiceNumber: string;
  invoiceDate: string | Date;
  expectedDelivery?: string | Date;
  supplier?: Supplier;
  products: PurchaseLineItem[];
  subTotal?: number;
  total: number;
  status?: string;
  remarks?: string;
  createdAt?: Date;
}

export interface GRNRecord {
  id: string;
  grnNumber: string;
  grnDate: string;
  supplier?: string;
  supplierId?: string;
  supplierName?: string;
  linkedPoId?: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  subtotal: number;
  totalAmount: number;
  status?: string;
}

export interface PurchaseReturnRecord {
  id?: string;
  returnNumber: string;
  returnDate: string;
  items: unknown[];
  supplier?: string;
  supplierId?: string;
  linkedPoId?: string;
  subtotal: number;
  total: number;
  reason?: string;
}

export interface PurchaseContextType {
  // Suppliers
  suppliers: Supplier[];
  suppliersLoading: boolean;
  suppliersError: string | null;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  loadSuppliers: () => Promise<Supplier[]>;

  // Purchase Orders
  purchases: PurchaseRecord[];
  purchasesLoading: boolean;
  purchasesError: string | null;
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  loadPurchases: () => Promise<PurchaseRecord[]>;

  // Purchase Invoices
  purchaseInvoices: PurchaseInvoiceRecord[];
  purchaseInvoicesLoading: boolean;
  purchaseInvoicesError: string | null;
  setPurchaseInvoices: React.Dispatch<
    React.SetStateAction<PurchaseInvoiceRecord[]>
  >;
  loadPurchaseInvoices: () => Promise<PurchaseInvoiceRecord[]>;

  // GRNs
  grns: GRNRecord[];
  grnsLoading: boolean;
  grnsError: string | null;
  setGrns: React.Dispatch<React.SetStateAction<GRNRecord[]>>;
  loadGrns: () => Promise<GRNRecord[]>;

  // Purchase Returns
  purchaseReturns: PurchaseReturnRecord[];
  purchaseReturnsLoading: boolean;
  purchaseReturnsError: string | null;
  setPurchaseReturns: React.Dispatch<
    React.SetStateAction<PurchaseReturnRecord[]>
  >;
  loadPurchaseReturns: () => Promise<PurchaseReturnRecord[]>;
}
