import { createClient } from './client'

export async function checkMigrationStatus() {
  const supabase = createClient()
  
  try {
    // Check if whiteboard_collaborators table exists
    const { error: collabError } = await supabase
      .from('whiteboard_collaborators')
      .select('id')
      .limit(1)
    
    // Check if invite_code column exists
    const { error: inviteError } = await supabase
      .from('whiteboards')
      .select('invite_code')
      .limit(1)
    
    return {
      hasCollaboratorsTable: !collabError,
      hasInviteCode: !inviteError,
      isFullyMigrated: !collabError && !inviteError
    }
  } catch {
    return {
      hasCollaboratorsTable: false,
      hasInviteCode: false,
      isFullyMigrated: false
    }
  }
}