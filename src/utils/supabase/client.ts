import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqbsttpbjtetowwktpgg.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_k1CrUfzsfW4Q7GZBIN1xjg_8PH7xJbO'
  )
}
