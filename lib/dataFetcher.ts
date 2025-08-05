import { supabase } from "@/lib/supabaseClient";

export async function fetchWithCache<T>(key: string, table: string): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
      return data as T[];
    }
    throw new Error("No data");
  } catch (err) {
    // Fallback to cache
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached) as T[];
    throw err;
  }
} 