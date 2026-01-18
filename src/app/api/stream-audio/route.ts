import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsClient } from '@/lib/elevenlabs/client';
import type { VoiceSettings } from '@/types';

/**
 * Streaming Audio API Route
 * 
 * This endpoint provides TRUE streaming audio from ElevenLabs.
 * The audio is streamed chunk-by-chunk as it's generated,
 * enabling real-time playback without waiting for full generation.
 * 
 * Usage: POST /api/stream-audio
 * Body: { text, voiceId?, settings? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      voiceId = 'EXAVITQu4vr4xnSDxMaL', // Default: Bella
      settings 
    }: { 
      text: string; 
      voiceId?: string; 
      settings?: VoiceSettings;
    } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const elevenlabs = getElevenLabsClient();

    // Get the streaming audio from ElevenLabs
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_multilingual_v2',
      voiceSettings: {
        stability: settings?.stability ?? 0.5,
        similarityBoost: settings?.similarity_boost ?? 0.75,
        style: settings?.style ?? 0.0,
        useSpeakerBoost: settings?.use_speaker_boost ?? true,
      },
    });

    // Create a TransformStream to pass the audio through
    const { readable, writable } = new TransformStream();

    // Stream the audio chunks
    (async () => {
      const writer = writable.getWriter();
      const reader = audioStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            await writer.write(value);
          }
        }
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response with proper headers
    return new Response(readable, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Streaming audio error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stream audio' },
      { status: 500 }
    );
  }
}
