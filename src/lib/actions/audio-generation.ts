'use server';

import { getElevenLabsClient } from '@/lib/elevenlabs/client';
import { generateAudio, fetchAvailableVoices } from './core-logic';
import type { VoiceSettings } from '@/types';

/**
 * Generate audio from text using ElevenLabs Text-to-Speech
 * Returns audio as base64 encoded string for client-side playback
 * 
 * This is a Next.js Server Action wrapper around core business logic.
 */
export async function generateVoicePreview(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Default: Bella voice
  settings?: VoiceSettings
): Promise<{ success: boolean; audioBase64?: string; error?: string }> {
  try {
    const elevenlabs = getElevenLabsClient();

    // Delegate to core business logic
    const result = await generateAudio(elevenlabs, {
      text,
      voiceId,
      settings,
    });

    return {
      success: true,
      audioBase64: result.audioBase64,
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
 * 
 * This is a Next.js Server Action wrapper around core business logic.
 */
export async function getAvailableVoices(): Promise<{
  success: boolean;
  voices?: Array<{ voice_id: string; name: string; description?: string }>;
  error?: string;
}> {
  try {
    const elevenlabs = getElevenLabsClient();
    
    // Delegate to core business logic
    const voices = await fetchAvailableVoices(elevenlabs);

    return {
      success: true,
      voices,
    };
  } catch (error) {
    console.error('Fetch voices error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch voices',
    };
  }
}
