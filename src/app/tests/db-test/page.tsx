import { createVoice, getUserVoices } from '@/lib/actions/voice-design';

export default async function TestPage() {
  // Test database connection with a sample query
  const testUserId = '00000000-0000-0000-0000-000000000000'; // Test UUID
  const result = await getUserVoices(testUserId);

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="rounded-lg border p-6 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-semibold mb-4">Supabase Connection Status</h2>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium">Status: </span>
            <span className={result.success ? 'text-green-600' : 'text-red-600'}>
              {result.success ? '✓ Connected' : '✗ Failed'}
            </span>
          </div>
          
          {result.error && (
            <div className="text-red-600">
              <span className="font-medium">Error: </span>
              {result.error}
            </div>
          )}
          
          {result.success && (
            <div>
              <span className="font-medium">Voices found: </span>
              {result.data?.length ?? 0}
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded text-sm font-mono">
          {JSON.stringify(result, null, 2)}
        </div>
      </div>

      <div className="mt-8">
        <a 
          href="/" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
