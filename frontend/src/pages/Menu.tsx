import { useEffect, useMemo, useState } from "react";
import { Search, X, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { Button, Stars, EmptyState, Modal, QuantityStepper } from "../components/ui";
import { FoodCard, FoodCardSkeleton, ReviewCard } from "../components/cards";
import { Star, Sparkle, Heart, Arrow, CupDoodle, PlateDoodle } from "../components/Doodles";
import { money, type Category, type MenuItem, type Review } from "../lib/data";
import { asMenuItem, menuApi } from "../lib/menu-api";
import { asReview, reviewsApi } from "../lib/reviews-api";
import { useStore } from "../lib/store";
import { landingImages } from "../lib/landing-images";

const PAGE_SIZE = 8;

export function MenuPage({ openItem }: { openItem: MenuItem | null | undefined }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [seenCategories, setSeenCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [detail, setDetail] = useState<MenuItem | null>(openItem ?? null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (landingImages.length < 2) return;
    const timeout = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % landingImages.length);
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [activeSlide]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    menuApi.all(controller.signal).then((allItems) => {
      if (!controller.signal.aborted) {
        setAvailableCategories([...new Set(allItems.map((item) => item.category))]);
      }
    }).catch(() => {
      // The paginated request below still supplies the categories available on its current page.
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    menuApi.list({
      category: cat === "All" ? undefined : cat,
      search: debouncedQuery || undefined,
      page,
      limit: PAGE_SIZE,
    }, controller.signal).then((response) => {
      const next = response.menuItems.map(asMenuItem);
      setItems(next);
      setPageCount(Math.max(1, response.totalPages));
      setSeenCategories((prev) => [...new Set([...prev, ...next.map((item) => item.category)])]);
      if (page === 1 && cat === "All" && !debouncedQuery) setFeatured(next.filter((item) => item.available).slice(0, 4));
      void Promise.allSettled(next.map((item) => reviewsApi.average(item.id, controller.signal))).then((stats) => {
        if (controller.signal.aborted) return;
        const enriched = next.map((item, index) => {
          const result = stats[index];
          return result.status === "fulfilled" && result.value.totalReviews > 0
            ? { ...item, rating: result.value.averageRating, reviewCount: result.value.totalReviews } : item;
        });
        setItems(enriched);
        if (page === 1 && cat === "All" && !debouncedQuery) setFeatured(enriched.filter((item) => item.available).slice(0, 4));
      });
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the menu.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [cat, debouncedQuery, page, retry]);

  const categories = useMemo(() => ["All", ...(availableCategories.length ? availableCategories : seenCategories)], [availableCategories, seenCategories]);
  const safePage = Math.min(page, pageCount);
  const paged = items;
  const searching = query.trim().length > 0 || cat !== "All";

  const reset = () => { setQuery(""); setCat("All"); setPage(1); };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> Open · pickup from 12:00 PM
            </span>
            <h1 className="mt-4 font-hand text-5xl leading-[1.02] sm:text-6xl">
              Hungry?<br />Let's fix that.
            </h1>
            <p className="mt-3 max-w-md text-lg text-muted">Fresh favourites, ready when you are — pre-order and skip the wait.</p>
            <div className="mt-6 flex max-w-md items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 shadow-[0_2px_0_#e7ddc8]">
              <Search className="ml-2 h-5 w-5 flex-none text-muted" />
              <input
                value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search dishes, drinks, desserts…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted/70"
              />
              <Button onClick={() => document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth" })}>Explore Menu</Button>
            </div>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 z-10 text-ink">
              <Star className="absolute -left-2 top-4 text-[28px] text-orange -rotate-12" />
              <Sparkle className="absolute right-6 top-0 text-[34px] text-lime-deep" />
              <Heart className="absolute -right-1 bottom-16 text-[26px] text-red" />
              <Arrow className="absolute -bottom-2 left-10 text-[40px] text-ink" />
            </div>
            <div
              role="region"
              aria-roledescription="carousel"
              aria-label="Food highlights"
              className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[2.5rem] border-2 border-ink bg-cream shadow-[8px_8px_0_#181817]"
            >
              {landingImages.map((slide, index) => (
                <div
                  key={slide.name}
                  aria-hidden={index !== activeSlide}
                  className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
                >
                  <ImageWithFallback
                    src={slide.src}
                    alt={index === activeSlide ? slide.name : ""}
                    category={slide.name.includes("Lassi") ? "Lassi" : undefined}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {landingImages.length > 0 && (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent px-6 pb-6 pt-20 text-white">
                  <p className="text-xl font-bold drop-shadow-sm sm:text-2xl">{landingImages[activeSlide].name}</p>
                  <div className="flex gap-1.5" aria-label="Choose a food image">
                    {landingImages.map((slide, index) => (
                      <button
                        key={slide.name}
                        type="button"
                        aria-label={`Show ${slide.name}`}
                        aria-pressed={index === activeSlide}
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 shadow-lg">
              <CupDoodle className="text-[28px]" />
              <div className="text-xs"><p className="font-bold">Made fresh</p><p className="text-muted">ready for pickup</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        {/* Category pills */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {categories.map((c) => {
            const active = cat === c;
            return (
              <button key={c} onClick={() => { setCat(c as Category | "All"); setPage(1); }}
                className={`flex-none rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-lime-deep bg-lime text-ink" : "border-line bg-surface text-muted hover:text-ink"}`}>
                {c}
              </button>
            );
          })}
        </div>

        {/* Popular picks (only on unfiltered view) */}
        {!searching && (
          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="font-hand text-3xl">Today's Picks</h2>
              <span className="hidden text-sm text-muted sm:block">Fresh from the menu ✦</span>
            </div>
            {loading ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)}
              </div>
            ) : featured.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((m) => <FoodCard key={m.id} item={m} onOpen={setDetail} />)}
              </div>
            ) : null}
          </section>
        )}

        {/* Menu grid */}
        <section id="menu-grid" className="mt-12 scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-hand text-3xl">{searching ? "Search results" : "Explore the Menu"}</h2>
            {searching && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-muted hover:text-ink">
                <X className="h-4 w-4" /> Clear search
              </button>
            )}
          </div>

          {loading ? (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <EmptyState illustration={<PlateDoodle />} title="We couldn't load the menu."
              body={error} action={<Button onClick={() => setRetry((value) => value + 1)}>Try Again</Button>} />
          ) : paged.length === 0 ? (
            <EmptyState
              illustration={<PlateDoodle />}
              title="Nothing tasty matched that search."
              body="Try another dish or category."
              action={<Button onClick={reset}>Reset filters</Button>}
            />
          ) : (
            <>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((m) => <FoodCard key={m.id} item={m} onOpen={setDetail} />)}
              </div>
              {pageCount > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button disabled={safePage === 1} onClick={() => setPage((p) => p - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface disabled:opacity-40 hover:enabled:bg-cream">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`h-9 w-9 rounded-lg border text-sm font-semibold ${safePage === i + 1 ? "border-lime-deep bg-lime" : "border-line bg-surface hover:bg-cream"}`}>{i + 1}</button>
                  ))}
                  <button disabled={safePage === pageCount} onClick={() => setPage((p) => p + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface disabled:opacity-40 hover:enabled:bg-cream">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {detail && <ProductDetail item={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

function ProductDetail({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { qtyOf, add, cartBusy, user } = useStore();
  const [qty, setLocalQty] = useState(Math.max(1, qtyOf(item.id)));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setReviewsLoading(true);
    setReviewsError(null);
    Promise.all([reviewsApi.get(item.id, controller.signal), reviewsApi.average(item.id, controller.signal)])
      .then(([list, average]) => {
        setReviews(list.reviews.map((review) => asReview(review, user || undefined)));
        setRating({ average: average.averageRating, count: average.totalReviews });
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setReviewsError(error instanceof Error ? error.message : "Could not load reviews.");
      }).finally(() => { if (!controller.signal.aborted) setReviewsLoading(false); });
    return () => controller.abort();
  }, [item.id, user?.id, retry]);
  return (
    <Modal open onClose={onClose} className="max-w-4xl">
      <div className="relative">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-ink backdrop-blur hover:bg-cream" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-cream md:aspect-auto">
            <ImageWithFallback src={item.image} alt={item.name} category={item.category} className={`h-full w-full object-cover ${!item.available ? "saturate-0 opacity-70" : ""}`} />
            {item.popular && <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1 text-xs font-bold shadow">★ Popular pick</span>}
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-orange">{item.category}</span>
            <h2 className="mt-1 font-hand text-4xl">{item.name}</h2>
            {(rating?.count || item.reviewCount) ? <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Stars rating={rating?.average ?? item.rating ?? 0} /><span className="font-semibold text-ink">{rating?.average ?? item.rating}</span>
              <span>· {rating?.count ?? item.reviewCount} reviews</span>
            </div> : null}
            {item.description && <p className="mt-4 text-ink/90">{item.description}</p>}
            <p className="mt-4 text-3xl font-bold">{money(item.price)}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {item.available ? (
                <>
                  <QuantityStepper qty={qty} onDec={() => setLocalQty((q) => Math.max(1, q - 1))} onInc={() => setLocalQty((q) => q + 1)} />
                  <Button size="lg" className="flex-1" disabled={cartBusy} onClick={async () => {
                    if (await add(item, qty)) onClose();
                  }}>
                    <Plus className="h-5 w-5" /> Add to Cart · {money(item.price * qty)}
                  </Button>
                </>
              ) : (
                <div className="w-full rounded-xl bg-ink/5 p-3 text-center text-sm font-semibold text-muted">Currently unavailable — check back soon!</div>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="font-semibold">Customer Reviews</h3>
              {reviewsLoading ? <p className="mt-4 text-sm text-muted">Loading reviews…</p>
              : reviewsError ? <p className="mt-4 text-sm text-red">{reviewsError} <button onClick={() => setRetry((value) => value + 1)} className="underline">Try Again</button></p>
              : reviews.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-line bg-cream p-6 text-center">
                  <p className="font-hand text-xl">No reviews yet.</p>
                  <p className="text-sm text-muted">Be the first after trying it!</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
