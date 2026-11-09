import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { displayNameOf, useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your Explorer Profile — RE:SPACE" },
      { name: "description", content: "Your personal RE:SPACE explorer account." },
      { property: "og:title", content: "Your Explorer Profile — RE:SPACE" },
      { property: "og:description", content: "Your personal RE:SPACE explorer account." },
    ],
  }),
  component: Profile,
});

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—");

function Profile() {
  const { data, isLoading, error } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <section className="relative mx-auto max-w-3xl px-5 pt-32 pb-24">
      <div className="absolute inset-0 starfield opacity-40" aria-hidden />
      <div className="relative">
        <p className="eyebrow text-primary">Explorer profile</p>
        {isLoading ? (
          <Loader2 className="mt-10 animate-spin text-muted-foreground" />
        ) : error || !data ? (
          <p className="mt-10 text-destructive">We couldn't load your profile. Please refresh the page.</p>
        ) : (
          <div className="mt-6 rounded-2xl glass p-8 md:p-10 animate-rise">
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-amber-gradient text-primary-foreground shadow-glow">
                <UserRound className="size-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{displayNameOf(data)}</h1>
                <p className="text-sm text-muted-foreground">{data.user.email}</p>
              </div>
            </div>
            <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
              {[
                ["Full name", data.profile?.full_name || "—"],
                ["Display name", displayNameOf(data)],
                ["Email", data.user.email ?? "—"],
                ["Member since", fmt(data.profile?.created_at ?? data.user.created_at)],
                ["Last sign-in", fmt(data.user.last_sign_in_at)],
                ["Email confirmed", data.user.email_confirmed_at ? "Yes" : "Pending"],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-5">
                  <dt className="eyebrow text-muted-foreground">{k}</dt>
                  <dd className="mt-1 break-words">{v}</dd>
                </div>
              ))}
            </dl>
            <Button variant="glass" className="mt-8 rounded-full" onClick={signOut}><LogOut /> Log out</Button>
          </div>
        )}
      </div>
    </section>
  );
}
