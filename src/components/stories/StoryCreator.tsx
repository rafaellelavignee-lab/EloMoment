import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { createStory } from "@/services/stories";
import { uploadMedia, mediaTypeOf } from "@/services/storage";

const COLORS = ["#FFFFFF", "#F8D76E", "#5A4FCF", "#E7EAF2", "#FF8FA3"];
const STICKERS = ["✨", "🌙", "⭐", "💜", "🎂", "👑", "🎉", "🪩"];

export default function StoryCreator({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  async function publish() {
    if (!user || sending || (!file && !text.trim())) return;
    setSending(true);
    try {
      let mediaURL: string | null = null;
      let mediaType = null as ReturnType<typeof mediaTypeOf> | null;
      if (file) {
        mediaURL = await uploadMedia(user.uid, file);
        mediaType = mediaTypeOf(file);
      }
      await createStory(user.uid, mediaURL, mediaType, text.trim() || undefined, color);
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <div className="glass w-full max-w-md p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-lunar">Novo story</h2>
          <button onClick={onClose} className="text-2xl text-mist/70" aria-label="Fechar">×</button>
        </div>

        <div className="relative mt-4 flex aspect-[9/14] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-night to-galaxy">
          {preview ? (
            file!.type.startsWith("video/")
              ? <video src={preview} className="h-full w-full object-cover" controls />
              : <img src={preview} alt="Prévia" className="h-full w-full object-cover" />
          ) : (
            <p className="px-6 text-center text-sm text-mist/50">Tire uma foto, grave um vídeo ou escreva algo sob as estrelas ✨</p>
          )}
          {text && (
            <p className="absolute inset-x-4 bottom-6 text-center font-display text-2xl drop-shadow-lg" style={{ color }}>
              {text}
            </p>
          )}
        </div>

        {/* Captura direta da câmera (foto/vídeo) e galeria */}
        <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment" hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <input ref={fileRef} type="file" accept="image/*,video/*" hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <div className="mt-3 flex gap-2">
          <button onClick={() => cameraRef.current?.click()} className="btn-ghost flex-1 !px-3 !py-2 text-sm">📸 Câmera</button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost flex-1 !px-3 !py-2 text-sm">🖼️ Galeria</button>
        </div>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Texto do story…"
          className="input-night mt-3"
        />
        <div className="mt-2 flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-star" : "border-transparent"}`}
              style={{ background: c }}
              aria-label={`Cor ${c}`}
            />
          ))}
          <div className="ml-auto flex gap-1">
            {STICKERS.map((s) => (
              <button key={s} onClick={() => setText((t) => t + s)} className="text-lg transition-transform hover:scale-125">{s}</button>
            ))}
          </div>
        </div>

        <button onClick={publish} disabled={sending} className="btn-star mt-4 w-full disabled:opacity-50">
          {sending ? "Publicando…" : "Publicar story"}
        </button>
      </div>
    </motion.div>
  );
}
