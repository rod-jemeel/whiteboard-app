-- Test invite code queries to debug the issue

-- 1. Check if any whiteboards exist with invite codes
SELECT id, name, invite_code, user_id 
FROM whiteboards 
WHERE invite_code IS NOT NULL
LIMIT 5;

-- 2. Test the exact query the app is using
-- Replace 'A581823E' with your actual invite code
SELECT * 
FROM whiteboards 
WHERE invite_code = 'A581823E';

-- 3. Check if the invite code might have case issues or extra spaces
SELECT id, name, 
       invite_code,
       LENGTH(invite_code) as code_length,
       UPPER(invite_code) as upper_code,
       TRIM(invite_code) as trimmed_code
FROM whiteboards 
WHERE UPPER(invite_code) LIKE '%A581823E%'
   OR invite_code LIKE '%A581823E%';

-- 4. Create a test whiteboard with a known invite code for testing
-- INSERT INTO whiteboards (name, user_id, invite_code)
-- VALUES ('Test Whiteboard', auth.uid(), 'TEST123')
-- ON CONFLICT DO NOTHING;

-- 5. Check current user's permissions
SELECT auth.uid() as current_user_id;