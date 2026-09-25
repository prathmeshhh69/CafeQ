import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Sparkles, Flame, Clock, Star as LucideStar, ChevronLeft, ChevronRight, Dices, X, Coffee, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { ImageWithFallback } from "../lib/ImageWithFallback";
import { Button } from "./ui";
import { Star, Sparkle, CupDoodle, PlateDoodle, DoodleField, CafeBaristaDoodle } from "./Doodles";
import { money, type MenuItem } from "../lib/data";

interface HeroSectionProps {
  query: string;
  setQuery: (q: string) => void;
  onSearchSubmit: () => void;
  onSelectCategory?: (cat: string) => void;
  heroItems: MenuItem[];
  heroItem: MenuItem | null;
  landingImages: { name: string; src: string }[];
  activeSlide: number;
  setActiveSlide: (index: number | ((prev: number) => number)) => void;
  onOpenDetail: (item: MenuItem) => void;
  reduceMotion: boolean | null;
  allItems?: MenuItem[];
}

const BARISTA_QUOTES = [
  "Welcome! Fresh batches are sizzling right now! 🔥",
  "Psst... The Paneer Tikka is an absolute crowd favourite today! 🍢",
  "Our cold brew is steeped for 18 hours. Pure magic! ☕✨",
  "Pre-order now & walk in like a VIP — zero queues! ⚡",
  "Can't choose? Tap 'Surprise Me!' for a tasty mystery! 🎲",
];

const CRAVING_TAGS = [
  { label: "Paneer Tikka", emoji: "🍢", query: "Tikka" },
  { label: "Cold Brew", emoji: "☕", query: "Coffee" },
  { label: "Shawarma", emoji: "🌯", query: "Shawarma" },
  { label: "Mango Lassi", emoji: "🥭", query: "Lassi" },
  { label: "Gulab Jamun", emoji: "🍯", query: "Dessert" },
];

const TICKER_ITEMS = [
  "☕ 100% ARTISANAL ARABICA",
  "🍢 SIZZLING CHARCOAL TIKKAS",
  "⚡ READY IN 12-15 MINS",
  "🌯 HAND-ROLLED SHAWARMAS",
  "⭐ 4.9 RATED BY 2,500+ FOODIES",
  "🥐 FRESH BATCHES OUT HOURLY",
  "🛵 PRE-ORDER & SKIP EVERY QUEUE",
  "🧀 MELTY GOURMET BITES",
];

