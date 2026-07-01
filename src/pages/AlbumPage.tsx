import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { watchPosts } from "@/services/posts";
import { useUsers } from "@/hooks/useUsers";
import { formatTime } from "@/utils/format";
import type { Post } from "@/types";

type ViewMode = "grade" | "mosaico";

export default function AlbumPage() {
  const users = useUsers();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<ViewMode>("grade");
  const [person, setPerson] = useState("todos");
  const [hour, setHour] = useState("todas");
  const [lightbox, setLightbox] = useState<Post | null>(null);

  useEffect(() => watchPosts(setPosts), []);

  const media = useMemo(() => posts.filter((p) => p.mediaURL), [posts]);
  const hours = useMemo(
    () => Array.from(new Set(media.map((p) => new Date(p.createdAt).getHours()))).sort((a, b) => a - b),
    [media]
  );

  const filtered = media
    .filter((p) => person === "todos" || p.authorId === person)
    .filter((p) => hour === "todas" || new Date(p.createdAt).getHours() === Number(hour))
    .sort((a, b) => a.createdAt - b.createdAt); // organizado por horário

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-display text-2xl text-lunar">Álbum do evento</h2>
        <select value={person} onChange={(e) => setPerson(e.target.value)} className="input-night !w-auto !py-1.5 text-sm">
          <option value="todos">Todas as pessoas</option>
          {Object.values(users).map((u) => <option key={u.uid} value={u.uid}>{u.name}</option>)}
        </select>
        <select value={hour} onChange={(e) => setHour(e.target.value)} className="input-night !w-auto !py-1.5 text-sm">
          <option value="todas">Todos os horários</option>
          {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
        </select>
        <button onClick={() => setMode(mode === "grade" ? "mosaico" : "grade")} className="btn-ghost !px-4 !py-1.5 text-sm">
          {mode === "grade" ? "◫ Mosaico" : "▦ Grade"}
        </button>
      </div>

      <div className={mode === "grade" ? "grid grid-cols-3 gap-1 sm:gap-2" : "columns-2 gap-2 sm:columns-3 [&>*]:mb-2"}>
        {filtered.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => setLightbox(p)}
            className={`block w-full overflow-hidden rounded-lg ${mode === "grade" ? "aspect-square" : ""}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.03, 0.5) }}
          >
            {p.mediaType === "video" ? (
              <video src={p.mediaURL!} className="h-full w-full object-cover" muted />
            ) : (
              <img src={p.mediaURL!} alt="" loading="lazy" className="h-full w-full object-cover transition-transform hover:scale-105" />
            )}
          </motion.button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-mist/50">Nenhuma foto por aqui ainda. 📸</p>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 p-4 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {lightbox.mediaType === "video" ? (
              <video src={lightbox.mediaURL!} controls autoPlay className="max-h-[80vh] rounded-xl" />
            ) : (
              <img src={lightbox.mediaURL!} alt="" className="max-h-[80vh] rounded-xl" />
            )}
            <p className="mt-2 text-center text-sm text-mist/70">
              {users[lightbox.authorId]?.name} · {formatTime(lightbox.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
