import { useQuery } from "@tanstack/react-query";
import { paymentVoucherService } from "../api";

/**
 * Custom hook for payment voucher management
 * Provides read-only access to payment vouchers with React Query
 */
export function usePaymentVoucher() {
  // Fetch all payment vouchers
  const {
    data: paymentVouchers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["paymentVouchers"],
    queryFn: () => paymentVoucherService.getAll(),
  });

  return {
    // Data
    paymentVouchers,
    isLoading,
    error,

    // Actions
    refetch,
  };
}