export function HeroSection({
  query,
  setQuery,
  onSearchSubmit,
  onSelectCategory,
  heroItems,
  heroItem,
  landingImages,
  activeSlide,
  setActiveSlide,
  onOpenDetail,
  reduceMotion,
  allItems = [],
}: HeroSectionProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mascotWiggle, setMascotWiggle] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayList = heroItems.length > 0 ? heroItems : landingImages;
  const count = displayList.length;

  const currentDisplayItem = heroItems.length > 0 && heroItem ? heroItem : null;
  const currentFallback = landingImages.length > 0 ? landingImages[activeSlide % landingImages.length] : null;

  // Cycle barista quotes every 6 seconds
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % BARISTA_QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const showNextSlide = (direction: number) => {
    if (count > 0) {
      setActiveSlide((curr) => (curr + direction + count) % count);
    }
  };

  const handleBaristaClick = () => {
    setMascotWiggle(true);
    setQuoteIndex((prev) => (prev + 1) % BARISTA_QUOTES.length);
    setTimeout(() => setMascotWiggle(false), 600);
  };

  const handleTagClick = (tagQuery: string) => {
    setQuery(tagQuery);
    onSearchSubmit();
  };

  const handleSurpriseMe = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
        colors: ["#b94b20", "#ffa040", "#f59e0b", "#10b981", "#ffedd5"],
      });
    } catch {
      // Confetti fallback
    }

    // Roulette spin effect
    const candidatePool = allItems.length > 0 ? allItems : heroItems;
    let iterations = 0;
    const maxIterations = 10;
    const interval = setInterval(() => {
      iterations += 1;
      setActiveSlide((curr) => (curr + 1) % (count || 1));
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsSpinning(false);
        if (candidatePool.length > 0) {
          const randomIndex = Math.floor(Math.random() * candidatePool.length);
          const chosen = candidatePool[randomIndex];
          onOpenDetail(chosen);
        } else if (heroItem) {
          onOpenDetail(heroItem);
        }
      }
    }, 110);
  };

  return (
    <section className="relative isolate overflow-hidden border-b border-[#d8c2a3] bg-gradient-to-b from-[#fdf7ec] via-[#faeed4] to-[#f6e6c4]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 top-0 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#f59e0b]/15 via-[#ea580c]/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-12 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-[#ea580c]/20 via-[#f59e0b]/15 to-transparent blur-3xl" />
      
      {/* Floating doodles */}
      <DoodleField className="opacity-[0.22] [&_svg]:text-[#714d32]" />

      <div className="relative mx-auto max-w-[1320px] px-4 pb-14 pt-8 sm:px-6 sm:pb-16 md:py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          
          {/* LEFT COLUMN: High-energy copy, badge, search, CTA */}
          <motion.div
            className="relative z-10 flex flex-col"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Live Cafe Kitchen Pulse Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#b95b2a]/30 bg-gradient-to-r from-[#fff7ed] to-[#ffedd5] px-3.5 py-1.5 text-xs font-bold text-[#8c3513] shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ea580c] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#b94b20]" />
                </span>
                <span>OPEN NOW</span>
                <span className="text-[#bcaa8c]">&middot;</span>
                <span className="flex items-center gap-1 text-[#78350f]">
                  <Flame className="h-3.5 w-3.5 text-[#ea580c]" /> Live Kitchen Sizzling
                </span>
              </span>

              <span className="hidden items-center gap-1.5 rounded-full border border-[#d8c2a3] bg-[#fffcf5]/80 px-3 py-1 text-xs font-medium text-[#654d39] backdrop-blur-sm sm:inline-flex">
                <Clock className="h-3 w-3 text-[#b95b2a]" /> Pickup in ~12 mins
              </span>
            </div>

            {/* Main Headline */}
            <div className="relative mt-5">
              <h1 className="font-hand text-[3.6rem] font-bold leading-[0.92] tracking-tight text-[#1a120c] sm:text-6xl lg:text-[4.75rem]">
                Hungry?
                <br />
                <span className="relative inline-block font-sans text-[0.74em] font-extrabold tracking-[-0.05em] text-[#1c140d]">
                  Let's fix that
                  <span className="bg-gradient-to-r from-[#b94b20] via-[#ea580c] to-[#d97706] bg-clip-text text-transparent">
                    .
                  </span>
                  {/* Playful brush underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-[#ea580c]/60"
                    viewBox="0 0 250 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 11C60 3 170 3 247 9"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <Sparkles className="pointer-events-none absolute -right-2 top-2 h-7 w-7 text-[#d97706] sm:right-16 lg:right-24 animate-pulse" />
            </div>

            {/* Subheading */}
            <p className="mt-5 max-w-xl text-base leading-7 text-[#544335] sm:text-lg">
              Fresh favourites, artisan brews &amp; sizzling charcoal tikkas ready when you are &mdash;{" "}
              <span className="font-semibold text-[#8c3513]">pre-order in seconds and skip every queue.</span>
            </p>

            {/* Search Bar with glowing focus */}
            <div className="mt-7 max-w-[530px]">
              <motion.div
                className="group relative flex items-center gap-3 rounded-full border-2 border-[#cbb79a] bg-[#fffefb] p-1.5 pl-4 shadow-[0_4px_12px_rgba(100,60,25,0.08)] transition-all focus-within:border-[#b94b20] focus-within:shadow-[0_0_0_4px_rgba(185,75,32,0.18)]"
                whileFocus={{ scale: 1.01 }}
              >
                <Search className="h-5 w-5 flex-none text-[#8c745e] transition-colors group-focus-within:text-[#b94b20]" />
                <input
                  ref={searchInputRef}
                  aria-label="Search dishes, drinks, desserts"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearchSubmit();
                  }}
                  placeholder="Search dishes, drinks, desserts..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-[#1c140d] outline-none placeholder:text-[#96826e]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full bg-[#f2e2cb] text-[#5c4633] hover:bg-[#e7d1b3]"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onSearchSubmit}
                  className="hidden rounded-full bg-[#b94b20] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#a33f18] sm:inline-flex"
                >
                  Find
                </button>
              </motion.div>

              {/* Trending Craving Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[#6e5642]">
                <span className="flex items-center gap-1 font-bold text-[#984c1f]">
                  <Flame className="h-3.5 w-3.5 text-[#ea580c]" /> Popular:
                </span>
                {CRAVING_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => handleTagClick(tag.query)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#dbcaa7] bg-[#fffaf0] px-2.5 py-1 text-xs font-semibold text-[#543f2e] transition-all hover:border-[#b94b20] hover:bg-[#ffedd5] hover:text-[#8c3513] hover:scale-105 active:scale-95"
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Explore Menu + Surprise Me */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden rounded-full border border-[#76351d] bg-gradient-to-r from-[#b94b20] via-[#c45222] to-[#b94b20] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[#fff6e8] shadow-[0_5px_0_#6e321e] transition-all hover:bg-[#a9411c] hover:shadow-[0_6px_0_#6e321e]"
                  onClick={onSearchSubmit}
                >
                  {/* Glossy sweep */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center">
                    Explore menu
                    <span className="mx-1.5 text-[#fcd34d]">&mdash;</span>
                    discover flavors
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  disabled={isSpinning}
                  className="group flex items-center gap-2 rounded-full border border-[#bfa682] bg-gradient-to-b from-[#fffcf5] to-[#f4e6ce] px-5 py-3 text-sm font-bold text-[#5c3e26] shadow-[0_3px_0_#baa281] transition-all hover:border-[#b94b20] hover:bg-[#fff7ea] hover:text-[#8c3513] disabled:opacity-75"
                >
                  <Dices className={`h-4 w-4 text-[#ea580c] transition-transform ${isSpinning ? "animate-spin" : "group-hover:rotate-45"}`} />
                  <span>{isSpinning ? "Picking..." : "🎲 Surprise Me!"}</span>
                </button>
              </motion.div>
            </div>

            {/* Social proof & customer love strip */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#d8c2a3]/70 pt-5 text-xs text-[#6e5845]">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fffaf0] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Customer" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fffaf0] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Customer" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fffaf0] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Customer" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fffaf0] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="Customer" />
              </div>

              <div>
                <div className="flex items-center gap-1 text-[#ea580c]">
                  {[...Array(5)].map((_, i) => (
                    <LucideStar key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-1 font-bold text-[#1f1610]">4.9 / 5.0</span>
                </div>
                <p className="text-[11px] text-[#78614d]">Loved by 2,500+ campus &amp; city foodies</p>
              </div>

              <div className="hidden h-5 w-px bg-[#cbb79a] md:block" />

              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex items-center gap-1 font-medium text-[#5c4633]">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-[#b94b20]" /> 100% Artisanal
                </span>
                <span className="text-[#bcaa8c]">&middot;</span>
                <span className="flex items-center gap-1 font-medium text-[#5c4633]">
                  <Coffee className="h-3.5 w-3.5 text-[#b94b20]" /> Handcrafted Brews
                </span>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: 3D Floating Food Showcase & Interactive Barista */}
          <motion.div
            className="relative mx-auto w-full max-w-[620px]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            {/* Ambient food backdrop glow */}
            <div className="absolute -inset-3 -z-10 rounded-[44px] bg-gradient-to-tr from-[#ea580c]/30 via-[#f59e0b]/20 to-transparent blur-2xl" />

            {/* Decorative Stars */}
            <Star className="pointer-events-none absolute -left-6 top-8 z-30 hidden rotate-[-10deg] text-[32px] text-[#945b33] sm:block animate-float-slow" />
            <Sparkle className="pointer-events-none absolute -top-4 right-8 z-30 hidden text-[30px] text-[#9c713f] sm:block animate-float-reverse" />

            {/* Main Food Showcase Box */}
            <div className="relative overflow-hidden rounded-[36px] border-[5px] border-[#211912] bg-[#f2e4ce] shadow-[10px_12px_0_#be9d72] sm:aspect-[1.38/1] aspect-[1.25/1]">
              <AnimatePresence mode="wait">
                {currentDisplayItem ? (
                  <motion.div
                    key={currentDisplayItem.id}
                    className="group relative h-full w-full cursor-pointer"
                    onClick={() => onOpenDetail(currentDisplayItem)}
                    initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.38 }}
                  >
                    <ImageWithFallback
                      src={currentDisplayItem.image}
                      alt={currentDisplayItem.name}
                      category={currentDisplayItem.category}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradient Scrim for readable overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#140d08]/95 via-[#140d08]/50 to-transparent px-5 pb-5 pt-20 text-white">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#ffa040] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1a120b]">
                          {currentDisplayItem.category}
                        </span>
                        {currentDisplayItem.rating && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-[#fef08a]">
                            <LucideStar className="h-3 w-3 fill-current" /> {currentDisplayItem.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl">
                        {currentDisplayItem.name}
                      </h3>

                      {/* Bottom action row with price & controls */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-extrabold text-[#fed7aa] sm:text-2xl">
                            {money(currentDisplayItem.price)}
                          </span>
                          <span className="text-[11px] text-[#fed7aa]/80">freshly prepared</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded-full bg-[#1b130e]/80 p-0.5 backdrop-blur-md border border-white/10 shadow">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showNextSlide(-1);
                              }}
                              aria-label="Previous highlight"
                              className="grid h-7 w-7 place-items-center rounded-full bg-[#fff8e9] text-[#211912] hover:scale-105 active:scale-95 transition-transform"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-9 text-center text-xs font-bold text-white">
                              {(activeSlide % Math.max(count, 1)) + 1}/{count || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showNextSlide(1);
                              }}
                              aria-label="Next highlight"
                              className="grid h-7 w-7 place-items-center rounded-full bg-[#fff8e9] text-[#211912] hover:scale-105 active:scale-95 transition-transform"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetail(currentDisplayItem);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-[#b94b20] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-[#a33f18] transition-colors"
                          >
                            Order <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : currentFallback ? (
                  <motion.div
                    key={currentFallback.name}
                    className="relative h-full w-full"
                    initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.38 }}
                  >
                    <ImageWithFallback
                      src={currentFallback.src}
                      alt={currentFallback.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#140d08]/95 via-[#140d08]/50 to-transparent px-5 pb-5 pt-20 text-white">
                      <h3 className="text-2xl font-bold sm:text-3xl">{currentFallback.name}</h3>
                      <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                        <p className="text-xs text-[#fed7aa]">Freshly prepared by CafeQ Chef</p>
                        <div className="flex items-center gap-1 rounded-full bg-[#1b130e]/80 p-0.5 backdrop-blur-md border border-white/10 shadow">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              showNextSlide(-1);
                            }}
                            aria-label="Previous highlight"
                            className="grid h-7 w-7 place-items-center rounded-full bg-[#fff8e9] text-[#211912] hover:scale-105 active:scale-95 transition-transform"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-9 text-center text-xs font-bold text-white">
                            {(activeSlide % Math.max(count, 1)) + 1}/{count || 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              showNextSlide(1);
                            }}
                            aria-label="Next highlight"
                            className="grid h-7 w-7 place-items-center rounded-full bg-[#fff8e9] text-[#211912] hover:scale-105 active:scale-95 transition-transform"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid h-full place-items-center text-[#725b42]">
                    <PlateDoodle className="text-8xl" />
                  </div>
                )}
              </AnimatePresence>

              {/* Floating Top-Left Tag: Sizzling Hot */}
              <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1f1610]/75 px-3 py-1 text-xs font-bold text-[#fef08a] backdrop-blur-md shadow">
                <Flame className="h-3.5 w-3.5 text-[#f97316] animate-pulse" />
                <span>Chef's Highlight</span>
              </div>

              {/* Floating Top-Right: Fast Prep Badge */}
              <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full border border-white/20 bg-[#1f1610]/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md shadow">
                <Clock className="h-3 w-3 text-[#38bdf8]" />
                <span>12 min ready</span>
              </div>
            </div>

            {/* Floating Tag Badge: Made fresh to order (Floating cleanly at top-left edge) */}
            <motion.div
              className="absolute -top-4 -left-3 sm:-left-5 z-30 flex items-center gap-2 rounded-2xl border border-[#cbb995] bg-[#fffaf0] px-3 py-1.5 shadow-[0_8px_20px_rgba(44,32,20,0.16)]"
              animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#f8ecd5] to-[#ebd2aa] text-[#765037] shadow-inner">
                <CupDoodle className="text-[20px]" />
              </span>
              <div className="text-[11px] leading-tight">
                <p className="font-extrabold text-[#241a13]">Made fresh to order</p>
                <p className="text-[#70604e]">Piping hot &middot; zero queue</p>
              </div>
            </motion.div>

            {/* Interactive Thumbnail Carousel Strip */}
            {count > 1 && (
              <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {displayList.slice(0, 5).map((item, idx) => {
                  const isActive = activeSlide % count === idx;
                  const name = "name" in item ? item.name : `Item ${idx + 1}`;
                  const imageSrc = "image" in item ? item.image : "src" in item ? (item as { src: string }).src : "";
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`group flex items-center gap-2 rounded-2xl border px-3 py-1.5 transition-all ${
                        isActive
                          ? "border-[#b94b20] bg-[#fffaf0] ring-2 ring-[#b94b20]/30 shadow-md scale-102"
                          : "border-[#d8c2a3] bg-[#fffcf5]/80 hover:border-[#b94b20] hover:bg-[#fffaf0]"
                      }`}
                    >
                      <div className="h-7 w-7 overflow-hidden rounded-lg bg-[#e8d7be]">
                        <img src={imageSrc} alt={name} className="h-full w-full object-cover" />
                      </div>
                      <span className={`max-w-[85px] truncate text-xs font-bold ${isActive ? "text-[#8c3513]" : "text-[#544335]"}`}>
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Interactive Cafe Barista Mascot with Speech Bubble */}
            <div className="absolute -bottom-8 -right-4 z-20 hidden sm:block lg:-right-10">
              {/* Dynamic Speech Bubble */}
              <motion.div
                className="absolute -top-14 right-4 z-30 max-w-[210px] cursor-pointer rounded-2xl border-2 border-[#5b3526] bg-[#fffdfa] p-2.5 shadow-[0_6px_14px_rgba(40,25,15,0.18)]"
                onClick={handleBaristaClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={mascotWiggle ? { rotate: [-2, 2, -2, 0], scale: [1, 1.08, 1] } : undefined}
              >
                <p className="text-[11px] font-bold leading-snug text-[#4a2818]">
                  {BARISTA_QUOTES[quoteIndex]}
                </p>
                <span className="mt-0.5 block text-[9px] font-semibold text-[#a85a2a]">
                  👉 Click for barista tips!
                </span>
                {/* Speech triangle */}
                <div className="absolute -bottom-2 right-10 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-[#5b3526]" />
                <div className="absolute -bottom-[6px] right-[41px] h-0 w-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-[#fffdfa]" />
              </motion.div>

              {/* Barista Doodle */}
              <motion.div
                className="cursor-pointer"
                onClick={handleBaristaClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <CafeBaristaDoodle className="w-[140px] drop-shadow-[4px_6px_3px_rgba(31,20,14,0.28)] lg:w-[185px]" />
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* INFINITE MARQUEE TICKER TAPE AT BASE OF HERO */}
      <div className="relative overflow-hidden border-t border-[#d8c2a3] bg-[#211812] py-2.5 text-white shadow-inner">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((text, idx) => (
            <div key={idx} className="mx-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#fed7aa]">
              <span>{text}</span>
              <span className="text-[#ea580c]">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
