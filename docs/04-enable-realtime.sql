-- Enable Realtime on tables for live updates

-- Enable realtime for the drawings table
ALTER PUBLICATION supabase_realtime ADD TABLE drawings;

-- Enable realtime for the presence table  
ALTER PUBLICATION supabase_realtime ADD TABLE presence;

-- Enable realtime for whiteboard_collaborators (for avatar stack updates)
ALTER PUBLICATION supabase_realtime ADD TABLE whiteboard_collaborators;

-- Verify realtime is enabled
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;