import { useState } from "react";
import { Search, ShoppingBag, ChevronDown, LogOut, User, Receipt, Menu as MenuIcon, Home } from "lucide-react";
import { useStore } from "../lib/store";
import { CupDoodle } from "./Doodles";

export function Logo({ onClick, size = "md" }: { onClick?: () => void; size?: "sm" | "md" }) {
  return (
    <button onClick={onClick} className="group inline-flex items-center gap-2" aria-label="CafeQ home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime ring-2 ring-red transition-transform group-hover:-rotate-6">
        <CupDoodle className="text-[20px]" />
      </span>
      <span className={`font-hand font-bold tracking-tight ${size === "sm" ? "text-xl" : "text-2xl"}`}>
        Cafe<span className="text-orange">Q</span>
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
    <header className="sticky top-0 z-40 border-b border-red/30 bg-ink text-cream backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <Logo onClick={() => go("menu")} />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {link("menu", "Menu")}
          {link("orders", "My Orders")}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
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
