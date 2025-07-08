-- Simple fix for invite code access
-- This temporarily makes whiteboards table more permissive for authenticated users

-- Option 1: Temporarily disable RLS (NOT recommended for production)
-- ALTER TABLE whiteboards DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a very permissive policy for authenticated users
DROP POLICY IF EXISTS "whiteboards_select_policy" ON whiteboards;
DROP POLICY IF EXISTS "allow_invite_code_lookup" ON whiteboards;
DROP POLICY IF EXISTS "select_whiteboards" ON whiteboards;

-- This policy allows ANY authenticated user to SELECT ANY whiteboard
-- We'll rely on application logic to control access
CREATE POLICY "authenticated_users_can_read_whiteboards" ON whiteboards
    FOR SELECT
    TO authenticated
    USING (true);

-- Keep restrictive policies for INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "whiteboards_insert_policy" ON whiteboards;
DROP POLICY IF EXISTS "insert_whiteboards" ON whiteboards;
CREATE POLICY "only_owners_can_insert" ON whiteboards
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "whiteboards_update_policy" ON whiteboards;
DROP POLICY IF EXISTS "update_whiteboards" ON whiteboards;
CREATE POLICY "only_owners_can_update" ON whiteboards
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "whiteboards_delete_policy" ON whiteboards;
DROP POLICY IF EXISTS "delete_whiteboards" ON whiteboards;
CREATE POLICY "only_owners_can_delete" ON whiteboards
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Verify RLS is still enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'whiteboards';

-- Test the new policy
SELECT COUNT(*) as visible_whiteboards FROM whiteboards WHERE auth.uid() IS NOT NULL;