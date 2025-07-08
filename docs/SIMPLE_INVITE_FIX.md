# Simple Invite Code Fix

You're right - this should be simple! Here's the straightforward solution:

## The Problem
RLS policies are blocking users from looking up whiteboards by invite code.

## The Simple Solution

### Step 1: Run This SQL in Supabase
```sql
-- Create a simple function that bypasses RLS
CREATE OR REPLACE FUNCTION join_whiteboard_by_code(invite_code_input TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    whiteboard_record RECORD;
BEGIN
    -- Find the whiteboard
    SELECT id, name, user_id 
    INTO whiteboard_record
    FROM whiteboards 
    WHERE UPPER(TRIM(invite_code)) = UPPER(TRIM(invite_code_input))
    LIMIT 1;
    
    -- If not found, return error
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid invite code');
    END IF;
    
    -- Check if user is already a member
    IF whiteboard_record.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM whiteboard_collaborators 
        WHERE whiteboard_id = whiteboard_record.id AND user_id = auth.uid()
    ) THEN
        RETURN json_build_object('success', true, 'whiteboard_id', whiteboard_record.id);
    END IF;
    
    -- Add as collaborator
    INSERT INTO whiteboard_collaborators (whiteboard_id, user_id, role)
    VALUES (whiteboard_record.id, auth.uid(), 'editor');
    
    RETURN json_build_object('success', true, 'whiteboard_id', whiteboard_record.id);
END;
$$;

GRANT EXECUTE ON FUNCTION join_whiteboard_by_code TO authenticated;
```

### Step 2: That's It!
The app is already updated to use this function. Once you create it in Supabase, invite codes will work.

## How It Works

1. User enters invite code
2. Function looks up whiteboard (bypassing RLS)
3. Adds user as collaborator
4. Returns whiteboard ID
5. App redirects to whiteboard

## Test It

1. Go to `/join-manual` and enter an invite code manually
2. Or use the normal invite link `/join/[CODE]`

## Why This Works

- `SECURITY DEFINER` runs the function with admin privileges
- Bypasses all RLS complexity
- Simple and straightforward
- Just like you said - enter code, get added to whiteboard!

## Also Fix the Drawing Error

Run this too:
```sql
ALTER TABLE drawings DROP CONSTRAINT IF EXISTS drawings_type_check;
ALTER TABLE drawings ADD CONSTRAINT drawings_type_check 
CHECK (type IN ('pen', 'line', 'rectangle', 'circle', 'eraser'));
```

This fixes the drawing save error by allowing 'rectangle' and 'line' types.