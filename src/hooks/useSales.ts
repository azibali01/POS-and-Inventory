import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  salesService,
  saleReturnService,
  type SaleRecordPayload,
} from "../api";

/**
 * Custom hook for sales management
 * Provides all sales-related operations with React Query
 */
export function useSales() {
  const queryClient = useQueryClient();

  // Fetch all sales
  const {
    data: sales = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sales"],
    queryFn: () => salesService.getAll(),
  });

  // Create sale mutation
  const createMutation = useMutation({
    mutationFn: (sale: SaleRecordPayload) => salesService.create(sale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  // Update sale mutation
  const updateMutation = useMutation({
    mutationFn: ({
      invoiceNumber,
      data,
    }: {
      invoiceNumber: string;
      data: Partial<SaleRecordPayload>;
    }) => salesService.updateByInvoiceNumber(invoiceNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  // Delete sale mutation
  const deleteMutation = useMutation({
    mutationFn: (invoiceNumber: string) =>
      salesService.deleteByInvoiceNumber(invoiceNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  // Get sale by invoice number
  const getSaleByInvoiceNumber = async (invoiceNumber: string) => {
    return salesService.getByInvoiceNumber(invoiceNumber);
  };

  return {
    // Data
    sales,
    isLoading,
    error,

    // Actions
    refetch,
    createSale: createMutation.mutate,
    createSaleAsync: createMutation.mutateAsync,
    updateSale: updateMutation.mutate,
    updateSaleAsync: updateMutation.mutateAsync,
    deleteSale: deleteMutation.mutate,
    getSaleByInvoiceNumber,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation results
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    createdSale: createMutation.data,
  };
}

/**
 * Custom hook for sale returns management
 */
export function useSaleReturns() {
  const queryClient = useQueryClient();

  // Fetch all sale returns
  const {
    data: saleReturns = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sale-returns"],
    queryFn: () => saleReturnService.getAll(),
  });

  // Create sale return mutation
  const createMutation = useMutation({
    mutationFn: (saleReturn: unknown) => saleReturnService.create(saleReturn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-returns"] });
    },
  });

  // Update sale return mutation
  const updateMutation = useMutation({
    mutationFn: ({
      invoiceNumber,
      data,
    }: {
      invoiceNumber: string;
      data: unknown;
    }) => saleReturnService.updateByInvoiceNumber(invoiceNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-returns"] });
    },
  });

  // Delete sale return mutation
  const deleteMutation = useMutation({
    mutationFn: (invoiceNumber: string) =>
      saleReturnService.deleteByInvoiceNumber(invoiceNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-returns"] });
    },
  });

  return {
    // Data
    saleReturns,
    isLoading,
    error,

    // Actions
    refetch,
    createSaleReturn: createMutation.mutate,
    updateSaleReturn: updateMutation.mutate,
    deleteSaleReturn: deleteMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation results
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
