import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { watchPosts } from "@/services/posts";
import { useUsers } from "@/hooks/useUsers";
import PostCard from "@/components/feed/PostCard";
import Avatar from "@/components/ui/Avatar";
import type { Post } from "@/types";

export default function SearchPage() {
  const users = useUsers();
  const [params] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState(params.get("q") ?? "");
  const hourFilter = params.get("hora");

  useEffect(() => watchPosts(setPosts), []);

  const term = q.trim().toLowerCase();
  const matchedUsers = useMemo(
    () => Object.values(users).filter((u) => term && u.name.toLowerCase().includes(term)),
    [users, term]
  );
  const matchedPosts = useMemo(
    () => posts.filter((p) => {
      if (hourFilter && new Date(p.createdAt).getHours() !== Number(hourFilter)) return false;
      if (!term) return !!hourFilter;
      return (
        p.text.toLowerCase().includes(term) ||
        p.hashtags.some((h) => h.includes(term.startsWith("#") ? term : `#${term}`)) ||
        (users[p.authorId]?.name.toLowerCase().includes(term) ?? false)
      );
    }),
    [posts, term, hourFilter, users]
  );

  return (
    <div>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar pessoa, legenda, #hashtag, emoji…"
        className="input-night"
      />
      {hourFilter && <p className="mt-2 text-sm text-nebula">Mostrando publicações das {hourFilter}h 🕰️</p>}

      {matchedUsers.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm text-mist/60">Pessoas</h3>
          <div className="mt-2 flex flex-wrap gap-3">
            {matchedUsers.map((u) => (
              <div key={u.uid} className="glass flex items-center gap-2 px-3 py-2">
                <Avatar user={u} size={30} />
                <span className="text-sm">{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {matchedPosts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
      {term && matchedUsers.length === 0 && matchedPosts.length === 0 && (
        <p className="py-16 text-center text-sm text-mist/50">Nada encontrado nesta constelação. 🌠</p>
      )}
    </div>
  );
}
