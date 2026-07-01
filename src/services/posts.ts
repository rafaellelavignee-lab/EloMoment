import { supabase } from "@/lib/supabase";
import { watchQuery } from "./realtime";
import { extractHashtags } from "@/utils/format";
import type { Post, Comment, MediaType } from "@/types";

function toPost(row: any): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    text: row.text,
    mediaURL: row.media_url,
    mediaType: row.media_type,
    location: row.location ?? "",
    hashtags: row.hashtags ?? [],
    pinned: row.pinned,
    createdAt: row.created_at,
    reactions: row.reactions ?? {},
  };
}

function toComment(row: any): Comment {
  return {
    id: row.id,
    authorId: row.author_id,
    text: row.text,
    createdAt: row.created_at,
    likes: row.likes ?? [],
    replyTo: row.reply_to ?? undefined,
  };
}

export function watchPosts(cb: (posts: Post[]) => void): () => void {
  return watchQuery(
    "posts",
    async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    toPost,
    (posts) => {
      // Posts fixados primeiro
      posts.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
      cb(posts);
    }
  );
}

export async function createPost(
  authorId: string,
  text: string,
  mediaURL: string | null,
  mediaType: MediaType | null,
  location?: string
): Promise<void> {
  const { error } = await supabase.from("posts").insert({
    author_id: authorId, text, media_url: mediaURL, media_type: mediaType,
    location: location ?? "",
    hashtags: extractHashtags(text),
    pinned: false,
    created_at: Date.now(),
    reactions: {},
  });
  if (error) throw error;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function togglePin(postId: string, pinned: boolean): Promise<void> {
  const { error } = await supabase.from("posts").update({ pinned }).eq("id", postId);
  if (error) throw error;
}

/** Reagir: mesmo emoji remove; outro emoji substitui.
 * Leitura-modificação-escrita (sem lock) — aceitável no volume de uma festa. */
export async function react(postId: string, uid: string, emoji: string, current?: string): Promise<void> {
  const { data, error: fetchError } = await supabase.from("posts").select("reactions").eq("id", postId).single();
  if (fetchError) throw fetchError;
  const reactions: Record<string, string> = { ...(data?.reactions ?? {}) };
  if (current === emoji) delete reactions[uid];
  else reactions[uid] = emoji;
  const { error } = await supabase.from("posts").update({ reactions }).eq("id", postId);
  if (error) throw error;
}

export function watchComments(postId: string, cb: (c: Comment[]) => void): () => void {
  return watchQuery(
    "comments",
    async () => {
      const { data, error } = await supabase
        .from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    toComment,
    cb,
    `post_id=eq.${postId}`
  );
}

export async function addComment(postId: string, authorId: string, text: string, replyTo?: string): Promise<void> {
  const { error } = await supabase.from("comments").insert({
    post_id: postId, author_id: authorId, text, created_at: Date.now(),
    likes: [], reply_to: replyTo ?? null,
  });
  if (error) throw error;
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("post_id", postId);
  if (error) throw error;
}

export async function toggleCommentLike(postId: string, commentId: string, uid: string, liked: boolean): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("comments").select("likes").eq("id", commentId).eq("post_id", postId).single();
  if (fetchError) throw fetchError;
  const likes: string[] = data?.likes ?? [];
  const next = liked ? likes.filter((u) => u !== uid) : [...likes, uid];
  const { error } = await supabase.from("comments").update({ likes: next }).eq("id", commentId);
  if (error) throw error;
}
