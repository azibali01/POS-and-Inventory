import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierService, type SupplierPayload } from "../api";

/**
 * Custom hook for supplier management
 * Provides all supplier-related operations with React Query
 */
export function useSupplier() {
  const queryClient = useQueryClient();

  // Fetch all suppliers
  const {
    data: suppliers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: SupplierPayload) => supplierService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<SupplierPayload>;
    }) => supplierService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => supplierService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    // Data
    suppliers,
    isLoading,
    error,

    // Actions (sync - fire and forget)
    refetch,
    createSupplier: createMutation.mutate,
    updateSupplier: updateMutation.mutate,
    deleteSupplier: deleteMutation.mutate,

    // Actions (async - returns promise with result)
    createSupplierAsync: createMutation.mutateAsync,
    updateSupplierAsync: updateMutation.mutateAsync,
    deleteSupplierAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
