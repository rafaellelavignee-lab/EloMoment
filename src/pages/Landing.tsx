import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import StarField from "@/components/sky/StarField";
import Splash from "@/components/sky/Splash";
import { useAuthStore } from "@/stores/authStore";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  const [splashDone, setSplashDone] = useState(sessionStorage.getItem("elomoment-splash") === "1");
  const [code, setCode] = useState("");

  function finishSplash() {
    sessionStorage.setItem("elomoment-splash", "1");
    setSplashDone(true);
  }

  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-6">
      <AnimatePresence>{!splashDone && <Splash onDone={finishSplash} />}</AnimatePresence>
      <StarField density={1.3} />

      {/* Lua */}
      <div
        className="animate-floaty absolute right-[10%] top-[10%] h-20 w-20 rounded-full sm:h-28 sm:w-28"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E7EAF2 55%, #b9c4de 100%)",
          boxShadow: "0 0 60px 16px rgba(231,234,242,.3)",
        }}
        aria-hidden="true"
      />

      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: splashDone ? 1 : 0, y: splashDone ? 0 : 24 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-display text-5xl text-lunar sm:text-6xl">
          Elo<span className="text-star">Moment</span>
        </h1>
        <p className="mt-3 text-mist/80">Onde cada estrela guarda uma lembrança.</p>

        <div className="glass mt-10 p-6">
          <p className="text-sm text-mist/70">
            Esta é uma rede social privada da festa. O acesso acontece apenas pelo link do convite.
          </p>
          <label className="mt-4 block text-left text-xs text-mist/60" htmlFor="invite">
            Já tem um código de convite?
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="invite"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123XYZ"
              className="input-night tracking-widest"
            />
            <button
              onClick={() => code.trim() && navigate(`/invite/${code.trim()}`)}
              className="btn-star shrink-0"
            >
              Entrar
            </button>
          </div>
        </div>

        <button onClick={() => navigate("/login")} className="btn-ghost mt-4 text-sm">
          Já tenho conta com e-mail e senha
        </button>

        <p className="mt-6 text-xs text-mist/40">Noite Estrelada · 15 anos ✨</p>
      </motion.div>
    </div>
  );
}
