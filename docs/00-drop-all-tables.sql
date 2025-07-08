-- WARNING: This will DELETE ALL DATA!
-- Drop all existing tables to start fresh

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS presence CASCADE;
DROP TABLE IF EXISTS whiteboard_collaborators CASCADE;
DROP TABLE IF EXISTS drawings CASCADE;
DROP TABLE IF EXISTS whiteboards CASCADE;

-- Verify all tables are dropped
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('whiteboards', 'drawings', 'whiteboard_collaborators', 'presence');