import { useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "@/types";
import { REACTIONS } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useUsers } from "@/hooks/useUsers";
import { react, deletePost, togglePin } from "@/services/posts";
import { timeAgo } from "@/utils/format";
import Avatar from "@/components/ui/Avatar";
import Comments from "./Comments";

export default function PostCard({ post }: { post: Post }) {
  const user = useAuthStore((s) => s.user);
  const users = useUsers();
  const author = users[post.authorId];
  const [showComments, setShowComments] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const myReaction = user ? post.reactions[user.uid] : undefined;
  const counts = Object.values(post.reactions).reduce<Record<string, number>>((acc, e) => {
    acc[e] = (acc[e] ?? 0) + 1;
    return acc;
  }, {});
  const canModerate = user && (user.uid === post.authorId || user.role === "host");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass overflow-hidden"
    >
      {post.pinned && (
        <div className="bg-star/15 px-4 py-1.5 text-xs text-star">⭐ Fixado pelo anfitrião</div>
      )}
      <header className="flex items-center gap-3 p-4 pb-2">
        <Avatar user={author} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-lunar">{author?.name ?? "Convidado"}</p>
          <p className="text-xs text-mist/50">
            {timeAgo(post.createdAt)}{post.location ? ` · 📍 ${post.location}` : ""}
          </p>
        </div>
        {user?.role === "host" && (
          <button onClick={() => togglePin(post.id, !post.pinned)} className="text-xs text-mist/60 hover:text-star">
            {post.pinned ? "Desafixar" : "Fixar"}
          </button>
        )}
        {canModerate && (
          <button onClick={() => deletePost(post.id)} className="text-xs text-mist/60 hover:text-red-400">
            Excluir
          </button>
        )}
      </header>

      {post.text && <p className="whitespace-pre-wrap px-4 pb-3 text-[15px]">{post.text}</p>}

      {post.mediaURL && (
        <div className="bg-black/30">
          {post.mediaType === "video" ? (
            <video src={post.mediaURL} controls playsInline className="max-h-[70vh] w-full object-contain" />
          ) : (
            <img src={post.mediaURL} alt="" loading="lazy" className="max-h-[70vh] w-full object-contain" />
          )}
        </div>
      )}

      <footer className="p-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${myReaction ? "bg-star/20 text-star" : "bg-white/5 hover:bg-white/10"}`}
            >
              {myReaction ?? "🤍"} Reagir
            </button>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass absolute bottom-full left-0 z-10 mb-2 flex gap-1 !rounded-full px-3 py-2"
              >
                {REACTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { user && react(post.id, user.uid, e, myReaction); setPickerOpen(false); }}
                    className="text-xl transition-transform hover:scale-150"
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          {Object.entries(counts).map(([e, n]) => (
            <span key={e} className="rounded-full bg-white/5 px-2 py-1 text-sm">{e} {n}</span>
          ))}
          <button onClick={() => setShowComments((v) => !v)} className="ml-auto text-sm text-mist/70 hover:text-lunar">
            💬 Comentários
          </button>
        </div>
        {showComments && <Comments postId={post.id} />}
      </footer>
    </motion.article>
  );
}
