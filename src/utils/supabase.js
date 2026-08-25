import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

export const isCloudEnabled = Boolean(url && key);
export const supabase = isCloudEnabled ? createClient(url, key) : null;
