import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseService, type PurchaseRecordPayload } from "../api";

/**
 * Custom hook for purchase order management
 * Provides all purchase-related operations with React Query
 */
export function usePurchase() {
  const queryClient = useQueryClient();

  // Fetch all purchase orders
  const {
    data: purchases = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => purchaseService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: PurchaseRecordPayload) =>
      purchaseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<PurchaseRecordPayload>;
    }) => purchaseService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => purchaseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  return {
    // Data
    purchases,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createPurchase: createMutation.mutate,
    updatePurchase: updateMutation.mutate,
    deletePurchase: deleteMutation.mutate,

    // Actions (async)
    createPurchaseAsync: createMutation.mutateAsync,
    updatePurchaseAsync: updateMutation.mutateAsync,
    deletePurchaseAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
