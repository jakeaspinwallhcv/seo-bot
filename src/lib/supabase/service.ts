import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client with service role credentials
 *
 * IMPORTANT: This client bypasses Row Level Security (RLS) and should ONLY
 * be used in server-side code for administrative operations or background tasks.
 *
 * Use cases:
 * - Background jobs (analysis, scheduled tasks)
 * - Admin operations
 * - System-level operations that need to bypass RLS
 *
 * DO NOT expose this client to the frontend or use it for user-facing operations.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  if (supabaseServiceKey === 'your-service-role-key') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is set to placeholder value. Please update it with your actual service role key from Supabase Dashboard > Settings > API'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
