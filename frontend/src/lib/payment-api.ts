import { apiRequest } from "./api";
import type { AuthUser } from "./auth-api";

interface PaymentOrder { orderId: string; amount: number; currency: string; keyId: string; }
interface CheckoutSuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
type CheckoutResult = { kind: "success"; response: CheckoutSuccess }
  | { kind: "cancelled" } | { kind: "failed"; message: string };

interface CheckoutInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (event: { error?: { description?: string } }) => void) => void;
}
type CheckoutConstructor = new (options: {
  key: string; amount: number; currency: string; name: string; order_id: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: CheckoutSuccess) => void;
  modal: { ondismiss: () => void };
}) => CheckoutInstance;

declare global { interface Window { Razorpay?: CheckoutConstructor } }

let checkoutScript: Promise<void> | null = null;

async function loadCheckout() {
  if (window.Razorpay) return;
  if (!checkoutScript) checkoutScript = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Razorpay Checkout did not load."));
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.head.appendChild(script);
  }).catch((error) => { checkoutScript = null; throw error; });
  await checkoutScript;
}

export const paymentApi = {
  createOrder: (orderId: string) => apiRequest<PaymentOrder>("/api/payment/createpaymentorder", {
    method: "POST", body: { orderId },
  }),
  verify: (response: CheckoutSuccess) => apiRequest<{ message: string }>("/api/payment/verifypayment", {
    method: "POST", body: response,
  }),
  async open(order: PaymentOrder, user: AuthUser): Promise<CheckoutResult> {
    const key = order.keyId;
    if (!key) throw new Error("Online payment is not configured on the server.");
    await loadCheckout();
    const Razorpay = window.Razorpay;
    if (!Razorpay) throw new Error("Razorpay Checkout did not load.");
    return new Promise<CheckoutResult>((resolve) => {
      let failure: string | null = null;
      const checkout = new Razorpay({
        key, amount: order.amount, currency: order.currency, name: "CafeQ", order_id: order.orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        handler: (response) => resolve({ kind: "success", response }),
        modal: { ondismiss: () => resolve(failure ? { kind: "failed", message: failure } : { kind: "cancelled" }) },
      });
      checkout.on("payment.failed", (event) => { failure = event.error?.description || "Payment failed. Please try again."; });
      checkout.open();
    });
  },
};
