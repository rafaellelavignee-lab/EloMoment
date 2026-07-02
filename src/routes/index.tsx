import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import AppLayout from "@/layouts/AppLayout";
import Landing from "@/pages/Landing";
import InvitePage from "@/pages/InvitePage";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import FeedPage from "@/pages/FeedPage";
import AlbumPage from "@/pages/AlbumPage";
import TimelinePage from "@/pages/TimelinePage";
import MuralPage from "@/pages/MuralPage";
import SearchPage from "@/pages/SearchPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";

function Protected() {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="animate-pulse text-mist/60">Acendendo as estrelas…</p>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/redefinir-senha", element: <ResetPasswordPage /> },
  { path: "/invite/:code", element: <InvitePage /> },
  {
    element: <Protected />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          { index: true, element: <FeedPage /> },
          { path: "album", element: <AlbumPage /> },
          { path: "timeline", element: <TimelinePage /> },
          { path: "mural", element: <MuralPage /> },
          { path: "buscar", element: <SearchPage /> },
          { path: "chat", element: <ChatPage /> },
          { path: "perfil/:uid", element: <ProfilePage /> },
          { path: "painel", element: <AdminPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
