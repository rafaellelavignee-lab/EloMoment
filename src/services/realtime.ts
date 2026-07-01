import { supabase } from "@/lib/supabase";

/** Busca inicial + refetch a cada mudança na tabela (via Supabase Realtime), substituindo onSnapshot */
export function watchQuery<Row, T>(
  table: string,
  fetchRows: () => Promise<Row[]>,
  mapRow: (row: Row) => T,
  cb: (items: T[]) => void,
  filter?: string
): () => void {
  let cancelled = false;

  async function refresh() {
    const rows = await fetchRows();
    if (!cancelled) cb(rows.map(mapRow));
  }

  refresh();

  const channel = supabase
    .channel(`watch:${table}:${filter ?? "all"}:${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
      refresh
    )
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}
