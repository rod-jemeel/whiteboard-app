-- Add a timestamp field to track when canvas was last cleared
-- This helps with real-time updates when DELETE events don't propagate

ALTER TABLE whiteboards 
ADD COLUMN IF NOT EXISTS last_cleared_at TIMESTAMPTZ DEFAULT NULL;

-- Create a function to update the timestamp when drawings are cleared
CREATE OR REPLACE FUNCTION update_whiteboard_clear_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the whiteboard's last_cleared_at when drawings are deleted
  UPDATE whiteboards 
  SET last_cleared_at = NOW()
  WHERE id = OLD.whiteboard_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for drawing deletions
DROP TRIGGER IF EXISTS on_drawing_delete ON drawings;
CREATE TRIGGER on_drawing_delete
  AFTER DELETE ON drawings
  FOR EACH ROW
  EXECUTE FUNCTION update_whiteboard_clear_timestamp();

-- Test the setup
SELECT 'Clear timestamp mechanism added' as status;