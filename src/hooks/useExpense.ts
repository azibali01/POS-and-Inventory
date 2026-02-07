import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseService, type ExpensePayload } from "../api";

/**
 * Custom hook for expense management
 * Provides all expense-related operations with React Query
 */
export function useExpense() {
  const queryClient = useQueryClient();

  // Fetch all expenses
  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => expenseService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: ExpensePayload) => expenseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ExpensePayload>;
    }) => expenseService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  return {
    // Data
    expenses,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createExpense: createMutation.mutate,
    updateExpense: updateMutation.mutate,
    deleteExpense: deleteMutation.mutate,

    // Actions (async)
    createExpenseAsync: createMutation.mutateAsync,
    updateExpenseAsync: updateMutation.mutateAsync,
    deleteExpenseAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
