import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client
export const createElevenLabsClient = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ELEVENLABS_API_KEY environment variable');
  }

  return new ElevenLabsClient({ apiKey });
};

// ElevenLabs client singleton for server-side use
let elevenLabsClient: ElevenLabsClient | null = null;

export const getElevenLabsClient = () => {
  if (!elevenLabsClient) {
    elevenLabsClient = createElevenLabsClient();
  }
  return elevenLabsClient;
};
