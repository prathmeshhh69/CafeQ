import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Card, EmptyState } from "../components/ui";
import { CartItem, RecommendationCard } from "../components/cards";
import { PlateDoodle, Sparkle } from "../components/Doodles";
import { money, type MenuItem } from "../lib/data";
import { recommendationsApi } from "../lib/recommendations-api";
import { useStore } from "../lib/store";

export function CartPage({ go }: { go: (r: string) => void }) {
  const { cart, subtotal, cartLoading, cartError, reloadCart, cartBusy } = useStore();
  const [recs, setRecs] = useState<MenuItem[]>([]);
  const cartIds = cart.map((line) => line.item.id).join(",");

  useEffect(() => {
    if (!cartIds) { setRecs([]); return; }
    const controller = new AbortController();
    recommendationsApi.get(cartIds.split(","), controller.signal)
      .then((items) => setRecs(items.filter((item) => item.available && !cartIds.split(",").includes(item.id))))
      .catch(() => { if (!controller.signal.aborted) setRecs([]); });
    return () => controller.abort();
  }, [cartIds]);

  if (cartLoading) return <div className="mx-auto max-w-[1280px] px-4 py-16 text-center text-muted">Loading your cart…</div>;
  if (cartError) return <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6"><Card className="mx-auto max-w-xl px-6">
    <EmptyState illustration={<PlateDoodle />} title="We couldn't load your cart." body={cartError}
      action={<Button onClick={() => { void reloadCart().catch(() => {}); }}>Try Again</Button>} />
  </Card></div>;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-xl px-6">
          <EmptyState
            illustration={<PlateDoodle />}
            title="Your cart looks hungry."
            body="Add something delicious from the menu."
            action={<Button onClick={() => go("menu")}>Browse Menu</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-hand text-4xl">Your Cart</h1>
      <p className="mt-1 text-muted">{cart.reduce((s, l) => s + l.qty, 0)} items ready for pickup.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Card className="divide-y divide-line px-5">
            {cart.map((l) => <CartItem key={l.item.id} item={l.item} qty={l.qty} />)}
          </Card>

          {/* Recommendations */}
          {recs.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-2">
                <h2 className="font-hand text-2xl">Complete your meal</h2>
                <Sparkle className="text-xl text-lime-deep" />
              </div>
              <p className="text-sm text-muted">These go pretty well together 👀</p>
              <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
                {recs.map((m) => <RecommendationCard key={m.id} item={m} />)}
              </div>
            </section>
          )}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <h2 className="font-semibold">Order Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-medium tabular-nums">{money(subtotal)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-muted">Pickup order — no delivery fee.</p>
            <Button size="lg" block className="mt-5" disabled={cartBusy} onClick={() => go("checkout")}>
              Choose Pickup Time <ArrowRight className="h-5 w-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
