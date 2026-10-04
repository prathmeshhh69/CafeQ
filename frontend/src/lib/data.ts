export type Category = string;

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  image: string;
  available: boolean;
  popular?: boolean;
  stock?: number;
  minStock?: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type PickupStatus = "NOT_PICKED_UP" | "PICKED_UP";

export interface OrderLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  customer: { name: string; email: string; phone: string };
  lines: OrderLine[];
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  pickupDate: string;
  pickupSlot: string;
  placedAt: string;
  pickupCode?: string;
  pickupStatus?: PickupStatus;
  pickedUpAt?: string | null;
  reviewed?: boolean;
}

export function isOrderActive(order: Pick<Order, "status" | "pickupStatus">): boolean {
  return order.pickupStatus !== "PICKED_UP"
    && ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(order.status);
}

export function formatPickupTime(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export interface Review {
  id: string;
  itemId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  mine?: boolean;
}

export interface TimeSlot {
  id: string;
  date: string;
  start: string;
  end: string;
  current: number;
  max: number;
  active: boolean;
}

export const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export function upcomingDates(count = 6): { iso: string; label: string; day: string; num: string }[] {
  const dates = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() + offset);
    dates.push({
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      num: String(date.getDate()),
    });
  }
  return dates;
}
