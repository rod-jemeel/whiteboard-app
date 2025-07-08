-- Fix the drawing types constraint to match what the application uses
-- The current constraint has 'rect' but the app uses 'rectangle'
-- The current constraint is missing 'line' which the app uses

-- Drop the existing constraint
ALTER TABLE drawings DROP CONSTRAINT IF EXISTS drawings_type_check;

-- Add the updated constraint with correct types
ALTER TABLE drawings ADD CONSTRAINT drawings_type_check 
CHECK (type IN ('pen', 'line', 'rectangle', 'circle', 'eraser'));

-- Verify the change
SELECT conname, contype, conkey
FROM pg_constraint  
WHERE conrelid = 'drawings'::regclass
AND contype = 'c';