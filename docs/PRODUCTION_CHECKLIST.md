# Production Deployment Checklist

## Prerequisites
1. Ensure all environment variables are set in your deployment platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production domain)

## Database Setup (Run in Order)
Execute these SQL migrations in your Supabase SQL editor:

1. **Base Schema** (`docs/01-schema.sql`)
   - Creates initial tables structure

2. **Schema Update** (`docs/02-schema-update.sql`)
   - Updates whiteboard structure and adds invite codes

3. **Fix RLS Policies** (`docs/03-fix-whiteboards-rls.sql`)
   - Initial RLS policy fixes

4. **Migration Status** (`docs/04-migration-status.sql`)
   - Adds migration tracking table

5. **User Profiles** (`docs/05-create-user-profiles.sql`)
   - Creates user profiles table and trigger

6. **Presence Optimization** (`docs/06-optimize-presence.sql`)
   - Optimizes presence table structure

7. **Invite Code Access** (`docs/07-fix-invite-code-access.sql`)
   - Fixes invite code lookup permissions

8. **Comprehensive RLS Fix** (`docs/08-comprehensive-rls-fix.sql`)
   - Final comprehensive RLS policy update

## Supabase Configuration

### 1. Storage Bucket
- Create a public bucket named `avatars`
- Set CORS policy to allow your domain

### 2. Enable Realtime
Enable realtime for these tables:
- `drawings`
- `presence`
- `whiteboard_collaborators`

Go to: Database → Replication → Toggle on for each table

### 3. Auth Configuration
- Update email templates to use `NEXT_PUBLIC_APP_URL`
- Set redirect URLs to include your production domain

### 4. RLS Status
Ensure Row Level Security is **ENABLED** for all tables:
- `whiteboards`
- `whiteboard_collaborators`
- `drawings`
- `presence`
- `user_profiles`

## Common Issues and Solutions

### 406 Errors
If you encounter 406 errors:
1. Run the comprehensive RLS fix: `docs/08-comprehensive-rls-fix.sql`
2. Verify user is authenticated before making queries
3. Check that all tables have RLS enabled

### Build Errors
1. ESLint: Already configured with relaxed rules
2. TypeScript: Strict mode disabled for faster deployment
3. Source maps: Disabled in production to prevent 404s

### Authentication Issues
1. Ensure middleware is checking sessions properly
2. Verify environment variables are set correctly
3. Check Supabase Auth settings for your domain

## Testing Production
1. Create a new account
2. Create a whiteboard
3. Generate an invite code
4. Test joining with another account
5. Verify real-time collaboration works
6. Test avatar uploads

## Monitoring
- Check Supabase logs for RLS policy violations
- Monitor browser console for 406/409 errors
- Use the `/debug` page to check database status