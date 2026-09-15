import { apiRequest } from "./api";
import type { AuthUser } from "./auth-api";
import type { Review } from "./data";

interface BackendReview {
  _id: string;
  user: string | { _id: string; name: string };
  order: string;
  menuItem: string | { _id: string; name: string };
  rating: number;
  comment?: string;
  createdAt?: string;
}

export function asReview(review: BackendReview, user?: AuthUser): Review {
  const author = typeof review.user === "object" ? review.user.name : user?.name || "Customer";
  const ownerId = typeof review.user === "object" ? review.user._id : review.user;
  return {
    id: review._id,
    itemId: typeof review.menuItem === "object" ? review.menuItem._id : review.menuItem,
    author, rating: review.rating, comment: review.comment || "",
    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }) : "Just now",
    mine: ownerId === user?.id,
  };
}

export const reviewsApi = {
  get: (menuItemId: string, signal?: AbortSignal) =>
    apiRequest<{ reviews: BackendReview[] }>(`/api/reviews/${encodeURIComponent(menuItemId)}`, { signal }),
  average: (menuItemId: string, signal?: AbortSignal) =>
    apiRequest<{ averageRating: number; totalReviews: number }>(`/api/reviews/average/${encodeURIComponent(menuItemId)}`, { signal }),
  create: (body: { orderId: string; menuItemId: string; rating: number; comment?: string }) =>
    apiRequest<{ review: BackendReview }>("/api/reviews/", { method: "POST", body }),
  update: (reviewId: string, body: { rating?: number; comment?: string }) =>
    apiRequest<{ review: BackendReview }>(`/api/reviews/${encodeURIComponent(reviewId)}`, { method: "PUT", body }),
  remove: (reviewId: string) => apiRequest<{ message: string }>(`/api/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE" }),
};
