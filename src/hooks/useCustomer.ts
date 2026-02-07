import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService, type CustomerPayload } from "../api";

/**
 * Custom hook for customer management
 * Provides all customer-related operations with React Query
 */
export function useCustomer() {
  const queryClient = useQueryClient();

  // Fetch all customers
  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: (customer: CustomerPayload) => customerService.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<CustomerPayload>;
    }) => customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  // Search customers mutation (can also be a query)
  const searchMutation = useMutation({
    mutationFn: (query: string) => customerService.search(query),
  });

  return {
    // Data
    customers,
    isLoading,
    error,

    // Actions (sync - fire and forget)
    refetch,
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate,
    searchCustomers: searchMutation.mutate,

    // Actions (async - returns promise with result)
    createCustomerAsync: createMutation.mutateAsync,
    updateCustomerAsync: updateMutation.mutateAsync,
    deleteCustomerAsync: deleteMutation.mutateAsync,
    searchCustomersAsync: searchMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSearching: searchMutation.isPending,

    // Mutation results
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    searchResults: searchMutation.data,
  };
}
