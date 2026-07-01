import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StarField from "@/components/sky/StarField";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { watchAnnouncements } from "@/services/mural";
import type { Announcement } from "@/types";

const NAV = [
  { to: "/app", label: "Início", icon: "🌌", end: true },
  { to: "/app/album", label: "Álbum", icon: "🖼️" },
  { to: "/app/mural", label: "Mural", icon: "⭐" },
  { to: "/app/timeline", label: "Festa", icon: "🕰️" },
  { to: "/app/chat", label: "Chat", icon: "💬" },
];

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useUIStore();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string | null>(localStorage.getItem("elomoment-ann"));

  useEffect(() => watchAnnouncements(setAnnouncements), []);
  const latest = announcements[0];

  return (
    <div className="min-h-full pb-24 sm:pb-8">
      <StarField />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <h1 className="font-display text-xl text-lunar">
            Elo<span className="text-star">Moment</span>
          </h1>
          <nav className="ml-6 hidden gap-1 sm:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm transition ${isActive ? "bg-star/15 text-star" : "text-mist/70 hover:text-lunar"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => navigate("/app/buscar")} aria-label="Pesquisar" className="text-lg">🔍</button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Alternar tema"
              className="text-lg"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            {(user?.role === "host" || user?.role === "debutante") && (
              <button onClick={() => navigate("/app/painel")} aria-label="Painel" className="text-lg">👑</button>
            )}
            <Avatar user={user} size={34} onClick={() => navigate("/app/perfil/" + user?.uid)} />
          </div>
        </div>
      </header>

      {/* Anúncio do anfitrião */}
      <AnimatePresence>
        {latest && dismissed !== latest.id && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-auto mt-3 flex max-w-2xl items-center gap-3 rounded-xl bg-star/15 px-4 py-2 text-sm text-star"
          >
            <span>📣 {latest.text}</span>
            <button
              className="ml-auto"
              onClick={() => { setDismissed(latest.id); localStorage.setItem("elomoment-ann", latest.id); }}
              aria-label="Dispensar aviso"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-2xl px-4 py-5">
        <Outlet />
      </main>

      {/* Navegação inferior (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy/85 backdrop-blur-md sm:hidden">
        <div className="flex justify-around py-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 text-[11px] ${isActive ? "text-star" : "text-mist/60"}`
              }
            >
              <span className="text-xl">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
