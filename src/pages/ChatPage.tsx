import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUsers } from "@/hooks/useUsers";
import { watchMyChats, watchMessages, createChat, sendMessage, reactToMessage } from "@/services/chat";
import { uploadMedia, mediaTypeOf } from "@/services/storage";
import { formatTime } from "@/utils/format";
import { renderWithMentions } from "@/utils/mentions";
import Avatar from "@/components/ui/Avatar";
import MentionPicker from "@/components/ui/MentionPicker";
import { REACTIONS } from "@/types";
import type { Chat, Message } from "@/types";

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const users = useUsers();
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [picking, setPicking] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => (user ? watchMyChats(user.uid, setChats) : undefined), [user]);
  useEffect(() => (active ? watchMessages(active.id, setMessages) : undefined), [active]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function chatTitle(c: Chat): string {
    if (c.isGroup) return c.name || "Grupo";
    const other = c.members.find((m) => m !== user?.uid);
    return other ? users[other]?.name ?? "Convidado" : "Você";
  }

  async function startChat() {
    if (!user || selected.length === 0) return;
    const isGroup = groupMode || selected.length > 1;
    const id = await createChat([user.uid, ...selected], isGroup, isGroup ? (groupName || "Grupo da festa") : undefined);
    setPicking(false); setGroupMode(false); setSelected([]); setGroupName("");
    setActive({ id, members: [user.uid, ...selected], isGroup, name: groupName, createdAt: Date.now(), lastMessage: null });
  }

  async function send(file?: File) {
    if (!user || !active || (!text.trim() && !file)) return;
    let mediaURL: string | null = null;
    let mediaType = null as "image" | "video" | "gif" | null;
    if (file) {
      mediaURL = await uploadMedia(user.uid, file);
      mediaType = mediaTypeOf(file);
    }
    await sendMessage(active.id, user.uid, text.trim() || undefined, mediaURL, mediaType);
    setText("");
  }

  // Conversa aberta
  if (active) {
    return (
      <div className="flex h-[calc(100dvh-180px)] flex-col sm:h-[70vh]">
        <header className="glass mb-3 flex items-center gap-3 !rounded-xl px-4 py-2.5">
          <button onClick={() => setActive(null)} aria-label="Voltar">←</button>
          <span className="font-semibold text-lunar">{chatTitle(active)}</span>
          {active.isGroup && <span className="text-xs text-mist/50">{active.members.length} pessoas</span>}
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-1">
          {messages.map((m) => {
            const mine = m.senderId === user?.uid;
            const myReaction = user ? m.reactions[user.uid] : undefined;
            const counts = Object.values(m.reactions).reduce<Record<string, number>>((acc, e) => {
              acc[e] = (acc[e] ?? 0) + 1;
              return acc;
            }, {});
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : ""}`}>
                {!mine && <Avatar user={users[m.senderId]} size={26} />}
                <div className={`group relative max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-br-sm bg-nebula text-lunar" : "rounded-bl-sm bg-white/10"}`}>
                  {active.isGroup && !mine && (
                    <p className="text-[11px] font-semibold text-star">{users[m.senderId]?.name}</p>
                  )}
                  {m.mediaURL && (m.mediaType === "video"
                    ? <video src={m.mediaURL} controls className="mb-1 max-h-52 rounded-lg" />
                    : <img src={m.mediaURL} alt="" className="mb-1 max-h-52 rounded-lg" loading="lazy" />)}
                  {m.text && <p>{renderWithMentions(m.text, users)}</p>}
                  <p className="mt-0.5 text-right text-[10px] opacity-60">
                    {formatTime(m.createdAt)}{mine && m.readBy.length > 1 ? " · Visto" : ""}
                  </p>

                  <button
                    onClick={() => setPickerFor((v) => (v === m.id ? null : m.id))}
                    className="absolute -top-3 rounded-full bg-navy px-1.5 py-0.5 text-xs opacity-0 shadow group-hover:opacity-100"
                    style={mine ? { left: -8 } : { right: -8 }}
                    aria-label="Reagir"
                  >
                    {myReaction ?? "🤍"}
                  </button>
                  {pickerFor === m.id && (
                    <div className="glass absolute -top-11 z-10 flex gap-1 !rounded-full px-2 py-1.5" style={mine ? { right: 0 } : { left: 0 }}>
                      {REACTIONS.map((e) => (
                        <button
                          key={e}
                          onClick={() => {
                            if (user) reactToMessage(m.id, user.uid, e, myReaction);
                            setPickerFor(null);
                          }}
                          className="text-base transition-transform hover:scale-150"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                  {Object.keys(counts).length > 0 && (
                    <div className="mt-0.5 flex gap-1">
                      {Object.entries(counts).map(([e, n]) => (
                        <span key={e} className="rounded-full bg-black/20 px-1.5 text-[11px]">{e} {n}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="mt-3 flex gap-2">
          <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) send(f); }} />
          <input ref={fileRef} type="file" accept="image/*,video/*" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) send(f); }} />
          <button onClick={() => cameraRef.current?.click()} className="btn-ghost !px-3 !py-2" aria-label="Tirar foto">📷</button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost !px-3 !py-2" aria-label="Enviar da galeria">🖼️</button>
          {active.isGroup && (
            <MentionPicker users={users} excludeUid={user?.uid} onPick={(name) => setText((t) => `${t}@${name} `)} />
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Mensagem…"
            className="input-night"
          />
          <button onClick={() => send()} className="btn-star !px-4">➤</button>
        </div>
      </div>
    );
  }

  // Lista de conversas
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-lunar">Conversas</h2>
        <button onClick={() => setPicking(true)} className="btn-star !px-4 !py-2 text-sm">+ Nova</button>
      </div>

      <ul className="mt-4 space-y-2">
        {chats.map((c) => (
          <li key={c.id}>
            <button onClick={() => setActive(c)} className="glass flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="text-2xl">{c.isGroup ? "👥" : "💬"}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-lunar">{chatTitle(c)}</span>
                <span className="block truncate text-xs text-mist/50">{c.lastMessage?.text ?? "Comece a conversa ✨"}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {chats.length === 0 && (
        <p className="py-16 text-center text-sm text-mist/50">Nenhuma conversa ainda. Puxe assunto com alguém da festa. 💬</p>
      )}

      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-sm p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-lunar">{groupMode ? "Novo grupo" : "Nova conversa"}</h3>
              <button onClick={() => { setPicking(false); setSelected([]); setGroupMode(false); }} aria-label="Fechar">×</button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-mist/70">
              <input type="checkbox" checked={groupMode} onChange={(e) => setGroupMode(e.target.checked)} />
              Criar grupo
            </label>
            {groupMode && (
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Nome do grupo" className="input-night mt-2" />
            )}
            <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto">
              {Object.values(users).filter((u) => u.uid !== user?.uid).map((u) => (
                <li key={u.uid}>
                  <button
                    onClick={() => setSelected((s) => s.includes(u.uid) ? s.filter((x) => x !== u.uid) : (groupMode ? [...s, u.uid] : [u.uid]))}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 ${selected.includes(u.uid) ? "bg-star/20" : "hover:bg-white/5"}`}
                  >
                    <Avatar user={u} size={30} />
                    <span className="text-sm">{u.name}</span>
                    {selected.includes(u.uid) && <span className="ml-auto text-star">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={startChat} disabled={selected.length === 0} className="btn-star mt-4 w-full disabled:opacity-40">
              Conversar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
