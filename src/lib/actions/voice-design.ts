'use server';

import { getElevenLabsClient } from '@/lib/elevenlabs/client';
import { createSupabaseServerClient } from '@/lib/supabase/client';
import {
  createVoiceDesignPreviews,
  createVoiceFromPreview,
  createVoiceRecord,
  fetchUserVoices,
  deleteVoiceRecord,
  type VoiceDesignPreview,
} from './core-logic';
import type {
  VoiceCreateResponse,
  VoiceListResponse,
  VoiceSettings,
} from '@/types';

// ============================================================================
// Voice Design Preview Response Types
// ============================================================================

export interface VoiceDesignPreviewsResponse {
  success: boolean;
  data?: {
    /** Multiple generated voice previews to choose from */
    previews: VoiceDesignPreview[];
    /** The text used for generation */
    text: string;
  };
  error?: string;
}

// ============================================================================
// Voice Design Server Actions (REAL API - NO MOCKS!)
// ============================================================================

/**
 * Create voice design previews using ElevenLabs Text-to-Voice API
 * This generates multiple unique voice previews based on a text description
 * 
 * REAL IMPLEMENTATION - Uses elevenlabs.textToVoice.createPreviews()
 * 
 * @param voiceDescription - Natural language description of the voice
 * @param sampleText - Text to speak in the preview (100-1000 chars recommended)
 * @returns Multiple voice previews with audio and generated voice IDs
 */
export async function previewVoiceDesign(
  voiceDescription: string,
  sampleText: string
): Promise<VoiceDesignPreviewsResponse> {
  try {
    if (!voiceDescription.trim()) {
      return {
        success: false,
        error: 'Voice description is required',
      };
    }

    if (!sampleText.trim() || sampleText.length < 50) {
      return {
        success: false,
        error: 'Sample text must be at least 50 characters',
      };
    }

    const elevenlabs = getElevenLabsClient();
    
    // Call the REAL ElevenLabs Text-to-Voice Design API
    const result = await createVoiceDesignPreviews(elevenlabs, {
      voiceDescription,
      text: sampleText,
      outputFormat: 'mp3_44100_128', // High quality preview
    });
    
    return {
      success: true,
      data: {
        previews: result.previews,
        text: result.text,
      },
    };
  } catch (error) {
    console.error('Voice design preview error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate voice previews',
    };
  }
}

/**
 * Create a permanent voice from a design preview
 * This saves the voice to ElevenLabs and then to Supabase
 * 
 * REAL IMPLEMENTATION - Uses elevenlabs.textToVoice.create()
 * 
 * @param userId - User ID for RLS
 * @param generatedVoiceId - The generated_voice_id from a preview
 * @param voiceName - Name for the new voice
 * @param voiceDescription - Description for the voice
 * @param settings - Optional voice settings to save
 */
export async function createVoiceFromDesign(
  userId: string,
  generatedVoiceId: string,
  voiceName: string,
  voiceDescription: string,
  settings?: VoiceSettings
): Promise<VoiceCreateResponse> {
  try {
    if (!generatedVoiceId) {
      return {
        success: false,
        error: 'Generated voice ID is required. Generate a preview first.',
      };
    }

    const elevenlabs = getElevenLabsClient();
    
    // Step 1: Create the permanent voice in ElevenLabs from the preview
    const { voiceId } = await createVoiceFromPreview(elevenlabs, {
      generatedVoiceId,
      voiceName,
      voiceDescription,
    });

    // Step 2: Save to Supabase with RLS
    const supabase = createSupabaseServerClient();
    const voice = await createVoiceRecord(supabase, {
      userId,
      voiceId, // Real ElevenLabs voice_id
      name: voiceName,
      description: voiceDescription,
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
 * Legacy createVoice function - now wraps createVoiceFromDesign
 * Kept for backward compatibility with existing UI
 * 
 * NOTE: This requires a generatedVoiceId from previewVoiceDesign()
 */
export async function createVoice(
  userId: string,
  name: string,
  description: string,
  sampleText: string,
  settings?: VoiceSettings,
  generatedVoiceId?: string
): Promise<VoiceCreateResponse> {
  // If no generatedVoiceId provided, we need to generate a preview first
  if (!generatedVoiceId) {
    // Generate a preview to get a generatedVoiceId
    const previewResult = await previewVoiceDesign(description, sampleText);
    
    if (!previewResult.success || !previewResult.data?.previews[0]) {
      return {
        success: false,
        error: previewResult.error || 'Failed to generate voice preview',
      };
    }
    
    // Use the first preview's generatedVoiceId
    generatedVoiceId = previewResult.data.previews[0].generatedVoiceId;
  }

  return createVoiceFromDesign(userId, generatedVoiceId, name, description, settings);
}

// ============================================================================
// Voice Library Server Actions
// ============================================================================

/**
 * Get all voices for the authenticated user
 * RLS automatically filters by user_id
 */
export async function getUserVoices(userId: string): Promise<VoiceListResponse> {
  try {
    const supabase = createSupabaseServerClient();
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
 */
export async function deleteVoice(voiceId: string): Promise<ActionResponse> {
  try {
    const supabase = createSupabaseServerClient();
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
