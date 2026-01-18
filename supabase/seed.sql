-- Seed data for local development testing
-- Note: In local development, you can create test users through Supabase Studio
-- This file can be used to insert sample voice data after authentication is set up

-- Example seed data structure (uncomment after creating a test user):
/*
-- Insert sample voice configurations
-- Replace 'YOUR_USER_ID_HERE' with actual user ID from auth.users

INSERT INTO public.voices (user_id, voice_id, name, description, preview_url, settings) VALUES
(
    'YOUR_USER_ID_HERE'::uuid,
    'voice_sample_001',
    'Detective Voice',
    'A gritty, middle-aged detective from London',
    'https://example.com/sample-preview.mp3',
    '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true}'::jsonb
),
(
    'YOUR_USER_ID_HERE'::uuid,
    'voice_sample_002',
    'Narrator Voice',
    'Calm and authoritative narrator for audiobooks',
    'https://example.com/narrator-preview.mp3',
    '{"stability": 0.7, "similarity_boost": 0.8, "style": 0.2, "use_speaker_boost": false}'::jsonb
);
*/

-- To use this seed:
-- 1. Start local Supabase: npx supabase start
-- 2. Create a test user in Supabase Studio (http://localhost:54323)
-- 3. Copy the user's UUID
-- 4. Replace 'YOUR_USER_ID_HERE' above with the actual UUID
-- 5. Uncomment the INSERT statements
-- 6. Run: npx supabase db reset
