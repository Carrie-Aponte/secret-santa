import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface SecretSantaRecord {
  id: string
  giver: string
  receiver: string
  created_at: string
  updated_at: string
}

export interface AppStateRecord {
  id: string
  family_members: string[]
  available_receivers: string[]
  assignments: Record<string, string>
  completed_assignments: Array<{giver: string, receiver: string}>
  updated_at: string
}
