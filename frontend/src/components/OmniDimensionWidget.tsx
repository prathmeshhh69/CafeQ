import { useEffect } from "react";
import { useStore } from "../lib/store";

export function OmniDimensionWidget() {
  const { user } = useStore();

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") return;

    const existingScript = document.getElementById("omnidimension-web-widget");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "omnidimension-web-widget";
    script.async = true;
    script.src =
      "https://omnidim.io/web_widget.js?secret_key=018c4bf127ba6322e16a33a1c8d6cea5";
    document.body.appendChild(script);
  }, [user]);

  if (!user || user.role !== "CUSTOMER") return null;

  return (
    <section
      aria-labelledby="omnidimension-ordering-title"
      className="mx-auto mb-6 w-[min(100%-2rem,42rem)] rounded-3xl border border-orange/20 bg-cream px-5 py-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">
            AI ordering
          </p>
          <h2 id="omnidimension-ordering-title" className="mt-1 text-lg font-bold text-ink">
            OmniDimension assistant
          </h2>
          <p className="mt-1 text-sm text-muted">
            Use the assistant to explore the menu. Review and place orders through the authenticated CafeQ checkout.
          </p>
        </div>
      </div>
    </section>
  );
}
