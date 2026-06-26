import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
