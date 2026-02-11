/**
 * Supabase 浏览器端客户端（仅 anon key）
 * 用于留言提交、留言列表等；勿在前端使用 service_role。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = typeof import.meta !== "undefined" ? (import.meta.env?.PUBLIC_SUPABASE_URL as string) || "" : "";
const anonKey = typeof import.meta !== "undefined" ? (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY as string) || "" : "";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey || anonKey.length < 20) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

export type GuestbookRow = {
  id: string;
  name: string;
  email: string | null;
  message: string;
  created_at: string;
  session_id?: string | null;
};
