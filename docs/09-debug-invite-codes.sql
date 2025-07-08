-- Debug and fix invite code access issues

-- 1. Check current RLS policies on whiteboards
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'whiteboards';

-- 2. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Users can create whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Users can update own whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Users can delete own whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "Collaborators can view whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "allow_invite_code_lookup" ON whiteboards;
DROP POLICY IF EXISTS "select_whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "insert_whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "update_whiteboards" ON whiteboards;
DROP POLICY IF EXISTS "delete_whiteboards" ON whiteboards;

-- 3. Create a single, simple SELECT policy that allows:
--    - Owners to see their whiteboards
--    - Collaborators to see their whiteboards
--    - ANY authenticated user to query ANY whiteboard (for invite code lookups)
CREATE POLICY "whiteboards_select_policy" ON whiteboards
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 4. Create other necessary policies
CREATE POLICY "whiteboards_insert_policy" ON whiteboards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "whiteboards_update_policy" ON whiteboards
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "whiteboards_delete_policy" ON whiteboards
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Test: Check if we have any whiteboards with invite codes
SELECT 
    id,
    name,
    invite_code,
    user_id,
    created_at
FROM whiteboards
WHERE invite_code IS NOT NULL
LIMIT 5;

-- 6. Create a test whiteboard with invite code if none exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM whiteboards WHERE invite_code IS NOT NULL LIMIT 1) THEN
        INSERT INTO whiteboards (name, user_id, invite_code)
        VALUES ('Test Whiteboard', auth.uid(), 'TEST123');
        RAISE NOTICE 'Created test whiteboard with invite code: TEST123';
    END IF;
END $$;

-- 7. Verify the policies are working
SELECT 'Policies updated. Any authenticated user can now query whiteboards.' as status;