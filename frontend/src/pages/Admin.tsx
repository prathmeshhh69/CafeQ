import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Boxes, CalendarClock,
  LogOut, Menu as MenuIcon, X, TrendingUp, IndianRupee, Package, AlertTriangle,
  Plus, Pencil, Trash2, Search, ArrowUpCircle, Replace, ChevronRight, PackageX,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Button, Card, Input, StatusBadge, PaymentBadge, ConfirmationModal, Modal, EmptyState } from "../components/ui";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { PlateDoodle } from "../components/Doodles";
import {
  upcomingDates, money,
  type Order, type OrderStatus, type MenuItem, type TimeSlot,
} from "../lib/data";
import { useStore } from "../lib/store";
import { Logo } from "../components/nav";
import { adminOrdersApi } from "../lib/admin-orders-api";
import { asOrder } from "../lib/orders-api";
import { menuApi, asMenuItem } from "../lib/menu-api";
import { adminMenuApi } from "../lib/admin-menu-api";
import { inventoryApi, type InventoryRow } from "../lib/inventory-api";
import { asTimeSlot, timeSlotsApi } from "../lib/time-slots-api";
import { adminAnalyticsApi, type DashboardData } from "../lib/admin-analytics-api";

type AdminView = "dashboard" | "orders" | "menu" | "inventory" | "slots";

const NAV: { key: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "menu", label: "Menu", icon: UtensilsCrossed },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "slots", label: "Pickup Slots", icon: CalendarClock },
];

export function AdminApp({ exit }: { exit: () => void }) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [open, setOpen] = useState(false);
  const { logout, toast, user } = useStore();

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Logo />
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <span className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Manage</span>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setView(key); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${view === key ? "bg-lime text-ink" : "text-muted hover:bg-cream hover:text-ink"}`}>
              <Icon className="h-4.5 w-4.5" /> {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-lime">AD</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="truncate text-xs text-muted">{user?.email}</p></div>
          </div>
          <button onClick={async () => {
            try { await logout(); exit(); }
            catch (error) { toast(error instanceof Error ? error.message : "Could not log out.", "error"); }
          }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red hover:bg-red/10">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden"><MenuIcon className="h-6 w-6" /></button>
          <span className="text-sm font-semibold capitalize">{NAV.find((n) => n.key === view)?.label}</span>
          <button onClick={exit} className="ml-auto rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-ink">View customer site</button>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          {view === "dashboard" && <Dashboard />}
          {view === "orders" && <AdminOrders />}
          {view === "menu" && <AdminMenu />}
          {view === "inventory" && <AdminInventory />}
          {view === "slots" && <AdminSlots />}
        </main>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function MetricCard({ label, value, tone = "default", icon }: { label: string; value: string; tone?: "default" | "warn" | "danger" | "good"; icon?: React.ReactNode }) {
  const toneCls = { default: "text-ink", warn: "text-orange", danger: "text-red", good: "text-green" }[tone];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {icon && <span className={toneCls}>{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl font-bold ${toneCls}`}>{value}</p>
    </Card>
  );
}

