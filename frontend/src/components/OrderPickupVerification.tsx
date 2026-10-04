import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, PackageCheck } from "lucide-react";
import { adminOrdersApi, type VerifiedPickup } from "../lib/admin-orders-api";
import { formatPickupTime, type Order } from "../lib/data";
import { useStore } from "../lib/store";
import { Button, Input } from "./ui";

type OrderUpdate = Partial<Pick<Order, "status" | "pickupStatus" | "pickedUpAt">>;

export default function OrderPickupVerification({ order, disabled, onOrderUpdate, onBusyChange }: {
  order: Order;
  disabled: boolean;
  onOrderUpdate: (id: string, update: OrderUpdate) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const { user, toast } = useStore();
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState<VerifiedPickup | null>(null);
  const [pending, setPending] = useState<"verify" | "handover" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const collected = order.pickupStatus === "PICKED_UP";
  const canVerify = order.status === "READY" && order.pickupStatus === "NOT_PICKED_UP";
  const canHandover = canVerify && verified?._id === order.id && verified.pickupCode === code.trim();

  useEffect(() => () => {
    requestRef.current?.abort();
    onBusyChange(false);
  }, [onBusyChange]);

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || !canVerify || requestRef.current || user?.role !== "ADMIN") return;
    const pickupCode = code.trim();
    setVerified(null);
    setError(null);
    if (!pickupCode) {
      setError("Enter the pickup code provided by the customer.");
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setPending("verify");
    onBusyChange(true);
    try {
      const response = await adminOrdersApi.verifyPickup(pickupCode, controller.signal);
      if (controller.signal.aborted) return;
      if (response.order._id !== order.id) {
        throw new Error("This pickup code belongs to a different order.");
      }
      setVerified(response.order);
      toast("Pickup code verified for this order.");
    } catch (reason) {
      if (controller.signal.aborted) return;
      const message = reason instanceof Error ? reason.message : "Could not verify this pickup code.";
      setError(message);
      toast(message, "error");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        if (!controller.signal.aborted) { setPending(null); onBusyChange(false); }
      }
    }
  };

  const handover = async () => {
    if (disabled || !canHandover || !verified || requestRef.current || user?.role !== "ADMIN") return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending("handover");
    setError(null);
    onBusyChange(true);
    try {
      const response = await adminOrdersApi.markPickedUp(verified.pickupCode, controller.signal);
      if (controller.signal.aborted) return;
      if (response.order._id !== order.id) {
        throw new Error("The pickup response belongs to a different order. Please verify again.");
      }
      onOrderUpdate(order.id, { pickupStatus: response.order.pickupStatus, pickedUpAt: response.order.pickedUpAt });
      setVerified(null);
      toast(response.message);
    } catch (reason) {
      if (controller.signal.aborted) return;
      setVerified(null);
      const message = reason instanceof Error ? reason.message : "Could not record this pickup.";
      setError(message);
      toast(message, "error");
      // A lost response or another staff member's handover can change the order.
      // Reconcile with the existing order endpoint and require verification again.
      try {
        const current = await adminOrdersApi.get(order.id);
        if (!controller.signal.aborted && current.order._id === order.id) {
          onOrderUpdate(order.id, { status: current.order.orderStatus,
            pickupStatus: current.order.pickupStatus, pickedUpAt: current.order.pickedUpAt });
        }
      } catch { /* Keep the backend error visible if reconciliation also fails. */ }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        if (!controller.signal.aborted) { setPending(null); onBusyChange(false); }
      }
    }
  };

  if (user?.role !== "ADMIN") return null;
  if (collected) {
    const collectedAt = formatPickupTime(order.pickedUpAt);
    return (
      <section className="mt-5 rounded-2xl border border-line bg-cream p-4" role="status" aria-label="Pickup status">
        <h3 className="flex items-center gap-2 font-semibold"><PackageCheck className="h-5 w-5 text-orange" /> Picked Up</h3>
        {collectedAt && <p className="mt-2 text-sm text-muted">Picked up at: {collectedAt}</p>}
      </section>
    );
  }
  if (!canVerify) return null;

  return (
    <section className="mt-5 rounded-2xl border border-line bg-cream p-4" aria-label="Verify pickup for this order">
      <h3 className="font-semibold">Verify Pickup Code</h3>
      <p className="mt-1 text-xs text-muted">Ask the customer for this order's pickup code before handing it over.</p>
      <form className="mt-4 space-y-3" onSubmit={(event) => { void verify(event); }} aria-busy={!!pending}>
        <Input label="Customer-provided pickup code" value={code} disabled={disabled || !!pending}
          onChange={(event) => {
            if (requestRef.current) return;
            setCode(event.target.value);
            setVerified(null);
            setError(null);
          }}
          placeholder="Enter the customer's code" autoComplete="off" autoCapitalize="characters" spellCheck={false}
          className="font-mono font-semibold" aria-describedby={error ? "order-pickup-error" : undefined} />
        <Button type="submit" block disabled={disabled || !!pending || !code.trim()} loading={pending === "verify"}>Verify Pickup</Button>
      </form>
      {error && <p id="order-pickup-error" role="alert" className="mt-3 text-sm text-red">{error}</p>}
      {canHandover ? (
        <div className="mt-4 space-y-3">
          <div role="status" className="rounded-xl border border-orange/25 bg-surface p-3 text-sm">
            <p className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-orange" /> Pickup Code Verified</p>
            {verified.customerCode && <p className="mt-1 text-xs text-muted">Customer Code: <span className="font-mono">{verified.customerCode}</span></p>}
          </div>
          <Button type="button" block disabled={disabled || !!pending} loading={pending === "handover"} onClick={() => { void handover(); }}>Mark as Picked Up</Button>
        </div>
      ) : <p className="mt-3 text-xs text-muted">Pickup-code verification is required before handover or completion.</p>}
    </section>
  );
}
