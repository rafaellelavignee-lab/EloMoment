import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarField from "@/components/sky/StarField";
import { loginWithPassword } from "@/services/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (sending) return;
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await loginWithPassword(email.trim(), password);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar. Confira e-mail e senha.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <StarField />
      <motion.div
        className="glass w-full max-w-sm p-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl text-lunar">Bem-vindo de volta ✨</h1>
        <p className="mt-1 text-sm text-mist/60">Entre com o e-mail e a senha que você criou.</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          className="input-night mt-5"
          autoComplete="email"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          className="input-night mt-2"
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button onClick={submit} disabled={sending} className="btn-star mt-6 w-full disabled:opacity-50">
          {sending ? "Entrando…" : "Entrar"}
        </button>
        <button onClick={() => navigate("/")} className="btn-ghost mt-3 w-full">
          Voltar ao início
        </button>
      </motion.div>
    </div>
  );
}
