# Fix for Drawing Type Error and Invite Code Issue

## Issue 1: Drawing Type Constraint Error

**Error**: `new row for relation "drawings" violates check constraint "drawings_type_check"`

**Cause**: The database expects `'rect'` but the app uses `'rectangle'`. Also, `'line'` is missing from allowed types.

**Fix**: Run this SQL in Supabase:
```sql
-- Fix the drawing types constraint
ALTER TABLE drawings DROP CONSTRAINT IF EXISTS drawings_type_check;
ALTER TABLE drawings ADD CONSTRAINT drawings_type_check 
CHECK (type IN ('pen', 'line', 'rectangle', 'circle', 'eraser'));
```

## Issue 2: Invite Code Not Working

**Error**: "Invalid invite code" even with correct code

**Possible Causes**:
1. RLS policy blocking the query
2. Case sensitivity issues
3. Extra whitespace in the code
4. Code doesn't exist in database

**Debug Steps**:

### 1. Test with Detailed Page
Navigate to: `/test-invite-detailed`
This will run comprehensive tests to identify the issue.

### 2. Check in Supabase SQL Editor
Run `/docs/13-test-invite-code.sql` to:
- See all whiteboards with invite codes
- Test the specific query
- Check for case/whitespace issues

### 3. Apply the Simple RLS Fix
Run `/docs/10-simple-invite-fix.sql` to allow authenticated users to read all whiteboards:
```sql
CREATE POLICY "authenticated_users_can_read_whiteboards" ON whiteboards
    FOR SELECT
    TO authenticated
    USING (true);
```

### 4. Create a Function for Invite Codes
If RLS is still blocking, create a function:
```sql
CREATE OR REPLACE FUNCTION get_whiteboard_by_invite_code(code TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    user_id UUID,
    invite_code TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT w.id, w.name, w.user_id, w.invite_code
    FROM whiteboards w
    WHERE UPPER(TRIM(w.invite_code)) = UPPER(TRIM(code));
END;
$$;
```

Then update the join page to use:
```typescript
const { data: whiteboard } = await supabase
  .rpc('get_whiteboard_by_invite_code', { code: inviteCode })
```

## Quick Fix for Both Issues

Run these in order:

1. **Fix drawing types** (`/docs/12-fix-drawing-types.sql`)
2. **Fix RLS for invite codes** (`/docs/10-simple-invite-fix.sql`)
3. **Test at** `/test-invite-detailed`

## Verify Success

After applying fixes:
1. Drawing should save without errors
2. Invite codes should work for joining whiteboards
3. Real-time updates should propagate properly