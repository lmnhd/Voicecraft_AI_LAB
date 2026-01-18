-- Create voices table for storing user-generated voice configurations
CREATE TABLE IF NOT EXISTS public.voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    voice_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    preview_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_voices_user_id ON public.voices(user_id);

-- Create index on voice_id for lookups
CREATE INDEX IF NOT EXISTS idx_voices_voice_id ON public.voices(voice_id);

-- Enable Row Level Security
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own voices
CREATE POLICY "users_can_insert_own_voices"
    ON public.voices
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own voices
CREATE POLICY "users_can_view_own_voices"
    ON public.voices
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can update their own voices
CREATE POLICY "users_can_update_own_voices"
    ON public.voices
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own voices
CREATE POLICY "users_can_delete_own_voices"
    ON public.voices
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.voices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
