# Real-time Clearing Solution

Since Supabase Replication is in early access, here are multiple solutions to ensure drawing clearing works in real-time:

## Current Implementation

The app now includes several mechanisms to handle clearing:

1. **Optimistic Updates** - UI updates immediately for the user who clears
2. **Standard Realtime** - Listens for DELETE events (if enabled)
3. **Custom Broadcasts** - Sends custom events when clearing
4. **Fallback Listeners** - Handles both standard and custom events

## Solution 1: Enable Realtime on Tables (Recommended)

Even without Replication, you can enable Realtime:

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Tables**
3. Click on the `drawings` table
4. Click the three dots menu → **Edit Table**
5. Find **Enable Realtime** toggle and turn it ON
6. Save changes

## Solution 2: Use Custom Broadcasts (Already Implemented)

The code now sends custom broadcast events when clearing:
- `drawing_deleted` - When clearing individual drawings
- `all_drawings_cleared` - When clearing all drawings

These work even if standard DELETE events don't propagate.

## Solution 3: Timestamp-Based Updates

Run `/docs/11-add-clear-timestamp.sql` to add a timestamp that updates when canvas is cleared. Then subscribe to whiteboard changes to detect clears.

## Solution 4: Manual Sync Button

Add a refresh button as a fallback:

```typescript
<button onClick={fetchDrawings}>
  <RefreshCw className="w-4 h-4" />
  Sync
</button>
```

## Testing Real-time Clearing

1. Open two browser windows with the same whiteboard
2. Draw in both windows
3. Clear drawings in one window
4. Check if they disappear in the other window

### What to Look for in Console:
- "Drawing DELETE event" - Standard realtime working
- "Custom drawing_deleted event" - Custom broadcast working
- "Custom all_drawings_cleared event" - Bulk clear working

## Troubleshooting

### If clearing doesn't work in real-time:

1. **Check WebSocket Connection**
   ```javascript
   // In browser console
   supabase.getChannels()
   ```

2. **Verify Table Has Realtime Enabled**
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE tablename = 'drawings';
   ```

3. **Check for Errors**
   - Browser console for JavaScript errors
   - Supabase logs for database errors

4. **Use the Fallback**
   - The app has optimistic updates, so users see immediate results
   - Other users can refresh or use a sync button if needed

## Current Status

With the latest code updates:
- ✅ Clearing works immediately for the user who clears
- ✅ Custom broadcast events are sent
- ✅ Listeners are set up for both standard and custom events
- ⚠️ Real-time propagation depends on Supabase configuration

The app is designed to work well even if real-time isn't perfect, with optimistic updates ensuring a smooth user experience.