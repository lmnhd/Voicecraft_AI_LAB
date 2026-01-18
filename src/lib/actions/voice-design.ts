'use server';

import { getElevenLabsClient } from '@/lib/elevenlabs/client';
import { createSupabaseServerClient } from '@/lib/supabase/client';
import type {
  VoicePreviewResponse,
  VoiceCreateResponse,
  VoiceListResponse,
  VoiceSettings,
  Voice,
} from '@/types';

/**
 * Preview a voice design using ElevenLabs Text-to-Voice API
 * Generates a temporary voice based on description and sample text
 */
export async function previewVoiceDesign(
  voiceDescription: string,
  sampleText: string,
  settings?: VoiceSettings
): Promise<VoicePreviewResponse> {
  try {
    // TODO: Implement ElevenLabs voice design preview
    // const elevenlabs = getElevenLabsClient();
    // const response = await elevenlabs.textToVoice.convert(...);
    
    // Placeholder response until streaming audio implementation
    return {
      success: true,
      data: {
        audioUrl: 'Not-Implemented', // Streaming audio handling pending
        voiceId: 'preview_temp_id',
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
 */
export async function createVoice(
  userId: string,
  name: string,
  description: string,
  sampleText: string,
  settings?: VoiceSettings
): Promise<VoiceCreateResponse> {
  try {
    // TODO: Implement ElevenLabs voice creation
    // const elevenlabs = getElevenLabsClient();
    // const voice = await elevenlabs.voices.create({...});

    // Placeholder voice_id until ElevenLabs integration is complete
    const voiceId = `voice_${Date.now()}`;

    const supabase = createSupabaseServerClient();

    // Insert voice into database with RLS (user_id enforcement)
    const { data, error } = await supabase
      .from('voices')
      .insert({
        user_id: userId,
        voice_id: voiceId,
        name,
        description,
        settings: settings ?? {},
      } as any) // Type assertion for Supabase generated types
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to save voice to database',
      };
    }

    return {
      success: true,
      data: data as Voice,
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
 */
export async function getUserVoices(userId: string): Promise<VoiceListResponse> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('voices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to fetch voices',
      };
    }

    return {
      success: true,
      data: data as Voice[],
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
 */
export async function deleteVoice(voiceId: string): Promise<ActionResponse> {
  try {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase.from('voices').delete().eq('id', voiceId);

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to delete voice',
      };
    }

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
