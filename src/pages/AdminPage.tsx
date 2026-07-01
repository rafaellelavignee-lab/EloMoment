import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUsers } from "@/hooks/useUsers";
import { createInvite, listInvites, deleteInvite } from "@/services/invites";
import { addAnnouncement } from "@/services/mural";
import { removeUser } from "@/services/users";
import Avatar from "@/components/ui/Avatar";
import type { Invite } from "@/types";

/** Painel do Anfitrião + área da Debutante */
export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const users = useUsers();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [copied, setCopied] = useState("");
  const isHost = user?.role === "host";
  const isDebutante = user?.role === "debutante";

  useEffect(() => { if (isHost) listInvites().then(setInvites); }, [isHost]);

  if (!isHost && !isDebutante) {
    return <p className="py-16 text-center text-mist/50">Área reservada ao anfitrião e à debutante. 👑</p>;
  }

  async function newInvite(role: "guest" | "debutante") {
    const code = await createInvite(role);
    setInvites(await listInvites());
    copy(code);
  }

  function copy(code: string) {
    navigator.clipboard.writeText(`${location.origin}/invite/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  }

  async function sendAnnouncement() {
    if (!user || !announcement.trim()) return;
    await addAnnouncement(user.uid, announcement.trim());
    setAnnouncement("");
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-lunar">
        {isHost ? "Painel do anfitrião 👑" : "Painel da debutante 👑"}
      </h2>

      {/* Anúncios: ambos podem */}
      <section className="glass p-5">
        <h3 className="font-semibold text-lunar">Enviar aviso para todos</h3>
        <div className="mt-2 flex gap-2">
          <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Ex.: A valsa começa em 10 minutos! 💃" className="input-night" />
          <button onClick={sendAnnouncement} className="btn-star shrink-0">📣 Enviar</button>
        </div>
      </section>

      {isHost && (
        <>
          <section className="glass p-5">
            <h3 className="font-semibold text-lunar">Convites</h3>
            <p className="mt-1 text-xs text-mist/50">Convites são únicos e expiram após o uso.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => newInvite("guest")} className="btn-star !py-2 text-sm">+ Convidado</button>
              <button onClick={() => newInvite("debutante")} className="btn-ghost !py-2 text-sm">+ Debutante</button>
            </div>
            <ul className="mt-4 space-y-2">
              {invites.map((inv) => (
                <li key={inv.code} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <code className="tracking-wider text-star">{inv.code}</code>
                  <span className="text-xs text-mist/50">{inv.role}</span>
                  <span className={`text-xs ${inv.used ? "text-mist/40" : "text-green-300"}`}>
                    {inv.used ? "usado" : "disponível"}
                  </span>
                  <span className="ml-auto flex gap-2">
                    {!inv.used && (
                      <button onClick={() => copy(inv.code)} className="text-xs underline">
                        {copied === inv.code ? "Copiado! ✓" : "Copiar link"}
                      </button>
                    )}
                    <button onClick={async () => { await deleteInvite(inv.code); setInvites(await listInvites()); }}
                      className="text-xs text-red-300">Excluir</button>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass p-5">
            <h3 className="font-semibold text-lunar">Convidados</h3>
            <ul className="mt-3 space-y-2">
              {Object.values(users).map((u) => (
                <li key={u.uid} className="flex items-center gap-3">
                  <Avatar user={u} size={32} />
                  <span className="text-sm">{u.name}</span>
                  <span className="text-xs text-mist/40">{u.role}</span>
                  {u.uid !== user?.uid && (
                    <button onClick={() => removeUser(u.uid)} className="ml-auto text-xs text-red-300">Remover</button>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-mist/40">
              Moderação de posts e comentários: use os botões Excluir/Fixar diretamente no feed.
            </p>
          </section>
        </>
      )}

      {isDebutante && (
        <section className="glass p-5">
          <h3 className="font-semibold text-lunar">Sua noite ✨</h3>
          <p className="mt-1 text-sm text-mist/60">
            Envie mensagens de destaque pelo aviso acima — elas aparecem para todos os convidados.
            Fixe suas fotos favoritas pedindo ao anfitrião, ou publique um post especial no feed.
          </p>
        </section>
      )}
    </div>
  );
}
