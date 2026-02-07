import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  salesService,
  saleReturnService,
  quotationService,
  type SaleRecordPayload,
  type QuotationRecordPayload,
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
    deleteSaleAsync: deleteMutation.mutateAsync,
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
    mutationFn: (saleReturn: Record<string, unknown>) => saleReturnService.create(saleReturn),
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
      data: Record<string, unknown>;
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

/**
 * Custom hook for quotations management
 */
export function useQuotations() {
  const queryClient = useQueryClient();

  // Fetch all quotations
  const {
    data: quotations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => quotationService.getAll(),
  });

  // Create quotation mutation
  const createMutation = useMutation({
    mutationFn: (quotation: QuotationRecordPayload) =>
      quotationService.create(quotation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  // Update quotation mutation
  const updateMutation = useMutation({
    mutationFn: ({
      quotationNumber,
      data,
    }: {
      quotationNumber: string;
      data: Partial<QuotationRecordPayload>;
    }) => quotationService.updateByQuotationNumber(quotationNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: (quotationNumber: string) =>
      quotationService.deleteByQuotationNumber(quotationNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  return {
    // Data
    quotations,
    isLoading,
    error,

    // Actions
    refetch,
    createQuotation: createMutation.mutate,
    createQuotationAsync: createMutation.mutateAsync,
    updateQuotation: updateMutation.mutate,
    updateQuotationAsync: updateMutation.mutateAsync,
    deleteQuotation: deleteMutation.mutate,
    deleteQuotationAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
