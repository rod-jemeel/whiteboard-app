# Invite Code Troubleshooting Guide

## Problem: "Invalid invite code" error when trying to join

### Quick Diagnosis

1. **Test the invite system**: Navigate to `/test-invite` and enter an invite code
2. **Check browser console**: Look for debug messages showing what's happening

### Common Causes & Solutions

#### 1. RLS Policy Too Restrictive
The most common cause is Row Level Security blocking the query.

**Quick Fix:**
Run `/docs/10-simple-invite-fix.sql` in Supabase SQL editor. This makes the SELECT policy more permissive.

**Permanent Fix:**
After testing, implement a more secure policy that still allows invite code lookups.

#### 2. Invite Code Case Sensitivity
Invite codes are stored in uppercase in the database.

**Check:**
- Ensure the code is being converted to uppercase before querying
- The join page already does this: `inviteCode.toUpperCase()`

#### 3. No Whiteboard with That Code
The invite code might not exist.

**Debug:**
```sql
-- Check if any whiteboards have invite codes
SELECT id, name, invite_code FROM whiteboards WHERE invite_code IS NOT NULL;

-- Check specific code
SELECT * FROM whiteboards WHERE invite_code = 'YOUR_CODE_HERE';
```

#### 4. Authentication Issues
User might not be properly authenticated.

**Check:**
- Verify user is logged in before attempting to join
- Check for auth errors in console

### Step-by-Step Fix Process

1. **Enable Debug Mode**
   - The join page now logs detailed information to console
   - Check browser console for messages

2. **Test with Simple Policy**
   Run this SQL to temporarily allow all authenticated users to read whiteboards:
   ```sql
   DROP POLICY IF EXISTS "authenticated_users_can_read_whiteboards" ON whiteboards;
   CREATE POLICY "authenticated_users_can_read_whiteboards" ON whiteboards
       FOR SELECT
       TO authenticated
       USING (true);
   ```

3. **Verify Invite Code Exists**
   ```sql
   SELECT * FROM whiteboards WHERE invite_code = 'YOUR_CODE_HERE';
   ```

4. **Check User Authentication**
   Visit `/test-invite` to see your authentication status

5. **Test Join Flow**
   - Copy an invite code from the dashboard
   - Open incognito window
   - Sign up/login with different account
   - Try joining with the code

### Production-Safe RLS Policy

Once confirmed working, use this more secure policy:

```sql
CREATE POLICY "secure_whiteboard_select" ON whiteboards
    FOR SELECT
    USING (
        -- Owner can see their whiteboards
        auth.uid() = user_id 
        OR 
        -- Collaborators can see their whiteboards
        EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
        OR
        -- Authenticated users can query by invite_code
        -- But only if they provide the invite_code in the query
        (
            auth.uid() IS NOT NULL 
            AND invite_code IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM whiteboards w2 
                WHERE w2.id = whiteboards.id 
                AND w2.invite_code = whiteboards.invite_code
            )
        )
    );
```

### Emergency Fixes

If nothing else works:

1. **Temporarily disable RLS** (NOT for production!):
   ```sql
   ALTER TABLE whiteboards DISABLE ROW LEVEL SECURITY;
   ```

2. **Create a public function** for invite code lookup:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_whiteboard_by_invite(code TEXT)
   RETURNS TABLE (
       id UUID,
       name TEXT,
       user_id UUID
   )
   SECURITY DEFINER
   SET search_path = public
   LANGUAGE plpgsql
   AS $$
   BEGIN
       RETURN QUERY
       SELECT w.id, w.name, w.user_id
       FROM whiteboards w
       WHERE w.invite_code = UPPER(code)
       LIMIT 1;
   END;
   $$;
   ```

### Monitoring

Use these tools to debug:
- `/test-invite` - Test invite codes and see what's visible
- `/debug` - Check database connection and tables
- Browser console - See detailed error messages
- Supabase logs - Check for RLS policy violations