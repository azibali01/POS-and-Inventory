import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  purchaseInvoiceService,
  type ListQueryParams,
  type PurchaseInvoiceRecordPayload,
} from "../api";

type PurchaseInvoiceListParams = Required<
  Pick<ListQueryParams, "page" | "limit">
> &
  Pick<ListQueryParams, "search">;

/**
 * Custom hook for purchase invoice management
 * Provides read-only access to purchase invoices with React Query
 */
export function usePurchaseInvoice() {
  const queryClient = useQueryClient();

  // Fetch all purchase invoices
  const {
    data: purchaseInvoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["purchaseInvoices"],
    queryFn: () => purchaseInvoiceService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: PurchaseInvoiceRecordPayload) =>
      purchaseInvoiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<PurchaseInvoiceRecordPayload>;
    }) => purchaseInvoiceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => purchaseInvoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
    },
  });

  return {
    // Data
    purchaseInvoices,
    isLoading,
    error,

    // Actions (sync)
    refetch,
    createPurchaseInvoice: createMutation.mutate,
    updatePurchaseInvoice: updateMutation.mutate,
    deletePurchaseInvoice: deleteMutation.mutate,

    // Actions (async)
    createPurchaseInvoiceAsync: createMutation.mutateAsync,
    updatePurchaseInvoiceAsync: updateMutation.mutateAsync,
    deletePurchaseInvoiceAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePurchaseInvoiceList(params: PurchaseInvoiceListParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "purchaseInvoices",
      "list",
      params.page,
      params.limit,
      params.search ?? "",
    ],
    queryFn: () => purchaseInvoiceService.list(params),
  });

  return {
    purchaseInvoices: data?.data ?? [],
    pagination: {
      total: data?.total ?? 0,
      page: data?.page ?? params.page,
      lastPage: data?.lastPage ?? 1,
    },
    isLoading,
    error,
    refetch,
  };
}
