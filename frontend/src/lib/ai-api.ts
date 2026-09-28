import { apiRequest } from "./api";

export interface AiRecommendation {
  menuItemId: string;
  name: string;
  category: string;
  price: number;
  availability: boolean;
  reason: string;
}

export interface AiAssistantResponse {
  message: string;
  recommendations: AiRecommendation[];
}

export const aiApi = {
  ask: (message: string, signal?: AbortSignal) =>
    apiRequest<AiAssistantResponse>("/api/ai/food-assistant", {
      method: "POST",
      body: { message },
      signal,
    }),
};
