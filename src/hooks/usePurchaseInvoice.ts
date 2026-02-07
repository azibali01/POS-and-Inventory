import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseInvoiceService, type PurchaseInvoiceRecordPayload } from "../api";

/**
 * Custom hook for purchase invoice management
 * Provides read-only access to purchase invoices with React Query
 */
export function usePurchaseInvoice() {
  const queryClient = useQueryClient();

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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: PurchaseInvoiceRecordPayload) =>
      purchaseInvoiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<PurchaseInvoiceRecordPayload>;
    }) => purchaseInvoiceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => purchaseInvoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
    },
  });

  return {
    // Data
    purchaseInvoices,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createPurchaseInvoice: createMutation.mutate,
    updatePurchaseInvoice: updateMutation.mutate,
    deletePurchaseInvoice: deleteMutation.mutate,

    // Actions (async)
    createPurchaseInvoiceAsync: createMutation.mutateAsync,
    updatePurchaseInvoiceAsync: updateMutation.mutateAsync,
    deletePurchaseInvoiceAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
