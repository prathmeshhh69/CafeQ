import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from "lucide-react";
import { Button, Input } from "../components/ui";
import { Logo } from "../components/nav";
import { CupDoodle, Star, Sparkle, Heart, Arrow, PlateDoodle } from "../components/Doodles";
import { useStore } from "../lib/store";
import { ApiError } from "../lib/api";

function PasswordInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium">{label}</span>}
      <span className="relative flex items-center">
        <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
        <input
          {...props} type={show ? "text" : "password"}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 pl-10 pr-11 text-sm placeholder:text-muted/70 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-lime/60"
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function BrandPanel({ headline }: { headline: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-ink text-cream lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <Star className="absolute left-[12%] top-[18%] text-[26px] text-lime" />
        <Sparkle className="absolute right-[18%] top-[12%] text-[30px] text-orange" />
        <Heart className="absolute right-[24%] top-[42%] text-[22px] text-red" />
        <Star className="absolute left-[20%] bottom-[26%] text-[18px] text-orange rotate-12" />
      </div>
      <Logo />
      <div className="relative z-10">
        <div className="mb-6 grid h-40 w-40 place-items-center rounded-full bg-lime/10 text-lime">
          <CupDoodle className="text-[110px]" />
        </div>
        <h2 className="font-hand text-5xl leading-[1.05]">{headline}</h2>
        <p className="mt-4 max-w-xs text-cream/70">Fresh favourites from your neighbourhood café — pre-ordered and ready right when you are.</p>
      </div>
      <div className="relative z-10 flex items-center gap-3 text-cream/60">
        <PlateDoodle className="text-[44px] text-lime" />
        <span className="font-hand text-xl">Good food, good mood.</span>
      </div>
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
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const user = await verifyOtp({ email: verificationEmail, otp });
      toast("Email verified. Welcome to CafeQ!");
      go(user.role === "ADMIN" ? "admin" : "menu");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not verify your email.");
    } finally {
      setLoading(false);
    }
  };
  const resend = async () => {
    setResending(true);
    setErrorMessage("");
    try {
      await resendOtp({ email: verificationEmail });
      setCooldown(60);
      setOtp("");
      toast("A new verification code has been sent.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not resend the verification code.");
      if (error instanceof ApiError && error.status === 429) setCooldown(60);
    } finally {
      setResending(false);
    }
  };
  const backToLogin = () => {
    setVerificationEmail("");
    setOtp("");
    setErrorMessage("");
    setCooldown(0);
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel headline={"Good food.\nBetter moods."} />
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden"><Logo /></div>
          {verificationEmail ? <>
            <button type="button" onClick={backToLogin} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </button>
            <h1 className="mt-2 font-hand text-4xl lg:mt-0">Your account needs verification</h1>
            <p className="mt-2 text-sm text-muted">Enter the 6-digit code sent to <span className="font-semibold text-ink">{verificationEmail}</span> to continue to CafeQ.</p>
            <form onSubmit={submitOtp} className="mt-8 space-y-4">
              <Input name="otp" label="6-digit verification code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" required />
              {errorMessage && <p role="alert" className="text-sm text-red">{errorMessage}</p>}
              <Button type="submit" size="lg" block loading={loading} disabled={otp.length !== 6}>Verify account</Button>
            </form>
            <div className="mt-4 text-center">
              <Button type="button" variant="ghost" loading={resending} disabled={cooldown > 0 || loading} onClick={resend}>
                {cooldown > 0 ? "Resend code in " + cooldown + "s" : "Resend OTP"}
              </Button>
            </div>
          </> : <>
          <div className="mt-8 flex items-center gap-2 lg:mt-0">
            <h1 className="font-hand text-4xl">Welcome back!</h1>
            <Arrow className="text-2xl text-orange" />
          </div>
          <p className="mt-1 text-muted">Log in to pick up where your cravings left off.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Input name="identifier" label="Email or Phone Number" icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" required />
            <PasswordInput name="password" label="Password" placeholder="••••••••" required />
            <Button type="submit" size="lg" block loading={loading}>Log In</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            New here?{" "}
            <button onClick={() => go("register")} className="font-semibold text-ink underline decoration-lime-deep decoration-2 underline-offset-2 hover:text-orange">Create an account</button>
          </p>
          </>}
        </div>
      </div>
    </div>
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
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const fields = new FormData(e.currentTarget);
    const email = String(fields.get("email") || "").trim().toLowerCase();
    try {
      await register({
        name: String(fields.get("name") || "").trim(),
        email,
        phone: String(fields.get("phone") || "").trim(),
        password: String(fields.get("password") || ""),
      });
      setVerificationEmail(email);
      setCooldown(60);
      toast("Verification code sent to your email.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const user = await verifyOtp({ email: verificationEmail, otp });
      toast("Email verified. Welcome to CafeQ!");
      go(user.role === "ADMIN" ? "admin" : "menu");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setErrorMessage("");
    try {
      await resendOtp({ email: verificationEmail });
      setCooldown(60);
      setOtp("");
      toast("A new verification code has been sent.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not resend the verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel headline={"Join the\nCafeQ family!"} />
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden"><Logo /></div>
          {verificationEmail ? (
            <>
              <h1 className="mt-8 font-hand text-4xl lg:mt-0">Verify your email</h1>
              <p className="mt-2 text-sm text-muted">We sent a 6-digit code to <span className="font-semibold text-ink">{verificationEmail}</span>. Enter it below to finish creating your account.</p>
              <form onSubmit={submitOtp} className="mt-8 space-y-4">
                <Input name="otp" label="6-digit verification code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" required />
                {errorMessage && <p role="alert" className="text-sm text-red">{errorMessage}</p>}
                <Button type="submit" size="lg" block loading={loading} disabled={otp.length !== 6}>Verify email</Button>
              </form>
              <div className="mt-4 text-center">
                <Button type="button" variant="ghost" loading={resending} disabled={cooldown > 0 || loading} onClick={resend}>
                  {cooldown > 0 ? "Resend code in " + cooldown + "s" : "Resend OTP"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-8 font-hand text-4xl lg:mt-0">Join the CafeQ family!</h1>
              <p className="mt-1 text-muted">Good food tastes better together.</p>
              <form onSubmit={submit} className="mt-8 space-y-4">
                <Input name="name" label="Full Name" icon={<User className="h-4 w-4" />} placeholder="Ojas Rane" required />
                <Input name="email" label="Email Address" icon={<Mail className="h-4 w-4" />} type="email" placeholder="you@example.com" required />
                <Input name="phone" label="Phone Number" icon={<Phone className="h-4 w-4" />} type="tel" placeholder="+91 98765 43210" required />
                <PasswordInput name="password" label="Password" placeholder="Create a password" required />
                {errorMessage && <p role="alert" className="text-sm text-red">{errorMessage}</p>}
                <Button type="submit" size="lg" block loading={loading}>Create Account</Button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted">
            {verificationEmail ? "Already verified? " : "Already have an account? "}
            <button onClick={() => go("login")} className="font-semibold text-ink underline decoration-lime-deep decoration-2 underline-offset-2 hover:text-orange">Log in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

