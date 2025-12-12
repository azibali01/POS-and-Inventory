/**
 * Central Context Exports
 *
 * Re-exports all domain-specific contexts for easy importing.
 *
 * Usage:
 * import { useInventory, useSales, usePurchase } from '@/contexts';
 */

// Inventory Context
export {
  InventoryProvider,
  useInventory,
} from "./InventoryContext/InventoryContext.tsx";
export type {
  InventoryItem,
  Category,
  Color,
  InventoryContextType,
} from "./InventoryContext/types";

// Sales Context
export { SalesProvider, useSales } from "./SalesContext/SalesContext.tsx";
export type {
  SaleRecord,
  QuotationRecord,
  Customer,
  SalesContextType,
} from "./SalesContext/types";

// Purchase Context
export {
  PurchaseProvider,
  usePurchase,
} from "./PurchaseContext/PurchaseContext.tsx";
export type {
  PurchaseRecord,
  PurchaseInvoiceRecord,
  GRNRecord,
  PurchaseReturnRecord,
  PurchaseContextType,
} from "./PurchaseContext/types";

// Accounts Context
export {
  AccountsProvider,
  useAccounts,
} from "./AccountsContext/AccountsContext.tsx";
export type {
  ReceiptVoucher,
  PaymentVoucher,
  AccountsContextType,
} from "./AccountsContext/types";

// Expenses Context
export {
  ExpensesProvider,
  useExpenses,
} from "./ExpensesContext/ExpensesContext.tsx";
export type { Expense, ExpensesContextType } from "./ExpensesContext/types";
