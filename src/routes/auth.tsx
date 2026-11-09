import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, PasswordInput } from "@/components/museum/PasswordInput";
import { IMAGES } from "@/lib/artifacts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Enter RE:SPACE — Login or Create Account" },
      { name: "description", content: "Sign in or create your explorer account to enter the RE:SPACE digital museum." },
      { property: "og:title", content: "Enter RE:SPACE" },
      { property: "og:description", content: "Every explorer has a story. Begin yours." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    displayName: z.string().trim().min(2, "At least 2 characters").max(40, "Max 40 characters"),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const navigate = useNavigate();

  const fieldErrors = (issues: z.ZodIssue[]) =>
    setErrors(Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message])));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setErrors({});

    if (mode === "signup") {
      const r = signupSchema.safeParse(raw);
      if (!r.success) return fieldErrors(r.error.issues);
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: r.data.email,
        password: r.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: r.data.fullName, display_name: r.data.displayName },
        },
      });
      setLoading(false);
      if (error) {
        const msg = /registered|exists/i.test(error.message) ? "An account with this email already exists. Try logging in." : error.message;
        return setErrors({ form: msg });
      }
      // An existing email returns a user with no identities.
      if (data.user && data.user.identities?.length === 0) {
        return setErrors({ email: "An account with this email already exists. Try logging in." });
      }
      if (data.session) {
        toast.success("Welcome aboard, explorer.");
        return navigate({ to: "/" });
      }
      setSentTo(r.data.email);
      return;
    }

    if (mode === "login") {
      const r = loginSchema.safeParse(raw);
      if (!r.success) return fieldErrors(r.error.issues);
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword(r.data);
      setLoading(false);
      if (error) {
        const msg = /confirm/i.test(error.message)
          ? "Please confirm your email first — check your inbox for the link."
          : /invalid/i.test(error.message)
            ? "Email or password is incorrect."
            : error.message;
        return setErrors({ form: msg });
      }
      toast.success("Welcome back to RE:SPACE.");
      return navigate({ to: "/" });
    }

    const r = z.object({ email: z.string().trim().email("Enter a valid email address") }).safeParse(raw);
    if (!r.success) return fieldErrors(r.error.issues);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setErrors({ form: error.message });
    setSentTo(r.data.email);
  }

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setSentTo(null);
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="absolute inset-0 lg:relative">
        <img src={IMAGES.earthrise.src} alt={IMAGES.earthrise.alt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 overlay-fade lg:overlay-side" />
        <div className="absolute inset-0 starfield opacity-60" aria-hidden />
        <div className="absolute bottom-10 left-10 hidden max-w-md lg:block animate-rise">
          <p className="eyebrow text-science">Abandoned. Remembered. Reimagined.</p>
          <p className="mt-3 text-sm text-muted-foreground">Photo: {IMAGES.earthrise.credit}</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md animate-rise">
          <p className="font-display text-sm font-bold tracking-[0.3em]">
            RE<span className="text-primary">:</span>SPACE
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
            Welcome to <span className="text-primary">RE:SPACE</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Every explorer has a story. Begin yours.</p>

          {mode !== "forgot" && (
            <div className="mt-8 grid grid-cols-2 gap-1 rounded-full glass p-1" role="tablist">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "eyebrow rounded-full py-3 transition-all",
                    mode === m ? "bg-amber-gradient text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "login" ? "Login" : "Create account"}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl glass p-6 md:p-8">
            {sentTo ? (
              <div className="text-center">
                <MailCheck className="mx-auto size-10 text-science" />
                <h2 className="mt-4 text-xl font-semibold">Check your inbox</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "signup"
                    ? `We sent a confirmation link to ${sentTo}. Open it to activate your account, then log in.`
                    : `If an account exists for ${sentTo}, a password reset link is on its way.`}
                </p>
                <Button variant="glass" className="mt-6 rounded-full" onClick={() => switchMode("login")}>Back to login</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4" key={mode}>
                {mode === "forgot" && (
                  <div>
                    <h2 className="text-xl font-semibold">Reset your password</h2>
                    <p className="mt-1 text-sm text-muted-foreground">We'll email you a secure link.</p>
                  </div>
                )}
                {mode === "signup" && (
                  <>
                    <Field id="fullName" label="Full name" error={errors.fullName}>
                      <Input id="fullName" name="fullName" autoComplete="name" className="h-11" />
                    </Field>
                    <Field id="displayName" label="Display name" error={errors.displayName}>
                      <Input id="displayName" name="displayName" autoComplete="nickname" className="h-11" />
                    </Field>
                  </>
                )}
                <Field id="email" label="Email address" error={errors.email}>
                  <Input id="email" name="email" type="email" autoComplete="email" className="h-11" />
                </Field>
                {mode !== "forgot" && (
                  <Field id="password" label="Password" error={errors.password}>
                    <PasswordInput id="password" name="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                  </Field>
                )}
                {mode === "signup" && (
                  <Field id="confirm" label="Confirm password" error={errors.confirm}>
                    <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
                  </Field>
                )}
                {mode === "login" && (
                  <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-science hover:underline">
                    Forgot password?
                  </button>
                )}
                <FieldError msg={errors.form} />
                <Button type="submit" variant="hero" className="h-12 w-full rounded-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {mode === "login" ? "Enter the museum" : mode === "signup" ? "Create account" : "Send reset link"}
                </Button>
                {mode === "forgot" && (
                  <button type="button" onClick={() => switchMode("login")} className="w-full text-xs text-muted-foreground hover:text-foreground">
                    Back to login
                  </button>
                )}
              </form>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            An independent student project — not an official NASA website.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}
