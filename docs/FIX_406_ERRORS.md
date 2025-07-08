# Fixing 406 Errors in Production

## Quick Fix
Run this SQL in your Supabase SQL editor:
```sql
-- Quick fix for 406 errors on invite code lookups
CREATE POLICY IF NOT EXISTS "allow_invite_code_lookup" ON whiteboards
    FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM whiteboard_collaborators 
            WHERE whiteboard_collaborators.whiteboard_id = whiteboards.id 
            AND whiteboard_collaborators.user_id = auth.uid()
        )
        OR (auth.uid() IS NOT NULL AND invite_code IS NOT NULL)
    );
```

## Understanding 406 Errors
406 "Not Acceptable" errors in Supabase typically indicate:
- Row Level Security (RLS) policy violations
- User trying to access data they don't have permission for
- Missing or incorrect authentication

## Complete Fix Process

### 1. Verify RLS is Enabled
Check that RLS is enabled for all tables in Supabase Dashboard:
- Go to Database → Tables
- Ensure the shield icon is active for:
  - whiteboards
  - whiteboard_collaborators
  - drawings
  - presence
  - user_profiles

### 2. Run Comprehensive RLS Fix
Execute `/docs/08-comprehensive-rls-fix.sql` in your Supabase SQL editor.

### 3. Check Authentication Flow
Ensure users are properly authenticated before queries:
```typescript
// Always check for user before making queries
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to auth
  return
}
```

### 4. Use Graceful Error Handling
Replace `.single()` with `.maybeSingle()` for queries that might fail:
```typescript
// Instead of this (throws error if no access):
const { data, error } = await supabase
  .from('whiteboards')
  .select('*')
  .eq('invite_code', code)
  .single()

// Use this (returns null if no access):
const { data, error } = await supabase
  .from('whiteboards')
  .select('*')
  .eq('invite_code', code)
  .maybeSingle()
```

### 5. Test in Production
1. Clear browser cache and cookies
2. Log in with a test account
3. Try joining a whiteboard with an invite code
4. Check browser console for errors

## Debugging Tips
- Enable Supabase logs to see exact RLS policy failures
- Use the `/debug` page to check database connectivity
- Check Network tab for 406 responses and their details

## Prevention
- Always test RLS policies locally before deploying
- Use the error handler utility for better error messages
- Implement proper loading states to handle async auth checks