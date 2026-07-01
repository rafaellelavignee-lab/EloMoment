import { useEffect, useMemo, useState } from "react";
import { watchActiveStories } from "@/services/stories";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import Avatar from "@/components/ui/Avatar";
import StoryViewer from "./StoryViewer";
import StoryCreator from "./StoryCreator";
import type { Story } from "@/types";

export default function StoriesBar() {
  const user = useAuthStore((s) => s.user);
  const users = useUsers();
  const { storyViewerAuthor, openStories, closeStories } = useUIStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => watchActiveStories(setStories), []);

  const byAuthor = useMemo(() => {
    const map: Record<string, Story[]> = {};
    for (const s of stories) (map[s.authorId] ??= []).push(s);
    return map;
  }, [stories]);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Criar story */}
        <button onClick={() => setCreating(true)} className="flex w-16 shrink-0 flex-col items-center gap-1">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-star/60 text-2xl text-star">+</span>
          <span className="text-xs text-mist/70">Seu story</span>
        </button>
        {Object.keys(byAuthor).map((uid) => (
          <button key={uid} onClick={() => openStories(uid)} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <Avatar user={users[uid]} size={56} ring />
            <span className="w-full truncate text-center text-xs text-mist/70">
              {uid === user?.uid ? "Você" : users[uid]?.name?.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {storyViewerAuthor && byAuthor[storyViewerAuthor] && (
        <StoryViewer
          stories={byAuthor[storyViewerAuthor]}
          author={users[storyViewerAuthor]}
          onClose={closeStories}
        />
      )}
      {creating && <StoryCreator onClose={() => setCreating(false)} />}
    </>
  );
}
