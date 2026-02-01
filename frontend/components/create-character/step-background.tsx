'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Slider } from '@/components/ui/slider'
import { Upload, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepBackgroundProps {
  greenscreenVideo: string | null
  uploadedBackground: File | null
  finalVideo: string | null
  characterScale: number
  onUploadBackground: (file: File | null) => void
  onScaleChange: (scale: number) => void
  onApplyBackground: () => void
  isApplying: boolean
  onFinish: () => void
  canFinish: boolean
}

export function StepBackground({
  greenscreenVideo,
  uploadedBackground,
  finalVideo,
  characterScale,
  onUploadBackground,
  onScaleChange,
  onApplyBackground,
  isApplying,
  onFinish,
  canFinish,
}: StepBackgroundProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const scalePercent = Math.round(characterScale * 100)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        onUploadBackground(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    },
    [onUploadBackground]
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

  const handleRemoveBackground = useCallback(() => {
    onUploadBackground(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [onUploadBackground, previewUrl])

  const canApply = greenscreenVideo && uploadedBackground && !finalVideo

  return (
    <div className="grid grid-cols-2 items-stretch gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Upload Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedBackground ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'relative flex h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
              )}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop background image here or click to upload
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewUrl || ''}
                alt="Background"
                className="h-72 w-full rounded-lg object-cover"
              />
              <Button
                variant="destructive"
                size="icon-sm"
                className="absolute right-2 top-2 cursor-pointer"
                onClick={handleRemoveBackground}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Character Size</label>
              <span className="text-sm text-muted-foreground">{scalePercent}%</span>
            </div>
            <Slider
              value={[characterScale * 100]}
              onValueChange={(values) => onScaleChange(values[0] / 100)}
              min={30}
              max={100}
              step={1}
              disabled={isApplying}
            />
            <p className="text-xs text-muted-foreground">
              Adjust the size of the character relative to the background
            </p>
          </div>

          <Button
            onClick={onApplyBackground}
            disabled={!canApply || isApplying}
            className="w-full cursor-pointer"
          >
            {isApplying ? (
              <>
                <Spinner className="mr-2" />
                Applying Background...
              </>
            ) : (
              'Apply Background'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col">
          {isApplying ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Spinner className="h-6 w-6" />
              <p className="text-sm text-muted-foreground">Applying background...</p>
            </div>
          ) : finalVideo ? (
            <div className="flex flex-1 flex-col">
              <video controls className="w-full flex-1 rounded-lg bg-black object-contain">
                <source src={finalVideo} type="video/mp4" />
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
          ) : greenscreenVideo ? (
            <div className="flex flex-1 flex-col">
              <video controls className="w-full flex-1 rounded-lg bg-black object-contain">
                <source src={greenscreenVideo} type="video/mp4" />
                Your browser does not support video.
              </video>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Upload a background image to replace the green screen
              </p>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground/40">No video available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
