import { createClient } from '@supabase/supabase-js';

// Replace these with your actual values from the Supabase dashboard
const supabaseUrl = '';
const supabaseAnonKey = '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);