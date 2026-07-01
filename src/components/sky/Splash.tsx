import { motion } from "framer-motion";
import StarField from "./StarField";

/** Abertura cinematográfica: estrelas -> lua -> logo -> slogan */
export default function Splash({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <StarField density={1.4} />

      {/* Lua surgindo lentamente */}
      <motion.div
        className="absolute right-[12%] top-[14%] h-24 w-24 rounded-full sm:h-32 sm:w-32"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E7EAF2 55%, #b9c4de 100%)",
          boxShadow: "0 0 60px 18px rgba(231,234,242,.35)",
        }}
        initial={{ opacity: 0, y: 40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, duration: 1.6, ease: "easeOut" }}
      />

      <motion.h1
        className="font-display text-5xl tracking-wide text-lunar sm:text-7xl"
        initial={{ opacity: 0, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, letterSpacing: "0.08em" }}
        transition={{ delay: 1.4, duration: 1.4, ease: "easeOut" }}
      >
        Elo<span className="text-star">Moment</span>
      </motion.h1>

      <motion.p
        className="mt-4 text-sm text-mist/80 sm:text-base"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 1 }}
        onAnimationComplete={() => setTimeout(onDone, 900)}
      >
        Onde cada estrela guarda uma lembrança.
      </motion.p>
    </motion.div>
  );
}
