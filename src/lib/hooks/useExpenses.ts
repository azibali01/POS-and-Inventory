import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as api from "../api";

export const EXPENSES_QUERY_KEY = ["expenses"];

export function useExpenses() {
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: EXPENSES_QUERY_KEY,
    queryFn: api.getExpenses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createExpenseMutation = useMutation({
    mutationFn: (payload: api.ExpensePayload) => {
      return (api as any).createExpense(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Expense created successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create expense",
        color: "red",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => (api as any).deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Expense deleted successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete expense",
        color: "red",
      });
    },
  });

  // Check if updateExpense exists in api.ts, if so add mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<api.ExpensePayload>;
    }) => (api as any).updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Expense updated successfully",
        color: "blue",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update expense",
        color: "red",
      });
    },
  });

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    isError: expensesQuery.isError,
    error: expensesQuery.error,
    createExpense: createExpenseMutation.mutate,
    createExpenseAsync: createExpenseMutation.mutateAsync,
    isCreating: createExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutate,
    isDeleting: deleteExpenseMutation.isPending,
    updateExpense: updateExpenseMutation.mutate,
    isUpdating: updateExpenseMutation.isPending,
  };
}
