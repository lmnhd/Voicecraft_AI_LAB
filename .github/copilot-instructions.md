# VoiceCraft AI Lab - Copilot Instructions

**ALWAYS** create a git checkpoint before significant changes: `git add . && git commit -m "checkpoint: before [change]"`
**ALWAYS** use strongly typed objects or Classes
**NEVER** use generic `any` types EVER! - This is TYPESCRIPT!
**NEVER** create 'Fallback' solutions to avoid throwing errors!
**ALWAYS** deal with the core issue - not how to compensate with 'mock' scenarios!
**NEVER** write 'MOCK' implementations or code unless specifically asked to! - simply use 'Not-Implemented' when necessary.
**ALWAYS** take an AI FIRST approach! - avoid programmatic solutions when AI can do it!
**NEVER** start/stop/manage the Next.js dev server.
**NEVER** remove TODO comments.
**ALWAYS** separate core business logic from Next.js API route handlers (e.g., `src/lib/actions/core-logic.ts`).
**ALWAYS** keep file lengths less than 500 lines - break into multiple files if necessary.
**ALWAYS** use descriptive variable names.
**ALWAYS** use Windows 11 & PowerShell only - no Unix commands (use `;` instead of `&&`).
**ALWAYS** get user confirmation between multi-step tasks.
**ALWAYS** keep LLM prompts separate from main logic.
**ALWAYS** isolate AI-specific processing.
**ALWAYS** create test pages in `/tests/` directory for rapid iteration.
**ALWAYS** use Next.js 15 (App Router) conventions.
**ALWAYS** be mindful of client/server component boundaries.
**ALWAYS** check working directory with `Get-Location` before operations.

### Git Workflow
Use descriptive commit messages: `checkpoint: before [change]` or `feat: [feature description]`.

### Technical Standards
- Framework: Next.js 15
- Language: TypeScript (Strict)
- Styling: Tailwind CSS
- Voice AI: ElevenLabs SDK
- Database: Supabase (Strict RLS enforcement)


## 🎯 Big Picture
A "Surgical Demo" application focused on **Voice AI (ElevenLabs)** and **Secure Data (Supabase RLS)** using **Next.js 15** (App Router). The goal is high-performance, zero-bloat, and AI-first engineering.

## 🛠 Critical Workflows
- **Environment**: ALWAYS use **Windows 11 & PowerShell**. Use `;` to chain commands (not `&&`).
- **Git Checkpoints**: ALWAYS commit before significant changes: `git add . ; git commit -m "checkpoint: before [change]"`
- **Dev Server**: NEVER start/stop/manage the Next.js dev server.
- **Rapid Iteration**: ALWAYS create test pages in `src/app/tests/` for prototype verification.

## 🏗 Architecture & Patterns
- **AI-First Logic**: Prefer AI-driven solutions over complex programmatic ones. Keep LLM prompts in separate files or dedicated sections within `src/lib/ai/`.
- **Server-Side Core**: Separate core business logic from Next.js API/Action boilerplate.
  - Pattern: `src/lib/actions/voice-design.ts` for logic, `src/app/` for UI.
- **Strict Boundaries**: Be mindful of `use client` vs. `use server` components.
- **File Length**: Limit files to **<500 lines**. Break down complex components or logic into smaller modules.

## 💻 Technical Standards (TypeScript Strict)
- **Typing**: NEVER use `any`. Use strongly typed Interfaces or Classes for all data structures (see `src/types/`).
- **Error Handling**: NEVER create 'Fallback' solutions or 'Mock' scenarios or code. Deal with the core issue. If functionality isn't ready, use 'Not-Implemented'.
- **Persistence**: Strict enforcement of **Supabase Row Level Security (RLS)**. Ensure all queries handle `user_id` context.

## 🧩 Key Integration Points
- **ElevenLabs**: Use `@elevenlabs/elevenlabs-js` for Text-to-Voice (TTV) design and streaming.
- **Supabase**: Primary store for voice configurations and metadata.

## 📝 Coding Style
- Use descriptive variable names (e.g., `generatedVoiceId` vs `vid`).
- NEVER remove TODO comments.
- Follow Shadcn UI patterns for component development.
