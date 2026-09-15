import { apiRequest } from "./api";
import type { AuthUser } from "./auth-api";
import type { Order, OrderStatus, PaymentStatus, TimeSlot } from "./data";

export interface BackendOrder {
  _id: string;
  user: string | { _id: string; name: string; email: string; phone?: string };
  items: { menuItem: string | { _id: string; image?: string }; name: string; price: number; quantity: number }[];
  timeSlot: string | { _id: string; date: string; startTime: string; endTime: string };
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
}

export function rememberPickupSlot(orderId: string, slot: TimeSlot) {
  try { sessionStorage.setItem(`cafeq-slot-${orderId}`, JSON.stringify(slot)); } catch { /* Storage may be unavailable. */ }
}

function rememberedPickupSlot(orderId: string): TimeSlot | null {
  try {
    const stored = sessionStorage.getItem(`cafeq-slot-${orderId}`);
    return stored ? JSON.parse(stored) as TimeSlot : null;
  } catch { return null; }
}

export function asOrder(order: BackendOrder, user: AuthUser, selectedSlot?: TimeSlot): Order {
  const customer = typeof order.user === "object" ? {
    name: order.user.name, email: order.user.email, phone: order.user.phone || "",
  } : { name: user.name, email: user.email, phone: user.phone };
  const slot = selectedSlot || rememberedPickupSlot(order._id) || (typeof order.timeSlot === "object" ? {
    date: order.timeSlot.date.slice(0, 10), start: order.timeSlot.startTime, end: order.timeSlot.endTime,
  } : null);
  return {
    id: order._id, customer,
    lines: order.items.map((line) => ({
      itemId: typeof line.menuItem === "object" ? line.menuItem._id : line.menuItem,
      name: line.name, price: line.price, qty: line.quantity,
      image: typeof line.menuItem === "object" ? line.menuItem.image || "" : "",
    })),
    total: order.totalAmount, status: order.orderStatus, payment: order.paymentStatus,
    pickupDate: slot?.date || "", pickupSlot: slot ? `${slot.start} – ${slot.end}` : "Pickup slot details unavailable",
    placedAt: order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    }) : "Just now",
  };
}

export const ordersApi = {
  create: (timeSlotId: string) =>
    apiRequest<{ order: BackendOrder }>("/api/orders/", { method: "POST", body: { timeSlotId } }),
  list: () => apiRequest<{ orders: BackendOrder[] }>("/api/orders/"),
  get: (id: string) => apiRequest<{ order: BackendOrder }>(`/api/orders/${encodeURIComponent(id)}`),
  cancel: (id: string) => apiRequest<{ order: BackendOrder }>(`/api/orders/${encodeURIComponent(id)}/cancel`, { method: "PATCH" }),
};
