export type UserRole = "guest" | "host" | "debutante";

export interface UserProfile {
  uid: string;
  name: string;
  photoURL: string | null;
  birthdate?: string;
  phrase?: string;
  favoriteEmoji?: string;
  favoriteColor?: string;
  role: UserRole;
  createdAt: number;
}

export interface Invite {
  code: string;
  role: UserRole;
  singleUse: boolean;
  used: boolean;
  usedBy?: string;
  createdAt: number;
}

export type MediaType = "image" | "video" | "gif";

export interface Post {
  id: string;
  authorId: string;
  text: string;
  mediaURL: string | null;
  mediaType: MediaType | null;
  location?: string;
  hashtags: string[];
  pinned: boolean;
  createdAt: number;
  /** uid -> emoji da reação */
  reactions: Record<string, string>;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
  likes: string[];
  replyTo?: string | null;
}

export interface Story {
  id: string;
  authorId: string;
  mediaURL: string | null;
  mediaType: MediaType | null;
  text?: string;
  textColor?: string;
  createdAt: number;
  expiresAt: number; // createdAt + 24h
}

export interface MuralMessage {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
  /** posição da estrela no céu do mural (0–100%) */
  x: number;
  y: number;
}

export interface GuestbookEntry {
  id: string;
  authorId: string;
  message: string;
  emoji?: string;
  signatureDataURL?: string | null;
  photoURL?: string | null;
  createdAt: number;
}

export interface TimelineMoment {
  id: string;
  time: string;
  title: string;
  description?: string;
  order: number;
}

export interface Announcement {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  members: string[];
  isGroup: boolean;
  name?: string;
  photoURL?: string | null;
  lastMessage?: { text: string; senderId: string; createdAt: number } | null;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaURL?: string | null;
  mediaType?: MediaType | "audio" | null;
  replyTo?: string | null;
  createdAt: number;
  readBy: string[];
}

export const REACTIONS = ["❤️", "😂", "😍", "🥹", "👏", "✨", "🌙", "⭐"] as const;
