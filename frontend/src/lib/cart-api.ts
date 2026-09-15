import { ApiError, apiRequest } from "./api";
import { asMenuItem, type BackendMenuItem } from "./menu-api";
import type { CartLine } from "./store";

interface CartResponse {
  items: { menuItem: BackendMenuItem; quantity: number; price: number; itemTotal: number }[];
}

export const cartApi = {
  async get(): Promise<CartLine[]> {
    try {
      const response = await apiRequest<CartResponse>("/api/cart/get-cart");
      return response.items.filter((line) => line.menuItem?._id).map((line) => ({
        item: { ...asMenuItem(line.menuItem), price: line.price }, qty: line.quantity,
      }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404 && error.message === "Cart not found") return [];
      throw error;
    }
  },
  add: (menuItemId: string, quantity: number) =>
    apiRequest<unknown>("/api/cart/add-to-cart", { method: "POST", body: { menuItemId, quantity } }),
  update: (menuItemId: string, quantity: number) =>
    apiRequest<unknown>(`/api/cart/update-cart/${encodeURIComponent(menuItemId)}`, { method: "PATCH", body: { quantity } }),
  remove: (menuItemId: string) =>
    apiRequest<unknown>(`/api/cart/remove-cart/${encodeURIComponent(menuItemId)}`, { method: "DELETE" }),
  clear: () => apiRequest<unknown>("/api/cart/clear", { method: "DELETE" }),
};
