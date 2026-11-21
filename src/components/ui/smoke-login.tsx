/**
 * Smoke Login. Designed & built by Aakash Mehra.
 *
 * A split sign-in page. The left half is a sheet of paper with live smoke drifting across it,
 * one WebGL fragment shader (domain-warped noise) with an acid green vein running through the
 * plumes. Moving the pointer over it stirs the smoke. Two loose sheets sit underneath so it
 * reads as a small stack of paper, and a grain layer gives it tooth.
 *
 * The right half is the form, on plain paper. Sentence case, set in Inter.
 * It opens in dark mode; the light / dark switch top right eases the smoke between smoke-in-the-dark
 * and ink-on-paper.
 *
 * The shader holds still under prefers-reduced-motion, and the entrance skips its blur.
 */
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Moon, Sun, AlertCircle } from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/react";
import { cn } from "@/lib/utils";

export type SmokeLoginProvider = "apple" | "google";
type Theme = "light" | "dark";

export type SmokeLoginProps = {
  mode?: "login" | "signup";
  brand?: string;
  title?: string;
  subtitle?: string;
  /** Called with the form values. Return a promise to keep the button in its loading state. */
  onSubmit?: (values: { email: string; password: string; name?: string }) => void | Promise<void>;
  onProviderSignIn?: (provider: SmokeLoginProvider) => void | Promise<void>;
  forgotPasswordHref?: string;
  signUpHref?: string;
  loginHref?: string;
  onSwitchMode?: (mode: "login" | "signup") => void;
  onBackHome?: () => void;
  defaultTheme?: Theme;
  className?: string;
  /** Small print under the form. */
  footer?: ReactNode;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms)) as Promise<void>;

