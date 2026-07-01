import { supabase } from "@/lib/supabase";
import { watchQuery } from "./realtime";
import { toUserProfile } from "./mappers";
import type { UserProfile } from "@/types";

export function watchUsers(cb: (users: Record<string, UserProfile>) => void): () => void {
  return watchQuery(
    "users",
    async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      return data ?? [];
    },
    toUserProfile,
    (profiles) => {
      const map: Record<string, UserProfile> = {};
      profiles.forEach((p) => { map[p.uid] = p; });
      cb(map);
    }
  );
}

export async function removeUser(uid: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("uid", uid);
  if (error) throw error;
}
