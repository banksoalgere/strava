
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// In production, fail fast if Supabase is not configured
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!supabaseUrl || !supabaseKey)) {
    throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY');
}

// Use placeholders in development/build if not configured
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseKey || 'placeholder';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Missing Supabase environment variables. Using placeholders for build.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(url, key);

