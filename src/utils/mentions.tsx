import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { UserProfile } from "@/types";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Troca "@Nome" (nomes conhecidos em `users`) por links pro perfil da pessoa. */
export function renderWithMentions(text: string, users: Record<string, UserProfile>): ReactNode[] {
  const named = Object.values(users)
    .filter((u) => u.name?.trim())
    .sort((a, b) => b.name.length - a.name.length);
  if (named.length === 0 || !text) return [text];

  const pattern = new RegExp(
    `@(${named.map((u) => escapeRegExp(u.name)).join("|")})(?![\\p{L}\\p{N}_])`,
    "gu"
  );

  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const name = match[1];
    const u = named.find((e) => e.name === name)!;
    parts.push(
      <Link key={key++} to={`/app/perfil/${u.uid}`} className="font-semibold text-star hover:underline">
        @{name}
      </Link>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
