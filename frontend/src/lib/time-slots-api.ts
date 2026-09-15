import { apiRequest } from "./api";
import type { TimeSlot } from "./data";

interface BackendTimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  availableOrders: number;
  isActive: boolean;
}

export const displayTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
};

export const apiTime = (value: string) => {
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return value;
  const match = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(value.trim());
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) throw new Error("Enter a time such as 3:00 PM.");
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

export function asTimeSlot(slot: BackendTimeSlot): TimeSlot {
  return {
    id: slot._id, date: slot.date.slice(0, 10), start: displayTime(slot.startTime), end: displayTime(slot.endTime),
    current: slot.currentOrders, max: slot.maxOrders, active: slot.isActive,
  };
}

export const timeSlotsApi = {
  async forDate(date: string, signal?: AbortSignal): Promise<TimeSlot[]> {
    const response = await apiRequest<{ timeSlots: BackendTimeSlot[] }>(
      `/api/time-slots/?date=${encodeURIComponent(date)}`, { signal });
    return response.timeSlots.map(asTimeSlot);
  },
  create: (body: { date: string; start: string; end: string; maxOrders: number }) =>
    apiRequest<{ timeSlot: BackendTimeSlot }>("/api/time-slots/timeslot", {
      method: "POST", body: { date: body.date, startTime: apiTime(body.start), endTime: apiTime(body.end), maxOrders: body.maxOrders },
    }),
  update: (id: string, body: { maxOrders?: number; isActive?: boolean }) =>
    apiRequest<{ timeSlot: BackendTimeSlot }>(`/api/time-slots/${encodeURIComponent(id)}`, { method: "PATCH", body }),
  deactivate: (id: string) =>
    apiRequest<{ timeSlot: BackendTimeSlot }>(`/api/time-slots/${encodeURIComponent(id)}/deactivate`, { method: "PATCH" }),
};
