import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2, XCircle, RotateCcw, Clock } from "lucide-react";
import { Button, Card, EmptyState } from "../components/ui";
import { PlateDoodle } from "../components/Doodles";
import { upcomingDates, money, type TimeSlot, type Order } from "../lib/data";
import { useStore } from "../lib/store";
import { timeSlotsApi } from "../lib/time-slots-api";
import { asOrder, ordersApi, rememberPickupSlot, type BackendOrder } from "../lib/orders-api";
import { paymentApi } from "../lib/payment-api";

type Phase = "form" | "processing" | "success" | "cancelled" | "failed";

export function CheckoutPage({ go, onPlaced }: { go: (r: string) => void; onPlaced: (o: Order) => void }) {
  const { cart, subtotal, user, addOrder, reloadCart, cartLoading, cartBusy, toast } = useStore();
  const dates = upcomingDates();
  const [date, setDate] = useState(dates[0].iso);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsRetry, setSlotsRetry] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [amountSnapshot, setAmountSnapshot] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const orderIdRef = useRef<string | null>(null);
  const createdOrderRef = useRef<BackendOrder | null>(null);
  const payingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setSlotsLoading(true);
    setSlotsError(null);
    timeSlotsApi.forDate(date, controller.signal).then(setSlots).catch((error: unknown) => {
      if (!controller.signal.aborted) setSlotsError(error instanceof Error ? error.message : "Could not load pickup slots.");
    }).finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [date, slotsRetry]);

  if (cartLoading) return <div className="mx-auto max-w-xl px-4 py-16 text-center text-muted">Loading your cart…</div>;
  if (cart.length === 0 && phase === "form" && !orderIdRef.current) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="px-6">
          <EmptyState illustration={<PlateDoodle />} title="Your cart looks hungry." body="Add something delicious before checking out."
            action={<Button onClick={() => go("menu")}>Browse Menu</Button>} />
        </Card>
      </div>
    );
  }

  const selectedSlot = slots.find((s) => s.id === slotId);

  const pay = async () => {
    if (payingRef.current) return;
    if (!selectedSlot || !selectedSlot.active || selectedSlot.current >= selectedSlot.max) {
      toast("Pick an available pickup slot first.", "error"); return;
    }
    if (!user) return;
    payingRef.current = true;
    setPaymentError(null);
    setAmountSnapshot((amount) => amount || subtotal);
    setPhase("processing");
    try {
      if (orderIdRef.current) {
        const existing = await ordersApi.get(orderIdRef.current).catch(() => null);
        if (existing?.order.paymentStatus === "PAID") {
          const paid = asOrder(existing.order, user, selectedSlot);
          setConfirmedOrder(paid);
          addOrder(paid);
          setPhase("success");
          return;
        }
      }
      if (!orderIdRef.current) {
        const { order } = await ordersApi.create(selectedSlot.id);
        orderIdRef.current = order._id;
        createdOrderRef.current = order;
        rememberPickupSlot(order._id, selectedSlot);
        void reloadCart().catch(() => {});
      }
      const paymentOrder = await paymentApi.createOrder(orderIdRef.current);
      const result = await paymentApi.open(paymentOrder, user);
      if (result.kind === "cancelled") { setPhase("cancelled"); return; }
      if (result.kind === "failed") { setPaymentError(result.message); setPhase("failed"); return; }
      try {
        await paymentApi.verify(result.response);
      } catch (error) {
        const current = await ordersApi.get(orderIdRef.current).catch(() => null);
        if (current?.order.paymentStatus !== "PAID") throw error;
      }
      const current = await ordersApi.get(orderIdRef.current).catch(() => null);
      const order = asOrder(current?.order || createdOrderRef.current!, user, selectedSlot);
      const paid = { ...order, payment: "PAID" as const };
      setConfirmedOrder(paid);
      addOrder(paid);
      toast("Payment successful!");
      setPhase("success");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment could not be completed.");
      setPhase("failed");
    } finally {
      payingRef.current = false;
    }
  };

  const finalize = () => {
    if (confirmedOrder) onPlaced(confirmedOrder);
  };

  if (phase !== "form") {
    return <PaymentState phase={phase} total={amountSnapshot} error={paymentError}
      onRetry={() => { void pay(); }} onContinue={finalize}
      onBack={() => go(orderIdRef.current ? "orders" : "cart")} backLabel={orderIdRef.current ? "My Orders" : "Back to cart"} />;
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <button onClick={() => go("cart")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </button>
      <h1 className="font-hand text-4xl">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left — scheduling */}
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="font-hand text-2xl">When should we have it ready?</h2>
            <p className="text-sm text-muted">Choose a pickup date, then a time slot.</p>

            <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
              {dates.map((d) => {
                const active = date === d.iso;
                return (
                  <button key={d.iso} onClick={() => { setDate(d.iso); setSlotId(null); }}
                    className={`flex-none rounded-2xl border px-4 py-3 text-center transition-colors ${active ? "border-lime-deep bg-lime" : "border-line bg-surface hover:bg-cream"}`}>
                    <div className="text-xs font-medium text-muted">{d.day}</div>
                    <div className="text-lg font-bold leading-tight">{d.num}</div>
                    <div className="text-[11px] text-muted">{d.label === d.day ? "" : d.label.split(" ")[0]}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-muted" /> Available time slots</div>
              {slotsLoading && <p className="text-sm text-muted">Loading pickup slots…</p>}
              {slotsError && <p className="text-sm text-red">{slotsError} <button onClick={() => setSlotsRetry((value) => value + 1)} className="underline">Try Again</button></p>}
              {!slotsLoading && !slotsError && slots.length === 0 && <p className="text-sm text-muted">No pickup slots are available for this date.</p>}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {slots.map((s) => <SlotPill key={s.id} slot={s} selected={slotId === s.id} onSelect={() => setSlotId(s.id)} />)}
              </div>
            </div>
          </Card>
        </div>

        {/* Right — summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {cart.map((l) => (
                <div key={l.item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted"><span className="font-medium text-ink">{l.item.name}</span> × {l.qty}</span>
                  <span className="font-medium tabular-nums">{money(l.item.price * l.qty)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
              <div className="flex justify-between text-base font-bold"><dt>Final Total</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
            </dl>

            <div className="mt-5">
              <p className="text-sm font-medium">Payment Method</p>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-lime-deep bg-lime/30 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-lime"><Lock className="h-4 w-4" /></span>
                <div className="text-sm">
                  <p className="font-semibold">Online Payment</p>
                  <p className="text-xs text-muted">Secure payment powered by Razorpay</p>
                </div>
              </div>
            </div>

            {selectedSlot && (
              <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-muted">
                Pickup {upcomingDates().find((d) => d.iso === date)?.label} · <span className="font-medium text-ink">{selectedSlot.start} – {selectedSlot.end}</span>
              </p>
            )}

            <Button size="lg" block className="mt-5 text-base" disabled={!selectedSlot || slotsLoading || cartBusy} onClick={() => { void pay(); }}>
              <ShieldCheck className="h-5 w-5" /> Pay &amp; Place Order · {money(subtotal)}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted">You won't be charged until payment is confirmed.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SlotPill({ slot, selected, onSelect }: { slot: TimeSlot; selected: boolean; onSelect: () => void }) {
  const remaining = slot.max - slot.current;
  const full = remaining <= 0 || !slot.active;
  const few = remaining > 0 && remaining <= 4;
  return (
    <button disabled={full} onClick={onSelect}
      className={`rounded-2xl border px-3 py-2.5 text-left transition-colors ${
        full ? "cursor-not-allowed border-line bg-cream opacity-60"
        : selected ? "border-lime-deep bg-lime"
        : "border-line bg-surface hover:bg-cream"}`}>
      <div className="text-sm font-semibold">{slot.start}</div>
      <div className="text-xs text-muted">– {slot.end}</div>
      {full ? <div className="mt-1 text-[11px] font-semibold text-red">Fully booked</div>
        : few ? <div className="mt-1 text-[11px] font-semibold text-orange">Few slots left</div>
        : <div className="mt-1 text-[11px] text-green">Available</div>}
    </button>
  );
}

function PaymentState({ phase, total, error, onRetry, onContinue, onBack, backLabel }: {
  phase: Phase; total: number; error: string | null; onRetry: () => void; onContinue: () => void; onBack: () => void; backLabel: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {phase === "processing" && (
        <>
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-line border-t-lime-deep" />
            <Lock className="absolute inset-0 m-auto h-7 w-7 text-ink" />
          </div>
          <h1 className="mt-6 font-hand text-3xl">Processing payment…</h1>
          <p className="mt-1 text-muted">Hang tight, we're confirming with Razorpay.</p>
        </>
      )}
      {phase === "success" && (
        <>
          <CheckCircle2 className="h-20 w-20 text-green animate-pop" />
          <h1 className="mt-6 font-hand text-3xl">Payment successful!</h1>
          <p className="mt-1 text-muted">Confirming your order of {money(total)}…</p>
          <Button size="lg" className="mt-6" onClick={onContinue}>Continue</Button>
        </>
      )}
      {phase === "failed" && (
        <>
          <XCircle className="h-20 w-20 text-red animate-pop" />
          <h1 className="mt-6 font-hand text-3xl">Payment didn't go through.</h1>
          <p className="mt-1 text-muted">{error || "Please try again. Your existing order will be reused."}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={onBack}>{backLabel}</Button>
            <Button onClick={onRetry}><RotateCcw className="h-4 w-4" /> Try Again</Button>
          </div>
        </>
      )}
      {phase === "cancelled" && (
        <>
          <XCircle className="h-20 w-20 text-orange animate-pop" />
          <h1 className="mt-6 font-hand text-3xl">Payment cancelled</h1>
          <p className="mt-1 text-muted">Your order is awaiting payment. You can try again.</p>
          <Button className="mt-6" onClick={onRetry}>Try Again</Button>
        </>
      )}
    </div>
  );
}
