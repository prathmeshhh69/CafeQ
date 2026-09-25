import { useEffect, useState } from "react";
import { ArrowLeft, ChefHat, PartyPopper, LogOut, Mail, Phone, User as UserIcon, ShieldCheck, Clock3, MapPin, ReceiptText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Card, EmptyState, StatusBadge, PaymentBadge, ConfirmationModal, RatingInput } from "../components/ui";
import { OrderCard, OrderTimeline, ReviewCard } from "../components/cards";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { PotDoodle, CupDoodle, PlateDoodle, Sparkle, CoffeeBeanDoodle } from "../components/Doodles";
import { money, type Order, type OrderStatus, type Review } from "../lib/data";
import { useStore } from "../lib/store";
import { asReview, reviewsApi } from "../lib/reviews-api";
import { paymentApi } from "../lib/payment-api";
import { ordersApi } from "../lib/orders-api";

const ACTIVE: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

export function OrdersPage({ go }: { go: (r: string, id?: string) => void }) {
  const { orders, ordersLoading, ordersError, reloadOrders } = useStore();
  const [tab, setTab] = useState<"active" | "past">("active");
  const reduceMotion = useReducedMotion();
  const list = orders.filter((order) => tab === "active" ? ACTIVE.includes(order.status) : !ACTIVE.includes(order.status));
  const activeCount = orders.filter((order) => ACTIVE.includes(order.status)).length;
  const pastCount = orders.length - activeCount;
  const paidTotal = orders.filter((order) => order.payment === "PAID").reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="relative mx-auto max-w-[1120px] overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-11 lg:px-8">
      <header className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute -right-1 top-0 hidden h-28 w-40 text-[#9a774e]/35 sm:block"><CoffeeBeanDoodle className="absolute right-12 top-1 w-12 rotate-[20deg]" /><Sparkle className="absolute right-1 top-10 text-3xl" /><PotDoodle className="absolute bottom-0 right-12 w-14 rotate-[8deg]" /></div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a512d]">Your CafeQ journey</p>
        <h1 className="mt-2 font-hand text-5xl leading-none text-[#211912] sm:text-6xl">My Orders</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f5d49] sm:text-base">Track your current orders and revisit your CafeQ favourites.</p>
      </header>
      <section aria-label="Order summary" className="mt-7 flex max-w-[660px] divide-x divide-[#dfceb3] overflow-hidden rounded-2xl border border-[#dfceb3] bg-[#fff8eb]">
        <div className="min-w-0 flex-1 px-4 py-3 sm:px-5"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#907451]">All orders</p><p className="mt-0.5 text-xl font-bold tabular-nums text-[#2a2119]">{orders.length}</p></div>
        <div className="min-w-0 flex-1 px-4 py-3 sm:px-5"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#907451]">Active now</p><p className="mt-0.5 text-xl font-bold tabular-nums text-[#2a2119]">{activeCount}</p></div>
        <div className="min-w-0 flex-[1.2] px-4 py-3 sm:px-5"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#907451]">Paid total</p><p className="mt-0.5 truncate text-xl font-bold tabular-nums text-[#2a2119]">{money(paidTotal)}</p></div>
      </section>
      <div className="mt-8 flex flex-col gap-4 border-b border-[#e2d2ba] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a512d]">From the CafeQ kitchen</p><h2 className="mt-1 font-hand text-3xl text-[#2a2119]">Your order history</h2></div>
        <div role="tablist" aria-label="Order history" className="relative inline-grid w-full max-w-[330px] grid-cols-2 rounded-xl border border-[#dfceb3] bg-[#f4ead8] p-1">
          {tab === "active" && <motion.span aria-hidden="true" layoutId="order-tab-highlight" transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-lg border border-[#873a20] bg-[#b94b20] shadow-[0_2px_0_#873a20]" />}
          {tab === "past" && <motion.span aria-hidden="true" layoutId="order-tab-highlight" transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} className="absolute bottom-1 right-1 top-1 w-[calc(50%-4px)] rounded-lg border border-[#873a20] bg-[#b94b20] shadow-[0_2px_0_#873a20]" />}
          {(["active", "past"] as const).map((value) => {
            const selected = tab === value;
            const count = value === "active" ? activeCount : pastCount;
            const label = value === "active" ? "Active Orders" : "Past Orders";
            const tabClass = "relative z-10 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#713819] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4ead8] " + (selected ? "text-[#fff8eb]" : "text-[#6f5d49] hover:text-[#2a2119]");
            return <button key={value} id={"orders-tab-" + value} type="button" role="tab" aria-selected={selected} aria-controls="orders-list" onClick={() => setTab(value)} className={tabClass}>{label}<span className={"rounded-full px-1.5 py-0.5 text-[10px] tabular-nums " + (selected ? "bg-white/20" : "bg-[#e8dcc6]")}>{count}</span></button>;
          })}
        </div>
      </div>
      <div id="orders-list" role="tabpanel" aria-labelledby={"orders-tab-" + tab}>
        {ordersLoading ? <div className="py-16 text-center"><CupDoodle className="mx-auto text-5xl text-[#9a774e]" /><p className="mt-3 text-sm text-[#78654e]">Loading your orders...</p></div>
        : ordersError ? <Card className="mt-6 border-[#dfceb3] bg-[#fffaf0] px-6"><EmptyState illustration={<CupDoodle />} title="We couldn't load your orders." body={ordersError} action={<Button onClick={() => { void reloadOrders().catch(() => {}); }}>Try Again</Button>} /></Card>
        : list.length === 0 ? <Card className="mt-6 border-[#dfceb3] bg-[#fffaf0] px-6"><EmptyState illustration={<CupDoodle className="text-[#9a774e]" />} title={tab === "active" ? "Nothing brewing here yet." : "No past orders just yet."} body={tab === "active" ? "Your next CafeQ favourite is waiting to be ordered." : "Completed and cancelled orders will find a home here."} action={<Button onClick={() => go("menu")} className="rounded-full bg-[#b94b20] px-6 text-[#fff8eb] hover:bg-[#a4411e]">Explore Menu</Button>} /></Card>
        : <div className="mt-5 grid items-start gap-4 md:grid-cols-2 md:gap-5">{list.map((order, index) => <motion.div key={order.id} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: reduceMotion ? 0 : Math.min(index * 0.045, 0.18) }}><OrderCard order={order} onView={(id) => go("order", id)} /></motion.div>)}</div>}
      </div>
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

  const shortOrderId = order.id.length > 14 ? `${order.id.slice(0, 6)}…${order.id.slice(-4)}` : order.id;

  return (
    <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-9 lg:px-8">
      <button type="button" onClick={() => go("orders")} className="group mb-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e2cfb3] bg-[#fffaf1] px-4 text-sm font-semibold text-[#70472d] transition-colors hover:border-[#bd7544] hover:bg-[#f8edda] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a94d22]">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> My Orders
      </button>
      <header className="flex flex-col gap-4 border-b border-[#dfc9a9] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a512d]"><ReceiptText className="h-3.5 w-3.5" /> Your CafeQ order</p>
          <h1 title={`Order #${order.id}`} className="break-words text-2xl font-semibold tracking-tight text-[#261d16] sm:text-3xl">Order <span className="font-mono text-[0.82em]">#{shortOrderId}</span></h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#76634d]"><Clock3 className="h-4 w-4 text-[#a56436]" />Placed {order.placedAt}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto"><StatusBadge status={order.status} /><PaymentBadge status={order.payment} /></div>
      </header>

      {/* Stateful hero */}
      {order.status === "PREPARING" && (
        <Card className="mt-6 flex items-center gap-4 overflow-hidden border-[#e2c29b] bg-[#f8e8d2] p-5">
          <PotDoodle className="text-[64px] text-[#a94d22]" />
          <div><h2 className="font-hand text-3xl text-[#392619]">Cooking with love!</h2><p className="text-[#765a40]">Your food is being prepared.</p></div>
        </Card>
      )}
      {order.status === "READY" && (
        <Card className="mt-6 flex items-center gap-4 border-[#c6d0ad] bg-[#edf1e2] p-5">
          <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-[#dce6c8] text-[#51643b]"><PartyPopper className="h-8 w-8" /></span>
          <div><h2 className="font-hand text-3xl text-[#354128]">Your order is ready! 🎉</h2><p className="text-[#617052]">You can head over and pick it up.</p></div>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden border-[#e2cfb3] bg-[#fffaf2] p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a45a30]">Made with care</p><h2 className="mt-1 font-hand text-2xl text-[#2c2118]">Order journey</h2></div><CoffeeBeanDoodle className="w-9 text-[#b28a5d]" /></div>
        <OrderTimeline status={order.status} />
      </Card>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden border-[#e2cfb3] bg-[#fffaf2]">
          <div className="flex items-center justify-between border-b border-dashed border-[#ddc8a8] px-5 py-4 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a45a30]">The good stuff</p><h2 className="mt-1 font-hand text-2xl text-[#2c2118]">In your order</h2></div><PlateDoodle className="text-4xl text-[#a8794c]" /></div>
          <div className="px-5 sm:px-6">
            {order.lines.map((l) => (
              <div key={l.itemId} className="flex min-w-0 items-center gap-3 border-b border-dashed border-[#e4d5bd] py-4 sm:gap-4">
                <ImageWithFallback src={l.image} alt={l.name} className="h-14 w-14 flex-none rounded-2xl border border-[#e5d5bd] bg-[#f3e7d5] object-cover sm:h-16 sm:w-16" />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#35271b]">{l.name}</p><p className="mt-1 text-sm text-[#806b53]">{money(l.price)} <span className="px-1 text-[#b48659]">×</span> {l.qty}</p></div>
                <span className="flex-none text-sm font-bold tabular-nums text-[#392719] sm:text-base">{money(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-end justify-between gap-3 bg-[#f7eddd] px-5 py-4 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#906d48]">Order total</p><p className="mt-0.5 font-hand text-3xl font-bold text-[#8d3e1e]">{money(order.total)}</p></div><span className="pb-1 text-xs text-[#806b53]">Incl. all items</span></div>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden border-[#d9c5a5] bg-[#f5ead8]">
            <div className="flex items-center gap-3 border-b border-[#dfc9a9] px-5 py-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ead7b8] text-[#8e4b29]"><MapPin className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#98633b]">When it’s ready</p><h2 className="font-hand text-2xl text-[#302217]">Pickup</h2></div><CupDoodle className="ml-auto text-3xl text-[#976b43]" /></div>
            <div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#866746]">Pickup window</p><p className="mt-1 text-xl font-bold tracking-tight text-[#332317]">{order.pickupSlot}</p>
              <dl className="mt-4 space-y-3 border-t border-dashed border-[#d5bd9a] pt-4 text-sm">
                <Row label="Status" value={<StatusBadge status={order.status} />} />
                <Row label="Payment" value={<PaymentBadge status={order.payment} />} />
              </dl>
            </div>
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
    </main>
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
    <Card className="mt-6 overflow-hidden border-[#e2cfb3] bg-[#fffaf2] p-5 sm:p-6">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f3e4ce] text-[#9b542e]"><CupDoodle className="text-2xl" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a45a30]">A little note for the kitchen</p><h2 className="font-hand text-2xl text-[#2c2118]">How was your CafeQ moment?</h2></div><Sparkle className="ml-auto text-lg text-[#bd7a3b]" /></div>
      <p className="mt-3 text-sm text-[#76634d]">Share a quick rating and help other regulars find their next favourite.</p>
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
            <div key={l.itemId} className="rounded-2xl border border-[#e2cfb3] bg-[#fbf4e8] p-4 transition-shadow hover:shadow-[0_8px_22px_-18px_rgba(70,45,23,0.55)]">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={l.image} alt={l.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#35271b]">{l.name}</p><p className="mb-1 text-xs text-[#806b53]">Tap a star to leave your rating</p><RatingInput value={d.rating} onChange={(n) => set(l.itemId, { rating: n })} size={22} /></div>
              </div>
              <textarea value={d.comment} onChange={(e) => set(l.itemId, { comment: e.target.value })}
                placeholder="Add a comment (optional)…" rows={2}
                className="mt-3 w-full resize-none rounded-xl border border-[#dfc9a9] bg-[#fffdf8] px-3 py-2 text-sm text-[#35271b] outline-none placeholder:text-[#9a8871] focus:border-[#b66a3d] focus:ring-2 focus:ring-[#d69b6b]/40" />
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
