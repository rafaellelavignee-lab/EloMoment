import { create } from "zustand";

type Theme = "dark" | "light" | "auto";

interface UIState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  storyViewerAuthor: string | null;
  openStories: (authorId: string) => void;
  closeStories: () => void;
}

function applyTheme(t: Theme) {
  const dark = t === "dark" || (t === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("elomoment-theme", t);
}

const initial = (localStorage.getItem("elomoment-theme") as Theme) || "dark";
applyTheme(initial);

export const useUIStore = create<UIState>((set) => ({
  theme: initial,
  setTheme: (theme) => { applyTheme(theme); set({ theme }); },
  storyViewerAuthor: null,
  openStories: (authorId) => set({ storyViewerAuthor: authorId }),
  closeStories: () => set({ storyViewerAuthor: null }),
}));
