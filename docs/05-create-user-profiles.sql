-- Create user profiles table

-- 1. Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- 3. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can view all profiles
CREATE POLICY "profiles_viewable_by_all_users" ON user_profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "users_insert_own_profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON user_profiles TO authenticated;

-- 6. Create function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO user_profiles (user_id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create profiles for existing users
INSERT INTO user_profiles (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);

-- 10. Enable realtime for user_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Verify the table was created
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;