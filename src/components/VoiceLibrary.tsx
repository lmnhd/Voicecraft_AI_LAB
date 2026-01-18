'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { getUserVoices, deleteVoice } from '@/lib/actions/voice-design';
import type { Voice } from '@/types';

export function VoiceLibrary() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // TODO: Replace with actual user ID from auth
  const userId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserVoices(userId);

      if (!result.success) {
        setError(result.error || 'Failed to load voices');
      } else {
        setVoices(result.data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (voiceId: string) => {
    if (!confirm('Are you sure you want to delete this voice?')) {
      return;
    }

    setDeletingId(voiceId);

    try {
      const result = await deleteVoice(voiceId);

      if (!result.success) {
        alert(result.error || 'Failed to delete voice');
      } else {
        // Remove from local state
        setVoices(voices.filter((v) => v.id !== voiceId));
      }
    } catch (err) {
      alert('An unexpected error occurred');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Voices</CardTitle>
          <CardDescription>Manage your saved voice designs</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Voices</CardTitle>
          <CardDescription>Manage your saved voice designs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
          <Button onClick={loadVoices} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Voices</CardTitle>
        <CardDescription>
          {voices.length === 0
            ? 'No voices yet. Create your first one!'
            : `${voices.length} voice${voices.length === 1 ? '' : 's'} saved`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {voices.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Your saved voices will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{voice.name}</h3>
                  {voice.description && (
                    <p className="text-sm text-muted-foreground">
                      {voice.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Created {new Date(voice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(voice.id)}
                  disabled={deletingId === voice.id}
                >
                  {deletingId === voice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
