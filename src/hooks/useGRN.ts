import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { grnService, type GRNRecordPayload } from "../api";

/**
 * Custom hook for GRN (Goods Receipt Note) management
 * Provides all GRN-related operations with React Query
 */
export function useGRN() {
  const queryClient = useQueryClient();

  // Fetch all GRNs
  const {
    data: grns = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["grns"],
    queryFn: () => grnService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: GRNRecordPayload) => grnService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
    },
  });

  return {
    // Data
    grns,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createGRN: createMutation.mutate,

    // Actions (async)
    createGRNAsync: createMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
  };
}
