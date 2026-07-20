import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (((import.meta as any).env?.VITE_SUPABASE_URL) || '').trim();

// Strip any path suffix like /rest/v1 or trailing slashes
if (supabaseUrl) {
  try {
    const urlObj = new URL(supabaseUrl);
    supabaseUrl = `${urlObj.protocol}//${urlObj.host}`;
  } catch (e) {
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

const supabaseAnonKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '').trim();

// Safety check to prevent app crash if keys are not provided yet in the dev environment
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    '⚠️ Supabase credentials are empty or invalid. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}
