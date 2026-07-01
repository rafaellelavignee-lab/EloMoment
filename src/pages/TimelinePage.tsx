import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { watchTimeline, addTimelineMoment, deleteTimelineMoment } from "@/services/mural";
import { useAuthStore } from "@/stores/authStore";
import type { TimelineMoment } from "@/types";

export default function TimelinePage() {
  const user = useAuthStore((s) => s.user);
  const [moments, setMoments] = useState<TimelineMoment[]>([]);
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const isStaff = user?.role === "host" || user?.role === "debutante";

  useEffect(() => watchTimeline(setMoments), []);

  async function add() {
    if (!time || !title.trim()) return;
    await addTimelineMoment({ time, title: title.trim(), order: moments.length });
    setTime(""); setTitle("");
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-lunar">Linha do tempo da festa</h2>
      <ol className="relative mt-6 ml-3 space-y-6 border-l border-star/30 pl-6">
        {moments.map((m, i) => (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-star shadow-glow" />
            <p className="font-display text-lg text-star">{m.time}</p>
            <p className="text-lunar">{m.title}</p>
            {m.description && <p className="text-sm text-mist/60">{m.description}</p>}
            <div className="mt-1 flex gap-3 text-xs">
              <Link to={`/app/buscar?hora=${m.time.split(":")[0]}`} className="text-nebula underline">
                Ver publicações desse momento
              </Link>
              {isStaff && (
                <button onClick={() => deleteTimelineMoment(m.id)} className="text-mist/40">Remover</button>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
      {moments.length === 0 && (
        <p className="mt-10 text-center text-sm text-mist/50">A programação da festa aparecerá aqui. 🕰️</p>
      )}

      {isStaff && (
        <div className="glass mt-8 flex flex-wrap gap-2 p-4">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-night !w-32" aria-label="Horário" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Momento (ex.: Valsa)" className="input-night flex-1" />
          <button onClick={add} className="btn-star">Adicionar</button>
        </div>
      )}
    </div>
  );
}
