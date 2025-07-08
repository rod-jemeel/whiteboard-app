# Enable Realtime for Tables (Without Replication)

Since Replication is in early access, you need to enable Realtime on tables through the standard method:

## Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Tables**
3. Click on each table:
   - `drawings`
   - `presence` 
   - `whiteboard_collaborators`
4. Click **Edit Table** (three dots menu)
5. Scroll down to **Enable Realtime**
6. Toggle it ON
7. Click **Save**

## Method 2: SQL Commands

Run this in the SQL Editor:

```sql
-- Enable realtime for specific tables
ALTER TABLE drawings REPLICA IDENTITY FULL;
ALTER TABLE presence REPLICA IDENTITY FULL;
ALTER TABLE whiteboard_collaborators REPLICA IDENTITY FULL;

-- Verify realtime is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('drawings', 'presence', 'whiteboard_collaborators');
```

## Method 3: Supabase CLI

If using Supabase CLI:

```bash
supabase db push --include-realtime drawings,presence,whiteboard_collaborators
```

## Verify Realtime is Working

1. Check the Supabase Dashboard under **Realtime** → **Inspector**
2. You should see active channels when users are connected
3. Monitor events as they happen

## Alternative Solution: Manual Refresh

If Realtime isn't available, we can implement a polling mechanism or manual sync button as a fallback.

## Current Implementation

The app already has optimistic updates in place:
- When clearing drawings, the UI updates immediately
- Real-time events sync changes to other users
- If real-time fails, users still see their own changes instantly

## Troubleshooting

If DELETE events aren't working:

1. **Check WebSocket Connection**
   - Open browser DevTools → Network → WS
   - Look for active WebSocket connections

2. **Check Console Logs**
   - You should see "Drawing DELETE event" messages

3. **Test with Simple Insert**
   - Draw something and check if it appears in other windows
   - If INSERT works but DELETE doesn't, it's a Supabase configuration issue

4. **Fallback Solution**
   Add a "Refresh" button or auto-refresh timer if needed.