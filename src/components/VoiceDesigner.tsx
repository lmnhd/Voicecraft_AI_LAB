'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Play } from 'lucide-react';
import { previewVoiceDesign } from '@/lib/actions/voice-design';
import type { VoiceSettings } from '@/types';

export function VoiceDesigner() {
  const [isLoading, setIsLoading] = useState(false);
  const [voiceDescription, setVoiceDescription] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [style, setStyle] = useState([0.0]);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!voiceDescription.trim() || !sampleText.trim()) {
      setError('Please provide both voice description and sample text');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const settings: VoiceSettings = {
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0],
        use_speaker_boost: useSpeakerBoost,
      };

      const result = await previewVoiceDesign(voiceDescription, sampleText, settings);

      if (!result.success) {
        setError(result.error || 'Failed to generate preview');
      } else {
        // TODO: Handle audio playback
        console.log('Preview generated:', result.data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
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
        {/* Voice Description */}
        <div className="space-y-2">
          <Label htmlFor="voice-description">Voice Description</Label>
          <Textarea
            id="voice-description"
            placeholder="e.g., A gritty, middle-aged detective from London"
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            rows={3}
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
            rows={4}
          />
        </div>

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

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

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
