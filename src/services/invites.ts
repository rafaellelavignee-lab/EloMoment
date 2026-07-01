import { supabase } from "@/lib/supabase";
import type { Invite, UserRole } from "@/types";

function toInvite(row: Record<string, any>): Invite {
  return {
    code: row.code,
    role: row.role,
    singleUse: row.single_use,
    used: row.used,
    usedBy: row.used_by ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getInvite(code: string): Promise<Invite | null> {
  const { data, error } = await supabase.from("invites").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  return data ? toInvite(data) : null;
}

/** Marca o convite como usado (update condicional: impede uso duplicado simultâneo) */
export async function consumeInvite(code: string, uid: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("invites").select("*").eq("code", code).maybeSingle();
  if (fetchError) throw fetchError;
  if (!existing) throw new Error("Este convite não existe.");
  if (existing.single_use && existing.used) throw new Error("Este convite já foi utilizado.");

  const { data, error } = await supabase
    .from("invites")
    .update({ used: true, used_by: uid })
    .eq("code", code)
    .eq("used", false)
    .select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Este convite já foi utilizado.");
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map((n) => chars[n % chars.length])
    .join("");
}

export async function createInvite(role: UserRole = "guest", singleUse = true): Promise<string> {
  const code = generateInviteCode();
  const { error } = await supabase.from("invites").insert({
    code, role, single_use: singleUse, used: false, created_at: Date.now(),
  });
  if (error) throw error;
  return code;
}

export async function listInvites(): Promise<Invite[]> {
  const { data, error } = await supabase.from("invites").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toInvite);
}

export async function deleteInvite(code: string): Promise<void> {
  const { error } = await supabase.from("invites").delete().eq("code", code);
  if (error) throw error;
}
