import type { UserProfile } from "@/types";

export function toUserProfile(row: Record<string, any>): UserProfile {
  return {
    uid: row.uid,
    name: row.name,
    photoURL: row.photo_url,
    birthdate: row.birthdate ?? undefined,
    phrase: row.phrase ?? undefined,
    favoriteEmoji: row.favorite_emoji ?? undefined,
    favoriteColor: row.favorite_color ?? undefined,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function fromUserProfile(profile: Partial<UserProfile>): Record<string, any> {
  const row: Record<string, any> = {};
  if (profile.uid !== undefined) row.uid = profile.uid;
  if (profile.name !== undefined) row.name = profile.name;
  if (profile.photoURL !== undefined) row.photo_url = profile.photoURL;
  if (profile.birthdate !== undefined) row.birthdate = profile.birthdate;
  if (profile.phrase !== undefined) row.phrase = profile.phrase;
  if (profile.favoriteEmoji !== undefined) row.favorite_emoji = profile.favoriteEmoji;
  if (profile.favoriteColor !== undefined) row.favorite_color = profile.favoriteColor;
  if (profile.role !== undefined) row.role = profile.role;
  if (profile.createdAt !== undefined) row.created_at = profile.createdAt;
  return row;
}
