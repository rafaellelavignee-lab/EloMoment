import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Story, UserProfile } from "@/types";
import { timeAgo } from "@/utils/format";
import Avatar from "@/components/ui/Avatar";

const DURATION = 6000;

interface Props { stories: Story[]; author?: UserProfile; onClose: () => void; }

export default function StoryViewer({ stories, author, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const story = stories[index];

  useEffect(() => {
    if (story?.mediaType === "video") return; // vídeo avança no onEnded
    const t = setTimeout(() => next(), DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, story?.mediaType]);

  function next() { index < stories.length - 1 ? setIndex(index + 1) : onClose(); }
  function prev() { if (index > 0) setIndex(index - 1); }

  if (!story) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="relative h-full max-h-[92vh] w-full max-w-md overflow-hidden sm:rounded-2xl">
        {/* Barras de progresso */}
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-3">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              {i === index && story.mediaType !== "video" && (
                <motion.div
                  className="h-full bg-star"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: DURATION / 1000, ease: "linear" }}
                />
              )}
              {i < index && <div className="h-full w-full bg-star" />}
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 top-5 z-10 flex items-center gap-2 p-3">
          <Avatar user={author} size={34} />
          <span className="text-sm font-semibold text-lunar">{author?.name}</span>
          <span className="text-xs text-mist/60">{timeAgo(story.createdAt)}</span>
          <button onClick={onClose} className="ml-auto text-2xl text-lunar/80" aria-label="Fechar">×</button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            className="flex h-full w-full items-center justify-center bg-gradient-to-b from-night to-navy"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {story.mediaURL && story.mediaType === "video" && (
              <video src={story.mediaURL} autoPlay playsInline onEnded={next} className="h-full w-full object-contain" />
            )}
            {story.mediaURL && story.mediaType !== "video" && (
              <img src={story.mediaURL} alt="" className="h-full w-full object-contain" />
            )}
            {story.text && (
              <p
                className="absolute inset-x-6 bottom-16 text-center font-display text-2xl drop-shadow-lg"
                style={{ color: story.textColor ?? "#FFFFFF" }}
              >
                {story.text}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navegação por toque */}
        <button className="absolute inset-y-0 left-0 w-1/3" onClick={prev} aria-label="Anterior" />
        <button className="absolute inset-y-0 right-0 w-1/3" onClick={next} aria-label="Próximo" />
      </div>
    </motion.div>
  );
}
