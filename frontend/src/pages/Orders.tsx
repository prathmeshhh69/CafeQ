import { useEffect, useState } from "react";
import { ArrowLeft, ChefHat, PartyPopper, LogOut, Mail, Phone, User as UserIcon, ShieldCheck } from "lucide-react";
import { Button, Card, EmptyState, StatusBadge, PaymentBadge, ConfirmationModal, RatingInput } from "../components/ui";
import { OrderCard, OrderTimeline, ReviewCard } from "../components/cards";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { PotDoodle, CupDoodle, PlateDoodle, Sparkle } from "../components/Doodles";
import { money, type Order, type OrderStatus, type Review } from "../lib/data";
import { useStore } from "../lib/store";
import { asReview, reviewsApi } from "../lib/reviews-api";
import { paymentApi } from "../lib/payment-api";
import { ordersApi } from "../lib/orders-api";

const ACTIVE: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

export function OrdersPage({ go }: { go: (r: string, id?: string) => void }) {
  const { orders, ordersLoading, ordersError, reloadOrders } = useStore();
  const [tab, setTab] = useState<"active" | "past">("active");
  const list = orders.filter((o) => tab === "active" ? ACTIVE.includes(o.status) : !ACTIVE.includes(o.status));

  return (
    <div className="mx-auto max-w-[1024px] px-4 py-8 sm:px-6">
      <h1 className="font-hand text-4xl">My Orders</h1>
      <div className="mt-5 inline-flex rounded-2xl border border-line bg-surface p-1">
        {(["active", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${tab === t ? "bg-lime text-ink" : "text-muted hover:text-ink"}`}>
            {t === "active" ? "Active Orders" : "Past Orders"}
          </button>
        ))}
      </div>

      {ordersLoading ? <p className="mt-6 text-center text-muted">Loading your orders…</p>
      : ordersError ? <Card className="mt-6 px-6"><EmptyState illustration={<CupDoodle />}
          title="We couldn't load your orders." body={ordersError}
          action={<Button onClick={() => { void reloadOrders().catch(() => {}); }}>Try Again</Button>} /></Card>
      : list.length === 0 ? (
        <Card className="mt-6 px-6">
          <EmptyState illustration={<CupDoodle />}
            title="No orders yet."
            body={tab === "active" ? "Your first favourite is waiting." : "Completed orders will show up here."}
            action={<Button onClick={() => go("menu")}>Browse Menu</Button>} />
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((o) => <OrderCard key={o.id} order={o} onView={(id) => go("order", id)} />)}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage({ id, go }: { id: string; go: (r: string, id?: string) => void }) {
  const { orders, loadOrder, cancelOrder, user, toast } = useStore();
  const order = orders.find((o) => o.id === id);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loadOrder(id).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load this order.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, loadOrder]);

  if (loading) return <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">Loading order…</div>;

  if (!order || error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState illustration={<PlateDoodle />} title="Order not found." body={error || "It may have been removed."}
          action={<Button onClick={() => go("orders")}>Back to orders</Button>} />
      </div>
    );
  }

  const canCancel = order.status === "PENDING";
  const doCancel = async () => {
    setCancelling(true);
    if (await cancelOrder(order.id)) setConfirmCancel(false);
    setCancelling(false);
  };

  const retryPayment = async () => {
    if (!user || paymentBusy) return;
    setPaymentBusy(true);
    try {
      const existing = await ordersApi.get(order.id);
      if (existing.order.paymentStatus === "PAID") {
        await loadOrder(order.id);
        toast("Payment is already confirmed.", "info");
        return;
      }
      const paymentOrder = await paymentApi.createOrder(order.id);
      const result = await paymentApi.open(paymentOrder, user);
      if (result.kind === "cancelled") { toast("Payment checkout closed.", "info"); return; }
      if (result.kind === "failed") { toast(result.message, "error"); return; }
      try { await paymentApi.verify(result.response); }
      catch (reason) {
        const current = await ordersApi.get(order.id).catch(() => null);
        if (current?.order.paymentStatus !== "PAID") throw reason;
      }
      await loadOrder(order.id);
      toast("Payment successful!");
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : "Payment could not be completed.", "error");
    } finally { setPaymentBusy(false); }
  };

  return (
    <div className="mx-auto max-w-[1024px] px-4 py-8 sm:px-6">
      <button onClick={() => go("orders")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> My Orders
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-hand text-4xl">Order {order.id}</h1>
          <p className="text-sm text-muted">Placed {order.placedAt}</p>
        </div>
        <div className="flex items-center gap-2"><StatusBadge status={order.status} /><PaymentBadge status={order.payment} /></div>
      </div>

      {/* Stateful hero */}
      {order.status === "PREPARING" && (
        <Card className="mt-6 flex items-center gap-4 overflow-hidden bg-lime/25 p-5">
          <PotDoodle className="text-[64px] text-red" />
          <div><h2 className="font-hand text-3xl">Cooking with love!</h2><p className="text-muted">Your food is being prepared.</p></div>
        </Card>
      )}
      {order.status === "READY" && (
        <Card className="mt-6 flex items-center gap-4 border-green/50 bg-green/15 p-5">
          <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-lime text-ink"><PartyPopper className="h-8 w-8" /></span>
          <div><h2 className="font-hand text-3xl">Your order is ready! 🎉</h2><p className="text-muted">You can head over and pick it up.</p></div>
        </Card>
      )}

      <Card className="mt-6 p-5 sm:p-6">
        <h2 className="mb-6 font-semibold">Order progress</h2>
        <OrderTimeline status={order.status} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-3 divide-y divide-line">
            {order.lines.map((l) => (
              <div key={l.itemId} className="flex items-center gap-3 py-3">
                <ImageWithFallback src={l.image} alt={l.name} className="h-14 w-14 rounded-xl border border-line object-cover" />
                <div className="flex-1"><p className="font-medium">{l.name}</p><p className="text-sm text-muted">{money(l.price)} × {l.qty}</p></div>
                <span className="font-semibold tabular-nums">{money(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-base font-bold"><span>Total</span><span className="tabular-nums">{money(order.total)}</span></div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold">Pickup details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Status" value={<StatusBadge status={order.status} />} />
              <Row label="Payment" value={<PaymentBadge status={order.payment} />} />
              <Row label="Pickup slot" value={<span className="font-medium">{order.pickupSlot}</span>} />
            </dl>
          </Card>
          {order.payment !== "PAID" && order.status !== "CANCELLED" && (
            <Button block loading={paymentBusy} onClick={() => { void retryPayment(); }}>Retry Payment</Button>
          )}
          {canCancel && (
            <Button variant="secondary" block onClick={() => setConfirmCancel(true)} className="!text-red">Cancel Order</Button>
          )}
        </div>
      </div>

      {/* Review after completion */}
      {order.status === "COMPLETED" && order.payment === "PAID" && <ReviewSection order={order} />}

      <ConfirmationModal
        open={confirmCancel} onClose={() => setConfirmCancel(false)} onConfirm={doCancel} loading={cancelling}
        title="Cancel this order?" body="This can't be undone. Contact the café about any refund for a paid order."
        confirmLabel="Cancel Order" cancelLabel="Keep Order" danger
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><dt className="text-muted">{label}</dt><dd>{value}</dd></div>;
}

function ReviewSection({ order }: { order: Order }) {
  const { toast, user } = useStore();
  const [drafts, setDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitted, setSubmitted] = useState<Record<string, Review>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all(order.lines.map((line) => reviewsApi.get(line.itemId))).then((responses) => {
      if (!active) return;
      const found: Record<string, Review> = {};
      responses.forEach((response, index) => {
        const mine = response.reviews.find((review) => review.order === order.id
          && (typeof review.user === "object" ? review.user._id : review.user) === user.id);
        if (mine) found[order.lines[index].itemId] = asReview(mine, user);
      });
      setSubmitted(found);
    }).catch((error: unknown) => { if (active) toast(error instanceof Error ? error.message : "Could not load your reviews.", "error"); });
    return () => { active = false; };
  }, [order.id, user?.id]);

  const set = (itemId: string, patch: Partial<{ rating: number; comment: string }>) =>
    setDrafts((d) => ({ ...d, [itemId]: { ...{ rating: 0, comment: "" }, ...d[itemId], ...patch } }));

  const submit = async (itemId: string) => {
    const d = drafts[itemId];
    if (!d || d.rating === 0) { toast("Pick a star rating first.", "error"); return; }
    if (!user || busy[itemId]) return;
    setBusy((previous) => ({ ...previous, [itemId]: true }));
    try {
      const existing = submitted[itemId];
      const response = existing && editing[itemId]
        ? await reviewsApi.update(existing.id, { rating: d.rating, comment: d.comment })
        : await reviewsApi.create({ orderId: order.id, menuItemId: itemId, rating: d.rating, comment: d.comment });
      setSubmitted((previous) => ({ ...previous, [itemId]: asReview(response.review, user) }));
      setEditing((previous) => ({ ...previous, [itemId]: false }));
      toast(existing ? "Review updated." : "Review submitted.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save your review.", "error");
    } finally { setBusy((previous) => ({ ...previous, [itemId]: false })); }
  };

  const removeReview = async () => {
    if (!deleteId) return;
    const existing = submitted[deleteId];
    if (!existing) return;
    setBusy((previous) => ({ ...previous, [deleteId]: true }));
    try {
      await reviewsApi.remove(existing.id);
      setSubmitted((previous) => { const next = { ...previous }; delete next[deleteId]; return next; });
      setDeleteId(null);
      toast("Review deleted.", "info");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not delete your review.", "error");
    } finally { setBusy((previous) => ({ ...previous, [deleteId]: false })); }
  };

  return (
    <Card className="mt-6 p-5 sm:p-6">
      <div className="flex items-center gap-2"><h2 className="font-hand text-2xl">Rate your order</h2><Sparkle className="text-lg text-lime-deep" /></div>
      <p className="text-sm text-muted">Tell us how it was — help other regulars pick their favourites.</p>
      <div className="mt-4 space-y-4">
        {order.lines.map((l) => {
          const existing = submitted[l.itemId];
          if (existing && !editing[l.itemId]) {
            return (
              <ReviewCard key={l.itemId} review={existing}
                onEdit={() => {
                  setDrafts((previous) => ({ ...previous, [l.itemId]: { rating: existing.rating, comment: existing.comment } }));
                  setEditing((previous) => ({ ...previous, [l.itemId]: true }));
                }}
                onDelete={() => setDeleteId(l.itemId)} />
            );
          }
          const d = drafts[l.itemId] ?? { rating: 0, comment: "" };
          return (
            <div key={l.itemId} className="rounded-2xl border border-line bg-cream p-4">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={l.image} alt={l.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1"><p className="font-medium">{l.name}</p><RatingInput value={d.rating} onChange={(n) => set(l.itemId, { rating: n })} size={22} /></div>
              </div>
              <textarea value={d.comment} onChange={(e) => set(l.itemId, { comment: e.target.value })}
                placeholder="Add a comment (optional)…" rows={2}
                className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lime/60" />
              <div className="mt-2 flex justify-end"><Button size="sm" loading={!!busy[l.itemId]} onClick={() => { void submit(l.itemId); }}>{existing ? "Save Review" : "Submit Review"}</Button></div>
            </div>
          );
        })}
      </div>
      <ConfirmationModal open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { void removeReview(); }} loading={!!(deleteId && busy[deleteId])}
        title="Delete this review?" body="Your rating and comment will be removed." confirmLabel="Delete" danger />
    </Card>
  );
}

export function AccountPage({ go }: { go: (r: string) => void }) {
  const { user, logout, orders, toast } = useStore();
  if (!user) return null;
  const active = orders.filter((o) => ACTIVE.includes(o.status)).length;
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-hand text-4xl">Account</h1>
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-line bg-lime/20 p-6">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-orange text-2xl font-bold text-ink">
            {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </span>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-green" /> {user.isVerified ? "Verified" : "Account"} {user.role === "ADMIN" ? "admin" : "customer"}
            </span>
          </div>
        </div>
        <dl className="divide-y divide-line">
          <Detail icon={<UserIcon className="h-4 w-4" />} label="Name" value={user.name} />
          <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <Detail icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />
          <Detail icon={<ShieldCheck className="h-4 w-4" />} label="Role" value={user.role === "ADMIN" ? "Admin" : "Customer"} />
        </dl>
      </Card>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" block onClick={() => go("orders")}>My Orders {active > 0 && <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-bold">{active} active</span>}</Button>
        <Button variant="secondary" block onClick={async () => {
          try { await logout(); go("login"); }
          catch (error) { toast(error instanceof Error ? error.message : "Could not log out.", "error"); }
        }} className="!text-red"><LogOut className="h-4 w-4" /> Logout</Button>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream text-muted">{icon}</span>
      <div><dt className="text-xs font-medium text-muted">{label}</dt><dd className="font-medium">{value}</dd></div>
    </div>
  );
}
