import { VoiceDesigner } from '@/components/VoiceDesigner';
import { VoiceLibrary } from '@/components/VoiceLibrary';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-end">
          <ThemeToggle />
        </div>
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            VoiceCraft AI Lab
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Design custom AI voices with ElevenLabs Text-to-Voice technology
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Voice Designer Section */}
          <VoiceDesigner />

          {/* Voice Library Section */}
          <VoiceLibrary />
        </div>
      </div>
    </main>
  );
}
