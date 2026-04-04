import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

export interface CategoryPayload {
  _id?: string | number;
  id?: string | number;
  name: string;
  metadata?: Record<string, unknown>;
}

export const categoryService = {
  async getAll(): Promise<CategoryPayload[]> {
    const { data } = await axiosClient.get<CategoryPayload[]>(
      ENDPOINTS.CATEGORIES,
    );
    return data;
  },

  async create(payload: CategoryPayload): Promise<CategoryPayload> {
    const { data } = await axiosClient.post<CategoryPayload>(
      ENDPOINTS.CATEGORIES,
      payload,
    );
    return data;
  },

  async update(
    id: string | number,
    payload: Partial<CategoryPayload>,
  ): Promise<CategoryPayload> {
    const { data } = await axiosClient.put<CategoryPayload>(
      `${ENDPOINTS.CATEGORIES}/${String(id)}`,
      payload,
    );
    return data;
  },

  async delete(id: string | number): Promise<CategoryPayload> {
    const { data } = await axiosClient.delete<CategoryPayload>(
      `${ENDPOINTS.CATEGORIES}/${String(id)}`,
    );
    return data;
  },
};
