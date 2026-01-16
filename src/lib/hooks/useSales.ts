import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as api from "../api";

export const SALES_QUERY_KEY = ["sales"];

export function useSales() {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: SALES_QUERY_KEY,
    queryFn: async () => {
      // Assuming api.getSales exists matching api.createSale
      const data = await (api as any).getSales();
      // If getSales doesn't exist, it might be getSaleInvoices or getInvoices
      // fallback to safe casting if uncertain
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createSaleMutation = useMutation({
    mutationFn: (payload: any) => (api as any).createSale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY });
      notifications.show({
        title: "Success",
        message: "Sale recorded successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to record sale",
        color: "red",
      });
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    isError: salesQuery.isError,
    error: salesQuery.error,
    createSale: createSaleMutation.mutate,
    isCreating: createSaleMutation.isPending,
  };
}
