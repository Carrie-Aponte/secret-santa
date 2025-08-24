import { supabase } from '@/lib/supabase'
import { AppState } from '@/app/features/santa/types'

const APP_STATE_ID = 'aponte-family-2025'

export class DatabaseService {

    static async saveAppState(appState: AppState): Promise<void> {
    try {
      const { error } = await supabase
        .from('app_states')
        .upsert({
          id: APP_STATE_ID,
          family_members: appState.familyMembers,
          available_receivers: appState.availableReceivers,
          assignments: appState.assignments,
          completed_assignments: appState.completedAssignments,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving app state:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to save app state:', error)
      throw error
    }
  }


  static async loadAppState(): Promise<AppState | null> {
    try {
      const { data, error } = await supabase
        .from('app_states')
        .select('*')
        .eq('id', APP_STATE_ID)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 meaning no rows found
        console.error('Error loading app state:', error)
        throw error
      }

      if (!data) {
        return null 
      }

      return {
        familyMembers: data.family_members,
        availableReceivers: data.available_receivers,
        assignments: data.assignments || {},
        completedAssignments: data.completed_assignments || []
      }
    } catch (error) {
      console.error('Failed to load app state:', error)
      return null
    }
  }


  static async resetAppState(): Promise<void> {
    try {
      const { error } = await supabase
        .from('app_states')
        .delete()
        .eq('id', APP_STATE_ID)

      if (error) {
        console.error('Error resetting app state:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to reset app state:', error)
      throw error
    }
  }

  static async getAssignment(personName: string): Promise<string | null> {
    try {
      const appState = await this.loadAppState()
      if (!appState) return null
      
      return appState.assignments[personName] || null
    } catch (error) {
      console.error('Failed to get assignment:', error)
      return null
    }
  }
}