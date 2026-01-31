'use client'

import { useState, useCallback } from 'react'
import { StepImage } from './step-image'
import { StepVoice } from './step-voice'
import { StepVideo } from './step-video'
import { ResultView } from './result-view'

interface WizardData {
  uploadedImage: File | null
  imagePrompt: string
  generatedImage: string | null
  audioText: string
  voiceDescription: string
  generatedAudioSamples: string[]
  selectedAudioIndex: number | null
  audioDuration: number | null
  videoPrompt: string
  generatedVideo: string | null
}

const initialData: WizardData = {
  uploadedImage: null,
  imagePrompt: '',
  generatedImage: null,
  audioText: '',
  voiceDescription: '',
  generatedAudioSamples: [],
  selectedAudioIndex: null,
  audioDuration: null,
  videoPrompt: '',
  generatedVideo: null,
}

export function CreateCharacterWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleGenerateImage = useCallback(async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    updateData({ generatedImage: '/placeholder.jpg' })
    setIsGenerating(false)
  }, [updateData])

  const handleGenerateVoice = useCallback(async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    updateData({
      generatedAudioSamples: [
        '/placeholder-audio-1.mp3',
        '/placeholder-audio-2.mp3',
        '/placeholder-audio-3.mp3',
      ],
      selectedAudioIndex: null,
      audioDuration: 7,
    })
    setIsGenerating(false)
  }, [updateData])

  const handleSelectAudio = useCallback((index: number) => {
    updateData({ selectedAudioIndex: index })
  }, [updateData])

  const handleGenerateVideo = useCallback(async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    updateData({ generatedVideo: '/placeholder-video.mp4' })
    setIsGenerating(false)
  }, [updateData])

  const handleReset = useCallback(() => {
    setStep(1)
    setData(initialData)
    setShowResult(false)
  }, [])

  if (showResult) {
    return <ResultView generatedVideo={data.generatedVideo} onReset={handleReset} />
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center">
      <div className="py-6">
        {step === 1 && (
          <StepImage
            uploadedImage={data.uploadedImage}
            imagePrompt={data.imagePrompt}
            generatedImage={data.generatedImage}
            onUploadImage={(file) => updateData({ uploadedImage: file })}
            onPromptChange={(prompt) => updateData({ imagePrompt: prompt })}
            onGenerate={handleGenerateImage}
            isGenerating={isGenerating}
            onNext={() => setStep(2)}
            canGoNext={data.generatedImage !== null}
          />
        )}
        {step === 2 && (
          <StepVoice
            audioText={data.audioText}
            voiceDescription={data.voiceDescription}
            generatedAudioSamples={data.generatedAudioSamples}
            selectedAudioIndex={data.selectedAudioIndex}
            onAudioTextChange={(text) => updateData({ audioText: text })}
            onVoiceDescriptionChange={(desc) => updateData({ voiceDescription: desc })}
            onSelectAudio={handleSelectAudio}
            onGenerate={handleGenerateVoice}
            isGenerating={isGenerating}
            onNext={() => setStep(3)}
            canGoNext={data.generatedAudioSamples.length > 0 && data.selectedAudioIndex !== null}
          />
        )}
        {step === 3 && (
          <StepVideo
            videoPrompt={data.videoPrompt}
            generatedVideo={data.generatedVideo}
            onVideoPromptChange={(prompt) => updateData({ videoPrompt: prompt })}
            onGenerate={handleGenerateVideo}
            isGenerating={isGenerating}
            onFinish={() => setShowResult(true)}
            canFinish={data.generatedVideo !== null}
          />
        )}
      </div>
    </div>
  )
}