function Dashboard() {
  const today = upcomingDates()[0].iso;
  const [to, setTo] = useState(today);
  const [from, setFrom] = useState(() => {
    const date = new Date(`${today}T12:00:00`);
    date.setDate(date.getDate() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    adminAnalyticsApi.dashboard({ from, to }, controller.signal).then(setData).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load dashboard.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [from, to, retry]);

  const total = data?.summary.totalOrders ?? 0;
  const statusColors: Record<OrderStatus, string> = {
    PENDING: "#ffa040", CONFIRMED: "#19151b", PREPARING: "#ec702a",
    READY: "#d9541e", COMPLETED: "#9f4028", CANCELLED: "#cf2150",
  };
  const statusData = (FILTERS.filter((status): status is OrderStatus => status !== "ALL"))
    .map((status) => ({ s: status[0] + status.slice(1).toLowerCase(),
      v: data?.ordersByStatus.find((entry) => entry.status === status)?.count ?? 0, c: statusColors[status] }));
  const revenueData = data?.revenueByDate.map((entry) => ({ d: entry.date.slice(5), v: entry.totalRevenue })) || [];
  const bestSellers = data?.topMenuItems.map((entry) => ({ n: entry.name, v: entry.quantity })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-hand text-3xl">Good morning, Admin</h1>
          <p className="text-sm text-muted">Here's how CafeQ is doing.</p>
        </div>
        <div className="flex items-end gap-2">
          <Input label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="py-2" />
          <Input label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="py-2" />
        </div>
      </div>

      {loading && <p className="text-center text-muted">Loading dashboard…</p>}
      {error && <Card className="px-6"><EmptyState illustration={<PlateDoodle />} title="We couldn't load the dashboard." body={error}
        action={<Button onClick={() => setRetry((value) => value + 1)}>Try Again</Button>} /></Card>}
      {!loading && !error && data && <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total Orders" value={String(total)} icon={<ClipboardList className="h-4 w-4" />} />
        <MetricCard label="Pending" value={String(data.summary.pendingOrders)} tone="warn" icon={<Package className="h-4 w-4" />} />
        <MetricCard label="Completed" value={String(data.summary.completedOrders)} tone="good" />
        <MetricCard label="Cancelled" value={String(data.summary.cancelledOrders)} tone="danger" />
        <MetricCard label="Paid Orders" value={String(data.summary.paidOrders)} />
        <MetricCard label="Total Revenue" value={money(data.summary.totalRevenue)} icon={<IndianRupee className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Total Items" value={String(data.inventory.totalItems)} icon={<Boxes className="h-4 w-4" />} />
        <MetricCard label="Low Stock" value={String(data.inventory.lowStockItems)} tone="warn" icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard label="Out of Stock" value={String(data.inventory.outOfStockItems)} tone="danger" icon={<PackageX className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green" /><h3 className="font-semibold">Revenue Over Time</h3></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData} margin={{ left: -12, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }} formatter={(v) => money(Number(v))} />
              <Line type="monotone" dataKey="v" stroke="var(--color-ink)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-lime)", stroke: "var(--color-ink)" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 font-semibold">Orders by Status</h3>
          <div className="space-y-2.5">
            {statusData.map((s) => (
              <div key={s.s}>
                <div className="flex justify-between text-xs"><span className="text-muted">{s.s}</span><span className="font-semibold">{s.v}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (s.v / Math.max(1, total)) * 100)}%`, background: s.c }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-4 font-semibold">Best Selling Items</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bestSellers} margin={{ left: -16, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="n" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "var(--color-cream)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }} formatter={(v) => `${v} sold`} />
            <Bar dataKey="v" radius={[8, 8, 0, 0]}>
              {bestSellers.map((_, i) => <Cell key={i} fill={i === 0 ? "var(--color-ink)" : "var(--color-lime)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      </>}
    </div>
  );
}

// ---------- Admin Orders ----------
const NEXT_ACTION: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  PENDING: { to: "CONFIRMED", label: "Confirm Order" },
  CONFIRMED: { to: "PREPARING", label: "Start Preparing" },
  PREPARING: { to: "READY", label: "Mark Ready" },
  READY: { to: "COMPLETED", label: "Mark Completed" },
};
const FILTERS: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

function AdminOrders() {
  const { toast, user } = useStore();
  const [merged, setMerged] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminOrdersApi.list();
      setMerged(response.orders.map((order) => asOrder(order, user)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load orders.");
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    if (!selected || !user) return;
    let active = true;
    adminOrdersApi.get(selected).then(({ order }) => {
      if (!active) return;
      const detail = asOrder(order, user);
      setMerged((previous) => previous.map((entry) => entry.id === selected ? detail : entry));
    }).catch((reason: unknown) => {
      if (active) toast(reason instanceof Error ? reason.message : "Could not load order details.", "error");
    });
    return () => { active = false; };
  }, [selected, user?.id]);

  const list = merged.filter((o) => filter === "ALL" || o.status === filter);
  const order = merged.find((o) => o.id === selected);

  const advance = async (o: Order) => {
    const next = NEXT_ACTION[o.status];
    if (!next || busy) return;
    setBusy(o.id);
    try {
      const { order } = await adminOrdersApi.updateStatus(o.id, next.to);
      setMerged((previous) => previous.map((entry) => entry.id === o.id ? { ...entry, status: order.orderStatus } : entry));
      toast(`Order ${o.id} → ${next.to.toLowerCase()}.`);
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not update order.", "error");
    } finally { setBusy(null); }
  };

  const cancel = async () => {
    if (!confirmCancel || busy) return;
    setBusy(confirmCancel);
    try {
      const { order } = await adminOrdersApi.updateStatus(confirmCancel, "CANCELLED");
      setMerged((previous) => previous.map((entry) => entry.id === confirmCancel ? { ...entry, status: order.orderStatus } : entry));
      setConfirmCancel(null);
      toast("Order cancelled.", "info");
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not cancel order.", "error");
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-hand text-3xl">Order Management</h1>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-none rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${filter === f ? "border-lime-deep bg-lime" : "border-line bg-surface text-muted hover:text-ink"}`}>
            {f === "ALL" ? "All" : f.toLowerCase()}
          </button>
        ))}
      </div>

      {error && <Card className="px-6"><EmptyState illustration={<PlateDoodle />} title="We couldn't load orders." body={error}
        action={<Button onClick={() => { void reload(); }}>Try Again</Button>} /></Card>}
      {loading && <p className="text-center text-muted">Loading orders…</p>}
      {!loading && !error && <Card className="overflow-hidden">
        {/* Desktop table */}
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Order ID</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-cream/40">
                <td className="px-4 py-3"><button onClick={() => setSelected(o.id)} className="font-semibold hover:underline">{o.id}</button></td>
                <td className="px-4 py-3">{o.customer.name}</td>
                <td className="px-4 py-3 font-medium tabular-nums">{money(o.total)}</td>
                <td className="px-4 py-3"><PaymentBadge status={o.payment} /></td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3">
                  {NEXT_ACTION[o.status]
                    ? <Button size="sm" disabled={!!busy} onClick={() => { void advance(o); }}>{NEXT_ACTION[o.status]!.label}</Button>
                    : <Button size="sm" variant="ghost" onClick={() => setSelected(o.id)}>Details <ChevronRight className="h-4 w-4" /></Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mobile cards */}
        <div className="divide-y divide-line md:hidden">
          {list.map((o) => (
            <div key={o.id} className="p-4">
              <div className="flex items-center justify-between"><button onClick={() => setSelected(o.id)} className="font-semibold">{o.id}</button><StatusBadge status={o.status} /></div>
              <p className="mt-1 text-sm text-muted">{o.customer.name} · {money(o.total)}</p>
              <div className="mt-2 flex items-center justify-between"><PaymentBadge status={o.payment} />
                {NEXT_ACTION[o.status] && <Button size="sm" disabled={!!busy} onClick={() => { void advance(o); }}>{NEXT_ACTION[o.status]!.label}</Button>}
              </div>
            </div>
          ))}
        </div>
        {list.length === 0 && <EmptyState illustration={<PlateDoodle />} title="No orders here." body="Try another filter." />}
      </Card>}

      {/* Detail side panel */}
      <Modal open={!!order} onClose={() => setSelected(null)} className="max-w-lg sm:!ml-auto sm:!mr-0 sm:h-screen sm:!max-h-screen sm:!rounded-none sm:rounded-l-3xl">
        {order && (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-hand text-2xl">Order {order.id}</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-2 flex gap-2"><StatusBadge status={order.status} /><PaymentBadge status={order.payment} /></div>

            <div className="mt-5 rounded-2xl border border-line bg-cream p-4 text-sm">
              <p className="font-semibold">{order.customer.name}</p>
              <p className="text-muted">{order.customer.email}</p>
              <p className="text-muted">{order.customer.phone}</p>
              <p className="mt-2 text-muted">Pickup: <span className="font-medium text-ink">{order.pickupSlot}</span></p>
            </div>

            <h3 className="mt-5 text-sm font-semibold">Items</h3>
            <div className="mt-2 divide-y divide-line">
              {order.lines.map((l) => (
                <div key={l.itemId} className="flex items-center gap-3 py-2.5 text-sm">
                  <ImageWithFallback src={l.image} alt={l.name} className="h-10 w-10 rounded-lg object-cover" />
                  <span className="flex-1">{l.name} × {l.qty}</span>
                  <span className="font-medium tabular-nums">{money(l.price * l.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold"><span>Total</span><span>{money(order.total)}</span></div>

            <div className="mt-6 space-y-2">
              {NEXT_ACTION[order.status] && <Button block disabled={!!busy} onClick={() => { void advance(order); }}>{NEXT_ACTION[order.status]!.label}</Button>}
              {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                <Button variant="secondary" block className="!text-red" onClick={() => setConfirmCancel(order.id)}>Cancel Order</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal open={!!confirmCancel} onClose={() => setConfirmCancel(null)}
        onConfirm={() => { void cancel(); }} loading={!!busy}
        title="Cancel this order?" body="The status will change to cancelled. Contact the customer about any refund."
        confirmLabel="Cancel Order" cancelLabel="Keep Order" danger />
    </div>
  );
}

// ---------- Admin Menu ----------
function AdminMenu() {
  const { toast } = useStore();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const categoryOptions = [...new Set(items.map((item) => item.category))];

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setItems(await menuApi.all()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load menu items."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  const save = async (item: MenuItem) => {
    if (busy) return;
    setBusy(true);
    try {
      const body = { name: item.name, description: item.description, price: item.price,
        category: item.category, image: item.image, isAvailable: item.available };
      const response = item.id ? await adminMenuApi.update(item.id, body) : await adminMenuApi.create(body);
      if (!response.menuItem) throw new Error("Menu item not found.");
      const saved = asMenuItem(response.menuItem);
      setItems((previous) => previous.some((entry) => entry.id === saved.id)
        ? previous.map((entry) => entry.id === saved.id ? saved : entry) : [saved, ...previous]);
      toast("Menu item saved.");
      setEditing(null); setCreating(false);
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not save menu item.", "error");
    } finally { setBusy(false); }
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (busy) return;
    setBusy(true);
    try {
      const { menuItem } = await adminMenuApi.update(item.id, { isAvailable: !item.available });
      if (!menuItem) throw new Error("Menu item not found.");
      setItems((previous) => previous.map((entry) => entry.id === item.id ? asMenuItem(menuItem) : entry));
      toast("Availability updated.");
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not update availability.", "error");
    } finally { setBusy(false); }
  };

  const deleteItem = async () => {
    if (!deleteId || busy) return;
    setBusy(true);
    try {
      await adminMenuApi.remove(deleteId);
      setItems((previous) => previous.filter((entry) => entry.id !== deleteId));
      setDeleteId(null);
      toast("Item deleted.", "info");
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not delete item.", "error");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-hand text-3xl">Menu Management</h1>
        <Button disabled={busy} onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add Menu Item</Button>
      </div>

      {loading && <p className="text-center text-muted">Loading menu items…</p>}
      {error && <Card className="px-6"><EmptyState illustration={<PlateDoodle />} title="We couldn't load menu items." body={error}
        action={<Button onClick={() => { void reload(); }}>Try Again</Button>} /></Card>}
      {!loading && !error && <Card className="overflow-hidden">
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Image</th><th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Availability</th><th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((m) => (
              <tr key={m.id} className="hover:bg-cream/40">
                <td className="px-4 py-2"><ImageWithFallback src={m.image} alt={m.name} category={m.category} className="h-11 w-11 rounded-lg object-cover" /></td>
                <td className="px-4 py-2 font-medium">{m.name}</td>
                <td className="px-4 py-2 text-muted">{m.category}</td>
                <td className="px-4 py-2 font-medium">{money(m.price)}</td>
                <td className="px-4 py-2">
                  <button disabled={busy} onClick={() => { void toggleAvailability(m); }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.available ? "bg-ink/10 text-ink" : "bg-red/15 text-red"}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />{m.available ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button disabled={busy} onClick={() => setEditing(m)} className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:bg-cream" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button disabled={busy} onClick={() => setDeleteId(m.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-red hover:bg-red/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divide-y divide-line md:hidden">
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-4">
              <ImageWithFallback src={m.image} alt={m.name} category={m.category} className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{m.name}</p><p className="text-xs text-muted">{m.category} · {money(m.price)}</p></div>
              <button onClick={() => setEditing(m)} className="grid h-8 w-8 place-items-center rounded-lg border border-line"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => setDeleteId(m.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-red"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Card>}

      {(editing || creating) && (
        <MenuItemModal item={editing} categories={categoryOptions} busy={busy} onClose={() => { setEditing(null); setCreating(false); }} onSave={(item) => { void save(item); }} />
      )}
      <ConfirmationModal open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { void deleteItem(); }} loading={busy}
        title="Delete this item?" body="Consider marking it unavailable instead if it's only temporary." confirmLabel="Delete" danger />
    </div>
  );
}

function MenuItemModal({ item, categories, busy, onClose, onSave }: {
  item: MenuItem | null; categories: string[]; busy: boolean; onClose: () => void; onSave: (i: MenuItem) => void;
}) {
  const [form, setForm] = useState<MenuItem>(item ?? {
    id: "", name: "", category: categories[0] || "", description: "", price: 0,
    image: "", available: true,
  });
  const upd = (p: Partial<MenuItem>) => setForm((f) => ({ ...f, ...p }));
  return (
    <Modal open onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h2 className="font-hand text-2xl">{item ? "Edit Menu Item" : "Add Menu Item"}</h2>
        <div className="mt-4 space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => upd({ name: e.target.value })} placeholder="e.g. Espresso" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Description</span>
            <textarea value={form.description} onChange={(e) => upd({ description: e.target.value })} rows={2}
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lime/60" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" type="number" value={form.price || ""} onChange={(e) => upd({ price: Number(e.target.value) })} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Category</span>
              <select value={form.category} onChange={(e) => upd({ category: e.target.value as MenuItem["category"] })}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lime/60">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <Input label="Image URL" value={form.image} onChange={(e) => upd({ image: e.target.value })} />
          <label className="flex items-center justify-between rounded-xl border border-line bg-cream px-4 py-3">
            <span className="text-sm font-medium">Available</span>
            <button type="button" onClick={() => upd({ available: !form.available })}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.available ? "bg-lime-deep" : "bg-line"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-transform ${form.available ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" block onClick={onClose}>Cancel</Button>
          <Button block loading={busy} onClick={() => onSave(form)} disabled={!form.name || form.price <= 0}>Save Item</Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Admin Inventory ----------
function stockHealth(m: MenuItem): "Healthy" | "Low Stock" | "Out of Stock" {
  if (m.stock === 0) return "Out of Stock";
  if ((m.stock ?? 0) < (m.minStock ?? 0)) return "Low Stock";
  return "Healthy";
}
function AdminInventory() {
  const { toast } = useStore();
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [lowRows, setLowRows] = useState<InventoryRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [action, setAction] = useState<{ item: InventoryRow; mode: "add" | "set" | "min" } | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const reload = useCallback(async (initial = false) => {
    setLoading(true);
    setError(null);
    try {
      const [all, low, menu] = await Promise.all([
        initial ? inventoryApi.all() : inventoryApi.get(), inventoryApi.lowStock(), menuApi.all(),
      ]);
      setItems(all);
      setLowRows(low);
      setMenuItems(menu);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load inventory.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(true); }, [reload]);

  const totalItems = items.length;
  const low = lowRows.length;
  const out = items.filter((m) => stockHealth(m) === "Out of Stock").length;

  const shown = (filter === "all" ? items : lowRows).filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
  const inventoryMenuIds = new Set(items.map((item) => item.id));
  const missingMenuItems = menuItems.filter((item) => !inventoryMenuIds.has(item.id));

  const apply = async (val: number) => {
    if (!action || busy) return;
    if (!Number.isInteger(val) || val < 0) { toast("Enter a non-negative whole number.", "error"); return; }
    setBusy(true);
    try {
      if (action.mode === "add") await inventoryApi.addStock(action.item.id, val);
      else if (action.mode === "set") await inventoryApi.setStock(action.item.id, val);
      else await inventoryApi.patch(action.item.inventoryId, { minimumStock: val });
      toast(action.mode === "add" ? `Added ${val} to stock.` : action.mode === "set" ? "Stock quantity set." : "Minimum stock updated.");
      setAction(null);
      await reload();
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not update inventory.", "error");
    } finally { setBusy(false); }
  };

  const createInventory = async (menuItem: string, quantity: number, minimumStock: number) => {
    if (busy) return;
    if (!menuItem || !Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(minimumStock) || minimumStock < 0) {
      toast("Choose an item and enter non-negative whole numbers.", "error"); return;
    }
    setBusy(true);
    try {
      await inventoryApi.create({ menuItem, quantity, minimumStock });
      toast("Inventory record created.");
      setCreating(false);
      await reload();
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not create inventory.", "error");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-hand text-3xl">Inventory</h1>
        <Button disabled={loading || busy || missingMenuItems.length === 0} onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add Inventory
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total Items" value={String(totalItems)} icon={<Boxes className="h-4 w-4" />} />
        <MetricCard label="Low Stock" value={String(low)} tone="warn" icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard label="Out of Stock" value={String(out)} tone="danger" icon={<PackageX className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-line bg-surface p-1">
          {(["all", "low"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${filter === f ? "bg-lime text-ink" : "text-muted"}`}>
              {f === "all" ? "All Inventory" : "Low Stock"}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product…"
            className="rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-lime/60" />
        </div>
      </div>

      {loading ? <p className="text-center text-muted">Loading inventory…</p>
      : error ? <Card className="px-6"><EmptyState illustration={<PlateDoodle />} title="We couldn't load inventory." body={error}
          action={<Button onClick={() => { void reload(); }}>Try Again</Button>} /></Card>
      : shown.length === 0 ? (
        <Card className="px-6"><EmptyState illustration={<PlateDoodle />} title="All stocked up!" body="No items need attention right now." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="hidden w-full text-sm md:table">
            <thead>
              <tr className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Current Stock</th>
                <th className="px-4 py-3 font-semibold">Minimum Stock</th><th className="px-4 py-3 font-semibold">Stock Health</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((m) => {
                const health = stockHealth(m);
                return (
                  <tr key={m.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3"><ImageWithFallback src={m.image} alt={m.name} category={m.category} className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium">{m.name}</span></div>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{m.stock}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{m.minStock}</td>
                    <td className="px-4 py-3"><HealthBadge health={health} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setAction({ item: m, mode: "add" })} className="inline-flex items-center gap-1 rounded-lg bg-lime px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-lime-deep"><ArrowUpCircle className="h-3.5 w-3.5" /> Add Stock</button>
                        <button onClick={() => setAction({ item: m, mode: "set" })} className="inline-flex items-center gap-1 rounded-lg border border-ink px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-ink hover:text-cream"><Replace className="h-3.5 w-3.5" /> Set Stock</button>
                        <button onClick={() => setAction({ item: m, mode: "min" })} className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted hover:text-ink">Edit Min</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="divide-y divide-line md:hidden">
            {shown.map((m) => (
              <div key={m.id} className="p-4">
                <div className="flex items-center gap-3">
                  <ImageWithFallback src={m.image} alt={m.name} category={m.category} className="h-11 w-11 rounded-lg object-cover" />
                  <div className="flex-1"><p className="font-medium">{m.name}</p><p className="text-xs text-muted">Stock {m.stock} · min {m.minStock}</p></div>
                  <HealthBadge health={stockHealth(m)} />
                </div>
                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => setAction({ item: m, mode: "add" })} className="flex-1 rounded-lg bg-lime py-1.5 text-xs font-semibold">Add Stock</button>
                  <button onClick={() => setAction({ item: m, mode: "set" })} className="flex-1 rounded-lg border border-ink py-1.5 text-xs font-semibold">Set Stock</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {action && <StockModal action={action} busy={busy} onClose={() => setAction(null)} onApply={(value) => { void apply(value); }} />}
      {creating && <CreateInventoryModal items={missingMenuItems} busy={busy} onClose={() => setCreating(false)}
        onCreate={(menuItem, quantity, minimumStock) => { void createInventory(menuItem, quantity, minimumStock); }} />}
    </div>
  );
}

function HealthBadge({ health }: { health: "Healthy" | "Low Stock" | "Out of Stock" }) {
  const cls = { "Healthy": "bg-ink/10 text-ink", "Low Stock": "bg-orange/15 text-[#923916]", "Out of Stock": "bg-red/15 text-red" }[health];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{health}</span>;
}

function StockModal({ action, busy, onClose, onApply }: { action: { item: InventoryRow; mode: "add" | "set" | "min" }; busy: boolean; onClose: () => void; onApply: (v: number) => void }) {
  const [val, setVal] = useState<number>(action.mode === "min" ? (action.item.minStock ?? 0) : action.mode === "set" ? (action.item.stock ?? 0) : 10);
  const isAdd = action.mode === "add";
  const title = action.mode === "add" ? "Add Stock" : action.mode === "set" ? "Set Stock" : "Edit Minimum Stock";
  return (
    <Modal open onClose={onClose} className="max-w-sm">
      <div className="p-6">
        <div className={`mb-3 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold ${isAdd ? "bg-lime text-ink" : action.mode === "set" ? "bg-ink text-cream" : "bg-cream text-ink border border-line"}`}>
          {isAdd ? <ArrowUpCircle className="h-4 w-4" /> : action.mode === "set" ? <Replace className="h-4 w-4" /> : null}{title}
        </div>
        <h2 className="font-hand text-2xl">{action.item.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {isAdd ? <>Adds to the current stock of <b className="text-ink">{action.item.stock}</b>.</>
            : action.mode === "set" ? <>Replaces current stock of <b className="text-ink">{action.item.stock}</b> entirely.</>
            : <>Alert threshold. Current minimum is <b className="text-ink">{action.item.minStock}</b>.</>}
        </p>
        <Input className="mt-4" type="number" value={val || ""} onChange={(e) => setVal(Number(e.target.value))}
          label={isAdd ? "Quantity to add" : action.mode === "set" ? "New stock quantity" : "Minimum stock"} />
        {isAdd && <p className="mt-2 text-sm text-green">New total will be {(action.item.stock ?? 0) + (val || 0)}.</p>}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" block onClick={onClose}>Cancel</Button>
          <Button block variant={isAdd ? "primary" : "dark"} loading={busy} onClick={() => onApply(val)}>{title}</Button>
        </div>
      </div>
    </Modal>
  );
}

function CreateInventoryModal({ items, busy, onClose, onCreate }: {
  items: MenuItem[]; busy: boolean; onClose: () => void;
  onCreate: (menuItem: string, quantity: number, minimumStock: number) => void;
}) {
  const [menuItem, setMenuItem] = useState(items[0]?.id || "");
  const [quantity, setQuantity] = useState(0);
  const [minimumStock, setMinimumStock] = useState(5);
  return <Modal open onClose={onClose} className="max-w-sm"><div className="p-6">
    <h2 className="font-hand text-2xl">Add Inventory</h2>
    <label className="mt-4 block text-sm font-medium">Menu Item
      <select value={menuItem} onChange={(event) => setMenuItem(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm">
        {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <Input label="Quantity" type="number" min={0} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
      <Input label="Minimum Stock" type="number" min={0} value={minimumStock} onChange={(event) => setMinimumStock(Number(event.target.value))} />
    </div>
    <div className="mt-6 flex gap-3">
      <Button variant="secondary" block onClick={onClose}>Cancel</Button>
      <Button block loading={busy} onClick={() => onCreate(menuItem, quantity, minimumStock)}>Create</Button>
    </div>
  </div></Modal>;
}

// ---------- Admin Slots ----------
function AdminSlots() {
  const { toast } = useStore();
  const dates = upcomingDates();
  const [date, setDate] = useState(dates[0].iso);
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({});
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    timeSlotsApi.forDate(date, controller.signal).then((active) => {
      setSlots((previous) => {
        const inactive = (previous[date] || []).filter((slot) => !slot.active && !active.some((entry) => entry.id === slot.id));
        return { ...previous, [date]: [...active, ...inactive] };
      });
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load slots.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [date, retry]);

  const current = slots[date] || [];
  const replaceSlot = (slot: TimeSlot) => setSlots((previous) => ({
    ...previous, [date]: (previous[date] || []).map((entry) => entry.id === slot.id ? slot : entry),
  }));

  const create = async (start: string, end: string, maxOrders: number) => {
    if (busy) return;
    if (!Number.isInteger(maxOrders) || maxOrders < 1) { toast("Maximum orders must be a positive whole number.", "error"); return; }
    setBusy(true);
    try {
      const { timeSlot } = await timeSlotsApi.create({ date, start, end, maxOrders });
      setSlots((previous) => ({ ...previous, [date]: [...(previous[date] || []), asTimeSlot(timeSlot)] }));
      toast("Time slot created.");
      setCreating(false);
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not create slot.", "error");
    } finally { setBusy(false); }
  };

  const updateCapacity = async (maxOrders: number) => {
    if (!editing || busy) return;
    if (!Number.isInteger(maxOrders) || maxOrders < 1) { toast("Maximum orders must be a positive whole number.", "error"); return; }
    setBusy(true);
    try {
      const { timeSlot } = await timeSlotsApi.update(editing.id, { maxOrders });
      replaceSlot(asTimeSlot(timeSlot));
      setEditing(null);
      toast("Slot updated.");
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not update slot.", "error");
    } finally { setBusy(false); }
  };

  const toggle = async (slot: TimeSlot) => {
    if (busy) return;
    setBusy(true);
    try {
      const { timeSlot } = slot.active ? await timeSlotsApi.deactivate(slot.id)
        : await timeSlotsApi.update(slot.id, { isActive: true });
      replaceSlot(asTimeSlot(timeSlot));
      toast(slot.active ? "Slot deactivated." : "Slot reactivated.", "info");
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Could not update slot.", "error");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-hand text-3xl">Pickup Slots</h1>
        <Button disabled={busy} onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Create Time Slot</Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => (
          <button key={d.iso} onClick={() => setDate(d.iso)}
            className={`flex-none rounded-2xl border px-4 py-2.5 text-center ${date === d.iso ? "border-lime-deep bg-lime" : "border-line bg-surface hover:bg-cream"}`}>
            <div className="text-xs font-medium text-muted">{d.day}</div><div className="text-lg font-bold leading-tight">{d.num}</div>
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-muted">Loading pickup slots…</p>}
      {error && <Card className="px-6"><EmptyState illustration={<PlateDoodle />} title="We couldn't load pickup slots." body={error}
        action={<Button onClick={() => setRetry((value) => value + 1)}>Try Again</Button>} /></Card>}
      {!loading && !error && current.length === 0 && <Card className="px-6"><EmptyState illustration={<PlateDoodle />}
        title="No pickup slots yet." body="Create a slot for this date." /></Card>}
      {!loading && !error && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {current.map((s) => {
          const remaining = s.max - s.current;
          const pct = Math.round((s.current / s.max) * 100);
          return (
            <Card key={s.id} className={`p-4 ${!s.active ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{s.start} – {s.end}</p><p className="text-xs text-muted">{s.current} / {s.max} orders</p></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.active ? "bg-ink/10 text-ink" : "bg-line text-muted"}`}>{s.active ? "Active" : "Inactive"}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream">
                <div className={`h-full rounded-full ${pct >= 100 ? "bg-red" : pct >= 80 ? "bg-orange" : "bg-lime-deep"}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted">{remaining > 0 ? `${remaining} slots remaining` : "Fully booked"}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" disabled={busy} className="flex-1" onClick={() => setEditing(s)}>Edit slot</Button>
                <Button size="sm" variant="ghost" disabled={busy} className="flex-1" onClick={() => { void toggle(s); }}>
                  {s.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>}

      {creating && <CreateSlotModal busy={busy} onClose={() => setCreating(false)}
        onCreate={(start, end, maxOrders) => { void create(start, end, maxOrders); }} date={date} />}
      {editing && <EditSlotModal slot={editing} busy={busy} onClose={() => setEditing(null)}
        onSave={(maxOrders) => { void updateCapacity(maxOrders); }} />}
    </div>
  );
}

function CreateSlotModal({ date, busy, onClose, onCreate }: {
  date: string; busy: boolean; onClose: () => void;
  onCreate: (start: string, end: string, maxOrders: number) => void;
}) {
  const [start, setStart] = useState("3:00 PM");
  const [end, setEnd] = useState("3:30 PM");
  const [max, setMax] = useState(20);
  return (
    <Modal open onClose={onClose} className="max-w-sm">
      <div className="p-6">
        <h2 className="font-hand text-2xl">Create Time Slot</h2>
        <div className="mt-4 space-y-3">
          <Input label="Date" type="date" value={date} readOnly />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="End Time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Input label="Maximum Orders" type="number" value={max || ""} onChange={(e) => setMax(Number(e.target.value))} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" block onClick={onClose}>Cancel</Button>
          <Button block loading={busy} onClick={() => onCreate(start, end, max)}>Create Slot</Button>
        </div>
      </div>
    </Modal>
  );
}

function EditSlotModal({ slot, busy, onClose, onSave }: {
  slot: TimeSlot; busy: boolean; onClose: () => void; onSave: (maxOrders: number) => void;
}) {
  const [maxOrders, setMaxOrders] = useState(slot.max);
  return <Modal open onClose={onClose} className="max-w-sm"><div className="p-6">
    <h2 className="font-hand text-2xl">Edit Time Slot</h2>
    <p className="mt-1 text-sm text-muted">{slot.start} – {slot.end} · {slot.current} orders booked</p>
    <Input className="mt-4" label="Maximum Orders" type="number" min={1} value={maxOrders}
      onChange={(event) => setMaxOrders(Number(event.target.value))} />
    <div className="mt-6 flex gap-3"><Button variant="secondary" block onClick={onClose}>Cancel</Button>
      <Button block loading={busy} onClick={() => onSave(maxOrders)}>Save Slot</Button></div>
  </div></Modal>;
}
