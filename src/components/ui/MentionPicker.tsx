import { useState } from "react";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types";
import Avatar from "./Avatar";

interface Props {
  users: Record<string, UserProfile>;
  excludeUid?: string;
  onPick: (name: string) => void;
}

/** Botão "👤" que abre uma lista de pessoas pra marcar (@Nome) no texto. */
export default function MentionPicker({ users, excludeUid, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const list = Object.values(users).filter((u) => u.uid !== excludeUid && u.name?.trim());

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost !px-3 !py-1.5 text-sm"
        aria-label="Marcar pessoa"
      >
        👤
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass absolute bottom-full left-0 z-10 mb-2 max-h-56 w-52 overflow-y-auto !rounded-xl p-2"
        >
          {list.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-mist/50">Ninguém pra marcar ainda.</p>
          ) : (
            list.map((u) => {
              function pick() { onPick(u.name); setOpen(false); }
              return (
                <div
                  key={u.uid}
                  role="button"
                  tabIndex={0}
                  onClick={pick}
                  onKeyDown={(e) => { if (e.key === "Enter") pick(); }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/10"
                >
                  <Avatar user={u} size={22} />
                  <span className="truncate">{u.name}</span>
                </div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
}
