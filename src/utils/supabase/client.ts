import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://traxfemzrvxirtlcxpov.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXhmZW16cnZ4aXJ0bGN4cG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MzIxNTcsImV4cCI6MjEwNzAwODE1N30.Ygraq1PHAO_qe0paa7uhQI1CGnnVuOwHXGPaGTcxERA";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseKey);
};
