-- Fix RLS policy to allow authenticated users to query whiteboards by invite code

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "allow_invite_code_lookup" ON whiteboards;

-- Create a new policy that allows authenticated users to view whiteboards by invite code
CREATE POLICY "allow_invite_code_lookup" ON whiteboards
    FOR SELECT 
    USING (
        -- Allow if user owns the whiteboard
        auth.uid() = user_id 
        OR 
        -- Allow if user is a collaborator
        EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
        OR
        -- Allow authenticated users to look up by invite code (for joining)
        (auth.uid() IS NOT NULL AND invite_code IS NOT NULL)
    );

-- Ensure the invite_code column has an index for performance
CREATE INDEX IF NOT EXISTS idx_whiteboards_invite_code ON whiteboards(invite_code);

-- Test the policy
SELECT 'Testing invite code lookup...' as status;
SELECT COUNT(*) as whiteboard_count FROM whiteboards WHERE auth.uid() IS NOT NULL;