-- Create storage bucket for avatars

-- Note: This needs to be run in the Supabase dashboard or through the Supabase CLI
-- as storage buckets cannot be created through SQL

-- 1. Create the avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true, -- Make it public so avatars can be displayed
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- 2. Create storage policies for the avatars bucket
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public to view avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Note: After running this, you may need to manually create the bucket
-- in the Supabase dashboard under Storage if it doesn't appear