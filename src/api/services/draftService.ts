import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

export interface DraftData {
  docNo?: string;
  docDate?: string;
  customerId?: string;
  items?: unknown[];
  remarks?: string;
  terms?: string;
  savedAt?: number;
  [key: string]: unknown;
}

export interface DraftRecord {
  _id?: string;
  id?: string;
  key: string;
  data?: DraftData;
  createdAt?: string;
  updatedAt?: string;
}

export const draftService = {
  async getAll(): Promise<DraftRecord[]> {
    const { data } = await axiosClient.get<DraftRecord[]>(ENDPOINTS.DRAFTS);
    return Array.isArray(data) ? data : [];
  },

  async getByKey(key: string): Promise<DraftRecord | null> {
    const drafts = await draftService.getAll();
    return drafts.find((draft) => draft.key === key) ?? null;
  },

  async create(payload: {
    key: string;
    data: DraftData;
  }): Promise<DraftRecord> {
    const { data } = await axiosClient.post<DraftRecord>(
      ENDPOINTS.DRAFTS,
      payload,
    );
    return data;
  },

  async update(
    id: string,
    payload: Partial<Pick<DraftRecord, "data">>,
  ): Promise<DraftRecord> {
    const { data } = await axiosClient.put<DraftRecord>(
      `${ENDPOINTS.DRAFTS}/${id}`,
      payload,
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.DRAFTS}/${id}`);
  },
};
