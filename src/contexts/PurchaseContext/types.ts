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
  // Suppliers CRUD (if available in DataContext) -> DataContext has NO createSupplier?
  // checking DataContext again... lines 204-210.
  // It has suppliersLoading, setSuppliers, loadSuppliers, suppliersForSelect.
  // It DOES NOT have createSupplier.
  // Wait, really? 
  // checking lines 1-800 of DataContext...
  // I don't see createSupplier.
  // Let me re-verify this assumption. If DataContext has no createSupplier, then PurchaseContext shouldn't either.
  // BUT SupplierForm likely acts on it?
  // Let's stick to what DataContext has for now. 
  suppliersForSelect: Array<{ value: string; label: string }>;

  // Purchase Orders
  purchases: PurchaseRecord[];
  purchasesLoading: boolean;
  purchasesError: string | null;
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  loadPurchases: () => Promise<PurchaseRecord[]>;
  createPurchase: (
    payload: import("../../lib/api").PurchaseRecordPayload
  ) => Promise<PurchaseRecord>;
  updatePurchase: (
    id: string | number,
    payload: Partial<import("../../lib/api").PurchaseRecordPayload>
  ) => Promise<PurchaseRecord>;
  deletePurchase: (id: string | number) => Promise<void>;

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
  createGrn: (payload: import("../../lib/api").GRNRecordPayload) => Promise<GRNRecord>;
  applyGrnToInventory: (grn: GRNRecord) => void;
  updatePurchaseFromGrn: (grn: GRNRecord) => void;

  // Purchase Returns
  purchaseReturns: PurchaseReturnRecord[];
  purchaseReturnsLoading: boolean;
  purchaseReturnsError: string | null;
  setPurchaseReturns: React.Dispatch<
    React.SetStateAction<PurchaseReturnRecord[]>
  >;
  loadPurchaseReturns: () => Promise<PurchaseReturnRecord[]>;
  createPurchaseReturn: (
    payload: import("../../lib/api").PurchaseReturnRecordPayload
  ) => Promise<PurchaseReturnRecord>;
  applyPurchaseReturnToInventory: (ret: PurchaseReturnRecord) => void;
  updatePurchaseFromReturn: (ret: PurchaseReturnRecord) => void;
  processPurchaseReturn: (ret: PurchaseReturnRecord) => {
    applied: boolean;
    message?: string;
  };
}
