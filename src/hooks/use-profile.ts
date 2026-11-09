import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u, error: ue } = await supabase.auth.getUser();
      if (ue || !u.user) throw ue ?? new Error("Not signed in");
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (error) throw error;
      return { user: u.user, profile: data };
    },
  });
}

export function displayNameOf(p: ReturnType<typeof useProfile>["data"]) {
  if (!p) return "";
  return (
    p.profile?.display_name ||
    (p.user.user_metadata?.display_name as string | undefined) ||
    p.user.email?.split("@")[0] ||
    "Explorer"
  );
}
