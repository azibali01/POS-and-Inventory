import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { colorService, type ColorPayload } from "../api";

/**
 * Custom hook for color management
 * Provides all color-related operations with React Query
 */
export function useColor() {
  const queryClient = useQueryClient();

  // Fetch all colors
  const {
    data: colors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["colors"],
    queryFn: () => colorService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: ColorPayload) => colorService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ColorPayload>;
    }) => colorService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => colorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
    },
  });

  return {
    // Data
    colors,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createColor: createMutation.mutate,
    updateColor: updateMutation.mutate,
    deleteColor: deleteMutation.mutate,

    // Actions (async)
    createColorAsync: createMutation.mutateAsync,
    updateColorAsync: updateMutation.mutateAsync,
    deleteColorAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
