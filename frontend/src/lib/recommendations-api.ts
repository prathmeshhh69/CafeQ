import { apiRequest } from "./api";
import { asMenuItem, type BackendMenuItem } from "./menu-api";

interface RecommendationsResponse {
  recommendations: { menuItem: BackendMenuItem; score: number }[];
}

export const recommendationsApi = {
  get: async (menuItems: string[], signal?: AbortSignal) => {
    const response = await apiRequest<RecommendationsResponse>("/api/recommendations/", {
      method: "POST", body: { menuItems }, signal,
    });
    return response.recommendations
      .filter((entry) => entry.menuItem?._id)
      .map((entry) => asMenuItem(entry.menuItem));
  },
};
