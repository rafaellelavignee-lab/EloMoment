import { supabase } from "@/lib/supabase";
import { watchQuery } from "./realtime";
import type { MuralMessage, GuestbookEntry, TimelineMoment, Announcement } from "@/types";

function toMuralMessage(row: any): MuralMessage {
  return { id: row.id, authorId: row.author_id, text: row.text, createdAt: row.created_at, x: row.x, y: row.y };
}

function toGuestbookEntry(row: any): GuestbookEntry {
  return {
    id: row.id, authorId: row.author_id, message: row.message,
    emoji: row.emoji ?? undefined, signatureDataURL: row.signature_data_url ?? undefined,
    photoURL: row.photo_url ?? undefined, createdAt: row.created_at,
  };
}

function toTimelineMoment(row: any): TimelineMoment {
  return { id: row.id, time: row.time, title: row.title, description: row.description ?? undefined, order: row.order };
}

function toAnnouncement(row: any): Announcement {
  return { id: row.id, authorId: row.author_id, text: row.text, createdAt: row.created_at };
}

export function watchMural(cb: (msgs: MuralMessage[]) => void): () => void {
  return watchQuery(
    "mural_messages",
    async () => {
      const { data, error } = await supabase.from("mural_messages").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    toMuralMessage,
    cb
  );
}

export async function addMuralMessage(authorId: string, text: string): Promise<void> {
  const { error } = await supabase.from("mural_messages").insert({
    author_id: authorId, text, created_at: Date.now(),
    x: 6 + Math.random() * 88,
    y: 8 + Math.random() * 74,
  });
  if (error) throw error;
}

export async function deleteMuralMessage(id: string): Promise<void> {
  const { error } = await supabase.from("mural_messages").delete().eq("id", id);
  if (error) throw error;
}

export function watchGuestbook(cb: (entries: GuestbookEntry[]) => void): () => void {
  return watchQuery(
    "guestbook_entries",
    async () => {
      const { data, error } = await supabase.from("guestbook_entries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    toGuestbookEntry,
    cb
  );
}

export async function addGuestbookEntry(entry: Omit<GuestbookEntry, "id" | "createdAt">): Promise<void> {
  const { error } = await supabase.from("guestbook_entries").insert({
    author_id: entry.authorId, message: entry.message, emoji: entry.emoji ?? null,
    signature_data_url: entry.signatureDataURL ?? null, photo_url: entry.photoURL ?? null,
    created_at: Date.now(),
  });
  if (error) throw error;
}

export function watchTimeline(cb: (moments: TimelineMoment[]) => void): () => void {
  return watchQuery(
    "timeline_moments",
    async () => {
      const { data, error } = await supabase.from("timeline_moments").select("*").order("order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    toTimelineMoment,
    cb
  );
}

export async function addTimelineMoment(m: Omit<TimelineMoment, "id">): Promise<void> {
  const { error } = await supabase.from("timeline_moments").insert({
    time: m.time, title: m.title, description: m.description ?? null, order: m.order,
  });
  if (error) throw error;
}

export async function deleteTimelineMoment(id: string): Promise<void> {
  const { error } = await supabase.from("timeline_moments").delete().eq("id", id);
  if (error) throw error;
}

export function watchAnnouncements(cb: (a: Announcement[]) => void): () => void {
  return watchQuery(
    "announcements",
    async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    toAnnouncement,
    cb
  );
}

export async function addAnnouncement(authorId: string, text: string): Promise<void> {
  const { error } = await supabase.from("announcements").insert({ author_id: authorId, text, created_at: Date.now() });
  if (error) throw error;
}
