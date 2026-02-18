import { createClient } from '@supabase/supabase-js';

// Safely access environment variables. 
// We use (import.meta as any) to avoid TS errors, and || {} to prevent runtime crash if .env is missing.
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// If credentials are provided, use them. Otherwise, we will rely on mock mode in queries.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isMockMode = !supabase;
