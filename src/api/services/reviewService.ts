import { apiClient } from '@/lib/apiClient';

export type ReviewTargetType = 'supplier';

export interface ReviewReviewer {
  id: string;
  name: string;
  avatar?: string;
}

export interface Review {
  id: string;
  reviewerAccountId: ReviewReviewer | string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  body?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  average: number;
  count: number;
  breakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface ReviewListResponse {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const reviewService = {
  async create(input: { targetType: ReviewTargetType; targetId: string; rating: number; body?: string }) {
    return apiClient.post<Review>('/reviews', input);
  },
  async update(id: string, body: { rating?: number; body?: string }) {
    return apiClient.patch<Review>(`/reviews/${id}`, body);
  },
  async delete(id: string) {
    return apiClient.delete<{ deleted: boolean }>(`/reviews/${id}`);
  },
  async list(params: { targetType: ReviewTargetType; targetId: string; page?: number; pageSize?: number }) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, String(v));
    });
    return apiClient.get<ReviewListResponse>(`/reviews?${q.toString()}`);
  },
  async stats(targetType: ReviewTargetType, targetId: string) {
    return apiClient.get<ReviewStats>(`/reviews/stats?targetType=${targetType}&targetId=${targetId}`);
  },
};
