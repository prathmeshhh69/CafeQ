import { apiRequest } from "./api";
import type { OrderStatus } from "./data";

export interface DashboardData {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    paidOrders: number;
    totalRevenue: number;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  topMenuItems: { name: string; quantity: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  revenueByDate: { date: string; totalRevenue: number }[];
}

export const adminAnalyticsApi = {
  dashboard: (query: { from?: string; to?: string }, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    const suffix = params.size ? `?${params}` : "";
    return apiRequest<DashboardData>(`/api/admin/dashboard${suffix}`, { signal });
  },
};
