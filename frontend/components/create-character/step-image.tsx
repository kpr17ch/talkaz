'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Upload, X, Maximize2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepImageProps {
  uploadedImage: File | null
  imagePrompt: string
  generatedImage: string | null
  onUploadImage: (file: File | null) => void
  onPromptChange: (prompt: string) => void
  onGenerate: () => void
  isGenerating: boolean
  onNext: () => void
  canGoNext: boolean
}

export function StepImage({
  uploadedImage,
  imagePrompt,
  generatedImage,
  onUploadImage,
  onPromptChange,
  onGenerate,
  isGenerating,
  onNext,
  canGoNext,
}: StepImageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        onUploadImage(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    },
    [onUploadImage]
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

  const handleRemoveImage = useCallback(() => {
    onUploadImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [onUploadImage, previewUrl])

  const canGenerate = uploadedImage && imagePrompt.trim().length > 0

  return (
    <>
      <div className="grid grid-cols-2 items-stretch gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!uploadedImage ? (
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
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Full-body photo recommended
                </p>
              </div>
            ) : (
              <div className="group relative">
                <img
                  src={previewUrl || ''}
                  alt="Uploaded image"
                  className="h-72 w-full cursor-pointer rounded-lg object-contain"
                  onClick={() => setLightboxImage(previewUrl)}
                />
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="absolute bottom-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setLightboxImage(previewUrl)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  className="absolute right-2 top-2 cursor-pointer"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Desired Style</label>
              <Select value={imagePrompt} onValueChange={onPromptChange}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select a style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Playstation 2" className="cursor-pointer">Playstation 2</SelectItem>
                  <SelectItem value="Anime" className="cursor-pointer">Anime</SelectItem>
                  <SelectItem value="Cartoon" className="cursor-pointer">Cartoon</SelectItem>
                </SelectContent>
              </Select>
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
                'Generate Image'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Generated Image</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col">
            {isGenerating ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <Spinner className="h-6 w-6" />
                <p className="text-sm text-muted-foreground">Generating image...</p>
              </div>
            ) : generatedImage ? (
              <div className="flex flex-1 flex-col">
                <div className="group relative flex-1">
                  <img
                    src={generatedImage}
                    alt="Generated character"
                    className="h-72 w-full cursor-pointer rounded-lg object-contain"
                    onClick={() => setLightboxImage(generatedImage)}
                  />
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute bottom-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setLightboxImage(generatedImage)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="cursor-pointer"
                  >
                    Use Image
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground/40">Your generated image will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/80 p-8"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Fullscreen view"
            className="max-h-full max-w-full object-contain"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  )
}
