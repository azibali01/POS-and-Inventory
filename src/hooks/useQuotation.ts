import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotationService, type QuotationRecordPayload } from "../api";

/**
 * Custom hook for quotation management
 * Provides all quotation-related operations with React Query
 */
export function useQuotation() {
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

  // Get quotation by number
  const getQuotationByNumber = async (quotationNumber: string) => {
    return quotationService.getByQuotationNumber(quotationNumber);
  };

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
    getQuotationByNumber,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation results
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    createdQuotation: createMutation.data,
  };
}
