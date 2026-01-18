# Critical Rules for VoiceCraft AI Lab

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
