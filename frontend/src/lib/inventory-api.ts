import { apiRequest } from "./api";
import { asMenuItem, type BackendMenuItem } from "./menu-api";
import type { MenuItem } from "./data";

interface BackendInventory {
  _id: string;
  menuItem: BackendMenuItem | null;
  quantity: number;
  minimumStock: number;
}

export interface InventoryRow extends MenuItem {
  inventoryId: string;
  stock: number;
  minStock: number;
}

function asInventory(inventory: BackendInventory): InventoryRow | null {
  if (!inventory.menuItem?._id) return null;
  return {
    ...asMenuItem(inventory.menuItem), inventoryId: inventory._id,
    stock: inventory.quantity, minStock: inventory.minimumStock,
  };
}

async function list(path: string): Promise<InventoryRow[]> {
  const response = await apiRequest<{ inventories: BackendInventory[] }>(path);
  return response.inventories.map(asInventory).filter((row): row is InventoryRow => row !== null);
}

export const inventoryApi = {
  get: () => list("/api/inventory/"),
  all: () => list("/api/inventory/all"),
  lowStock: () => list("/api/inventory/low-stock"),
  create: (body: { menuItem: string; quantity?: number; minimumStock?: number }) =>
    apiRequest<{ inventory: BackendInventory }>("/api/inventory/", { method: "POST", body }),
  patch: (id: string, body: { quantity?: number; minimumStock?: number }) =>
    apiRequest<{ inventory: BackendInventory }>(`/api/inventory/${encodeURIComponent(id)}`, { method: "PATCH", body }),
  addStock: (menuItem: string, quantity: number) =>
    apiRequest<{ inventory: BackendInventory }>("/api/inventory/add-stock", {
      method: "POST", body: { menuItem, quantity },
    }),
  setStock: (menuItem: string, quantity: number) =>
    apiRequest<{ inventory: BackendInventory }>("/api/inventory/update-stock", {
      method: "PUT", body: { menuItem, quantity },
    }),
};
