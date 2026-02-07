/**
 * API Endpoint Configuration
 * Centralized endpoint definitions for all API routes
 */

export const ENDPOINTS = {
  // Sales
  SALES: "/sale-invoice",
  QUOTATIONS: "/quotations",
  SALE_RETURNS: "/sale-return",

  // Purchase
  PURCHASE_ORDERS: "/purchaseorder",
  PURCHASE_INVOICES: "/purchase-invoice",
  PURCHASE_RETURNS: "/purchase-returns",
  GRNS: "/grns",

  // Inventory & Products
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  COLORS: "/colors",

  // Accounts
  CUSTOMERS: "/customers",
  SUPPLIERS: "/suppliers",
  EXPENSES: "/expenses",
  PAYMENT_VOUCHERS: "/payment-voucher",
  RECEIPT_VOUCHERS: "/reciept-voucher",

  // Drafts (autosave)
  DRAFTS: "/drafts",
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
