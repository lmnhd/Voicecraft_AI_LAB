# VoiceCraft AI Lab - Implementation Plan

## 🎯 Project Objective
Build a "Surgical Demo" application for the TalentBridgeX interview (Jan 20). The goal is to demonstrate expertise in **Next.js 15**, **Voice AI (ElevenLabs TTV)**, and **Database Security (Supabase RLS)**.

## 🚀 Key Features (The "Surgical" Focus)
1. **Voice Designer Interface**: Users input voice descriptions (e.g., "A gritty, middle-aged detective from London") and text.
2. **Real-time Preview**: Stream audio directly from ElevenLabs TTV (Text-to-Voice) design API.
3. **Smart Persistence**: Save the generated `voice_id` and settings to Supabase, demonstrating Row Level Security (RLS) for user-owned voices.
4. **Zero-Bloat Architecture**: Single-page focus, high performance, and clean Server Actions.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Voice AI**: ElevenLabs SDK (`@elevenlabs/elevenlabs-js`)
- **Database/Auth**: Supabase (PostgreSQL + Storage)
- **Deployment**: Vercel

## 📅 Roadmap (Monday-Tuesday Schedule)

### Phase 1: Environment & Foundation (Monday Morning)
- [ ] Initialize Next.js 15 with Tailwind.
- [ ] Configure Supabase Client and ElevenLabs API keys.
- [ ] Define Database Schema: `voices` table (user_id, voice_id, name, description, preview_url, settings).

### Phase 2: Core Logic - The Server Action (Monday Afternoon)
- [ ] Implement `voice-design.ts` Server Action.
- [ ] Logic for `textToVoice.design` (preview generation).
- [ ] Logic for `textToVoice.create` (official voice creation).
- [ ] Handle streaming audio responses for the preview.

### Phase 3: The "Impressive" UI (Tuesday Morning)
- [ ] Build the `VoiceCraftDashboard`.
- [ ] Add "Surgical" touches: Loading states that show the AI's "thought process".
- [ ] Implement Audio Waveform visualization for previews.

### Phase 4: Security & RLS (Tuesday Afternoon)
- [ ] Enable RLS on Supabase.
- [ ] Write policies ensuring users can only see/delete their *own* created voices.
- [ ] Final Vercel Deployment & "Battle Testing".

## 💎 Interview Talking Points (Surgical Engineering)
- **Why Server Actions?** Explain the removal of API Route overhead for simple, secure backend logic.
- **Why RLS?** Point out that security is baked into the database layer, not just the application layer.
- **Why ElevenLabs TTV?** Contrast prompt-based design vs. manual voice cloning as a faster prototype-to-production path.
