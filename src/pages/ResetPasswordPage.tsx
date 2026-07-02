import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarField from "@/components/sky/StarField";
import { supabase } from "@/lib/supabase";
import { updatePassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Se a sessão de recuperação já foi processada antes deste efeito montar
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit() {
    if (sending) return;
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await updatePassword(password);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar a nova senha.");
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
        <h1 className="font-display text-2xl text-lunar">Criar nova senha ✨</h1>

        {!ready ? (
          <p className="mt-3 text-sm text-mist/60">
            Abra esta página pelo link que chegou no seu e-mail.
          </p>
        ) : (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha (mín. 6 caracteres)"
              className="input-night mt-5"
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
            <button onClick={submit} disabled={sending} className="btn-star mt-6 w-full disabled:opacity-50">
              {sending ? "Salvando…" : "Salvar nova senha"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
