export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
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
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Voice Designer
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Voice design interface coming soon...
            </p>
          </section>

          {/* Voice Library Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Your Voices
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Voice library coming soon...
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
