import { supabase } from "@/lib/supabase";
import { consumeInvite } from "./invites";
import { toUserProfile, fromUserProfile } from "./mappers";
import type { UserProfile, UserRole } from "@/types";

export interface AuthUser {
  uid: string;
}

/** Fluxo de entrada por convite: autentica anonimamente, consome o convite e cria o perfil */
export async function registerWithInvite(
  code: string,
  profile: Omit<UserProfile, "uid" | "role" | "createdAt">,
  role: UserRole
): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("Falha ao autenticar.");

  await consumeInvite(code, data.user.id);

  const full: UserProfile = {
    ...profile,
    uid: data.user.id,
    role,
    createdAt: Date.now(),
  };
  const { error: insertError } = await supabase.from("users").insert(fromUserProfile(full));
  if (insertError) throw insertError;
  return full;
}

export async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("users").select("*").eq("uid", uid).maybeSingle();
  if (error) throw error;
  return data ? toUserProfile(data) : null;
}

export async function updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const { error } = await supabase.from("users").update(fromUserProfile(data)).eq("uid", uid);
  if (error) throw error;
}

export function watchAuth(cb: (user: AuthUser | null) => void): () => void {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ? { uid: session.user.id } : null);
  });
  return () => sub.subscription.unsubscribe();
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