const THEMES: Record<Theme, Record<string, string>> = {
  light: {
    "--bg": "#efede7",
    "--paper": "#f7f6f2",
    "--sheet": "#e6e3db",
    "--ink": "#141513",
    "--muted": "#6f716b",
    "--line": "#dcd9d0",
    "--field": "#fbfaf7",
    "--accent": "#3f8f00",
    "--btn": "#141513",
    "--btn-ink": "#f7f6f2",
    "--grain-blend": "multiply",
  },
  dark: {
    "--bg": "#0c0d0c",
    "--paper": "#121412",
    "--sheet": "#1a1c1a",
    "--ink": "#ecede8",
    "--muted": "#8d908a",
    "--line": "#262925",
    "--field": "#161816",
    "--accent": "#9dff3a",
    "--btn": "#9dff3a",
    "--btn-ink": "#0c0d0c",
    "--grain-blend": "soft-light",
  },
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function SmokeLogin({
  mode = "login",
  brand = "mygit",
  title,
  subtitle,
  onSubmit = () => wait(1400),
  onProviderSignIn = () => wait(1400),
  forgotPasswordHref = "#",
  signUpHref = "#",
  loginHref = "#",
  onSwitchMode,
  onBackHome,
  defaultTheme = "dark",
  className,
  footer,
}: SmokeLoginProps) {
  const [theme, setTheme] = useState(defaultTheme);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(null as null | "form" | SmokeLoginProvider);
  const [emailVal, setEmailVal] = useState(mode === "login" ? "alex@mygit.dev" : "");
  const [pwVal, setPwVal] = useState(mode === "login" ? "gitpassword123" : "");
  const [nameVal, setNameVal] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const { signIn, isLoaded: signInLoaded, setActive: setActiveSignIn } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setActiveSignUp } = useSignUp();

  const reduce = useReducedMotion();
  const dark = theme === "dark";
  const isSignUp = mode === "signup";

  const resolvedTitle = title ?? (isSignUp ? (pendingVerification ? "Verify your email" : "Create an account") : "Welcome back");
  const resolvedSubtitle =
    subtitle ?? (isSignUp ? (pendingVerification ? "Enter the 6-digit code sent to your inbox." : "Join the developer network building with byte-compatible Git.") : "Sign in to pick up where you left off.");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setErrorMsg(null);

    // 1. If currently in sign-up verification phase:
    if (isSignUp && pendingVerification) {
      if (!signUpLoaded || !signUp) return;
      setBusy("form");
      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verificationCode.trim(),
        });
        if (completeSignUp.status === "complete") {
          await setActiveSignUp({ session: completeSignUp.createdSessionId });
          await onSubmit({ email: emailVal, password: pwVal, name: nameVal });
        } else {
          setErrorMsg("Verification incomplete. Please check your code and try again.");
        }
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
        setErrorMsg(clerkErr.errors?.[0]?.message || clerkErr.message || "Invalid verification code");
      } finally {
        setBusy(null);
      }
      return;
    }

    // 2. Sign In flow with Clerk
    if (!isSignUp) {
      setBusy("form");
      try {
        if (signInLoaded && signIn) {
          const result = await signIn.create({
            identifier: emailVal,
            password: pwVal,
          });
          if (result.status === "complete") {
            await setActiveSignIn({ session: result.createdSessionId });
            await onSubmit({ email: emailVal, password: pwVal });
            return;
          } else {
            console.log("Additional sign-in requirement:", result.status);
          }
        }
        await onSubmit({ email: emailVal, password: pwVal });
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
        setErrorMsg(clerkErr.errors?.[0]?.message || clerkErr.message || "Invalid email or password");
      } finally {
        setBusy(null);
      }
      return;
    }

    // 3. Sign Up flow with Clerk
    if (isSignUp) {
      setBusy("form");
      try {
        if (signUpLoaded && signUp) {
          const [firstName, ...rest] = nameVal.trim().split(" ");
          const lastName = rest.join(" ");
          const result = await signUp.create({
            emailAddress: emailVal,
            password: pwVal,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          });

          if (result.status === "complete") {
            await setActiveSignUp({ session: result.createdSessionId });
            await onSubmit({ email: emailVal, password: pwVal, name: nameVal });
            return;
          } else if (result.status === "missing_requirements") {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
            return;
          }
        }
        await onSubmit({ email: emailVal, password: pwVal, name: nameVal });
      } catch (err: unknown) {
        const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
        setErrorMsg(clerkErr.errors?.[0]?.message || clerkErr.message || "Failed to create account");
      } finally {
        setBusy(null);
      }
    }
  };

  const provider = async (p: SmokeLoginProvider) => {
    if (busy) return;
    setBusy(p);
    setErrorMsg(null);
    const strategy = p === "google" ? "oauth_google" : "oauth_apple";

    try {
      if (isSignUp) {
        if (signUpLoaded && signUp) {
          await signUp.authenticateWithRedirect({
            strategy,
            redirectUrl: `${window.location.origin}/sso-callback`,
            redirectUrlComplete: `${window.location.origin}/#dashboard`,
          });
          return;
        }
      } else {
        if (signInLoaded && signIn) {
          await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: `${window.location.origin}/sso-callback`,
            redirectUrlComplete: `${window.location.origin}/#dashboard`,
          });
          return;
        }
      }
      await onProviderSignIn(p);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
      setErrorMsg(clerkErr.errors?.[0]?.message || clerkErr.message || `Failed to sign in with ${p}`);
      setBusy(null);
    }
  };

  // Each block drifts up out of a blur, one after another.
  const rise = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div
      style={THEMES[theme] as CSSProperties}
      className={cn(
        "relative grid min-h-dvh w-full grid-cols-[minmax(0,1fr)] gap-3 overflow-x-clip bg-[var(--bg)] p-3 font-sans text-[var(--ink)] transition-colors duration-700 lg:grid-cols-[1.08fr_1fr]",
        className,
      )}
    >
      {/* Paper tooth across the whole page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{ backgroundImage: GRAIN, mixBlendMode: "var(--grain-blend)" as CSSProperties["mixBlendMode"] }}
      />

      {/* ---- left: the smoke, on a small stack of paper ---- */}
      <section className="relative z-[1] min-h-[42vh] lg:min-h-0">
        <div aria-hidden className="absolute inset-0 rotate-[-1.4deg] rounded-[28px] bg-[var(--sheet)] shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-colors duration-700" />
        <div aria-hidden className="absolute inset-0 rotate-[0.9deg] rounded-[28px] bg-[var(--paper)] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.18)] transition-colors duration-700" />
        <div className="relative h-full overflow-hidden rounded-[28px] bg-[var(--paper)] shadow-[0_1px_0_rgb(255_255_255/0.6)_inset,0_1px_2px_rgb(0_0_0/0.08),0_24px_48px_-24px_rgb(0_0_0/0.35)] transition-colors duration-700">
          <SmokeCanvas dark={dark} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: GRAIN, mixBlendMode: "var(--grain-blend)" as CSSProperties["mixBlendMode"] }}
          />

          <motion.div {...rise(0)} className="absolute left-6 top-6 flex items-center gap-3">
            {onBackHome && (
              <button
                type="button"
                onClick={onBackHome}
                className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--field)]/80 px-3 py-1.5 text-[12px] font-medium text-[var(--ink)] backdrop-blur-md transition-all hover:border-[var(--muted)] hover:bg-[var(--field)]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Home</span>
              </button>
            )}
            <span className="text-[15px] font-semibold tracking-[-0.02em]">{brand}</span>
          </motion.div>

          <motion.div {...rise(1)} className="absolute inset-x-6 bottom-6 hidden max-w-[22rem] sm:block">
            <p className="text-[28px] font-medium leading-[1.1] tracking-[-0.035em]">
              {isSignUp ? "Step into the stream. Code without limits." : "Breathe in. The rest can wait."}
            </p>
            <p className="mt-2 text-[13px] text-[var(--muted)]">
              {isSignUp ? "Join thousands shaping decentralized version control." : "A quieter way into your work."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- right: the form ---- */}
      <section className="relative z-[1] flex items-center justify-center px-5 py-16 sm:px-10">
        <ThemeSwitch theme={theme} onToggle={() => setTheme(dark ? "light" : "dark")} />

        <div className="w-full max-w-[360px]">
          <motion.h1 {...rise(2)} className="text-[34px] font-semibold leading-none tracking-[-0.045em]">
            {resolvedTitle}
          </motion.h1>
          <motion.p {...rise(3)} className="mt-3 text-[15px] text-[var(--muted)]">
            {resolvedSubtitle}
          </motion.p>

          {!isSignUp && (
            <motion.div
              {...rise(3.3)}
              className="mt-5 p-3 rounded-xl border border-[var(--line)] bg-[var(--field)] text-xs flex items-center justify-between gap-3 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-[var(--ink)]">
                  <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                  <span>Demo Credentials</span>
                </div>
                <p className="font-mono text-[11px] text-[var(--muted)] mt-0.5">
                  alex@mygit.dev <span className="opacity-40">/</span> gitpassword123
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailVal("alex@mygit.dev");
                  setPwVal("gitpassword123");
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] text-[11px] font-medium hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                Auto-fill
              </button>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {isSignUp && pendingVerification ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--field)] text-xs text-[var(--muted)]">
                  Please enter the 6-digit verification code sent to{" "}
                  <strong className="text-[var(--ink)] font-mono">{emailVal}</strong>.
                </div>

                <div>
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className={cn(fieldCls, "font-mono tracking-widest text-center text-lg")}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!!busy}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--btn)] text-[15px] font-medium text-[var(--btn-ink)] shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_1px_2px_rgb(0_0_0/0.2),0_10px_24px_-12px_rgb(0_0_0/0.5)] transition-[transform,background-color,box-shadow] duration-300 active:scale-[0.985] disabled:opacity-80"
                  >
                    {busy === "form" ? (
                      <LoaderCircle className="size-[18px] animate-spin" />
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingVerification(false);
                      setErrorMsg(null);
                    }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--ink)] underline cursor-pointer"
                  >
                    Back to edit details
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isSignUp && (
                  <motion.div {...rise(3.5)}>
                    <Label htmlFor="name">Full Name</Label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={nameVal}
                      onChange={(e) => setNameVal(e.target.value)}
                      placeholder="Ada Lovelace"
                      className={fieldCls}
                    />
                  </motion.div>
                )}

                <motion.div {...rise(4)}>
                  <Label htmlFor="email">Email</Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    placeholder="you@studio.com"
                    className={fieldCls}
                  />
                </motion.div>

                <motion.div {...rise(5)}>
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <a href={forgotPasswordHref} className="text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
                        Forgot?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPw ? "text" : "password"}
                      required
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      value={pwVal}
                      onChange={(e) => setPwVal(e.target.value)}
                      placeholder="••••••••"
                      className={cn(fieldCls, "pr-12")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-[10px] text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    >
                      {showPw ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div {...rise(6)} className="pt-2">
                  <button
                    type="submit"
                    disabled={!!busy}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--btn)] text-[15px] font-medium text-[var(--btn-ink)] shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_1px_2px_rgb(0_0_0/0.2),0_10px_24px_-12px_rgb(0_0_0/0.5)] transition-[transform,background-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_1px_2px_rgb(0_0_0/0.2),0_14px_30px_-12px_var(--accent)] active:scale-[0.985] disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {busy === "form" ? (
                      <LoaderCircle className="size-[18px] animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Create account" : "Sign in"}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </motion.div>
              </>
            )}
          </form>

          <motion.div {...rise(7)} className="my-7 flex items-center gap-3 text-[12px] text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--line)]" />
            Or
            <span className="h-px flex-1 bg-[var(--line)]" />
          </motion.div>

          <motion.div {...rise(8)} className="grid grid-cols-2 gap-3">
            <ProviderButton onClick={() => provider("apple")} busy={busy === "apple"} disabled={!!busy}>
              <AppleIcon className="size-[17px]" /> Apple
            </ProviderButton>
            <ProviderButton onClick={() => provider("google")} busy={busy === "google"} disabled={!!busy}>
              <GoogleIcon className="size-[17px]" /> Google
            </ProviderButton>
          </motion.div>

          <motion.p {...rise(9)} className="mt-9 text-center text-[13px] text-[var(--muted)]">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => (onSwitchMode ? onSwitchMode("login") : (window.location.hash = "#login"))}
                  className="font-medium text-[var(--ink)] underline-offset-4 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => (onSwitchMode ? onSwitchMode("signup") : (window.location.hash = "#signup"))}
                  className="font-medium text-[var(--ink)] underline-offset-4 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </>
            )}
          </motion.p>

          {footer && (
            <motion.div {...rise(10)} className="mt-10 text-center text-[12px] text-[var(--muted)]">
              {footer}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

const fieldCls =
  "mt-2 h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--field)] px-4 text-[15px] text-[var(--ink)] shadow-[0_1px_2px_rgb(0_0_0/0.04)_inset] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)]";

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-medium text-[var(--ink)]">
      {children}
    </label>
  );
}

