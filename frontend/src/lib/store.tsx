import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type MenuItem, type Order, type OrderStatus,
} from "./data";
import { ApiError, onUnauthorized } from "./api";
import { authApi, type AuthUser } from "./auth-api";
import { cartApi } from "./cart-api";
import { asOrder, ordersApi } from "./orders-api";

export interface CartLine { item: MenuItem; qty: number; }
export interface Toast { id: number; kind: "success" | "error" | "info"; msg: string; }

interface Store {
  // auth
  user: AuthUser | null;
  authLoading: boolean;
  login: (credentials: { email?: string; phone?: string; password: string }) => Promise<AuthUser>;
  register: (details: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  verifyOtp: (details: { email: string; otp: string }) => Promise<AuthUser>;
  resendOtp: (details: { email: string }) => Promise<void>;
  logout: () => Promise<void>;
  // cart
  cart: CartLine[];
  cartLoading: boolean;
  cartBusy: boolean;
  cartError: string | null;
  reloadCart: () => Promise<void>;
  add: (item: MenuItem, quantity?: number) => Promise<boolean>;
  setQty: (id: string, qty: number) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
  qtyOf: (id: string) => number;
  subtotal: number;
  cartCount: number;
  // orders
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  reloadOrders: () => Promise<void>;
  loadOrder: (id: string) => Promise<Order>;
  cancelOrder: (id: string) => Promise<boolean>;
  addOrder: (o: Order) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  // toasts
  toasts: Toast[];
  toast: (msg: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Store["user"]>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartBusy, setCartBusy] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const cartBusyRef = useRef(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  useEffect(() => {
    onUnauthorized(() => {
      setUser(null);
      setCart([]);
      setOrders([]);
    });
    authApi.me().then(({ user }) => setUser(user)).catch((error: unknown) => {
      if (!(error instanceof ApiError && error.status === 401)) {
        toast(error instanceof Error ? error.message : "Could not restore your session.", "error");
      }
    }).finally(() => setAuthLoading(false));
    return () => onUnauthorized(null);
  }, [toast]);

  const login = useCallback(async (credentials: { email?: string; phone?: string; password: string }) => {
    const { user } = await authApi.login(credentials);
    setUser(user);
    return user;
  }, []);
  const register = useCallback(async (details: { name: string; email: string; phone: string; password: string }) => {
    await authApi.register(details);
  }, []);
  const verifyOtp = useCallback(async (details: { email: string; otp: string }) => {
    const { user } = await authApi.verifyOtp(details);
    setUser(user);
    return user;
  }, []);
  const resendOtp = useCallback(async (details: { email: string }) => {
    await authApi.resendOtp(details);
  }, []);
  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setCart([]);
    setOrders([]);
  }, []);

  const reloadCart = useCallback(async () => {
    setCartError(null);
    try { setCart(await cartApi.get()); }
    catch (error) {
      const message = error instanceof Error ? error.message : "Could not load your cart.";
      setCartError(message);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setCartLoading(true);
    cartApi.get().then((lines) => { if (active) { setCart(lines); setCartError(null); } })
      .catch((error: unknown) => { if (active) setCartError(error instanceof Error ? error.message : "Could not load your cart."); })
      .finally(() => { if (active) setCartLoading(false); });
    return () => { active = false; };
  }, [user?.id]);

  const mutateCart = useCallback(async (request: () => Promise<unknown>, successMessage?: string) => {
    if (cartBusyRef.current) return false;
    cartBusyRef.current = true;
    setCartBusy(true);
    try {
      await request();
      await reloadCart();
      if (successMessage) toast(successMessage);
      return true;
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update your cart.", "error");
      return false;
    } finally {
      cartBusyRef.current = false;
      setCartBusy(false);
    }
  }, [reloadCart, toast]);

  const add = useCallback((item: MenuItem, quantity = 1) =>
    mutateCart(() => cartApi.add(item.id, quantity), "Added to your cart!"), [mutateCart]);
  const setQty = useCallback((id: string, qty: number) =>
    mutateCart(() => qty <= 0 ? cartApi.remove(id) : cartApi.update(id, qty)), [mutateCart]);
  const remove = useCallback((id: string) => mutateCart(() => cartApi.remove(id)), [mutateCart]);
  const clear = useCallback(() => mutateCart(() => cartApi.clear()), [mutateCart]);
  const qtyOf = useCallback((id: string) => cart.find((l) => l.item.id === id)?.qty ?? 0, [cart]);

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.item.price * l.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);

  const reloadOrders = useCallback(async () => {
    if (!user) return;
    setOrdersError(null);
    try {
      const response = await ordersApi.list();
      setOrders(response.orders.map((order) => asOrder(order, user)));
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Could not load your orders.");
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") return;
    setOrdersLoading(true);
    reloadOrders().catch(() => {}).finally(() => setOrdersLoading(false));
  }, [user?.id, reloadOrders]);

  const loadOrder = useCallback(async (id: string) => {
    if (!user) throw new Error("Please log in to view this order.");
    const { order } = await ordersApi.get(id);
    const mapped = asOrder(order, user);
    setOrders((prev) => [mapped, ...prev.filter((entry) => entry.id !== id)]);
    return mapped;
  }, [user]);

  const cancelOrder = useCallback(async (id: string) => {
    if (!user) return false;
    try {
      const { order } = await ordersApi.cancel(id);
      setOrders((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: order.orderStatus } : entry));
      toast("Order cancelled.", "info");
      return true;
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not cancel the order.", "error");
      return false;
    }
  }, [user, toast]);

  const addOrder = useCallback((o: Order) => setOrders((prev) => [o, ...prev]), []);
  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  }, []);

  const value: Store = {
    user, authLoading, login, register, verifyOtp, resendOtp, logout,
    cart, cartLoading, cartBusy, cartError, reloadCart, add, setQty, remove, clear, qtyOf, subtotal, cartCount,
    orders, ordersLoading, ordersError, reloadOrders, loadOrder, cancelOrder, addOrder, setOrderStatus,
    toasts, toast, dismissToast,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
