import { apiRequest } from "./api";
import type { BackendMenuItem } from "./menu-api";

export interface MenuMutationBody {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
}

export const adminMenuApi = {
  create: (body: MenuMutationBody) => apiRequest<{ menuItem: BackendMenuItem }>("/api/menu/menu", {
    method: "POST", body,
  }),
  update: (id: string, body: Partial<MenuMutationBody>) =>
    apiRequest<{ menuItem: BackendMenuItem | null }>(`/api/menu/menu/${encodeURIComponent(id)}`, {
      method: "PUT", body,
    }),
  remove: (id: string) => apiRequest<{ message: string }>(`/api/menu/menu/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
