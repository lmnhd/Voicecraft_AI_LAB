-- Migration: Enable demo mode for VoiceCraft AI Lab
-- This migration removes the strict foreign key constraint to auth.users
-- and adds policies that allow service role operations for demo purposes.

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.voices 
DROP CONSTRAINT IF EXISTS voices_user_id_fkey;

-- Step 2: Add a policy that allows service role full access (for demo without auth)
-- The service role automatically bypasses RLS, but we'll add explicit policies too.

-- Allow service role to select all voices (for demo)
CREATE POLICY "service_role_select_all_voices"
    ON public.voices
    FOR SELECT
    TO service_role
    USING (true);

-- Allow service role to insert any voices (for demo)
CREATE POLICY "service_role_insert_all_voices"
    ON public.voices
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow service role to update any voices (for demo)
CREATE POLICY "service_role_update_all_voices"
    ON public.voices
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role to delete any voices (for demo)
CREATE POLICY "service_role_delete_all_voices"
    ON public.voices
    FOR DELETE
    TO service_role
    USING (true);

-- Note: The original authenticated user policies remain in place.
-- When real auth is implemented, users will still be restricted to their own data.
-- The service role policies are for demo/development purposes only.
