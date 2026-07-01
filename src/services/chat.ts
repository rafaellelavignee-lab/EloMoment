import { supabase } from "@/lib/supabase";
import { watchQuery } from "./realtime";
import type { Chat, Message, MediaType } from "@/types";

function toChat(row: any): Chat {
  return {
    id: row.id,
    members: row.members ?? [],
    isGroup: row.is_group,
    name: row.name ?? undefined,
    photoURL: row.photo_url,
    lastMessage: row.last_message ?? null,
    createdAt: row.created_at,
  };
}

function toMessage(row: any): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    text: row.text ?? undefined,
    mediaURL: row.media_url,
    mediaType: row.media_type,
    replyTo: row.reply_to ?? undefined,
    createdAt: row.created_at,
    readBy: row.read_by ?? [],
  };
}

export function watchMyChats(uid: string, cb: (chats: Chat[]) => void): () => void {
  return watchQuery(
    "chats",
    async () => {
      const { data, error } = await supabase.from("chats").select("*").contains("members", [uid]);
      if (error) throw error;
      return data ?? [];
    },
    toChat,
    (chats) => {
      chats.sort((a, b) => (b.lastMessage?.createdAt ?? b.createdAt) - (a.lastMessage?.createdAt ?? a.createdAt));
      cb(chats);
    }
  );
}

export async function createChat(members: string[], isGroup = false, name?: string): Promise<string> {
  const { data, error } = await supabase
    .from("chats")
    .insert({ members, is_group: isGroup, name: name ?? "", photo_url: null, last_message: null, created_at: Date.now() })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export function watchMessages(chatId: string, cb: (msgs: Message[]) => void): () => void {
  return watchQuery(
    "messages",
    async () => {
      const { data, error } = await supabase
        .from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    toMessage,
    cb,
    `chat_id=eq.${chatId}`
  );
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text?: string,
  mediaURL?: string | null,
  mediaType?: MediaType | "audio" | null,
  replyTo?: string | null
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    chat_id: chatId, sender_id: senderId, text: text ?? "", media_url: mediaURL ?? null,
    media_type: mediaType ?? null, reply_to: replyTo ?? null,
    created_at: Date.now(), read_by: [senderId],
  });
  if (error) throw error;

  const { error: updateError } = await supabase
    .from("chats")
    .update({ last_message: { text: text || "📷 Mídia", senderId, createdAt: Date.now() } })
    .eq("id", chatId);
  if (updateError) throw updateError;
}

export async function markRead(chatId: string, messageId: string, uid: string): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("messages").select("read_by").eq("id", messageId).eq("chat_id", chatId).single();
  if (fetchError) throw fetchError;
  const readBy: string[] = data?.read_by ?? [];
  if (readBy.includes(uid)) return;
  const { error } = await supabase.from("messages").update({ read_by: [...readBy, uid] }).eq("id", messageId);
  if (error) throw error;
}
