import { useEffect, useState } from "react";
import { watchUsers } from "@/services/users";
import type { UserProfile } from "@/types";

/** Mapa reativo uid -> perfil, usado em todo o app para exibir autores */
export function useUsers(): Record<string, UserProfile> {
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  useEffect(() => watchUsers(setUsers), []);
  return users;
}
