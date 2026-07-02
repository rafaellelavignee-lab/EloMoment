import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes em .env.local — o app carrega, mas login e dados não vão funcionar."
  );
}

// Placeholders evitam que createClient lance erro e derrube o app quando as credenciais ainda não foram preenchidas.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
