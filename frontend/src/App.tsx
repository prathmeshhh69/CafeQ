import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./lib/store";
import { Toaster } from "./components/ui";
import { Navbar, MobileBottomNav } from "./components/nav";
import { LoginPage, RegisterPage } from "./pages/Auth";
import { MenuPage } from "./pages/Menu";
import { CartPage } from "./pages/Cart";
import { CheckoutPage } from "./pages/Checkout";
import { ConfirmationPage } from "./pages/Confirmation";
import { OrdersPage, OrderDetailPage, AccountPage } from "./pages/Orders";
import { AdminApp } from "./pages/Admin";
import type { Order } from "./lib/data";

type Route =
  | "login" | "register" | "menu" | "home" | "cart" | "checkout"
  | "confirmation" | "orders" | "order" | "account" | "admin";

function routeFromLocation(): { route: Route; id: string | null } {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "order" && parts[1]) return { route: "order", id: parts[1] };
  const route = parts[0] as Route | undefined;
  const valid: Route[] = ["login", "register", "menu", "home", "cart", "checkout", "confirmation", "orders", "account", "admin"];
  return { route: route && valid.includes(route) ? route : "login", id: null };
}

function pathFor(route: Route, id?: string | null) {
  return route === "order" && id ? `/order/${encodeURIComponent(id)}` : `/${route}`;
}

function Shell() {
  const { user, authLoading } = useStore();
  const [route, setRoute] = useState<Route>(() => routeFromLocation().route);
  const [orderId, setOrderId] = useState<string | null>(() => routeFromLocation().id);
  const [placed, setPlaced] = useState<Order | null>(null);

  const go = (r: string, id?: string) => {
    const next = r as Route;
    if (id) setOrderId(id);
    setRoute(next);
    window.history.pushState(null, "", pathFor(next, id));
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const sync = () => {
      const location = routeFromLocation();
      setRoute(location.route);
      setOrderId(location.id);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const publicRoute = route === "login" || route === "register";
  const allowedRoute: Route = !user && !publicRoute ? "login"
    : user && publicRoute ? (user.role === "ADMIN" ? "admin" : "menu")
    : user?.role === "CUSTOMER" && route === "admin" ? "menu"
    : route === "confirmation" && !placed ? "orders"
    : route;
  useEffect(() => {
    if (authLoading || allowedRoute === route) return;
    setRoute(allowedRoute);
    window.history.replaceState(null, "", pathFor(allowedRoute));
  }, [authLoading, allowedRoute, route]);

  if (authLoading) return <div className="grid min-h-screen place-items-center text-muted">Loading CafeQ…</div>;

  if (allowedRoute === "login") return <><LoginPage go={go} /><Toaster /></>;
  if (allowedRoute === "register") return <><RegisterPage go={go} /><Toaster /></>;
  if (allowedRoute === "admin" && user?.role === "ADMIN") return <><AdminApp exit={() => go("menu")} /><Toaster /></>;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar route={allowedRoute} go={go} onSearch={() => go("menu")} />
      {allowedRoute === "menu" || allowedRoute === "home" ? <MenuPage openItem={null} /> : null}
      {allowedRoute === "cart" && <CartPage go={go} />}
      {allowedRoute === "checkout" && <CheckoutPage go={go} onPlaced={(o) => { setPlaced(o); go("confirmation"); }} />}
      {allowedRoute === "confirmation" && placed && <ConfirmationPage order={placed} go={go} />}
      {allowedRoute === "orders" && <OrdersPage go={go} />}
      {allowedRoute === "order" && orderId && <OrderDetailPage id={orderId} go={go} />}
      {allowedRoute === "account" && <AccountPage go={go} />}
      <MobileBottomNav route={allowedRoute} go={go} />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
