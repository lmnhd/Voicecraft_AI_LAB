'use server';

import { getElevenLabsClient } from '@/lib/elevenlabs/client';
import { createSupabaseServerClient } from '@/lib/supabase/client';
import {
  generateAudio,
  createVoiceRecord,
  fetchUserVoices,
  deleteVoiceRecord,
} from './core-logic';
import type {
  VoicePreviewResponse,
  VoiceCreateResponse,
  VoiceListResponse,
  VoiceSettings,
} from '@/types';

/**
 * Preview a voice design using ElevenLabs Text-to-Voice API
 * Generates audio based on description and sample text with streaming support
 * 
 * This is a Next.js Server Action wrapper around core business logic.
 */
export async function previewVoiceDesign(
  voiceDescription: string,
  sampleText: string,
  settings?: VoiceSettings
): Promise<VoicePreviewResponse> {
  try {
    const elevenlabs = getElevenLabsClient();
    
    // For preview, use a default voice ID (Bella - high quality female voice)
    // In a full implementation, you could use ElevenLabs Voice Design API
    // to create a temporary voice based on the description
    const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL';
    
    // Generate audio using core business logic
    const result = await generateAudio(elevenlabs, {
      text: sampleText,
      voiceId: defaultVoiceId,
      settings,
    });
    
    // Return audio as data URL for immediate playback
    const audioUrl = `data:audio/mpeg;base64,${result.audioBase64}`;
    
    return {
      success: true,
      data: {
        audioUrl,
        voiceId: defaultVoiceId,
      },
    };
  } catch (error) {
    console.error('Voice preview error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to preview voice',
    };
  }
}

/**
 * Create a permanent voice using ElevenLabs Voice Design API
 * Saves the voice configuration to Supabase with RLS enforcement
 * 
 * This is a Next.js Server Action wrapper around core business logic.
 */
export async function createVoice(
  userId: string,
  name: string,
  description: string,
  sampleText: string,
  settings?: VoiceSettings
): Promise<VoiceCreateResponse> {
  try {
    // TODO: Implement ElevenLabs voice creation via Voice Design API
    // const elevenlabs = getElevenLabsClient();
    // const voice = await elevenlabs.voices.create({...});

    // Placeholder voice_id until ElevenLabs Voice Design API integration is complete
    const voiceId = `voice_${Date.now()}`;

    const supabase = createSupabaseServerClient();

    // Delegate to core business logic - no 'any' types needed!
    const voice = await createVoiceRecord(supabase, {
      userId,
      voiceId,
      name,
      description,
      settings,
    });

    return {
      success: true,
      data: voice,
    };
  } catch (error) {
    console.error('Voice creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create voice',
    };
  }
}

/**
 * Get all voices for the authenticated user
 * RLS automatically filters by user_id
 * 
 * This is a Next.js Server Action wrapper around core business logic.
 */
export async function getUserVoices(userId: string): Promise<VoiceListResponse> {
  try {
    const supabase = createSupabaseServerClient();

    // Delegate to core business logic
    const voices = await fetchUserVoices(supabase, userId);

    return {
      success: true,
      data: voices,
    };
  } catch (error) {
    console.error('Fetch voices error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch voices',
    };
  }
}

/**
 * Delete a voice by ID
 * RLS ensures users can only delete their own voices
 * 
 * This is a Next.js Server Action wrapper around core business logic.
 */
export async function deleteVoice(voiceId: string): Promise<ActionResponse> {
  try {
    const supabase = createSupabaseServerClient();

    // Delegate to core business logic
    await deleteVoiceRecord(supabase, voiceId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete voice error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete voice',
    };
  }
}

type ActionResponse = {
  success: boolean;
  error?: string;
};
