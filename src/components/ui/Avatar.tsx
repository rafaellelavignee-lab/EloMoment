import type { UserProfile } from "@/types";

interface Props {
  user?: UserProfile | null;
  size?: number;
  ring?: boolean; // anel dourado (indica story ativo)
  onClick?: () => void;
}

export default function Avatar({ user, size = 40, ring = false, onClick }: Props) {
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "•";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 rounded-full ${ring ? "p-[2px] bg-gradient-to-tr from-star via-nebula to-star" : ""} ${onClick ? "" : "pointer-events-none"}`}
      style={{ width: size + (ring ? 4 : 0), height: size + (ring ? 4 : 0) }}
      aria-label={user?.name ?? "Perfil"}
    >
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.name}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-galaxy font-display text-lunar"
          style={{ fontSize: size * 0.45 }}
        >
          {user?.favoriteEmoji ?? initial}
        </span>
      )}
    </button>
  );
}
