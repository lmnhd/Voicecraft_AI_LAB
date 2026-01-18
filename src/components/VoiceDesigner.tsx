'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Play, Save } from 'lucide-react';
import { generateVoicePreview } from '@/lib/actions/audio-generation';
import { createVoice } from '@/lib/actions/voice-design';
import { AudioPlayer } from '@/components/AudioPlayer';
import type { VoiceSettings } from '@/types';

export function VoiceDesigner() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceDescription, setVoiceDescription] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [style, setStyle] = useState([0.0]);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!sampleText.trim()) {
      setError('Please provide sample text to preview');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioBase64(null);

    try {
      const settings: VoiceSettings = {
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0],
        use_speaker_boost: useSpeakerBoost,
      };

      const result = await generateVoicePreview(sampleText, 'EXAVITQu4vr4xnSDxMaL', settings);

      if (!result.success) {
        setError(result.error || 'Failed to generate preview');
      } else if (result.audioBase64) {
        setAudioBase64(result.audioBase64);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!voiceName.trim() || !voiceDescription.trim()) {
      setError('Please provide voice name and description to save');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const settings: VoiceSettings = {
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0],
        use_speaker_boost: useSpeakerBoost,
      };

      // TODO: Replace with actual user ID from auth
      const userId = '00000000-0000-0000-0000-000000000000';

      const result = await createVoice(userId, voiceName, voiceDescription, sampleText, settings);

      if (!result.success) {
        setError(result.error || 'Failed to save voice');
      } else {
        // Success! Clear form
        setVoiceName('');
        setVoiceDescription('');
        setSampleText('');
        setAudioBase64(null);
        alert('Voice saved successfully!');
        window.location.reload(); // Refresh to show new voice in library
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
        <CardTitle>Voice Designer</CardTitle>
        <CardDescription>
          Describe your ideal voice and hear a preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Name */}
        <div className="space-y-2">
          <Label htmlFor="voice-name">Voice Name</Label>
          <Input
            id="voice-name"
            placeholder="e.g., Detective Voice"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          />
        </div>

        {/* Voice Description */}
        <div className="space-y-2">
          <Label htmlFor="voice-description">Voice Description</Label>
          <Textarea
            id="voice-description"
            placeholder="e.g., A gritty, middle-aged detective from London"
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Sample Text */}
        <div className="space-y-2">
          <Label htmlFor="sample-text">Sample Text</Label>
          <Textarea
            id="sample-text"
            placeholder="Enter the text you want to hear in this voice..."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={3}
          />
        </div>

        {/* Audio Preview */}
        {audioBase64 && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <AudioPlayer audioBase64={audioBase64} />
          </div>
        )}

        {/* Voice Settings */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Voice Settings</h3>

          {/* Stability */}
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
            <p className="text-xs text-muted-foreground">
              Higher = more consistent, lower = more variable
            </p>
          </div>

          {/* Similarity Boost */}
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
            <p className="text-xs text-muted-foreground">
              Boost similarity to the original voice
            </p>
          </div>

          {/* Style */}
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
            <p className="text-xs text-muted-foreground">
              Amplify the style of the speaker
            </p>
          </div>

          {/* Speaker Boost */}
          <div className="flex items-center space-x-2">
            <input
            Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={isLoading || !sampleText.trim()}
            className="flex-1"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving || !voiceName.trim() || !voiceDescription.trim()}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Voice
              </>
            )}
          </Button>
        </div

        {/* Preview Button */}
        <Button
          onClick={handlePreview}
          disabled={isLoading || !voiceDescription.trim() || !sampleText.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Preview...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Preview Voice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
