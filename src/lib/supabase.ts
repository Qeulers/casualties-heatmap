import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_CONFIG = {
  bucketName: import.meta.env.VITE_SUPABASE_BUCKET_NAME || 'casualties-data',
  filePath: import.meta.env.VITE_SUPABASE_FILE_PATH || 'merged.csv',
};
