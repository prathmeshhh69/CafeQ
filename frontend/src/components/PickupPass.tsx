import { QRCodeSVG } from "qrcode.react";
import { Check, QrCode } from "lucide-react";
import { formatPickupTime, type Order } from "../lib/data";
import CopyCode from "./CopyCode";
import { Card } from "./ui";

export default function PickupPass({ order }: { order: Order }) {
  const collected = order.pickupStatus === "PICKED_UP";
  const ready = order.status === "READY" && order.pickupStatus === "NOT_PICKED_UP";
  const collectedAt = formatPickupTime(order.pickedUpAt);
  const title = collected ? "Picked Up" : ready ? "Ready for Pickup" : "Pickup Code";

  return (
    <Card className={`overflow-hidden p-5 ${ready ? "border-orange/40 bg-orange/5" : "border-line bg-surface"}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-cream text-orange">
          {collected ? <Check className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
        </span>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Your counter pass</p><h2 className="font-hand text-2xl text-ink">{title}</h2></div>
      </div>
      {order.pickupCode ? <CopyCode code={order.pickupCode} label="Pickup code" /> : <p className="text-sm text-muted">No pickup code is available for this order.</p>}
      {ready && order.pickupCode && (
        <div className="mt-4">
          <div className="mx-auto w-fit max-w-full rounded-2xl border border-line bg-white p-2">
            <QRCodeSVG value={order.pickupCode} size={164} className="h-auto max-w-full" level="M" marginSize={4} title={`Pickup code ${order.pickupCode}`} />
          </div>
          <p className="mt-3 text-center text-sm text-muted">Show this code at the counter to collect your order.</p>
        </div>
      )}
      {collected ? (
        <p className="mt-3 text-sm text-muted">{collectedAt ? `Collected on ${collectedAt}.` : "Your order has been collected."}</p>
      ) : !ready ? (
        <p className="mt-3 text-sm text-muted">{order.status === "CANCELLED" ? "This order was cancelled and cannot be collected." : order.status === "COMPLETED" ? "This order is completed." : order.status === "READY" ? "Pickup availability has not been confirmed. Refresh the order details." : "Your order is not ready yet. Your pickup pass will appear when it is ready."}</p>
      ) : !order.pickupCode ? <p className="mt-3 text-sm text-muted">Please ask the counter staff for help with collection.</p> : null}
    </Card>
  );
}
