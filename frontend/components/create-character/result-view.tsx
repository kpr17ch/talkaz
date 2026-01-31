'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'

interface ResultViewProps {
  generatedVideo: string | null
  onReset: () => void
}

export function ResultView({ generatedVideo, onReset }: ResultViewProps) {
  const handleDownload = () => {
    if (!generatedVideo) return
    const link = document.createElement('a')
    link.href = generatedVideo
    link.download = 'character-video.mp4'
    link.click()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-center text-xl font-semibold">
            Your Character Video is Ready!
          </h2>
          {generatedVideo && (
            <video controls className="w-full rounded-lg" autoPlay>
              <source src={generatedVideo} type="video/mp4" />
              Your browser does not support video.
            </video>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={handleDownload} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Download Video
        </Button>
        <Button onClick={onReset} className="cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          Create New Character
        </Button>
      </div>
    </div>
  )
}
