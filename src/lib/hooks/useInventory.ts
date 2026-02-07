import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as api from "../api";
import { ensureArray } from "../api-response-utils";
import type { InventoryItemPayload, CategoryPayload, ColorPayload } from "../api";

export const INVENTORY_QUERY_KEY = ["inventory"];
export const CATEGORIES_QUERY_KEY = ["categories"];
export const COLORS_QUERY_KEY = ["colors"];

export function useInventory() {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: async () => {
      const data = await api.getInventory();
      // Use existing utility to ensure array
      return ensureArray<InventoryItemPayload>(data, "inventory");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create Inventory Mutation
  const createInventoryMutation = useMutation({
    mutationFn: (payload: InventoryItemPayload) => api.createInventory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Product created successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create product",
        color: "red",
      });
    },
  });

  // Update Inventory Mutation
  const updateInventoryMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<InventoryItemPayload>;
    }) => api.updateInventory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Product updated successfully",
        color: "blue",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update product",
        color: "red",
      });
    },
  });

  // Example mutation: Delete Item
  const deleteInventoryMutation = useMutation({
    mutationFn: (id: string) => api.deleteInventory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Item deleted successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete item",
        color: "red",
      });
    },
  });

  return {
    inventory: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    error: inventoryQuery.error,
    refetch: inventoryQuery.refetch,
    deleteInventory: deleteInventoryMutation.mutate,
    deleteInventoryAsync: deleteInventoryMutation.mutateAsync,
    createInventory: createInventoryMutation.mutate,
    createInventoryAsync: createInventoryMutation.mutateAsync,
    updateInventory: updateInventoryMutation.mutate,
    updateInventoryAsync: updateInventoryMutation.mutateAsync,
    isCreating: createInventoryMutation.isPending,
    isUpdating: updateInventoryMutation.isPending,
    isDeleting: deleteInventoryMutation.isPending,
  };
}

export function useCategories() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const data = await api.getCategories();
      return ensureArray<CategoryPayload>(data, "categories");
    },
    staleTime: 1000 * 60 * 60, // 1 hour (categories change rarely)
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.createCategory({ name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Category created successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create category",
        color: "red",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.updateCategory(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Category updated successfully",
        color: "blue",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update category",
        color: "red",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    // api.deleteCategory takes an ID (string)
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Category deleted successfully",
        color: "orange",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete category",
        color: "red",
      });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    updateCategory: updateCategoryMutation.mutate,
    isUpdating: updateCategoryMutation.isPending,
    deleteCategory: deleteCategoryMutation.mutate,
    isDeleting: deleteCategoryMutation.isPending,
  };
}

// Additional hook for colors if needed
export function useColors() {
  const colorsQuery = useQuery({
    queryKey: COLORS_QUERY_KEY,
    queryFn: async () => {
      const data = await api.getColors();
      return ensureArray<ColorPayload>(data, "colors");
    },
    staleTime: 1000 * 60 * 60,
  });

  return {
    colors: colorsQuery.data || [],
    isLoading: colorsQuery.isLoading,
    isError: colorsQuery.isError,
    error: colorsQuery.error,
    refetch: colorsQuery.refetch,
  };
}
