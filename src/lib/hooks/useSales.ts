import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import * as api from "../api";
import type { SaleRecordPayload } from "../api";

export const SALES_QUERY_KEY = ["sales"];

export function useSales() {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: SALES_QUERY_KEY,
    queryFn: async () => {
      const data = await api.getSales();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createSaleMutation = useMutation({
    mutationFn: (payload: SaleRecordPayload) => api.createSale(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY });
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
