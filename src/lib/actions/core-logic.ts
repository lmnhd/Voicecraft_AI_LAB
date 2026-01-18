/**
 * Core Business Logic - Clean Architecture Layer
 * 
 * This module contains pure business logic separated from Next.js Server Actions.
 * All ElevenLabs and Supabase operations are isolated here for:
 * - Testability: Easy to unit test without Next.js context
 * - Reusability: Can be imported by different entry points (API routes, Server Actions, etc.)
 * - Maintainability: Single source of truth for business rules
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { Voice, VoiceInsert, VoiceSettings } from '@/types';

// ============================================================================
// ElevenLabs Voice Design API - Text-to-Voice (TTV)
// ============================================================================

/**
 * Voice design preview configuration
 */
export interface VoiceDesignConfig {
  voiceDescription: string;
  text: string;
  outputFormat?: 'mp3_22050_32' | 'mp3_44100_64' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192';
}

/**
 * Voice design preview result from ElevenLabs
 */
export interface VoiceDesignPreview {
  /** The generated voice ID - use this to create a permanent voice */
  generatedVoiceId: string;
  /** Base64 encoded audio preview */
  audioBase64: string;
  /** Media type (e.g., audio/mpeg) */
  mediaType: string;
  /** Duration of the preview in seconds */
  durationSecs: number;
}

/**
 * Result from voice design operation
 */
export interface VoiceDesignResult {
  /** Multiple voice previews to choose from */
  previews: VoiceDesignPreview[];
  /** The text used to generate previews */
  text: string;
}

/**
 * Creates voice design previews using ElevenLabs Text-to-Voice API
 * This is the REAL API call - not a mock!
 * 
 * @param elevenlabs - ElevenLabs client instance
 * @param config - Voice design configuration
 * @returns Multiple voice previews to choose from
 * @throws Error if design fails
 */
export async function createVoiceDesignPreviews(
  elevenlabs: ElevenLabsClient,
  config: VoiceDesignConfig
): Promise<VoiceDesignResult> {
  const { voiceDescription, text, outputFormat = 'mp3_44100_128' } = config;

  // Call the real ElevenLabs Text-to-Voice design API
  const response = await elevenlabs.textToVoice.createPreviews({
    voiceDescription,
    text,
    outputFormat,
  });

  // Map the SDK response to our typed interface
  const previews: VoiceDesignPreview[] = response.previews.map((preview) => ({
    generatedVoiceId: preview.generatedVoiceId,
    audioBase64: preview.audioBase64,
    mediaType: preview.mediaType,
    durationSecs: preview.durationSecs,
  }));

  return {
    previews,
    text: response.text,
  };
}

/**
 * Creates a permanent voice from a design preview
 * 
 * @param elevenlabs - ElevenLabs client instance
 * @param params - Voice creation parameters
 * @returns The created voice ID
 * @throws Error if creation fails
 */
export async function createVoiceFromPreview(
  elevenlabs: ElevenLabsClient,
  params: {
    generatedVoiceId: string;
    voiceName: string;
    voiceDescription: string;
    labels?: Record<string, string>;
  }
): Promise<{ voiceId: string; name: string }> {
  const { generatedVoiceId, voiceName, voiceDescription, labels } = params;

  // Call the real ElevenLabs API to create a permanent voice
  const voice = await elevenlabs.textToVoice.create({
    generatedVoiceId,
    voiceName,
    voiceDescription,
    labels,
  });

  return {
    voiceId: voice.voiceId,
    name: voice.name ?? voiceName,
  };
}

// ============================================================================
// ElevenLabs Text-to-Speech API (for existing voices)
// ============================================================================

/**
 * Voice generation configuration for TTS
 */
interface VoiceGenerationConfig {
  text: string;
  voiceId: string;
  modelId?: string;
  settings?: VoiceSettings;
}

/**
 * Voice generation result with typed audio buffer
 */
interface VoiceGenerationResult {
  audioBuffer: Uint8Array;
  audioBase64: string;
  duration?: number;
}

/**
 * Generates audio from text using ElevenLabs Text-to-Speech API
 * Returns both buffer and base64 encoded audio
 * 
 * @param elevenlabs - ElevenLabs client instance
 * @param config - Voice generation configuration
 * @returns Audio buffer and base64 string
 * @throws Error if generation fails
 */
export async function generateAudio(
  elevenlabs: ElevenLabsClient,
  config: VoiceGenerationConfig
): Promise<VoiceGenerationResult> {
  const { text, voiceId, modelId = 'eleven_multilingual_v2', settings } = config;

  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId,
    voiceSettings: {
      stability: settings?.stability ?? 0.5,
      similarityBoost: settings?.similarity_boost ?? 0.75,
      style: settings?.style ?? 0.0,
      useSpeakerBoost: settings?.use_speaker_boost ?? true,
    },
  });

  // Convert ReadableStream to buffer using proper Streams API
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
    audioBuffer,
    audioBase64,
  };
}

