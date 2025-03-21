-- Enable UUID extension for Postgres (Supabase has this enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for secure password handling
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------------------------------------
-- Custom Users Table (extends auth.users)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add row level security for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view and edit only their own data
CREATE POLICY "Users can view and edit their own data" 
    ON public.users 
    FOR ALL 
    USING (auth.uid() = id);

-- Policy for service role to access all users
CREATE POLICY "Service role can access all users" 
    ON public.users 
    FOR ALL 
    TO service_role 
    USING (true);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a user profile when a new auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- Projects Table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    summary TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT projects_name_not_empty CHECK (char_length(trim(name)) > 0)
);

-- Add indexes for faster querying
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);

-- Add row level security for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own projects
CREATE POLICY "Users can view their own projects" 
    ON public.projects 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own projects
CREATE POLICY "Users can insert their own projects" 
    ON public.projects 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own projects
CREATE POLICY "Users can update their own projects" 
    ON public.projects 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy to allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" 
    ON public.projects 
    FOR DELETE 
    USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- Function to update timestamps on record changes
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update timestamp columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- Comments for better documentation
--------------------------------------------------------------------------------
COMMENT ON TABLE public.users IS 'Extended user profiles that reference auth.users';
COMMENT ON COLUMN public.users.id IS 'References the auth.users table';
COMMENT ON COLUMN public.users.email IS 'User email address (must match auth.users)';
COMMENT ON COLUMN public.users.name IS 'User display name';
COMMENT ON COLUMN public.users.avatar_url IS 'URL to the user avatar image';
COMMENT ON COLUMN public.users.preferences IS 'User preferences stored as JSON';

COMMENT ON TABLE public.projects IS 'User projects with configuration';
COMMENT ON COLUMN public.projects.id IS 'Unique identifier for the project';
COMMENT ON COLUMN public.projects.name IS 'Project name';
COMMENT ON COLUMN public.projects.summary IS 'Project summary/description';
COMMENT ON COLUMN public.projects.user_id IS 'Reference to the auth.user who owns this project';
COMMENT ON COLUMN public.projects.config IS 'JSON configuration for the project including tech stack, pages and schema';