import { Plus, Trash2, Check, ChefHat, PackageCheck, Clock, CircleCheck, CircleDot, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { Button, QuantityStepper, Stars, PaymentBadge, Card } from "./ui";
import { money, type MenuItem, type Order, type OrderStatus, type Review } from "../lib/data";
import { useStore } from "../lib/store";
import { CupDoodle, PlateDoodle } from "./Doodles";

// ---------- FoodCard ----------
export function FoodCard({ item, onOpen }: { item: MenuItem; onOpen: (i: MenuItem) => void }) {
  const { qtyOf, add, setQty, cartBusy } = useStore();
  const qty = qtyOf(item.id);
  const unavailable = !item.available;
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-16px_rgba(24,24,23,0.35)]">
      <button onClick={() => onOpen(item)} className="relative aspect-[4/3] overflow-hidden bg-cream text-left" aria-label={`View ${item.name}`}>
        <ImageWithFallback
          src={item.image} alt={item.name} category={item.category}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${unavailable ? "saturate-0 opacity-60" : ""}`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">{item.category}</span>
        {item.popular && !unavailable && (
          <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink shadow">★ Popular</span>
        )}
        {unavailable && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-xs font-semibold text-cream">Currently unavailable</span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <button onClick={() => onOpen(item)} className="text-left">
          <h3 className="font-semibold leading-tight hover:underline">{item.name}</h3>
        </button>
        {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>}
        {item.rating !== undefined && <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Stars rating={item.rating} />
          <span className="font-medium text-ink">{item.rating}</span>
          <span>· {item.reviewCount ?? 0} reviews</span>
        </div>}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">{money(item.price)}</span>
          {unavailable ? (
            <Button size="sm" disabled variant="secondary">Add</Button>
          ) : qty > 0 ? (
            <QuantityStepper qty={qty} size="sm" disabled={cartBusy} onDec={() => setQty(item.id, qty - 1)} onInc={() => setQty(item.id, qty + 1)} />
          ) : (
            <Button size="sm" disabled={cartBusy} onClick={() => { void add(item); }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="mt-4 flex justify-between">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ---------- CartItem ----------
export function CartItem({ item, qty }: { item: MenuItem; qty: number }) {
  const { setQty, remove, cartBusy } = useStore();
  return (
    <div className="flex gap-4 py-4">
      <ImageWithFallback src={item.image} alt={item.name} category={item.category} className="h-20 w-20 flex-none rounded-2xl border border-line object-cover" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate font-semibold">{item.name}</h4>
            <p className="text-sm text-muted">{money(item.price)} each</p>
          </div>
          <span className="font-bold tabular-nums">{money(item.price * qty)}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper qty={qty} size="sm" disabled={cartBusy} onDec={() => setQty(item.id, qty - 1)} onInc={() => setQty(item.id, qty + 1)} />
          <button disabled={cartBusy} onClick={() => remove(item.id)} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-red disabled:opacity-50">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- RecommendationCard ----------
export function RecommendationCard({ item }: { item: MenuItem }) {
  const { add, qtyOf, cartBusy } = useStore();
  const inCart = qtyOf(item.id) > 0;
  return (
    <div className="flex w-48 flex-none flex-col overflow-hidden rounded-2xl border border-line bg-cream">
      <ImageWithFallback src={item.image} alt={item.name} category={item.category} className="aspect-[4/3] w-full object-cover" />
      <div className="flex flex-1 flex-col p-3">
        <h4 className="truncate text-sm font-semibold">{item.name}</h4>
        <span className="text-sm font-bold">{money(item.price)}</span>
        <button
          disabled={cartBusy}
          onClick={() => { void add(item); }}
          className={`mt-2 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${inCart ? "bg-ink/10 text-ink" : "bg-lime text-ink hover:bg-lime-deep"}`}
        >
          {inCart ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
        </button>
      </div>
    </div>
  );
}

// ---------- OrderCard ----------
export function OrderCard({ order, onView }: { order: Order; onView: (id: string) => void }) {
  const status = {
    PENDING: { label: "Pending", style: "border-[#d9b789] bg-[#f7e9d2] text-[#78502f]" },
    CONFIRMED: { label: "Confirmed", style: "border-[#c8bca9] bg-[#f0ebe2] text-[#4e4337]" },
    PREPARING: { label: "Preparing", style: "border-[#e5b083] bg-[#fae6d4] text-[#9a461f]" },
    READY: { label: "Ready for pickup", style: "border-[#a9c49e] bg-[#e9f1e3] text-[#42633b]" },
    COMPLETED: { label: "Completed", style: "border-[#b6c9ab] bg-[#edf2e8] text-[#52634b]" },
    CANCELLED: { label: "Cancelled", style: "border-[#ddb9b1] bg-[#f7e9e6] text-[#98594c]" },
  }[order.status];
  return (
    <Card className="group relative overflow-hidden border-[#dfcdb2] bg-[#fffaf0] p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9a87d] hover:shadow-[0_10px_24px_-20px_rgba(56,36,19,0.55)]">
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
        <div className="min-w-0">
          <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold " + status.style}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status.label}</span>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#796a56]"><Clock className="h-3.5 w-3.5" />{order.placedAt}</p>
        </div>
        <span className="max-w-[45%] truncate pt-1 font-mono text-xs text-[#82715b]">#{order.id.slice(-8)}</span>
      </div>
      <div className="mx-5 border-t border-dashed border-[#d9c7a9] sm:mx-6" />
      <div className="px-5 py-4 sm:px-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#907451]">{order.lines.reduce((sum, line) => sum + line.qty, 0)} items</p>
        <div className="space-y-2.5">
          {order.lines.slice(0, 3).map((line, index) => (
            <div key={line.itemId} className="flex min-w-0 items-center gap-3">
              {line.image ? <ImageWithFallback src={line.image} alt="" className="h-10 w-10 flex-none rounded-xl border border-[#e1d3ba] object-cover" /> : <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#e1d3ba] bg-[#f5ead6] text-[#86603e]">{index % 2 ? <CupDoodle className="text-xl" /> : <PlateDoodle className="text-2xl" />}</span>}
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#35291e]">{line.name}</p>
              <span className="flex-none text-sm tabular-nums text-[#796a56]">&times;{line.qty}</span>
            </div>
          ))}
          {order.lines.length > 3 && <p className="pl-[52px] text-xs font-medium text-[#8a775f]">+{order.lines.length - 3} more items</p>}
        </div>
      </div>
      <div className="mx-5 border-t border-dashed border-[#d9c7a9] sm:mx-6" />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#927b5e]">Total</p><p className="mt-0.5 text-lg font-bold tabular-nums text-[#241b14]">{money(order.total)}</p></div>
        {order.payment === "PAID" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bfd0b3] bg-[#edf2e8] px-2.5 py-1 text-xs font-semibold text-[#52634b]"><Check className="h-3.5 w-3.5" /> Paid</span> : <PaymentBadge status={order.payment} />}
        <motion.button type="button" onClick={() => onView(order.id)} whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d9c5a5] bg-[#fffdf8] px-3.5 py-2 text-sm font-semibold text-[#70452b] transition-colors hover:border-[#b65a30] hover:bg-[#f8edda] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b65a30] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0]">View Order <ArrowRight className="h-4 w-4" /></motion.button>
      </div>
    </Card>
  );
}

// ---------- OrderTimeline ----------
const STEPS: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: "PENDING", label: "Order Placed", icon: CircleDot },
  { key: "CONFIRMED", label: "Confirmed", icon: Check },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "READY", label: "Ready for Pickup", icon: PackageCheck },
  { key: "COMPLETED", label: "Completed", icon: CircleCheck },
];
export function OrderTimeline({ status }: { status: OrderStatus }) {
  const reduceMotion = useReducedMotion();
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#d9b7a9] bg-[#f8e9e3] p-4 text-[#91452f]">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efd4c9]"><CircleDot className="h-5 w-5" /></span>
        <div><p className="font-semibold">Order cancelled</p><p className="text-sm text-red/80">This order was cancelled.</p></div>
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <>
      {/* Desktop horizontal */}
      <ol aria-label="Order status progress" className="hidden items-start sm:flex">
        {STEPS.map((s, i) => {
          const done = i < current, active = i === current;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex min-w-0 flex-1 items-start last:flex-none">
              <div className="flex min-w-[76px] flex-col items-center gap-2 text-center">
                <span className={`relative grid h-11 w-11 place-items-center rounded-full border transition-colors ${done ? "border-[#b9c99f] bg-[#e8efdc] text-[#51643b]" : active ? "border-[#b34b20] bg-[#c95525] text-[#fff8ec] shadow-[0_3px_0_#873b20]" : "border-[#dfcfb8] bg-[#f7efe3] text-[#9b866c]"}`}>
                  {active && <motion.span aria-hidden="true" className="absolute inset-[-4px] rounded-full border border-[#c95525]/50" animate={reduceMotion ? { opacity: 0.5 } : { scale: [1, 1.13, 1], opacity: [0.55, 0.12, 0.55] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />}
                  <Icon className="relative h-5 w-5" strokeWidth={2} />
                </span>
                <span className={`max-w-[90px] text-xs font-semibold leading-4 ${done || active ? "text-[#3d2b1d]" : "text-[#897761]"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`mx-1 mt-[21px] h-[2px] flex-1 rounded-full ${i < current ? "bg-[#c95525]" : "bg-[#e2d4bf]"}`} />}
            </li>
          );
        })}
      </ol>
      {/* Mobile vertical */}
      <ol aria-label="Order status progress" className="sm:hidden">
        {STEPS.map((s, i) => {
          const done = i < current, active = i === current;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`relative grid h-10 w-10 flex-none place-items-center rounded-full border ${done ? "border-[#b9c99f] bg-[#e8efdc] text-[#51643b]" : active ? "border-[#b34b20] bg-[#c95525] text-[#fff8ec] shadow-[0_2px_0_#873b20]" : "border-[#dfcfb8] bg-[#f7efe3] text-[#9b866c]"}`}>
                  {active && <motion.span aria-hidden="true" className="absolute inset-[-4px] rounded-full border border-[#c95525]/50" animate={reduceMotion ? { opacity: 0.5 } : { scale: [1, 1.13, 1], opacity: [0.55, 0.12, 0.55] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />}
                  <Icon className="relative h-4 w-4" />
                </span>
                {i < STEPS.length - 1 && <span className={`my-1 w-[2px] flex-1 rounded-full ${i < current ? "bg-[#c95525]" : "bg-[#e2d4bf]"}`} />}
              </div>
              <span className={`pb-6 pt-2 text-sm ${active ? "font-bold text-[#8d3e1e]" : done ? "font-semibold text-[#3d2b1d]" : "font-medium text-[#897761]"}`}>{s.label}{active && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a45a30]">Current</span>}</span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

// ---------- ReviewCard ----------
export function ReviewCard({ review, onEdit, onDelete }: { review: Review; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange/80 text-sm font-bold">{review.author[0]}</span>
          <div>
            <p className="text-sm font-semibold">{review.author}{review.mine && <span className="ml-1.5 rounded bg-lime px-1.5 py-0.5 text-[10px] font-bold">You</span>}</p>
            <p className="text-xs text-muted">{review.date}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="mt-2.5 text-sm text-ink/90">{review.comment}</p>
      {review.mine && (onEdit || onDelete) && (
        <div className="mt-2.5 flex gap-3 text-xs font-medium">
          {onEdit && <button onClick={onEdit} className="text-muted hover:text-ink">Edit</button>}
          {onDelete && <button onClick={onDelete} className="text-muted hover:text-red">Delete</button>}
        </div>
      )}
    </div>
  );
}
