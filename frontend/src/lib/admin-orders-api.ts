import { apiRequest } from "./api";
import type { BackendOrder } from "./orders-api";
import type { OrderStatus } from "./data";

export const adminOrdersApi = {
  list: () => apiRequest<{ orders: BackendOrder[] }>("/api/orders/admin/all"),
  get: (id: string) => apiRequest<{ order: BackendOrder }>(`/api/orders/admin/${encodeURIComponent(id)}`),
  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<{ order: BackendOrder }>(`/api/orders/admin/${encodeURIComponent(id)}/status`, {
      method: "PATCH", body: { status },
    }),
};
