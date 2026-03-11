import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

export interface ShiftSession {
  _id?: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  status: "OPEN" | "CLOSED";
}

export interface ActiveShiftResponse {
  session: ShiftSession | null;
  currentSalesTotal: number;
}

export interface OpenShiftPayload {
  openingBalance: number;
}

export interface CloseShiftPayload {
  closingBalance: number;
}

export const shiftService = {
  async getActive(): Promise<ActiveShiftResponse> {
    const { data } = await axiosClient.get<ActiveShiftResponse>(
      `${ENDPOINTS.SESSION}/active`,
    );
    return data;
  },

  async open(payload: OpenShiftPayload): Promise<ShiftSession> {
    const { data } = await axiosClient.post<ShiftSession>(
      `${ENDPOINTS.SESSION}/open`,
      payload,
    );
    return data;
  },

  async close(payload: CloseShiftPayload): Promise<ShiftSession> {
    const { data } = await axiosClient.post<ShiftSession>(
      `${ENDPOINTS.SESSION}/close`,
      payload,
    );
    return data;
  },
};