function ProviderButton({
  children,
  busy,
  ...props
}: { children: ReactNode; busy: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--field)] text-[14px] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-[transform,border-color,background-color] duration-300 hover:border-[var(--muted)]/50 active:scale-[0.98] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {busy ? <LoaderCircle className="size-[17px] animate-spin" /> : children}
    </button>
  );
}

function ThemeSwitch({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="absolute right-3 top-3 flex h-9 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--field)] pl-2.5 pr-3.5 text-[13px] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-[transform,background-color,border-color] duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:right-6 sm:top-6"
    >
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6, filter: "blur(4px)" }}
            animate={{ opacity: 1, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="absolute"
          >
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      {dark ? "Dark" : "Light"}
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * Smoke
 * ------------------------------------------------------------------------- */

// Smoke is all soft gradients, so render small and let the browser upscale it.
const RENDER_SCALE = 0.4;

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uDark;

float hash(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 r = mat2(.8, .6, -.6, .8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02 + vec2(1.7, 9.2); a *= .5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * ar, uv.y) * 1.25;
  float t = uTime * .07;

  // The pointer stirs a slow eddy into the smoke.
  vec2 d = p - vec2(uMouse.x * ar, uMouse.y) * 1.25;
  float k = exp(-dot(d, d) * 1.6);
  p += vec2(-d.y, d.x) * k * .55;

  // Two rounds of domain warping: the classic recipe for curling, billowing plumes.
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t * .8));
  vec2 r = vec2(fbm(p + 3. * q + vec2(1.7, 9.2) + t * 1.2), fbm(p + 3. * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 2.6 * r + vec2(t * .4, -t * .3));

  float smoke = smoothstep(.3, .85, f);
  smoke *= smoke;
  float wisp = smoothstep(.55, .75, f) * (1. - smoothstep(.75, .95, f)); // bright rims on the plumes
  float vein = (1. - smoothstep(.0, .04, abs(f - .58))) * smoothstep(.42, .62, r.y); // acid green thread along a plume edge

  vec3 green = vec3(.62, 1., .23);

  // light: ink smoke on paper
  vec3 paper = vec3(.968, .964, .949);
  vec3 lit = mix(paper, vec3(.07, .08, .07), smoke * .92);
  lit = mix(lit, vec3(.36, .72, .02), vein * .7);
  lit += (1. - smoke) * wisp * .03;

  // dark: pale smoke in the dark, green glowing through it
  vec3 night = mix(vec3(.04, .045, .04), vec3(.03, .035, .03), uv.y);
  vec3 drk = night + vec3(.78, .8, .76) * smoke * .62 + vec3(.9) * wisp * .08;
  drk += green * vein * .8;

  vec3 col = mix(lit, drk, uDark);
  col += (hash(gl_FragCoord.xy + fract(t)) - .5) / 255.; // dither against banding
  gl_FragColor = vec4(col, 1.);
}`;

function SmokeCanvas({ dark }: { dark: boolean }) {
  const ref = useRef(null as HTMLCanvasElement | null);
  const darkRef = useRef(dark ? 1 : 0);
  const redraw = useRef((() => {}) as () => void);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!canvas || !gl) return; // The paper colour behind stands in.

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uDark = gl.getUniformLocation(program, "uDark");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    const mouse = { x: 0.7, y: 0.4, tx: 0.7, ty: 0.4 };
    let shade = darkRef.current;
    let time = 40; // start mid-drift so the first frame is already full of smoke
    let raf = 0;
    let last = 0;

    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDark, shade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / 30 - 2) return; // slow smoke doesn't need more than 30fps
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      time = 40 + (now - start) / 1000;
      // Ease the pointer and the theme so both glide rather than snap.
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2.2);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2.2);
      shade += (darkRef.current - shade) * Math.min(1, dt * 3.5);
      draw();
    };
    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) draw();
      else raf = requestAnimationFrame(loop);
    };
    // Under reduced motion there is no loop, so a theme change redraws once.
    redraw.current = () => {
      if (!reduce.matches) return;
      shade = darkRef.current;
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - b.left) / b.width;
      mouse.ty = 1 - (e.clientY - b.top) / b.height;
    };

    const ro = new ResizeObserver(() => {
      const s = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * s));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    });
    ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    reduce.addEventListener("change", play);
    play();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      reduce.removeEventListener("change", play);
    };
  }, []);

  useEffect(() => {
    darkRef.current = dark ? 1 : 0;
    redraw.current();
  }, [dark]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}

/* ---------------------------------------------------------------------------
 * Brand glyphs
 * ------------------------------------------------------------------------- */

type IconProps = { className?: string };

function GoogleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export default SmokeLogin;
