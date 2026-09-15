import { Button, Card, PaymentBadge } from "../components/ui";
import { CupDoodle, Star, Sparkle, Heart } from "../components/Doodles";
import { money, upcomingDates, type Order } from "../lib/data";

export function ConfirmationPage({ order, go }: { order: Order; go: (r: string, id?: string) => void }) {
  const dateLabel = upcomingDates().find((d) => d.iso === order.pickupDate)?.label ?? order.pickupDate;
  return (
    <div className="relative mx-auto max-w-lg px-4 py-16 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-40 max-w-md">
        <Star className="absolute left-6 top-2 text-[28px] text-orange -rotate-12" />
        <Sparkle className="absolute right-8 top-0 text-[32px] text-lime-deep" />
        <Heart className="absolute left-1/2 top-6 text-[22px] text-red" />
      </div>
      <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full bg-lime text-ink shadow-[0_6px_0_#c3cb2f] animate-pop">
        <CupDoodle className="text-[72px]" />
      </div>
      <h1 className="mt-6 font-hand text-5xl">Order confirmed!</h1>
      <p className="mt-2 text-muted">We're getting it ready for you.</p>

      <Card className="mt-8 p-5 text-left">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Order number" value={order.id} />
          <Field label="Pickup time" value={order.pickupSlot} />
          <Field label="Pickup date" value={dateLabel} />
          <Field label="Total amount" value={money(order.total)} />
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <span className="text-xs font-medium text-muted">Payment status</span>
          <div className="mt-1"><PaymentBadge status={order.payment} /></div>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" block onClick={() => go("order", order.id)}>Track Order</Button>
        <Button size="lg" block variant="secondary" onClick={() => go("order", order.id)}>View Order Details</Button>
      </div>
      <button onClick={() => go("menu")} className="mt-5 text-sm font-medium text-muted underline decoration-lime-deep decoration-2 underline-offset-2 hover:text-ink">
        Back to menu
      </button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted">{label}</span>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
