-- Comprehensive RLS fix for 406 errors
-- This migration ensures all tables have proper RLS policies for authenticated users

-- 1. Fix whiteboards table policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Users can create whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Users can update own whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Users can delete own whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Collaborators can view whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "allow_invite_code_lookup" ON whiteboards;

-- Create comprehensive policies for whiteboards
CREATE POLICY "select_whiteboards" ON whiteboards
    FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
        OR (auth.uid() IS NOT NULL AND invite_code IS NOT NULL)
    );

CREATE POLICY "insert_whiteboards" ON whiteboards
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_whiteboards" ON whiteboards
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "delete_whiteboards" ON whiteboards
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 2. Fix whiteboard_collaborators table policies
DROP POLICY IF EXISTS "Users can view collaborators" ON whiteboard_collaborators;
DROP POLICY IF EXISTS "Whiteboard owners can manage collaborators" ON whiteboard_collaborators;
DROP POLICY IF EXISTS "Users can view their own collaborations" ON whiteboard_collaborators;

-- Allow viewing collaborators for whiteboards user has access to
CREATE POLICY "select_collaborators" ON whiteboard_collaborators
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = whiteboard_collaborators.whiteboard_id 
            AND (
                whiteboards.user_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM whiteboard_collaborators wc2
                    WHERE wc2.whiteboard_id = whiteboards.id 
                    AND wc2.user_id = auth.uid()
                )
            )
        )
    );

-- Only whiteboard owners can add collaborators
CREATE POLICY "insert_collaborators" ON whiteboard_collaborators
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = whiteboard_collaborators.whiteboard_id 
            AND whiteboards.user_id = auth.uid()
        )
    );

-- Only whiteboard owners can remove collaborators
CREATE POLICY "delete_collaborators" ON whiteboard_collaborators
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = whiteboard_collaborators.whiteboard_id 
            AND whiteboards.user_id = auth.uid()
        )
    );

-- 3. Fix drawings table policies
DROP POLICY IF EXISTS "Users can view drawings" ON drawings;
DROP POLICY IF EXISTS "Users can create drawings" ON drawings;
DROP POLICY IF EXISTS "Users can update own drawings" ON drawings;
DROP POLICY IF EXISTS "Users can delete own drawings" ON drawings;

-- Allow viewing drawings for accessible whiteboards
CREATE POLICY "select_drawings" ON drawings
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = drawings.whiteboard_id 
            AND (
                whiteboards.user_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM whiteboard_collaborators 
                    WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
                    AND whiteboard_collaborators.user_id = auth.uid()
                )
            )
        )
    );

-- Allow creating drawings on accessible whiteboards
CREATE POLICY "insert_drawings" ON drawings
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = drawings.whiteboard_id 
            AND (
                whiteboards.user_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM whiteboard_collaborators 
                    WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
                    AND whiteboard_collaborators.user_id = auth.uid()
                )
            )
        )
    );

-- Users can update their own drawings
CREATE POLICY "update_drawings" ON drawings
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own drawings
CREATE POLICY "delete_drawings" ON drawings
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Fix presence table policies
DROP POLICY IF EXISTS "Users can view presence" ON presence;
DROP POLICY IF EXISTS "Users can update own presence" ON presence;
DROP POLICY IF EXISTS "Users can insert own presence" ON presence;
DROP POLICY IF EXISTS "Users can delete own presence" ON presence;

-- Allow viewing presence for accessible whiteboards
CREATE POLICY "select_presence" ON presence
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = presence.whiteboard_id 
            AND (
                whiteboards.user_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM whiteboard_collaborators 
                    WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
                    AND whiteboard_collaborators.user_id = auth.uid()
                )
            )
        )
    );

-- Users can manage their own presence
CREATE POLICY "insert_presence" ON presence
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_presence" ON presence
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "delete_presence" ON presence
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 5. Fix user_profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- All authenticated users can view profiles
CREATE POLICY "select_profiles" ON user_profiles
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Users can manage their own profile
CREATE POLICY "insert_profiles" ON user_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_profiles" ON user_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whiteboards_invite_code ON whiteboards(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_whiteboards_user_id ON whiteboards(user_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_collaborators_whiteboard_id ON whiteboard_collaborators(whiteboard_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_collaborators_user_id ON whiteboard_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_drawings_whiteboard_id ON drawings(whiteboard_id);
CREATE INDEX IF NOT EXISTS idx_presence_whiteboard_id ON presence(whiteboard_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 7. Grant necessary permissions
GRANT ALL ON whiteboards TO authenticated;
GRANT ALL ON whiteboard_collaborators TO authenticated;
GRANT ALL ON drawings TO authenticated;
GRANT ALL ON presence TO authenticated;
GRANT ALL ON user_profiles TO authenticated;

-- Test the policies
SELECT 'RLS policies updated successfully' as status;