import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { watchPosts } from "@/services/posts";
import { watchActiveStories } from "@/services/stories";
import { logout } from "@/services/auth";
import Avatar from "@/components/ui/Avatar";
import PostCard from "@/components/feed/PostCard";
import type { Post, Story } from "@/types";

export default function ProfilePage() {
  const { uid = "" } = useParams();
  const me = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const users = useUsers();
  const profile = users[uid];
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [tab, setTab] = useState<"posts" | "fotos" | "videos">("posts");

  useEffect(() => watchPosts(setPosts), []);
  useEffect(() => watchActiveStories(setStories), []);

  const myPosts = useMemo(() => posts.filter((p) => p.authorId === uid), [posts, uid]);
  const myStories = useMemo(() => stories.filter((s) => s.authorId === uid), [stories, uid]);
  const photos = myPosts.filter((p) => p.mediaType === "image" || p.mediaType === "gif");
  const videos = myPosts.filter((p) => p.mediaType === "video");

  if (!profile) return <p className="py-16 text-center text-mist/50">Carregando perfil…</p>;

  return (
    <div>
      <div className="glass p-6 text-center" style={{ borderColor: profile.favoriteColor ?? undefined }}>
        <div className="flex justify-center"><Avatar user={profile} size={88} /></div>
        <h2 className="mt-3 font-display text-2xl text-lunar">
          {profile.name} {profile.favoriteEmoji}
        </h2>
        {profile.phrase && <p className="mt-1 italic text-mist/70">“{profile.phrase}”</p>}
        <div className="mt-4 flex justify-center gap-8 text-sm">
          <span><b className="text-star">{myPosts.length}</b> posts</span>
          <span><b className="text-star">{myStories.length}</b> stories</span>
          <span><b className="text-star">{photos.length}</b> fotos</span>
          <span><b className="text-star">{videos.length}</b> vídeos</span>
        </div>
        {me?.uid === uid && (
          <button onClick={async () => { await logout(); setUser(null); location.href = "/"; }}
            className="mt-4 text-xs text-mist/40 underline">
            Sair da conta
          </button>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        {(["posts", "fotos", "videos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-star/20 text-star" : "text-mist/60"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {tab === "posts" && myPosts.map((p) => <PostCard key={p.id} post={p} />)}
        {tab !== "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {(tab === "fotos" ? photos : videos).map((p) => (
              <div key={p.id} className="aspect-square overflow-hidden rounded-lg">
                {p.mediaType === "video"
                  ? <video src={p.mediaURL!} className="h-full w-full object-cover" muted />
                  : <img src={p.mediaURL!} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
