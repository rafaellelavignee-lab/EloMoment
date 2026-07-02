import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import StarField from "@/components/sky/StarField";
import { getInvite } from "@/services/invites";
import { registerWithInvite } from "@/services/auth";
import { uploadMedia } from "@/services/storage";
import { useAuthStore } from "@/stores/authStore";
import type { Invite } from "@/types";

const EMOJIS = ["✨", "🌙", "⭐", "💜", "🎀", "🦋", "🌸", "🎉", "🪩", "👑"];
const COLORS = ["#F8D76E", "#5A4FCF", "#193B7D", "#FF8FA3", "#7FD1AE", "#E7EAF2"];

export default function InvitePage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [invite, setInvite] = useState<Invite | null | "loading">("loading");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phrase, setPhrase] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getInvite(code).then((inv) => {
      if (!inv || (inv.singleUse && inv.used)) setInvite(null);
      else setInvite(inv);
    }).catch(() => setInvite(null));
  }, [code]);

  async function submit() {
    if (!invite || invite === "loading" || sending) return;
    if (!name.trim()) { setError("Digite seu nome para continuar."); return; }
    if (email.trim() && password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setSending(true); setError("");
    try {
      const profile = await registerWithInvite(code, {
        name: name.trim(),
        photoURL: null,
        birthdate: birthdate || undefined,
        phrase: phrase.trim() || undefined,
        favoriteEmoji: emoji,
        favoriteColor: color,
      }, invite.role, email.trim() ? { email: email.trim(), password } : undefined);
      if (photo) {
        const url = await uploadMedia(profile.uid, photo, "avatars");
        profile.photoURL = url;
        const { updateProfile } = await import("@/services/auth");
        await updateProfile(profile.uid, { photoURL: url });
      }
      setUser(profile);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  if (invite === "loading") {
    return (
      <div className="flex min-h-full items-center justify-center">
        <StarField />
        <p className="animate-pulse text-mist/60">Procurando seu convite entre as estrelas…</p>
      </div>
    );
  }

  if (invite === null) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
        <StarField />
        <span className="text-5xl">🌠</span>
        <h1 className="mt-4 font-display text-3xl text-lunar">Este convite não existe.</h1>
        <p className="mt-2 max-w-xs text-sm text-mist/60">
          Confira o link recebido ou peça um novo convite ao anfitrião da festa.
        </p>
        <button onClick={() => navigate("/")} className="btn-ghost mt-8">Voltar ao início</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <StarField />
      <motion.div
        className="glass w-full max-w-md p-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl text-lunar">Você foi convidado ✨</h1>
        <p className="mt-1 text-sm text-mist/60">Crie seu perfil para entrar na Noite Estrelada.</p>

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-star/50 text-2xl"
            aria-label="Adicionar foto de perfil"
          >
            {photo ? <img src={URL.createObjectURL(photo)} alt="Sua foto" className="h-full w-full object-cover" /> : "📷"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          <div className="flex-1">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome *" className="input-night" />
            <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="input-night mt-2 text-mist/70" aria-label="Data de nascimento (opcional)" />
          </div>
        </div>

        <input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Uma frase sua ✍️" className="input-night mt-3" />

        <p className="mt-4 text-xs text-mist/60">Emoji favorito</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`rounded-full px-2 py-1 text-xl transition ${emoji === e ? "bg-star/25 ring-1 ring-star" : "hover:bg-white/10"}`}>
              {e}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-mist/60">Cor favorita</p>
        <div className="mt-1 flex gap-2">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-lunar" : "border-transparent"}`}
              style={{ background: c }} aria-label={`Cor ${c}`} />
          ))}
        </div>

        <p className="mt-5 text-xs text-mist/60">
          Quer poder entrar de novo depois com e-mail e senha? (opcional)
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          className="input-night mt-2"
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Crie uma senha (mín. 6 caracteres)"
          className="input-night mt-2"
          autoComplete="new-password"
        />

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button onClick={submit} disabled={sending} className="btn-star mt-6 w-full disabled:opacity-50">
          {sending ? "Entrando…" : "Entrar na festa ✨"}
        </button>
      </motion.div>
    </div>
  );
}
