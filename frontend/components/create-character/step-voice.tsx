'use client'

import { useCallback, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, ChevronRight, Circle, CheckCircle2, Upload, X, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepVoiceProps {
  voiceMode: 'design' | 'clone'
  audioText: string
  voiceDescription: string
  cloneAudioFile: File | null
  generatedAudioSamples: { url: string; duration: number }[]
  selectedAudioIndex: number | null
  onVoiceModeChange: (mode: 'design' | 'clone') => void
  onAudioTextChange: (text: string) => void
  onVoiceDescriptionChange: (desc: string) => void
  onCloneAudioFileChange: (file: File | null) => void
  onSelectAudio: (index: number) => void
  onGenerateDesign: () => void
  onGenerateClone: () => void
  isGenerating: boolean
  onNext: () => void
  canGoNext: boolean
}

const MAX_CHARS = 200

export function StepVoice({
  voiceMode,
  audioText,
  voiceDescription,
  cloneAudioFile,
  generatedAudioSamples,
  selectedAudioIndex,
  onVoiceModeChange,
  onAudioTextChange,
  onVoiceDescriptionChange,
  onCloneAudioFileChange,
  onSelectAudio,
  onGenerateDesign,
  onGenerateClone,
  isGenerating,
  onNext,
  canGoNext,
}: StepVoiceProps) {
  const charCount = audioText.length
  const isOverLimit = charCount > MAX_CHARS
  const canGenerateDesign = audioText.trim().length > 0 && voiceDescription.trim().length > 0 && !isOverLimit
  const canGenerateClone = audioText.trim().length > 0 && cloneAudioFile !== null && !isOverLimit

  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('audio/')) {
        onCloneAudioFileChange(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    },
    [onCloneAudioFileChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleRemoveAudio = useCallback(() => {
    onCloneAudioFileChange(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [onCloneAudioFileChange, previewUrl])

  return (
    <div className="grid grid-cols-2 items-stretch gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Configure Voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={voiceMode} onValueChange={(v) => onVoiceModeChange(v as 'design' | 'clone')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="design" className="cursor-pointer">
                <Mic className="mr-2 h-4 w-4" />
                Voice Design
              </TabsTrigger>
              <TabsTrigger value="clone" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Voice Clone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">What should the character say?</label>
                <Textarea
                  placeholder="Enter text... (max. 10 seconds of audio)"
                  value={audioText}
                  onChange={(e) => onAudioTextChange(e.target.value)}
                  className="min-h-20 resize-none"
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Description</label>
                <Textarea
                  placeholder="Describe the voice... (e.g. deep and calm, young and energetic, raspy)"
                  value={voiceDescription}
                  onChange={(e) => onVoiceDescriptionChange(e.target.value)}
                  className="min-h-20 resize-none"
                />
              </div>

              <Button
                onClick={onGenerateDesign}
                disabled={!canGenerateDesign || isGenerating}
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
            </TabsContent>

            <TabsContent value="clone" className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Voice Sample</label>
                {!cloneAudioFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                      'relative flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                      isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
                    )}
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Drop audio file or click to upload
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{cloneAudioFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer"
                      onClick={handleRemoveAudio}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a clear audio sample of the voice you want to clone
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">What should the character say?</label>
                <Textarea
                  placeholder="Enter text... (max. 10 seconds of audio)"
                  value={audioText}
                  onChange={(e) => onAudioTextChange(e.target.value)}
                  className="min-h-20 resize-none"
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
              </div>

              <Button
                onClick={onGenerateClone}
                disabled={!canGenerateClone || isGenerating}
                className="w-full cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Spinner className="mr-2" />
                    Cloning & Generating...
                  </>
                ) : (
                  'Clone & Generate Voice'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Generated Samples</CardTitle>
          {generatedAudioSamples.length > 0 && (
            <CardDescription>
              Choose from the following samples. If you do not like any of them, generate new samples.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex h-full flex-col">
          {isGenerating ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Spinner className="h-6 w-6" />
              <p className="text-sm text-muted-foreground">
                {voiceMode === 'clone' ? 'Cloning voice & generating audio...' : 'Generating audio...'}
              </p>
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
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Sample {index + 1}</span>
                        <span className="text-xs text-muted-foreground">{sample.duration.toFixed(1)}s</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayAudio(index, sample.url)
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
