/**
 * Shared type definitions for the frontend application
 * Extracted from DataContext.tsx to reduce duplication and improve maintainability
 */

import type { InventoryItemPayload } from "../lib/api";
import type { Supplier } from "../components/purchase/SupplierForm";

// ===== INVENTORY TYPES =====

export interface InventoryItem {
  _id: string;
  itemName?: string;
  category?: string;
  unit?: string;
  color?: string;
  thickness?: number;
  salesRate?: number;
  openingStock?: number;
  minimumStockLevel?: number;
  description?: string;
  stock?: number;
  lastUpdated?: string;
  quantity?: number;
  brand?: string;
}

// ===== CUSTOMER TYPES =====

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  openingAmount?: number;
  creditLimit?: number;
  paymentType?: "Credit" | "Debit";
  createdAt?: string;
}

export type CustomerInput = Omit<Customer, "_id" | "createdAt">;

// ===== SALES TYPES =====

export interface SaleRecord {
  date: string | Date;
  quotationDate: string | Date;
  customerId: string | number | boolean | undefined;
  total: number | undefined;
  status: string;
  id: string | number;
  invoiceNumber?: string;
  invoiceDate?: string;
  customerName?: string;
  customer?: Array<{ id?: string | number; name: string }>;
  products?: InventoryItemPayload[];
  totalGrossAmount?: number;
  totalNetAmount?: number;
  subTotal?: number;
  amount?: number;
  remarks?: string;
  length?: number;
  totalDiscount?: number;
  paymentMethod?: "Cash" | "Card";
}

export interface SaleItem {
  id?: string | number;
  _id?: string | number;
  sku?: string;
  productId?: string | number;
  productName?: string;
  itemName?: string;
  name?: string;
  quantity?: number;
  salesRate?: number;
  sellingPrice?: number;
  rate?: number;
  discount?: number;
  discountAmount?: number;
  length?: number;
  color?: string;
  unit?: string;
  price?: number;
  totalGrossAmount?: number;
  totalNetAmount?: number;
  openingStock?: number;
  minimumStockLevel?: number;
  metadata?: Record<string, unknown>;
}

// ===== PURCHASE TYPES =====

export interface PurchaseRecord {
  id?: string;
  poNumber: string;
  poDate: string | Date;
  expectedDelivery?: string | Date;
  supplier?: Supplier;
  products: Array<{
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
  }>;
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
  products: Array<{
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
  }>;
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
  id: string | undefined;
  returnNumber: string;
  returnDate: string;
  items: InventoryItemPayload[];
  supplier?: string;
  supplierId?: string;
  linkedPoId?: string;
  subtotal: number;
  total: number;
  reason?: string;
}

export interface SupplierCreditRecord {
  id: string;
  supplierId?: string;
  supplierName?: string;
  date: string;
  total: number;
  note?: string;
}

// ===== EXPENSE TYPES =====

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string | Date;
  categoryType: string;
  description?: string;
  amount: number;
  paymentMethod?: "Cash" | "Card";
  reference?: string;
  remarks?: string;
  createdAt?: string | Date;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt">;

// ===== VOUCHER TYPES =====

export interface ReceiptVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string | Date;
  receivedFrom: string;
  amount: number;
  referenceNumber?: string;
  paymentMode: string;
  remarks?: string;
}

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string | Date;
  paidTo: string;
  amount: number;
  referenceNumber?: string;
  paymentMode: string;
  remarks?: string;
}

// ===== COLOR TYPES =====

export interface Color {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
}
