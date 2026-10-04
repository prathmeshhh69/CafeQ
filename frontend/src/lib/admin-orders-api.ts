import { apiRequest } from "./api";
import type { BackendOrder } from "./orders-api";
import type { OrderStatus, PickupStatus } from "./data";

export interface VerifiedPickup {
  _id: string;
  customerName?: string;
  customerCode?: string;
  items: { menuItem: string; name: string; price: number; quantity: number }[];
  totalAmount: number;
  orderStatus: OrderStatus;
  pickupStatus: PickupStatus;
  pickupCode: string;
}

export interface PickupReceipt {
  _id: string;
  pickupCode: string;
  customerName?: string;
  customerCode?: string;
  pickupStatus: PickupStatus;
  pickedUpAt: string | null;
}

export const adminOrdersApi = {
  verifyPickup: (pickupCode: string, signal?: AbortSignal) =>
    apiRequest<{ message: string; order: VerifiedPickup }>("/api/admin/orders/verify-pickup", {
      method: "POST", body: { pickupCode }, signal,
    }),
  markPickedUp: (pickupCode: string, signal?: AbortSignal) =>
    apiRequest<{ message: string; order: PickupReceipt }>("/api/admin/orders/mark-picked-up", {
      method: "POST", body: { pickupCode }, signal,
    }),
  list: () => apiRequest<{ orders: BackendOrder[] }>("/api/orders/admin/all"),
  get: (id: string) => apiRequest<{ order: BackendOrder }>(`/api/orders/admin/${encodeURIComponent(id)}`),
  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<{ order: BackendOrder }>(`/api/orders/admin/${encodeURIComponent(id)}/status`, {
      method: "PATCH", body: { status },
    }),
};
