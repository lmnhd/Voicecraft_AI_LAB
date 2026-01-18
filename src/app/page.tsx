import { VoiceDesigner } from '@/components/VoiceDesigner';
import { VoiceLibrary } from '@/components/VoiceLibrary';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-end">
          <ThemeToggle />
        </div>
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            VoiceCraft AI Lab
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Design custom AI voices with ElevenLabs Text-to-Voice technology (Hosted on Supabase!)
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
