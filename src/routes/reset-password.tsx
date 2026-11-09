import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldError, PasswordInput } from "@/components/museum/PasswordInput";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — RE:SPACE" },
      { name: "description", content: "Choose a new password for your RE:SPACE explorer account." },
      { property: "og:title", content: "Set a new password — RE:SPACE" },
      { property: "og:description", content: "Choose a new password for your RE:SPACE account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
      else if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if ((f.password ?? "").length < 8) return setError("Use at least 8 characters");
    if (f.password !== f.confirm) return setError("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: f.password });
    setLoading(false);
    if (error) return setError(error.message);
    toast.success("Password updated.");
    navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5">
      <div className="absolute inset-0 starfield opacity-60" aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl glass p-8 animate-rise">
        <h1 className="text-3xl font-bold">Set a new password</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Open this page from the reset link in your email. If the link expired, request a new one from the login screen.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">New password</Label>
              <PasswordInput id="password" name="password" autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs text-muted-foreground">Confirm password</Label>
              <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
            </div>
            <FieldError msg={error} />
            <Button type="submit" variant="hero" className="h-12 w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
