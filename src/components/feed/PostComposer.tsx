import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { createPost } from "@/services/posts";
import { uploadMedia, mediaTypeOf } from "@/services/storage";
import Avatar from "@/components/ui/Avatar";

const QUICK_EMOJIS = ["✨", "🌙", "⭐", "💜", "🎉", "😍", "🥹", "📸"];

export default function PostComposer() {
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  async function publish() {
    if (!user || sending || (!text.trim() && !file)) return;
    setSending(true);
    try {
      let mediaURL: string | null = null;
      let mediaType = null as ReturnType<typeof mediaTypeOf> | null;
      if (file) {
        mediaURL = await uploadMedia(user.uid, file);
        mediaType = mediaTypeOf(file);
      }
      await createPost(user.uid, text.trim(), mediaURL, mediaType, location.trim() || undefined);
      setText(""); setFile(null); setLocation("");
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div layout className="glass p-4">
      <div className="flex gap-3">
        <Avatar user={user} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Compartilhe um momento desta noite… ✨ (use #hashtags)"
            rows={2}
            className="input-night resize-none"
          />
          {preview && (
            <div className="relative mt-3 overflow-hidden rounded-xl">
              {file!.type.startsWith("video/") ? (
                <video src={preview} className="max-h-72 w-full object-cover" controls />
              ) : (
                <img src={preview} alt="Prévia" className="max-h-72 w-full object-cover" />
              )}
              <button
                onClick={() => setFile(null)}
                className="absolute right-2 top-2 rounded-full bg-navy/80 px-3 py-1 text-sm"
              >
                Remover
              </button>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button onClick={() => fileRef.current?.click()} className="btn-ghost !px-4 !py-1.5 text-sm">
              📷 Foto / vídeo
            </button>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="📍 Local"
              className="input-night !w-36 !py-1.5 text-sm"
            />
            <div className="hidden gap-1 sm:flex">
              {QUICK_EMOJIS.map((e) => (
                <button key={e} onClick={() => setText((t) => t + e)} className="text-lg transition-transform hover:scale-125">
                  {e}
                </button>
              ))}
            </div>
            <button onClick={publish} disabled={sending} className="btn-star !px-5 !py-1.5 ml-auto text-sm disabled:opacity-50">
              {sending ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
