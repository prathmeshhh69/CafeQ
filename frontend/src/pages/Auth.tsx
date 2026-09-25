import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button, Input } from "../components/ui";
import { Logo } from "../components/nav";
import { CupDoodle, Star, Sparkle, Heart, PlateDoodle } from "../components/Doodles";
import { useStore } from "../lib/store";
import { ApiError } from "../lib/api";

const panelVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.42, ease: "easeOut" } },
};
const formPanelVariants: Variants = {
  hidden: { opacity: 0, x: 14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const formSequenceVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.065 } },
};
const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } },
};

function PasswordInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>}
      <span className="relative flex items-center">
        <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
        <input
          {...props}
          type={show ? "text" : "password"}
          className="auth-input w-full rounded-xl border border-line bg-surface px-4 py-3 pl-10 pr-11 text-sm text-ink placeholder:text-muted/70"
        />
        <button
          type="button"
          onClick={() => setShow((visible) => !visible)}
          className="absolute right-3 grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-orange"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function BrandPanel({ headline, reduceMotion }: { headline: string; reduceMotion: boolean }) {
  return (
    <motion.section
      variants={panelVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={reduceMotion ? { duration: 0 } : undefined}
      className="auth-brand relative hidden min-h-screen overflow-hidden bg-ink px-10 py-9 text-cream lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-orange/20" />
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-orange/15" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />
        <motion.span className="absolute left-[12%] top-[26%] text-lime" initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={reduceMotion ? undefined : { opacity: [0.65, 0.9, 0.65], y: [0, -3, 0] }} transition={{ duration: 6, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}><Star className="text-[20px]" /></motion.span>
        <motion.span className="absolute right-[18%] top-[16%] text-orange" initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={reduceMotion ? undefined : { opacity: [0.6, 0.85, 0.6], y: [0, -3, 0] }} transition={{ duration: 7, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}><Sparkle className="text-[25px]" /></motion.span>
        <motion.span className="absolute right-[14%] top-[53%] text-red/80" initial={reduceMotion ? false : { opacity: 0, y: 3 }} animate={reduceMotion ? undefined : { opacity: [0.65, 0.85, 0.65], y: [0, -2, 0] }} transition={{ duration: 7.5, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}><Heart className="text-[17px]" /></motion.span>
        <motion.span className="absolute bottom-[19%] left-[20%] rotate-12 text-orange" initial={reduceMotion ? false : { opacity: 0, y: 3 }} animate={reduceMotion ? undefined : { opacity: [0.6, 0.85, 0.6], y: [0, -2, 0] }} transition={{ duration: 8, delay: 1.6, repeat: Infinity, ease: "easeInOut" }}><Star className="text-[14px]" /></motion.span>
        <span className="absolute left-[53%] top-[35%] h-1.5 w-1.5 rounded-full bg-cream/50" />
        <span className="absolute right-[30%] bottom-[22%] h-1 w-1 rounded-full bg-lime" />
      </div>
      <div className="relative z-10"><Logo /></div>
      <div className="relative z-10 mx-auto w-full max-w-lg py-10">
        <div className="relative mb-8 grid h-48 w-48 place-items-center rounded-full border border-lime/20 bg-lime/10 text-lime shadow-[0_0_90px_rgba(255,160,64,0.08)]">
          <div className="absolute inset-3 rounded-full border border-dashed border-cream/15" />
          <motion.div animate={reduceMotion ? undefined : { y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <CupDoodle className="text-[116px]" />
          </motion.div>
          <Sparkle className="absolute right-7 top-8 text-xl text-orange" />
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-orange">Made for your cravings</p>
        <h2 className="whitespace-pre-line font-hand text-5xl leading-[1.04] xl:text-6xl">{headline}</h2>
        <p className="mt-5 max-w-sm text-base leading-7 text-cream/70">
          Fresh favourites from your neighbourhood cafe, ready when you are.
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-3 text-cream/65">
        <PlateDoodle className="text-[38px] text-lime" />
        <span className="font-hand text-lg">Good food, good mood.</span>
        <span className="ml-auto text-xs tracking-wide">YOUR LITTLE CAFEQ CORNER</span>
      </div>
    </motion.section>
  );
}

function AuthFrame({ headline, mode, children }: { headline: string; mode: "login" | "register"; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[minmax(360px,0.88fr)_1.12fr]">
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
        className="auth-brand relative flex min-h-[132px] items-center justify-between overflow-hidden bg-ink px-5 py-5 text-cream sm:px-8 lg:hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-12 h-40 w-40 rounded-full border border-orange/25" />
        <div className="relative z-10">
          <Logo />
          <p className="mt-2 text-xs font-medium tracking-wide text-cream/70">Good food. Better moods.</p>
        </div>
        <motion.div className="relative z-10 mr-4 text-lime" animate={reduceMotion ? undefined : { y: [0, -2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <CupDoodle className="text-[48px]" />
        </motion.div>
      </motion.section>
      <BrandPanel headline={headline} reduceMotion={!!reduceMotion} />
      <motion.main
        variants={formPanelVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? { duration: 0 } : undefined}
        className="relative flex min-w-0 items-center justify-center overflow-hidden px-5 py-8 sm:px-10 sm:py-12 lg:min-h-screen lg:px-12"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-12 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />
        <div className="relative z-10 w-full max-w-[460px]">
          <motion.div
            key={mode}
            variants={formSequenceVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

export function LoginPage({ go }: { go: (r: string) => void }) {
  const { login, verifyOtp, resendOtp, toast } = useStore();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fields = new FormData(e.currentTarget);
    const identifier = String(fields.get("identifier") || "").trim();
    const password = String(fields.get("password") || "");
    try {
      const user = await login(identifier.includes("@") ? { email: identifier, password } : { phone: identifier, password });
      toast("Welcome back to CafeQ!");
      go(user.role === "ADMIN" ? "admin" : "menu");
    } catch (error) {
      if (error instanceof ApiError && error.code === "ACCOUNT_NOT_VERIFIED" && error.email) {
        setVerificationEmail(error.email);
        setOtp("");
        setErrorMessage("");
        setCooldown(0);
        toast("Your account needs verification. Enter the code sent to your email.", "info");
        return;
      }
      toast(error instanceof Error ? error.message : "Could not log in.", "error");
    } finally {
      setLoading(false);
    }
  };
  const submitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setErrorMessage("");
    try { const user = await verifyOtp({ email: verificationEmail, otp }); toast("Email verified. Welcome to CafeQ!"); go(user.role === "ADMIN" ? "admin" : "menu"); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not verify your email."); }
    finally { setLoading(false); }
  };
  const resend = async () => {
    setResending(true); setErrorMessage("");
    try { await resendOtp({ email: verificationEmail }); setCooldown(60); setOtp(""); toast("A new verification code has been sent."); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not resend the verification code."); if (error instanceof ApiError && error.status === 429) setCooldown(60); }
    finally { setResending(false); }
  };
  const backToLogin = () => { setVerificationEmail(""); setOtp(""); setErrorMessage(""); setCooldown(0); };
  return (
    <AuthFrame headline={"Good food.\nBetter moods."} mode="login">
      {verificationEmail ? <>
        <motion.div variants={formItemVariants} className="mb-7">
          <button type="button" onClick={backToLogin} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to login</button>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-orange"><Sparkles className="h-3.5 w-3.5" /> Account verification</div>
          <h1 className="font-hand text-4xl leading-tight text-ink sm:text-[2.75rem]">Your account needs verification</h1>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">Enter the 6-digit code sent to <span className="font-semibold text-ink">{verificationEmail}</span> to continue to CafeQ.</p>
        </motion.div>
        <form onSubmit={submitOtp} className="space-y-5">
          <motion.div variants={formItemVariants}><Input name="otp" label="6-digit verification code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" required className="auth-input !py-3" /></motion.div>
          {errorMessage && <motion.p variants={formItemVariants} role="alert" className="text-sm text-red">{errorMessage}</motion.p>}
          <motion.div variants={formItemVariants} whileHover={loading ? undefined : { y: -2 }} whileTap={loading ? undefined : { scale: 0.99 }}><Button type="submit" size="lg" block loading={loading} disabled={otp.length !== 6} className="auth-primary !py-3.5">Verify account <ArrowRight className="h-4 w-4" /></Button></motion.div>
        </form>
        <motion.div variants={formItemVariants} className="mt-4 text-center"><Button type="button" variant="ghost" loading={resending} disabled={cooldown > 0 || loading} onClick={resend}>{cooldown > 0 ? "Resend code in " + cooldown + "s" : "Resend OTP"}</Button></motion.div>
      </> : <>
        <motion.div variants={formItemVariants} className="mb-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-orange"><Sparkles className="h-3.5 w-3.5" /> Your CafeQ corner</div>
          <h1 className="font-hand text-4xl leading-tight text-ink sm:text-[2.75rem]">Welcome back!</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted sm:text-base">Log in to pick up where your cravings left off.</p>
        </motion.div>
        <form onSubmit={submit} className="space-y-5">
          <motion.div variants={formItemVariants}><Input name="identifier" label="Email or phone number" icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" autoComplete="username" required className="auth-input !py-3" /></motion.div>
          <motion.div variants={formItemVariants}><PasswordInput name="password" label="Password" placeholder="Enter your password" autoComplete="current-password" required /></motion.div>
          <motion.div variants={formItemVariants} whileHover={loading ? undefined : { y: -2 }} whileTap={loading ? undefined : { scale: 0.99 }} animate={{ opacity: loading ? 0.84 : 1 }} transition={{ duration: 0.16 }}><Button type="submit" size="lg" block loading={loading} className="auth-primary !mt-7 !py-3.5">Log In <ArrowRight className="h-4 w-4" /></Button></motion.div>
        </form>
        <motion.p variants={formItemVariants} className="mt-7 text-center text-sm text-muted">New here? <button type="button" onClick={() => go("register")} className="auth-link font-semibold text-ink underline decoration-orange/60 decoration-2 underline-offset-4 hover:text-orange">Create an account</button></motion.p>
      </>}
    </AuthFrame>
  );
}

export function RegisterPage({ go }: { go: (r: string) => void }) {
  const { register, verifyOtp, resendOtp, toast } = useStore();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setErrorMessage("");
    const fields = new FormData(e.currentTarget);
    const email = String(fields.get("email") || "").trim().toLowerCase();
    try {
      await register({ name: String(fields.get("name") || "").trim(), email, phone: String(fields.get("phone") || "").trim(), password: String(fields.get("password") || "") });
      setVerificationEmail(email); setCooldown(60); toast("Verification code sent to your email.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not create your account."); }
    finally { setLoading(false); }
  };
  const submitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setErrorMessage("");
    try { const user = await verifyOtp({ email: verificationEmail, otp }); toast("Email verified. Welcome to CafeQ!"); go(user.role === "ADMIN" ? "admin" : "menu"); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not verify your email."); }
    finally { setLoading(false); }
  };
  const resend = async () => {
    setResending(true); setErrorMessage("");
    try { await resendOtp({ email: verificationEmail }); setCooldown(60); setOtp(""); toast("A new verification code has been sent."); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not resend the verification code."); }
    finally { setResending(false); }
  };
  return (
    <AuthFrame headline={"Join the\nCafeQ family!"} mode="register">
      {verificationEmail ? <>
        <motion.div variants={formItemVariants} className="mb-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-orange"><Sparkles className="h-3.5 w-3.5" /> Almost there</div>
          <h1 className="font-hand text-4xl leading-tight text-ink sm:text-[2.75rem]">Verify your email</h1>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">We sent a 6-digit code to <span className="font-semibold text-ink">{verificationEmail}</span>. Enter it below to finish creating your account.</p>
        </motion.div>
        <form onSubmit={submitOtp} className="space-y-5">
          <motion.div variants={formItemVariants}><Input name="otp" label="6-digit verification code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" required className="auth-input !py-3" /></motion.div>
          {errorMessage && <motion.p variants={formItemVariants} role="alert" className="text-sm text-red">{errorMessage}</motion.p>}
          <motion.div variants={formItemVariants} whileHover={loading ? undefined : { y: -2 }} whileTap={loading ? undefined : { scale: 0.99 }}><Button type="submit" size="lg" block loading={loading} disabled={otp.length !== 6} className="auth-primary !py-3.5">Verify email <ArrowRight className="h-4 w-4" /></Button></motion.div>
        </form>
        <motion.div variants={formItemVariants} className="mt-4 text-center"><Button type="button" variant="ghost" loading={resending} disabled={cooldown > 0 || loading} onClick={resend}>{cooldown > 0 ? "Resend code in " + cooldown + "s" : "Resend OTP"}</Button></motion.div>
        <motion.p variants={formItemVariants} className="mt-6 text-center text-sm text-muted">Already verified? <button type="button" onClick={() => go("login")} className="auth-link font-semibold text-ink underline decoration-orange/60 decoration-2 underline-offset-4 hover:text-orange">Log in</button></motion.p>
      </> : <>
        <motion.div variants={formItemVariants} className="mb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-orange"><Sparkles className="h-3.5 w-3.5" /> A seat at our table</div>
          <h1 className="font-hand text-4xl leading-tight text-ink sm:text-[2.75rem]">Join the CafeQ family!</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted sm:text-base">Your next favourite bite is just a few steps away.</p>
        </motion.div>
        <form onSubmit={submit} className="space-y-4">
          <motion.div variants={formItemVariants}><Input name="name" label="Full name" icon={<User className="h-4 w-4" />} placeholder="Ojas Rane" autoComplete="name" required className="auth-input !py-3" /></motion.div>
          <motion.div variants={formItemVariants}><Input name="email" label="Email address" icon={<Mail className="h-4 w-4" />} type="email" placeholder="you@example.com" autoComplete="email" required className="auth-input !py-3" /></motion.div>
          <motion.div variants={formItemVariants}><Input name="phone" label="Phone number" icon={<Phone className="h-4 w-4" />} type="tel" placeholder="+91 98765 43210" autoComplete="tel" required className="auth-input !py-3" /></motion.div>
          <motion.div variants={formItemVariants}><PasswordInput name="password" label="Password" placeholder="Create a password" autoComplete="new-password" required /></motion.div>
          {errorMessage && <motion.p variants={formItemVariants} role="alert" className="text-sm text-red">{errorMessage}</motion.p>}
          <motion.div variants={formItemVariants} whileHover={loading ? undefined : { y: -2 }} whileTap={loading ? undefined : { scale: 0.99 }} animate={{ opacity: loading ? 0.84 : 1 }} transition={{ duration: 0.16 }}><Button type="submit" size="lg" block loading={loading} className="auth-primary !mt-6 !py-3.5">Create Account <ArrowRight className="h-4 w-4" /></Button></motion.div>
        </form>
        <motion.p variants={formItemVariants} className="mt-6 text-center text-sm text-muted">Already have an account? <button type="button" onClick={() => go("login")} className="auth-link font-semibold text-ink underline decoration-orange/60 decoration-2 underline-offset-4 hover:text-orange">Log in</button></motion.p>
      </>}
    </AuthFrame>
  );
}
