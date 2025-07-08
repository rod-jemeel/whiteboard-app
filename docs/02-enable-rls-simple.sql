-- Enable RLS with simple, working policies

-- 1. Enable RLS on all tables
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to authenticated users
GRANT ALL ON whiteboards TO authenticated;
GRANT ALL ON drawings TO authenticated;
GRANT ALL ON whiteboard_collaborators TO authenticated;
GRANT ALL ON presence TO authenticated;

-- 3. Create simple policies for whiteboards
-- Users can do everything with their own whiteboards
CREATE POLICY "owner_access" ON whiteboards
    FOR ALL USING (auth.uid() = user_id);

-- Users can view whiteboards they collaborate on
CREATE POLICY "collaborator_read" ON whiteboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
    );

-- 4. Create policies for whiteboard_collaborators
-- Users can see their own collaborations
CREATE POLICY "user_collaborations" ON whiteboard_collaborators
    FOR SELECT USING (user_id = auth.uid());

-- Whiteboard owners can manage collaborators
CREATE POLICY "owner_manage" ON whiteboard_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = whiteboard_collaborators.whiteboard_id 
            AND whiteboards.user_id = auth.uid()
        )
    );

-- 5. Create policies for drawings
-- Users can access drawings in whiteboards they own or collaborate on
CREATE POLICY "drawing_access" ON drawings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = drawings.whiteboard_id 
            AND whiteboards.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = drawings.whiteboard_id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
    );

-- 6. Create policies for presence
-- Users can manage their own presence
CREATE POLICY "own_presence" ON presence
    FOR ALL USING (user_id = auth.uid());

-- Users can view presence in whiteboards they have access to
CREATE POLICY "view_presence" ON presence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM whiteboards 
            WHERE whiteboards.id = presence.whiteboard_id 
            AND whiteboards.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = presence.whiteboard_id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
    );

-- Verify RLS is enabled and policies exist
SELECT 
    t.tablename,
    t.rowsecurity as "RLS Enabled",
    COUNT(p.policyname) as "Policy Count"
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
AND t.tablename IN ('whiteboards', 'drawings', 'whiteboard_collaborators', 'presence')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;