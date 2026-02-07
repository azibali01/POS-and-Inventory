import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  purchaseReturnService,
  type PurchaseReturnRecordPayload,
} from "../api";

/**
 * Custom hook for purchase return management
 * Provides all purchase return-related operations with React Query
 */
export function usePurchaseReturn() {
  const queryClient = useQueryClient();

  // Fetch all purchase returns
  const {
    data: purchaseReturns = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["purchaseReturns"],
    queryFn: () => purchaseReturnService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: PurchaseReturnRecordPayload) =>
      purchaseReturnService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseReturns"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<PurchaseReturnRecordPayload>;
    }) => purchaseReturnService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseReturns"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => purchaseReturnService.delete(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseReturns"] });
    },
  });

  return {
    // Data
    purchaseReturns,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createPurchaseReturn: createMutation.mutate,
    updatePurchaseReturn: updateMutation.mutate,
    deletePurchaseReturn: deleteMutation.mutate,

    // Actions (async)
    createPurchaseReturnAsync: createMutation.mutateAsync,
    updatePurchaseReturnAsync: updateMutation.mutateAsync,
    deletePurchaseReturnAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
