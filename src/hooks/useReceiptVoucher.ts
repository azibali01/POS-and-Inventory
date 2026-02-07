import { useQuery } from "@tanstack/react-query";
import { receiptVoucherService } from "../api";

/**
 * Custom hook for receipt voucher management
 * Provides read-only access to receipt vouchers with React Query
 */
export function useReceiptVoucher() {
  // Fetch all receipt vouchers
  const {
    data: receiptVouchers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["receiptVouchers"],
    queryFn: () => receiptVoucherService.getAll(),
  });

  return {
    // Data
    receiptVouchers,
    isLoading,
    error,

    // Actions
    refetch,
  };
}
