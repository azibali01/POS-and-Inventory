import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../api";

/**
 * Custom hook for category management
 * Provides all category-related operations with React Query
 * Note: Categories are string-based entities
 */
export function useCategory() {
  const queryClient = useQueryClient();

  // Fetch all categories
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => categoryService.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Update/rename mutation
  const updateMutation = useMutation({
    mutationFn: ({
      oldName,
      newName,
    }: {
      oldName: string;
      newName: string;
    }) => categoryService.update(oldName, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (name: string) => categoryService.delete(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    // Data
    categories,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    renameCategory: updateMutation.mutate, // Alias for updateCategory
    deleteCategory: deleteMutation.mutate,

    // Actions (async)
    createCategoryAsync: createMutation.mutateAsync,
    updateCategoryAsync: updateMutation.mutateAsync,
    renameCategoryAsync: updateMutation.mutateAsync, // Alias for updateCategoryAsync
    deleteCategoryAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