/**
 * Creates a streaming audio generator for real-time playback
 * Use this for true streaming audio in the UI
 * 
 * @param elevenlabs - ElevenLabs client instance
 * @param config - Voice generation configuration
 * @returns AsyncGenerator yielding audio chunks
 */
export async function* streamAudio(
  elevenlabs: ElevenLabsClient,
  config: VoiceGenerationConfig
): AsyncGenerator<Uint8Array, void, unknown> {
  const { text, voiceId, modelId = 'eleven_multilingual_v2', settings } = config;

  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId,
    voiceSettings: {
      stability: settings?.stability ?? 0.5,
      similarityBoost: settings?.similarity_boost ?? 0.75,
      style: settings?.style ?? 0.0,
      useSpeakerBoost: settings?.use_speaker_boost ?? true,
    },
  });

  const reader = audioStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) yield value;
  }
}

// ============================================================================
// ElevenLabs Voice Library
// ============================================================================

/**
 * ElevenLabs voice from SDK
 */
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  labels?: Record<string, string>;
}

/**
 * Normalized voice information
 */
export interface NormalizedVoice {
  voice_id: string;
  name: string;
  description?: string;
}

/**
 * Fetches all available voices from ElevenLabs
 * 
 * @param elevenlabs - ElevenLabs client instance
 * @returns Array of normalized voice objects
 * @throws Error if fetch fails
 */
export async function fetchAvailableVoices(
  elevenlabs: ElevenLabsClient
): Promise<NormalizedVoice[]> {
  const response = await elevenlabs.voices.getAll();
  
  // The SDK returns voices with voiceId (camelCase), we normalize to voice_id (snake_case)
  return response.voices.map((v: { voiceId: string; name?: string; description?: string }) => ({
    voice_id: v.voiceId,
    name: v.name || 'Unnamed Voice',
    description: v.description,
  }));
}

// ============================================================================
// Supabase Voice Persistence Core Logic
// ============================================================================

/**
 * Voice creation parameters
 */
export interface VoiceCreationParams {
  userId: string;
  voiceId: string;
  name: string;
  description?: string;
  previewUrl?: string;
  settings?: VoiceSettings;
}

/**
 * Creates a new voice record in Supabase
 * RLS policies automatically enforce user_id filtering
 * 
 * @param supabase - Supabase client instance (must have user context)
 * @param params - Voice creation parameters
 * @returns Created voice record
 * @throws Error if creation fails or RLS policy blocks
 */
export async function createVoiceRecord(
  supabase: SupabaseClient,
  params: VoiceCreationParams
): Promise<Voice> {
  const voiceData: VoiceInsert = {
    user_id: params.userId,
    voice_id: params.voiceId,
    name: params.name,
    description: params.description ?? null,
    preview_url: params.previewUrl ?? null,
    settings: params.settings ?? {},
  };

  const { data, error } = await supabase
    .from('voices')
    .insert(voiceData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create voice record: ${error.message}`);
  }

  if (!data) {
    throw new Error('Voice creation returned no data');
  }

  return data as Voice;
}

/**
 * Fetches all voices for a specific user
 * RLS policies automatically enforce user_id filtering
 * 
 * @param supabase - Supabase client instance (must have user context)
 * @param userId - User ID to fetch voices for
 * @returns Array of voice records sorted by creation date (newest first)
 * @throws Error if fetch fails
 */
export async function fetchUserVoices(
  supabase: SupabaseClient,
  userId: string
): Promise<Voice[]> {
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch voices: ${error.message}`);
  }

  return (data as Voice[]) ?? [];
}

/**
 * Deletes a voice record by ID
 * RLS policies automatically enforce user ownership
 * 
 * @param supabase - Supabase client instance (must have user context)
 * @param voiceId - Voice ID to delete
 * @throws Error if deletion fails or user doesn't own the voice
 */
export async function deleteVoiceRecord(
  supabase: SupabaseClient,
  voiceId: string
): Promise<void> {
  const { error } = await supabase
    .from('voices')
    .delete()
    .eq('id', voiceId);

  if (error) {
    throw new Error(`Failed to delete voice: ${error.message}`);
  }
}

/**
 * Updates a voice record
 * RLS policies automatically enforce user ownership
 * 
 * @param supabase - Supabase client instance (must have user context)
 * @param voiceId - Voice ID to update
 * @param updates - Fields to update
 * @returns Updated voice record
 * @throws Error if update fails or user doesn't own the voice
 */
export async function updateVoiceRecord(
  supabase: SupabaseClient,
  voiceId: string,
  updates: {
    name?: string;
    description?: string;
    preview_url?: string;
    settings?: VoiceSettings;
  }
): Promise<Voice> {
  const { data, error } = await supabase
    .from('voices')
    .update(updates)
    .eq('id', voiceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update voice: ${error.message}`);
  }

  if (!data) {
    throw new Error('Voice update returned no data');
  }

  return data as Voice;
}
