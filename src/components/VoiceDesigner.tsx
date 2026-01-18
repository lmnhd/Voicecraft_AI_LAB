'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Play, Save, Sparkles, Volume2, Check } from 'lucide-react';
import { previewVoiceDesign, createVoiceFromDesign } from '@/lib/actions/voice-design';
import type { VoiceSettings } from '@/types';
import type { VoiceDesignPreview } from '@/lib/actions/core-logic';

/**
 * Voice Designer Component
 * 
 * Uses the REAL ElevenLabs Text-to-Voice API to:
 * 1. Generate multiple voice previews from a description
 * 2. Let users select their preferred voice
 * 3. Create a permanent voice from the selection
 * 
 * Features TRUE STREAMING audio playback for instant feedback
 */
export function VoiceDesigner() {
  // Form state
  const [voiceDescription, setVoiceDescription] = useState('');
  const [sampleText, setSampleText] = useState(
    'I designed this voice specifically for this moment to demonstrate the real-time flexibility of the ElevenLabs TTV pipeline I\'ve architected here.'
  );
  const [voiceName, setVoiceName] = useState('');
  
  // Voice settings
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [style, setStyle] = useState([0.0]);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Voice previews state
  const [previews, setPreviews] = useState<VoiceDesignPreview[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  
  // Streaming audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  /**
   * Generate voice design previews using the REAL ElevenLabs API
   */
  const handleGeneratePreviews = async () => {
    if (!voiceDescription.trim()) {
      setError('Please describe your ideal voice');
      return;
    }
    
    if (!sampleText.trim() || sampleText.length < 50) {
      setError('Sample text must be at least 50 characters for voice design');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    setPreviews([]);
    setSelectedPreviewIndex(null);

    try {
      // Call the REAL ElevenLabs Text-to-Voice API
      const result = await previewVoiceDesign(voiceDescription, sampleText);

      if (!result.success) {
        setError(result.error || 'Failed to generate voice previews');
      } else if (result.data?.previews) {
        setPreviews(result.data.previews);
        setSuccessMessage(`Generated ${result.data.previews.length} unique voice${result.data.previews.length > 1 ? 's' : ''}!`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Play a voice preview with streaming audio
   */
  const handlePlayPreview = useCallback(async (index: number) => {
    const preview = previews[index];
    if (!preview) return;

    // Stop any currently playing audio
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }

    setPlayingIndex(index);

    try {
      // Initialize AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Decode the base64 audio
      const audioData = atob(preview.audioBase64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      // Decode and play the audio
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioArray.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setPlayingIndex(null);
      };
      
      audioSourceRef.current = source;
      source.start(0);
    } catch (err) {
      console.error('Error playing audio:', err);
      setPlayingIndex(null);
    }
  }, [previews]);

  /**
   * Stream audio in real-time using the streaming API
   */
  const handleStreamPreview = async () => {
    if (!sampleText.trim()) {
      setError('Please provide sample text');
      return;
    }

    const selectedPreview = selectedPreviewIndex !== null ? previews[selectedPreviewIndex] : null;
    if (!selectedPreview) {
      setError('Please select a voice preview first');
      return;
    }

    setIsStreaming(true);
    setError(null);

    try {
      const settings: VoiceSettings = {
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0],
        use_speaker_boost: useSpeakerBoost,
      };

      // Call the streaming API
      const response = await fetch('/api/stream-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voiceId: selectedPreview.generatedVoiceId,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to stream audio');
      }

      // Create MediaSource for true streaming playback
      const mediaSource = new MediaSource();
      const audio = new Audio();
      audio.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        const reader = response.body?.getReader();
        
        if (!reader) {
          throw new Error('No response body');
        }

        // Stream chunks as they arrive
        const processChunk = async () => {
          const { done, value } = await reader.read();
          
          if (done) {
            if (!sourceBuffer.updating) {
              mediaSource.endOfStream();
            }
            return;
          }

          // Wait for previous append to complete
          if (sourceBuffer.updating) {
            await new Promise(resolve => {
              sourceBuffer.addEventListener('updateend', resolve, { once: true });
            });
          }

          sourceBuffer.appendBuffer(value);
          await processChunk();
        };

        await processChunk();
      });

      audio.play();
      audio.onended = () => setIsStreaming(false);
    } catch (err) {
      console.error('Streaming error:', err);
      setError('Failed to stream audio. The voice may not be available yet.');
    } finally {
      setIsStreaming(false);
    }
  };

  /**
   * Save the selected voice to ElevenLabs and Supabase
   */
  const handleSave = async () => {
    if (!voiceName.trim()) {
      setError('Please provide a name for your voice');
      return;
    }

    if (!voiceDescription.trim()) {
      setError('Please provide a description for your voice');
      return;
    }

    if (selectedPreviewIndex === null || !previews[selectedPreviewIndex]) {
      setError('Please select a voice preview to save');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const settings: VoiceSettings = {
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0],
        use_speaker_boost: useSpeakerBoost,
      };

      const userId = '00000000-0000-0000-0000-000000000000'; // TODO: Replace with real auth
      const selectedPreview = previews[selectedPreviewIndex];

      // Create the permanent voice using the REAL ElevenLabs API
      const result = await createVoiceFromDesign(
        userId,
        selectedPreview.generatedVoiceId,
        voiceName,
        voiceDescription,
        settings
      );

      if (!result.success) {
        setError(result.error || 'Failed to save voice');
      } else {
        setSuccessMessage('Voice created successfully!');
        // Reset form
        setVoiceName('');
        setVoiceDescription('');
        setPreviews([]);
        setSelectedPreviewIndex(null);
        // Refresh to show new voice in library
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Voice Designer
        </CardTitle>
        <CardDescription>
          Describe your ideal voice and AI will generate unique options for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Name */}
        <div className="space-y-2">
          <Label htmlFor="voice-name">Voice Name</Label>
          <Input
            id="voice-name"
            placeholder="e.g., Detective Morgan"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          />
        </div>

        {/* Voice Description - This is the AI prompt! */}
        <div className="space-y-2">
          <Label htmlFor="voice-description">
            Voice Description
            <span className="ml-2 text-xs text-muted-foreground">(AI will design a voice based on this)</span>
          </Label>
          <Textarea
            id="voice-description"
            placeholder="e.g., A gritty, middle-aged detective from London with a deep, gravelly voice"
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Sample Text */}
        <div className="space-y-2">
          <Label htmlFor="sample-text">
            Sample Text
            <span className="ml-2 text-xs text-muted-foreground">(min 50 characters)</span>
          </Label>
          <Textarea
            id="sample-text"
            placeholder="Enter the text you want to hear in this voice..."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {sampleText.length} / 50 characters minimum
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGeneratePreviews}
          disabled={isGenerating || !voiceDescription.trim() || sampleText.length < 50}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Voice Previews...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Voice Options
            </>
          )}
        </Button>

        {/* Voice Previews Grid */}
        {previews.length > 0 && (
          <div className="space-y-3">
            <Label>Select Your Voice ({previews.length} options)</Label>
            <div className="grid gap-3">
              {previews.map((preview, index) => (
                <div
                  key={preview.generatedVoiceId}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                    selectedPreviewIndex === index
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPreviewIndex(index)}
                >
                  <Button
                    size="sm"
                    variant={playingIndex === index ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(index);
                    }}
                  >
                    {playingIndex === index ? (
                      <Volume2 className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Voice Option {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {preview.durationSecs.toFixed(1)}s • {preview.mediaType}
                    </p>
                  </div>
                  {selectedPreviewIndex === index && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Settings (shown after previews generated) */}
        {previews.length > 0 && (
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Fine-tune Settings</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stability">Stability</Label>
                <span className="text-sm text-muted-foreground">{stability[0].toFixed(2)}</span>
              </div>
              <Slider
                id="stability"
                value={stability}
                onValueChange={setStability}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="similarity">Similarity Boost</Label>
                <span className="text-sm text-muted-foreground">{similarityBoost[0].toFixed(2)}</span>
              </div>
              <Slider
                id="similarity"
                value={similarityBoost}
                onValueChange={setSimilarityBoost}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="style">Style Exaggeration</Label>
                <span className="text-sm text-muted-foreground">{style[0].toFixed(2)}</span>
              </div>
              <Slider
                id="style"
                value={style}
                onValueChange={setStyle}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="speaker-boost"
                checked={useSpeakerBoost}
                onChange={(e) => setUseSpeakerBoost(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="speaker-boost" className="cursor-pointer">
                Use Speaker Boost
              </Label>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {/* Save Button */}
        {previews.length > 0 && selectedPreviewIndex !== null && (
          <Button
            onClick={handleSave}
            disabled={isSaving || !voiceName.trim()}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Voice...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Permanent Voice
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
