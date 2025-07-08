# Enable Realtime for Tables

To ensure clearing drawings works in real-time across all connected users, you need to enable Realtime for the following tables in Supabase:

## Required Tables

1. **drawings** - For real-time drawing updates and deletions
2. **presence** - For cursor tracking
3. **whiteboard_collaborators** - For avatar stack updates

## How to Enable

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Find each table listed above
4. Toggle the switch to enable replication
5. Wait a few seconds for changes to take effect

## Verify Real-time is Working

After enabling replication:

1. Open two browser windows with the same whiteboard
2. Draw in one window - should appear instantly in the other
3. Clear drawings - should clear instantly in both windows
4. Check browser console for "Drawing DELETE event" messages

## Troubleshooting

If clearing still requires refresh:

1. **Check Console Logs**
   - Look for "Drawing DELETE event" messages
   - If not appearing, replication might not be enabled

2. **Verify Subscription**
   - The whiteboard page subscribes to INSERT and DELETE events
   - Check Network tab for WebSocket connections

3. **Test with SQL**
   ```sql
   -- Check if table has replication enabled
   SELECT * FROM pg_publication_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('drawings', 'presence', 'whiteboard_collaborators');
   ```

4. **Manual Enable via SQL**
   ```sql
   -- Enable replication for a table
   ALTER PUBLICATION supabase_realtime ADD TABLE drawings;
   ALTER PUBLICATION supabase_realtime ADD TABLE presence;
   ALTER PUBLICATION supabase_realtime ADD TABLE whiteboard_collaborators;
   ```

## Expected Behavior

With real-time enabled and the code updates:
- Drawing deletions appear instantly without refresh
- "Clear My Drawings" removes only your drawings in real-time
- "Clear All Drawings" (owner only) clears the canvas for everyone instantly