import { supabase } from "@/lib/supabase";
import { watchQuery } from "./realtime";
import type { Story, MediaType } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

function toStory(row: any): Story {
  return {
    id: row.id, authorId: row.author_id, mediaURL: row.media_url, mediaType: row.media_type,
    text: row.text ?? undefined, textColor: row.text_color ?? undefined,
    createdAt: row.created_at, expiresAt: row.expires_at,
  };
}

/** Observa apenas stories ativos (últimas 24h) */
export function watchActiveStories(cb: (stories: Story[]) => void): () => void {
  return watchQuery(
    "stories",
    async () => {
      const { data, error } = await supabase.from("stories").select("*").gt("expires_at", Date.now());
      if (error) throw error;
      return data ?? [];
    },
    toStory,
    (stories) => {
      stories.sort((a, b) => a.createdAt - b.createdAt);
      cb(stories);
    }
  );
}

export async function createStory(
  authorId: string,
  mediaURL: string | null,
  mediaType: MediaType | null,
  text?: string,
  textColor?: string
): Promise<void> {
  const now = Date.now();
  const { error } = await supabase.from("stories").insert({
    author_id: authorId, media_url: mediaURL, media_type: mediaType,
    text: text ?? "", text_color: textColor ?? "#FFFFFF",
    created_at: now, expires_at: now + DAY,
  });
  if (error) throw error;
}

export async function deleteStory(id: string): Promise<void> {
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) throw error;
}
