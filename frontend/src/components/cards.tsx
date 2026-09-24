import { Plus, Trash2, Check, ChefHat, PackageCheck, Clock, CircleCheck, CircleDot } from "lucide-react";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { Button, QuantityStepper, Stars, StatusBadge, PaymentBadge, Card } from "./ui";
import { money, type MenuItem, type Order, type OrderStatus, type Review } from "../lib/data";
import { useStore } from "../lib/store";

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
  const items = order.lines;
  return (
    <Card className="p-4 transition-shadow hover:shadow-[0_8px_24px_-18px_rgba(24,24,23,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">Order {order.id}</p>
          <p className="text-xs text-muted">{order.placedAt}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-3">
          {items.slice(0, 3).map((l) => (
            <ImageWithFallback key={l.itemId} src={l.image} alt={l.name} className="h-11 w-11 rounded-xl border-2 border-surface object-cover" />
          ))}
          {items.length > 3 && (
            <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-surface bg-cream text-xs font-semibold">+{items.length - 3}</span>
          )}
        </div>
        <p className="ml-1 truncate text-sm text-muted">{items.map((l) => `${l.name} ×${l.qty}`).join(", ")}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <span className="font-bold">{money(order.total)}</span>
          <PaymentBadge status={order.payment} />
        </div>
        <Button size="sm" variant="secondary" onClick={() => onView(order.id)}>View Order</Button>
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
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red/40 bg-red/10 p-4 text-red">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-red/15"><CircleDot className="h-5 w-5" /></span>
        <div><p className="font-semibold">Order cancelled</p><p className="text-sm text-red/80">This order was cancelled.</p></div>
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <>
      {/* Desktop horizontal */}
      <ol className="hidden items-center sm:flex">
        {STEPS.map((s, i) => {
          const done = i < current, active = i === current;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${done ? "border-ink bg-ink/10 text-ink" : active ? "border-lime-deep bg-lime text-ink" : "border-line bg-cream text-muted"}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className={`text-xs font-medium ${done || active ? "text-ink" : "text-muted"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`mx-1 mb-5 h-0.5 flex-1 rounded-full ${i < current ? "bg-green" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>
      {/* Mobile vertical */}
      <ol className="sm:hidden">
        {STEPS.map((s, i) => {
          const done = i < current, active = i === current;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`grid h-9 w-9 place-items-center rounded-full border-2 ${done ? "border-ink bg-ink/10 text-ink" : active ? "border-lime-deep bg-lime text-ink" : "border-line bg-cream text-muted"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {i < STEPS.length - 1 && <span className={`my-1 w-0.5 flex-1 rounded-full ${i < current ? "bg-green" : "bg-line"}`} />}
              </div>
              <span className={`pb-6 pt-1.5 text-sm font-medium ${done || active ? "text-ink" : "text-muted"}`}>{s.label}</span>
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
