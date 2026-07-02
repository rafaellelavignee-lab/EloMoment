import { useEffect, useState } from "react";
import { watchComments, addComment, deleteComment, toggleCommentLike, reactToComment } from "@/services/posts";
import { useAuthStore } from "@/stores/authStore";
import { useUsers } from "@/hooks/useUsers";
import { timeAgo } from "@/utils/format";
import { renderWithMentions } from "@/utils/mentions";
import Avatar from "@/components/ui/Avatar";
import MentionPicker from "@/components/ui/MentionPicker";
import { REACTIONS } from "@/types";
import type { Comment } from "@/types";

export default function Comments({ postId }: { postId: string }) {
  const user = useAuthStore((s) => s.user);
  const users = useUsers();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  useEffect(() => watchComments(postId, setComments), [postId]);

  async function send() {
    if (!user || !text.trim()) return;
    await addComment(postId, user.uid, text.trim(), replyTo?.id);
    setText(""); setReplyTo(null);
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <ul className="space-y-3">
        {comments.map((c) => {
          const author = users[c.authorId];
          const parent = c.replyTo ? comments.find((p) => p.id === c.replyTo) : null;
          const liked = !!user && c.likes.includes(user.uid);
          const myReaction = user ? c.reactions[user.uid] : undefined;
          const counts = Object.values(c.reactions).reduce<Record<string, number>>((acc, e) => {
            acc[e] = (acc[e] ?? 0) + 1;
            return acc;
          }, {});
          return (
            <li key={c.id} className={`flex gap-2 ${parent ? "ml-8" : ""}`}>
              <Avatar user={author} size={28} />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-lunar">{author?.name ?? "Convidado"}</span>{" "}
                  {parent && <span className="text-nebula">↪ {users[parent.authorId]?.name} </span>}
                  <span className="text-mist/90">{renderWithMentions(c.text, users)}</span>
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-mist/50">
                  <span>{timeAgo(c.createdAt)}</span>
                  <button
                    onClick={() => user && toggleCommentLike(postId, c.id, user.uid, liked)}
                    className={liked ? "text-star" : ""}
                  >
                    ⭐ {c.likes.length || ""}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setPickerFor((v) => (v === c.id ? null : c.id))}
                      className={myReaction ? "text-star" : ""}
                    >
                      {myReaction ?? "🤍"} Reagir
                    </button>
                    {pickerFor === c.id && (
                      <div className="glass absolute bottom-full left-0 z-10 mb-2 flex gap-1 !rounded-full px-2 py-1.5">
                        {REACTIONS.map((e) => (
                          <button
                            key={e}
                            onClick={() => {
                              if (user) reactToComment(c.id, user.uid, e, myReaction);
                              setPickerFor(null);
                            }}
                            className="text-base transition-transform hover:scale-150"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {Object.entries(counts).map(([e, n]) => (
                    <span key={e}>{e} {n}</span>
                  ))}
                  <button onClick={() => setReplyTo(c)}>Responder</button>
                  {(user?.uid === c.authorId || user?.role === "host") && (
                    <button onClick={() => deleteComment(postId, c.id)}>Excluir</button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {replyTo && (
        <p className="mt-2 text-xs text-nebula">
          Respondendo a {users[replyTo.authorId]?.name}{" "}
          <button className="underline" onClick={() => setReplyTo(null)}>cancelar</button>
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <MentionPicker users={users} excludeUid={user?.uid} onPick={(name) => setText((t) => `${t}@${name} `)} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escreva um comentário…"
          className="input-night !py-2 text-sm"
        />
        <button onClick={send} className="btn-star !px-4 !py-2 text-sm">Enviar</button>
      </div>
    </div>
  );
}
