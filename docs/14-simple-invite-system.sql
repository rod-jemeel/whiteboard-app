-- SIMPLE INVITE CODE SYSTEM
-- Just let authenticated users look up whiteboards by invite code

-- 1. First, let's see what's actually in the database
SELECT id, name, invite_code, user_id 
FROM whiteboards 
WHERE invite_code IS NOT NULL
LIMIT 10;

-- 2. Create a simple function that bypasses RLS
CREATE OR REPLACE FUNCTION join_whiteboard_by_code(invite_code_input TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    whiteboard_record RECORD;
    result JSON;
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
    
    -- Check if user is already the owner
    IF whiteboard_record.user_id = auth.uid() THEN
        RETURN json_build_object(
            'success', true, 
            'whiteboard_id', whiteboard_record.id,
            'already_member', true,
            'is_owner', true
        );
    END IF;
    
    -- Check if user is already a collaborator
    IF EXISTS (
        SELECT 1 FROM whiteboard_collaborators 
        WHERE whiteboard_id = whiteboard_record.id 
        AND user_id = auth.uid()
    ) THEN
        RETURN json_build_object(
            'success', true, 
            'whiteboard_id', whiteboard_record.id,
            'already_member', true,
            'is_owner', false
        );
    END IF;
    
    -- Add user as collaborator
    INSERT INTO whiteboard_collaborators (whiteboard_id, user_id, role)
    VALUES (whiteboard_record.id, auth.uid(), 'editor')
    ON CONFLICT (whiteboard_id, user_id) DO NOTHING;
    
    RETURN json_build_object(
        'success', true, 
        'whiteboard_id', whiteboard_record.id,
        'already_member', false,
        'is_owner', false
    );
END;
$$;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION join_whiteboard_by_code TO authenticated;

-- 4. Test the function
-- SELECT join_whiteboard_by_code('YOUR_CODE_HERE');