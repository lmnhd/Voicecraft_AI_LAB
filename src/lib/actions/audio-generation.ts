'use server';

import { getElevenLabsClient } from '@/lib/elevenlabs/client';
import type { VoiceSettings } from '@/types';

/**
 * Generate audio from text using ElevenLabs Text-to-Speech
 * Returns audio as base64 encoded string for client-side playback
 */
export async function generateVoicePreview(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Default: Bella voice
  settings?: VoiceSettings
): Promise<{ success: boolean; audioBase64?: string; error?: string }> {
  try {
    const elevenlabs = getElevenLabsClient();

    // Generate audio using ElevenLabs textToSpeech.convert
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      modelId: 'eleven_multilingual_v2',
      voice_settings: {
        stability: settings?.stability ?? 0.5,
        similarity_boost: settings?.similarity_boost ?? 0.75,
        style: settings?.style ?? 0.0,
        use_speaker_boost: settings?.use_speaker_boost ?? true,
      },
    });

    // Convert ReadableStream to buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    // Concatenate all chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64 for client-side playback
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return {
      success: true,
      audioBase64,
    };
  } catch (error) {
    console.error('Voice generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate audio',
    };
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<{
  success: boolean;
  voices?: Array<{ voice_id: string; name: string; description?: string }>;
  error?: string;
}> {
  try {
    const elevenlabs = getElevenLabsClient();
    const voices = await elevenlabs.voices.getAll();

    return {
      success: true,
      voices: voices.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name || 'Unnamed Voice',
        description: v.description,
      })),
    };
  } catch (error) {
    console.error('Fetch voices error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch voices',
    };
  }
}
