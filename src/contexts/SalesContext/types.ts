/**
 * Sales Context Types
 *
 * Type definitions for sales operations including invoices,
 * quotations, sale returns, and customers.
 */

import type { InventoryItemPayload } from "../../lib/api";

export interface Customer {
  _id: string;
  id?: string | number;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  openingAmount?: number;
  creditLimit?: number;
  paymentType?: "Credit" | "Debit";
  createdAt?: string;
}

export interface SaleRecord {
  date: string | Date;
  quotationDate?: string | Date;
  customerId?: string | number | boolean;
  total?: number;
  status?: string;
  id: string | number;
  invoiceNumber?: string;
  invoiceDate?: string;
  _id?: string;
  customer?: Customer | null;
  name?: string;
  products?: InventoryItemPayload[];
  items?: InventoryItemPayload[];
  totalGrossAmount?: number;
  totalNetAmount?: number;
  subTotal?: number;
  amount?: number;
  remarks?: string;
  length?: number;
  totalDiscount?: number;
  discount?: number;
  paymentMethod?: "Cash" | "Card";
}

export interface QuotationRecord {
  quotationNumber?: string;
  quotationDate?: string;
  products?: InventoryItemPayload[];
  subTotal?: number;
  totalGrossAmount?: number;
  totalNetAmount?: number;
  discount?: number;
  totalDiscount?: number;
  customer?: Customer | Customer[];
  remarks?: string;
  length?: number;
  amount?: number;
}

export interface SalesContextType {
  // Sales Invoices
  sales: SaleRecord[];
  salesLoading: boolean;
  salesError: string | null;
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  loadSales: () => Promise<SaleRecord[]>;

  // Quotations
  quotations: QuotationRecord[];
  quotationsLoading: boolean;
  quotationsError: string | null;
  setQuotations: React.Dispatch<React.SetStateAction<QuotationRecord[]>>;
  loadQuotations: () => Promise<QuotationRecord[]>;

  // Sale Returns
  saleReturns: SaleRecord[];
  saleReturnsLoading: boolean;
  saleReturnsError: string | null;
  setSaleReturns: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  loadSaleReturns: () => Promise<SaleRecord[]>;

  // Customers
  customers: Customer[];
  customersLoading: boolean;
  customersError: string | null;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  loadCustomers: () => Promise<Customer[]>;
}
