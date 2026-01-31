'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Check } from 'lucide-react'

interface StepVideoProps {
  videoPrompt: string
  generatedVideo: string | null
  onVideoPromptChange: (prompt: string) => void
  onGenerate: () => void
  isGenerating: boolean
  onFinish: () => void
  canFinish: boolean
}

export function StepVideo({
  videoPrompt,
  generatedVideo,
  onVideoPromptChange,
  onGenerate,
  isGenerating,
  onFinish,
  canFinish,
}: StepVideoProps) {
  const canGenerate = videoPrompt.trim().length > 0

  return (
    <div className="grid min-h-[420px] grid-cols-2 items-stretch gap-6">
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Configure Video</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col space-y-2">
            <label className="text-sm font-medium">What should happen in the video?</label>
            <Textarea
              placeholder="Describe the actions... (e.g. waves at the camera, dances, points at something)"
              value={videoPrompt}
              onChange={(e) => onVideoPromptChange(e.target.value)}
              className="flex-1 resize-none"
            />
          </div>

          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="mt-4 w-full cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Spinner className="mr-2" />
                Generating...
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Generated Video</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {isGenerating ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Spinner className="h-6 w-6" />
              <p className="text-sm text-muted-foreground">Generating video...</p>
            </div>
          ) : generatedVideo ? (
            <div className="flex flex-1 flex-col">
              <video controls className="w-full flex-1 rounded-lg bg-black object-contain">
                <source src={generatedVideo} type="video/mp4" />
                Your browser does not support video.
              </video>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={onFinish}
                  disabled={!canFinish}
                  className="cursor-pointer"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Finish
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground/40">Your generated video will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
