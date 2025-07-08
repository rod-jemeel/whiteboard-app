-- OPTIONAL: If RLS causes issues, run this to disable it temporarily
-- WARNING: This removes all security - use only for development/debugging

-- Disable RLS on all tables
ALTER TABLE whiteboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE drawings DISABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE presence DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('whiteboards', 'drawings', 'whiteboard_collaborators', 'presence')
ORDER BY tablename;