import { useQuery } from "@tanstack/react-query";
import { purchaseInvoiceService } from "../api";

/**
 * Custom hook for purchase invoice management
 * Provides read-only access to purchase invoices with React Query
 */
export function usePurchaseInvoice() {
  // Fetch all purchase invoices
  const {
    data: purchaseInvoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["purchaseInvoices"],
    queryFn: () => purchaseInvoiceService.getAll(),
  });

  return {
    // Data
    purchaseInvoices,
    isLoading,
    error,

    // Actions
    refetch,
  };
}
