import { useEffect, useState } from "react";
import { watchPosts } from "@/services/posts";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import StoriesBar from "@/components/stories/StoriesBar";
import type { Post } from "@/types";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => watchPosts(setPosts), []);

  return (
    <div className="space-y-5">
      <StoriesBar />
      <PostComposer />
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
      {posts.length === 0 && (
        <p className="py-16 text-center text-sm text-mist/50">
          Nenhuma publicação ainda. Seja a primeira estrela desta noite. ✨
        </p>
      )}
    </div>
  );
}
