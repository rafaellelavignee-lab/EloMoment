import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { watchAuth, fetchProfile } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    return watchAuth(async (fbUser) => {
      if (fbUser) {
        const profile = await fetchProfile(fbUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, [setUser, setLoading]);

  return <RouterProvider router={router} />;
}
