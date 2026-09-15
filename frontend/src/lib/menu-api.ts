import { apiRequest } from "./api";
import type { MenuItem } from "./data";

export interface BackendMenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
}

interface MenuResponse {
  menuItems: BackendMenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function asMenuItem(item: BackendMenuItem): MenuItem {
  return {
    id: item._id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    category: item.category,
    image: item.image || "",
    available: item.isAvailable,
  };
}

export const menuApi = {
  list: (query: { category?: string; search?: string; available?: boolean; page: number; limit: number }, signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
    if (query.category) params.set("category", query.category);
    if (query.search) params.set("search", query.search);
    if (query.available !== undefined) params.set("available", String(query.available));
    return apiRequest<MenuResponse>(`/api/menu/menu?${params}`, { signal });
  },
  async all(signal?: AbortSignal): Promise<MenuItem[]> {
    const items: MenuItem[] = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const response = await menuApi.list({ page, limit: 100 }, signal);
      items.push(...response.menuItems.map(asMenuItem));
      totalPages = response.totalPages;
      page += 1;
    }
    return items;
  },
};
