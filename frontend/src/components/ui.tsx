import { useEffect } from "react";
import {
  Check, X, Minus, Plus, Star as StarIcon, AlertTriangle, Loader2, Info,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "../lib/data";

// ---------- Button ----------
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
};
export function Button({
  variant = "primary", size = "md", loading, block, className = "", children, disabled, ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";
  const sizes = {
    sm: "text-sm px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3.5",
  }[size];
  const variants = {
    primary: "bg-lime text-ink border border-lime-deep hover:bg-lime-deep shadow-[0_2px_0_#c3cb2f]",
    secondary: "bg-surface text-ink border border-line hover:bg-cream",
    ghost: "bg-transparent text-ink hover:bg-black/5",
    danger: "bg-red text-white hover:brightness-95 shadow-[0_2px_0_#d94a45]",
    dark: "bg-ink text-cream hover:bg-black shadow-[0_2px_0_#000]",
  }[variant];
  return (
    <button
      className={`${base} ${sizes} ${variants} ${block ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// ---------- Input ----------
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string; icon?: React.ReactNode; hint?: string; error?: string;
};
export function Input({ label, icon, hint, error, className = "", id, ...rest }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <span className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-3.5 text-muted">{icon}</span>}
        <input
          id={id}
          className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-lime/60 ${icon ? "pl-10" : ""} ${error ? "border-red" : "border-line"} ${className}`}
          {...rest}
        />
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-red">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

// ---------- Stars (display) ----------
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <StarIcon className="absolute inset-0 text-line" style={{ width: size, height: size }} strokeWidth={1.5} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon className="text-orange fill-orange" style={{ width: size, height: size }} strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

// ---------- RatingInput (interactive) ----------
export function RatingInput({ value, onChange, size = 26 }: { value: number; onChange: (n: number) => void; size?: number }) {
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110 active:scale-95">
          <StarIcon
            style={{ width: size, height: size }}
            className={n <= value ? "text-orange fill-orange" : "text-line"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

// ---------- Quantity stepper ----------
export function QuantityStepper({
  qty, onDec, onInc, size = "md", disabled = false,
}: { qty: number; onDec: () => void; onInc: () => void; size?: "sm" | "md"; disabled?: boolean }) {
  const s = size === "sm" ? "h-8 text-sm" : "h-10";
  const btn = size === "sm" ? "w-8" : "w-10";
  return (
    <div className={`inline-flex items-center rounded-xl border border-lime-deep bg-lime ${s}`}>
      <button disabled={disabled} onClick={onDec} className={`${btn} grid h-full place-items-center rounded-l-xl hover:bg-lime-deep transition-colors`} aria-label="Decrease quantity">
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-7 text-center font-semibold tabular-nums">{qty}</span>
      <button disabled={disabled} onClick={onInc} className={`${btn} grid h-full place-items-center rounded-r-xl hover:bg-lime-deep transition-colors`} aria-label="Increase quantity">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------- Status + Payment badges ----------
const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-orange/15", text: "text-[#a5651a]", label: "Pending" },
  CONFIRMED: { bg: "bg-[#7fa6d9]/20", text: "text-[#2f5c96]", label: "Confirmed" },
  PREPARING: { bg: "bg-lime/40", text: "text-[#5f6a12]", label: "Preparing" },
  READY: { bg: "bg-green/25", text: "text-[#4d5c1f]", label: "Ready" },
  COMPLETED: { bg: "bg-[#cfe6c9]", text: "text-[#3c6b34]", label: "Completed" },
  CANCELLED: { bg: "bg-red/15", text: "text-[#b23934]", label: "Cancelled" },
};
export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

const PAY_STYLE: Record<PaymentStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  PENDING: { bg: "bg-orange/15", text: "text-[#a5651a]", label: "Payment pending", icon: <Info className="w-3 h-3" /> },
  PAID: { bg: "bg-[#cfe6c9]", text: "text-[#3c6b34]", label: "Paid", icon: <Check className="w-3 h-3" /> },
  FAILED: { bg: "bg-red/15", text: "text-[#b23934]", label: "Payment failed", icon: <AlertTriangle className="w-3 h-3" /> },
};
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const s = PAY_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ---------- Card ----------
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

// ---------- Skeleton ----------
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

// ---------- EmptyState ----------
export function EmptyState({
  illustration, title, body, action,
}: { illustration: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[76px] leading-none text-ink/80">{illustration}</div>
      <h3 className="font-hand mt-4 text-2xl">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------- Modal ----------
export function Modal({
  open, onClose, children, className = "", labelledBy,
}: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string; labelledBy?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-2xl animate-pop sm:rounded-3xl ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ConfirmationModal({
  open, onClose, onConfirm, title, body, confirmLabel = "Confirm", cancelLabel = "Cancel", danger, loading,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; body?: string;
  confirmLabel?: string; cancelLabel?: string; danger?: boolean; loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-bold">{title}</h3>
        {body && <p className="mt-2 text-sm text-muted">{body}</p>}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" block onClick={onClose}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "primary"} block loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Toaster ----------
import { useStore } from "../lib/store";
export function Toaster() {
  const { toasts, dismissToast } = useStore();
  const icon = { success: <Check className="w-4 h-4" />, error: <AlertTriangle className="w-4 h-4" />, info: <Info className="w-4 h-4" /> };
  const ring = { success: "border-green/60", error: "border-red/60", info: "border-line" };
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 rounded-xl border-2 bg-surface px-4 py-3 shadow-lg animate-pop ${ring[t.kind]}`}>
          <span className={`grid h-6 w-6 place-items-center rounded-full ${t.kind === "error" ? "bg-red/15 text-red" : t.kind === "info" ? "bg-orange/15 text-orange" : "bg-green/20 text-green"}`}>
            {icon[t.kind]}
          </span>
          <span className="text-sm font-medium">{t.msg}</span>
          <button onClick={() => dismissToast(t.id)} className="ml-2 text-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}
