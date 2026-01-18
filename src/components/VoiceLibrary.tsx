'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Play, Square, Volume2 } from 'lucide-react';
import { getUserVoices, deleteVoice, generateSpeechFromVoice } from '@/lib/actions/voice-design';
import type { Voice } from '@/types';

export function VoiceLibrary() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [speakText, setSpeakText] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TODO: Replace with actual user ID from auth
  const userId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    loadVoices();
    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
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

  const handlePlay = async (voice: Voice) => {
    const text = speakText[voice.id]?.trim() || 'Hello! This is a test of my custom voice.';
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If already playing this voice, just stop
    if (playingId === voice.id) {
      setPlayingId(null);
      return;
    }

    setGeneratingId(voice.id);

    try {
      const result = await generateSpeechFromVoice(voice.voice_id, text);

      if (!result.success || !result.data) {
        alert(result.error || 'Failed to generate speech');
        return;
      }

      // Create and play audio
      const audio = new Audio(`data:audio/mpeg;base64,${result.data.audioBase64}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingId(null);
        audioRef.current = null;
        alert('Failed to play audio');
      };

      await audio.play();
      setPlayingId(voice.id);
    } catch (err) {
      console.error('Play error:', err);
      alert('An unexpected error occurred');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
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
          <div className="space-y-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="rounded-lg border p-4 space-y-3"
              >
                {/* Voice Info Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{voice.name}</h3>
                    </div>
                    {voice.description && (
                      <p className="text-sm text-muted-foreground mt-1">
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
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === voice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Play Controls Row */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter text to speak..."
                    value={speakText[voice.id] || ''}
                    onChange={(e) => setSpeakText({ ...speakText, [voice.id]: e.target.value })}
                    className="flex-1 text-sm"
                    disabled={generatingId === voice.id}
                  />
                  {playingId === voice.id ? (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleStop}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => handlePlay(voice)}
                      disabled={generatingId === voice.id}
                    >
                      {generatingId === voice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
