import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  shiftService,
  type CloseShiftPayload,
  type OpenShiftPayload,
} from "../api";

export const SHIFT_QUERY_KEY = ["shift", "active"];

export function useShift() {
  const queryClient = useQueryClient();

  const activeShiftQuery = useQuery({
    queryKey: SHIFT_QUERY_KEY,
    queryFn: () => shiftService.getActive(),
  });

  const invalidateShift = async () => {
    await queryClient.invalidateQueries({ queryKey: SHIFT_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  };

  const openShiftMutation = useMutation({
    mutationFn: (payload: OpenShiftPayload) => shiftService.open(payload),
    onSuccess: invalidateShift,
  });

  const closeShiftMutation = useMutation({
    mutationFn: (payload: CloseShiftPayload) => shiftService.close(payload),
    onSuccess: invalidateShift,
  });

  return {
    activeSession: activeShiftQuery.data?.session ?? null,
    currentSalesTotal: activeShiftQuery.data?.currentSalesTotal ?? 0,
    hasActiveSession: Boolean(activeShiftQuery.data?.session),
    isLoading: activeShiftQuery.isLoading,
    error: activeShiftQuery.error,
    refetch: activeShiftQuery.refetch,
    openShift: openShiftMutation.mutate,
    openShiftAsync: openShiftMutation.mutateAsync,
    closeShift: closeShiftMutation.mutate,
    closeShiftAsync: closeShiftMutation.mutateAsync,
    isOpening: openShiftMutation.isPending,
    isClosing: closeShiftMutation.isPending,
  };
}
