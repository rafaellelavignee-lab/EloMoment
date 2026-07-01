import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { watchMural, addMuralMessage, deleteMuralMessage } from "@/services/mural";
import { useAuthStore } from "@/stores/authStore";
import { useUsers } from "@/hooks/useUsers";
import type { MuralMessage } from "@/types";

/**
 * Mural de recados: cada mensagem é uma estrela posicionada no céu.
 * Clicar em uma estrela abre o recado com animação suave.
 */
export default function StarWall() {
  const user = useAuthStore((s) => s.user);
  const users = useUsers();
  const [messages, setMessages] = useState<MuralMessage[]>([]);
  const [open, setOpen] = useState<MuralMessage | null>(null);
  const [text, setText] = useState("");

  useEffect(() => watchMural(setMessages), []);

  async function send() {
    if (!user || !text.trim()) return;
    await addMuralMessage(user.uid, text.trim());
    setText("");
  }

  return (
    <div>
      <div className="glass relative h-[52vh] overflow-hidden sm:h-[60vh]">
        {messages.map((m, i) => (
          <motion.button
            key={m.id}
            onClick={() => setOpen(m)}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xl"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.6 }}
            aria-label={`Recado de ${users[m.authorId]?.name ?? "convidado"}`}
          >
            <span className="animate-twinkle drop-shadow-[0_0_8px_rgba(248,215,110,.8)]">⭐</span>
          </motion.button>
        ))}
        {messages.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-mist/50">
            O céu ainda está vazio. Deixe o primeiro recado e acenda uma estrela. ✨
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Deixe um recado para a debutante…"
          className="input-night"
        />
        <button onClick={send} className="btn-star shrink-0">Acender ⭐</button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="glass max-w-sm p-6 text-center"
              initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-4xl">⭐</span>
              <p className="mt-3 font-display text-lg text-lunar">“{open.text}”</p>
              <p className="mt-2 text-sm text-mist/60">— {users[open.authorId]?.name ?? "Convidado"}</p>
              {(user?.uid === open.authorId || user?.role === "host") && (
                <button
                  onClick={() => { deleteMuralMessage(open.id); setOpen(null); }}
                  className="mt-4 text-xs text-mist/50 underline"
                >
                  Excluir recado
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
