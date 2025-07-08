-- Create all tables for the whiteboard app

-- 1. Create whiteboards table
CREATE TABLE whiteboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create drawings table
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('pen', 'rect', 'circle', 'text', 'eraser')),
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create whiteboard_collaborators table
CREATE TABLE whiteboard_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(whiteboard_id, user_id)
);

-- 4. Create presence table
CREATE TABLE presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    user_name TEXT,
    cursor_x FLOAT,
    cursor_y FLOAT,
    is_online BOOLEAN DEFAULT true,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(whiteboard_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_whiteboards_user_id ON whiteboards(user_id);
CREATE INDEX idx_whiteboards_invite_code ON whiteboards(invite_code);
CREATE INDEX idx_drawings_whiteboard_id ON drawings(whiteboard_id);
CREATE INDEX idx_whiteboard_collaborators_whiteboard_id ON whiteboard_collaborators(whiteboard_id);
CREATE INDEX idx_whiteboard_collaborators_user_id ON whiteboard_collaborators(user_id);
CREATE INDEX idx_presence_whiteboard_id ON presence(whiteboard_id);
CREATE INDEX idx_presence_last_seen ON presence(last_seen);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to whiteboards
CREATE TRIGGER update_whiteboards_updated_at BEFORE UPDATE ON whiteboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('whiteboards', 'drawings', 'whiteboard_collaborators', 'presence')
ORDER BY tablename;