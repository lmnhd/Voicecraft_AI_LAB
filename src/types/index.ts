// Database Types
export interface Database {
  public: {
    Tables: {
      voices: {
        Row: Voice;
        Insert: VoiceInsert;
        Update: VoiceUpdate;
      };
    };
  };
}

// Voice table types
export interface Voice {
  id: string;
  user_id: string;
  voice_id: string;
  name: string;
  description: string | null;
  preview_url: string | null;
  settings: VoiceSettings;
  created_at: string;
  updated_at: string;
}

export interface VoiceInsert {
  id?: string;
  user_id: string;
  voice_id: string;
  name: string;
  description?: string | null;
  preview_url?: string | null;
  settings?: VoiceSettings;
  created_at?: string;
  updated_at?: string;
}

export interface VoiceUpdate {
  voice_id?: string;
  name?: string;
  description?: string | null;
  preview_url?: string | null;
  settings?: VoiceSettings;
  updated_at?: string;
}

// ElevenLabs Voice Settings
export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

// ElevenLabs API Types
export interface ElevenLabsVoiceDesignRequest {
  text: string;
  voice_description: string;
  settings?: VoiceSettings;
}

export interface ElevenLabsVoiceCreateRequest {
  name: string;
  description: string;
  text: string;
  voice_description: string;
  settings?: VoiceSettings;
}

export interface ElevenLabsVoiceResponse {
  voice_id: string;
  name: string;
  preview_url?: string;
  settings: VoiceSettings;
}

// UI Component Types
export interface VoiceDesignFormData {
  voiceDescription: string;
  sampleText: string;
  voiceName?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

// Server Action Response Types
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type VoicePreviewResponse = ActionResponse<{
  audioUrl: string;
  voiceId: string;
}>;

export type VoiceCreateResponse = ActionResponse<Voice>;

export type VoiceListResponse = ActionResponse<Voice[]>;
