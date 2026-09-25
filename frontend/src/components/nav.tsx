import { useState } from "react";
import { Search, ShoppingBag, ChevronDown, LogOut, User, Receipt, Menu as MenuIcon, Home } from "lucide-react";
import { useStore } from "../lib/store";
import { CupDoodle } from "./Doodles";

export function Logo({ onClick, size = "md" }: { onClick?: () => void; size?: "sm" | "md" }) {
  return (
    <button onClick={onClick} className="group inline-flex items-center gap-2" aria-label="CafeQ home">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#c6a875]/60 bg-[#33251c] text-[#e8bd72] ring-1 ring-[#8c6744]/70 transition-transform group-hover:-rotate-6">
        <CupDoodle className="text-[20px]" />
      </span>
      <span className={`font-hand font-bold tracking-tight ${size === "sm" ? "text-xl" : "text-2xl"}`}>
        <span className="text-[#fff4df]">Cafe</span><span className="text-[#e8bd72]">Q</span>
      </span>
    </button>
  );
}

type Route = string;
export function Navbar({
  route, go, onSearch,
}: { route: Route; go: (r: Route) => void; onSearch?: () => void }) {
  const { cartCount, user, logout, toast } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const link = (r: string, label: string) => {
    const active = route === r || (r === "menu" && route === "home");
    return (
      <button
        onClick={() => go(r)}
        className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "text-cream" : "text-cream/70 hover:text-cream"}`}
      >
        {label}
        {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-lime-deep" />}
      </button>
    );
  };
  return (
    <header className="sticky top-0 z-40 border-b border-[#8c6744]/60 bg-[#17120f] text-[#fff4df] shadow-[0_4px_18px_rgba(25,18,12,0.16)]">
      <div className="pointer-events-none absolute inset-x-0 top-1 mx-auto hidden h-[calc(100%-8px)] max-w-[1320px] rounded-[18px] border border-[#c6a875]/35 md:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden h-full overflow-hidden md:block">
        <svg viewBox="0 0 120 28" className="absolute left-8 top-0 h-7 w-24 text-[#c6a875]/80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M1 2h30c8 0 8 10 1 10-5 0-5-7 0-7 8 0 8 16 18 16s10-15 19-15c7 0 7 9 1 9-4 0-4-6 0-6 7 0 7 10 18 10h30"/><path d="M8 6c8 0 8 15 16 15 5 0 6-4 9-7m37 4c8 0 8-14 16-14"/></svg>
        <svg viewBox="0 0 120 28" className="absolute right-8 top-0 h-7 w-24 -scale-x-100 text-[#c6a875]/80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M1 2h30c8 0 8 10 1 10-5 0-5-7 0-7 8 0 8 16 18 16s10-15 19-15c7 0 7 9 1 9-4 0-4-6 0-6 7 0 7 10 18 10h30"/><path d="M8 6c8 0 8 15 16 15 5 0 6-4 9-7m37 4c8 0 8-14 16-14"/></svg>
        <svg viewBox="0 0 160 20" className="absolute bottom-0 left-1/2 h-5 w-40 -translate-x-1/2 text-[#c6a875]/80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M1 2h48c9 0 8 13 0 13-6 0-6-8 0-8 7 0 9 10 17 10s10-13 14-13 6 9 0 9-6-9 0-9 7 13 15 13 10-10 17-10c6 0 6 8 0 8-8 0-9-13 0-13h47"/><path d="M74 2c-2 6 10 6 6 13m7-13c2 6-10 6-6 13"/></svg>
      </div>
      <div className="relative mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6 md:h-[72px] md:gap-4">
        <Logo onClick={() => go("menu")} />
        <span className="hidden border-l border-[#c6a875]/40 pl-4 text-[10px] font-medium uppercase tracking-[0.16em] text-[#d4c2a4] lg:block">Curated coffee. Artisanal shawarma. Local bites.</span>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {link("menu", "Menu")}
          {link("orders", "My Orders")}
        </nav>
        <div className="flex items-center gap-1.5 md:ml-2">
          <button onClick={onSearch} className="hidden h-10 w-10 place-items-center rounded-xl text-cream/70 hover:bg-white/10 hover:text-cream sm:grid" aria-label="Search menu">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={() => go("cart")} className="relative grid h-10 w-10 place-items-center rounded-xl text-cream hover:bg-white/10" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[11px] font-bold text-ink ring-2 ring-ink">
                {cartCount}
              </span>
            )}
          </button>
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 hover:bg-white/10">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange/90 text-sm font-bold text-ink">
                  {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <span className="hidden text-sm font-medium lg:block">{user.name.split(" ")[0]}</span>
                <ChevronDown className="hidden h-4 w-4 text-cream/70 lg:block" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl animate-pop">
                    <MenuRow icon={<Receipt className="h-4 w-4" />} label="My Orders" onClick={() => { go("orders"); setMenuOpen(false); }} />
                    <MenuRow icon={<User className="h-4 w-4" />} label="Account" onClick={() => { go("account"); setMenuOpen(false); }} />
                    <div className="my-1 h-px bg-line" />
                    <MenuRow icon={<LogOut className="h-4 w-4" />} label="Logout" danger onClick={async () => {
                      setMenuOpen(false);
                      try { await logout(); go("login"); }
                      catch (error) { toast(error instanceof Error ? error.message : "Could not log out.", "error"); }
                    }} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => go("login")} className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-deep">Log In</button>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuRow({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${danger ? "text-red hover:bg-red/10" : "text-ink hover:bg-cream"}`}>
      {icon}{label}
    </button>
  );
}

export function MobileBottomNav({ route, go }: { route: Route; go: (r: Route) => void }) {
  const { cartCount } = useStore();
  const items = [
    { r: "menu", label: "Menu", icon: Home },
    { r: "cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
    { r: "orders", label: "Orders", icon: Receipt },
    { r: "account", label: "Profile", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-red/30 bg-ink/95 text-cream backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ r, label, icon: Icon, badge }) => {
          const active = route === r || (r === "menu" && route === "home");
          return (
            <button key={r} onClick={() => go(r)} className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${active ? "text-lime" : "text-cream/65"}`}>
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                {!!badge && badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-ink">{badge}</span>
                )}
              </span>
              {label}
              {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-lime-deep" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { MenuIcon };
