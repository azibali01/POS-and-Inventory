import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  salesService,
  saleReturnService,
  quotationService,
  type ListQueryParams,
  type SaleRecordPayload,
  type SaleReturnRecordPayload,
  type QuotationRecordPayload,
} from "../api";

type SalesListParams = Required<Pick<ListQueryParams, "page" | "limit">> &
  Pick<ListQueryParams, "search">;

function extractApiErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "Failed to record sale";
  }

  const response = (error as { response?: { data?: { message?: unknown } } })
    .response;
  const responseMessage = response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join("\n");
  }

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Failed to record sale";
}

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
      void queryClient.invalidateQueries({ queryKey: ["sales"] });
      notifications.show({
        title: "Sale Created",
        message: "Sale invoice created successfully",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error);
      notifications.show({
        title: "Sale Failed",
        message,
        color: "red",
      });
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
      void queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  // Delete sale mutation
  const deleteMutation = useMutation({
    mutationFn: (invoiceNumber: string) =>
      salesService.deleteByInvoiceNumber(invoiceNumber),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  // Get sale by invoice number
  const getSaleByInvoiceNumber: (
    invoiceNumber: string,
  ) => Promise<SaleRecordPayload | undefined> = (invoiceNumber) =>
    salesService.getByInvoiceNumber(invoiceNumber);

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

export function useSalesList(params: SalesListParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sales", "list", params.page, params.limit, params.search ?? ""],
    queryFn: () => salesService.list(params),
  });

  return {
    sales: data?.data ?? [],
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
  } = useQuery<SaleReturnRecordPayload[]>({
    queryKey: ["sale-returns"],
    queryFn: () => saleReturnService.getAll(),
  });

  // Create sale return mutation
  const createMutation = useMutation({
    mutationFn: (saleReturn: Record<string, unknown>) =>
      saleReturnService.create(saleReturn),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sale-returns"] });
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
      void queryClient.invalidateQueries({ queryKey: ["sale-returns"] });
    },
  });

  // Delete sale return mutation
  const deleteMutation = useMutation({
    mutationFn: (invoiceNumber: string) =>
      saleReturnService.deleteByInvoiceNumber(invoiceNumber),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sale-returns"] });
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
      void queryClient.invalidateQueries({ queryKey: ["quotations"] });
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
      void queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: (quotationId: string) =>
      quotationService.deleteById(quotationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["quotations"] });
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
