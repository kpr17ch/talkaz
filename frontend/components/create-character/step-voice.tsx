'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Play, Pause, ChevronRight, Circle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepVoiceProps {
  audioText: string
  voiceDescription: string
  generatedAudioSamples: string[]
  selectedAudioIndex: number | null
  onAudioTextChange: (text: string) => void
  onVoiceDescriptionChange: (desc: string) => void
  onSelectAudio: (index: number) => void
  onGenerate: () => void
  isGenerating: boolean
  onNext: () => void
  canGoNext: boolean
}

const MAX_CHARS = 200

export function StepVoice({
  audioText,
  voiceDescription,
  generatedAudioSamples,
  selectedAudioIndex,
  onAudioTextChange,
  onVoiceDescriptionChange,
  onSelectAudio,
  onGenerate,
  isGenerating,
  onNext,
  canGoNext,
}: StepVoiceProps) {
  const charCount = audioText.length
  const isOverLimit = charCount > MAX_CHARS
  const canGenerate = audioText.trim().length > 0 && voiceDescription.trim().length > 0 && !isOverLimit

  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlayAudio = (index: number, src: string) => {
    if (playingIndex === index) {
      audioRef.current?.pause()
      setPlayingIndex(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(src)
      audioRef.current.onended = () => setPlayingIndex(null)
      audioRef.current.play()
      setPlayingIndex(index)
    }
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Configure Voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What should the character say?</label>
            <Textarea
              placeholder="Enter text... (max. 10 seconds of audio)"
              value={audioText}
              onChange={(e) => onAudioTextChange(e.target.value)}
              className="min-h-28 resize-none"
            />
            <div className="flex justify-end">
              <span
                className={cn(
                  'text-xs',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
            {isOverLimit && (
              <p className="text-xs text-destructive">
                Text is too long for max. 10 seconds of audio
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Description</label>
            <Textarea
              placeholder="Describe the voice... (e.g. deep and calm, young and energetic, raspy)"
              value={voiceDescription}
              onChange={(e) => onVoiceDescriptionChange(e.target.value)}
              className="min-h-28 resize-none"
            />
          </div>

          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              'Generate Voice'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Generated Samples</CardTitle>
          {generatedAudioSamples.length > 0 && (
            <CardDescription>
              Choose from the following samples. If you do not like any of them, click Generate in the previous step to get new samples.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex h-full flex-col">
          {isGenerating ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Spinner className="h-6 w-6" />
              <p className="text-sm text-muted-foreground">Generating audio...</p>
            </div>
          ) : generatedAudioSamples.length > 0 ? (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-3">
                {generatedAudioSamples.map((sample, index) => (
                  <div
                    key={index}
                    onClick={() => onSelectAudio(index)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors',
                      selectedAudioIndex === index
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {selectedAudioIndex === index ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Sample {index + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayAudio(index, sample)
                      }}
                    >
                      {playingIndex === index ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="cursor-pointer"
                >
                  Select Sample
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground/40">Your generated audio will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
