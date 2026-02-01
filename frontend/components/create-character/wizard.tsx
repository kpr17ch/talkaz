'use client'

import { useState, useCallback, useRef } from 'react'
import { StepImage } from './step-image'
import { StepVoice } from './step-voice'
import { StepVideo } from './step-video'
import { StepBackground } from './step-background'
import { ResultView } from './result-view'
import * as api from '@/lib/api'

interface WizardData {
  uploadedImage: File | null
  uploadedImageUrl: string | null
  imagePrompt: string
  generatedImage: string | null
  voiceMode: 'design' | 'clone'
  audioText: string
  voiceDescription: string
  cloneAudioFile: File | null
  clonedVoiceId: string | null
  generatedAudioSamples: { url: string; duration: number }[]
  selectedAudioIndex: number | null
  audioDuration: number | null
  videoPrompt: string
  generatedVideo: string | null
  uploadedBackground: File | null
  uploadedBackgroundUrl: string | null
  characterScale: number
  finalVideo: string | null
}

const initialData: WizardData = {
  uploadedImage: null,
  uploadedImageUrl: null,
  imagePrompt: '',
  generatedImage: null,
  voiceMode: 'design',
  audioText: '',
  voiceDescription: '',
  cloneAudioFile: null,
  clonedVoiceId: null,
  generatedAudioSamples: [],
  selectedAudioIndex: null,
  audioDuration: null,
  videoPrompt: '',
  generatedVideo: null,
  uploadedBackground: null,
  uploadedBackgroundUrl: null,
  characterScale: 0.6,
  finalVideo: null,
}

export function CreateCharacterWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const audioSampleUrlsRef = useRef<string[]>([])

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleUploadImage = useCallback(async (file: File) => {
    updateData({ uploadedImage: file })
    const result = await api.uploadImage(file)
    updateData({ uploadedImageUrl: result.url })
  }, [updateData])

  const handleGenerateImage = useCallback(async () => {
    if (!data.uploadedImageUrl) return
    setIsGenerating(true)
    try {
      const result = await api.generateImage(data.uploadedImageUrl, data.imagePrompt)
      updateData({ generatedImage: result.output_url })
    } finally {
      setIsGenerating(false)
    }
  }, [data.uploadedImageUrl, data.imagePrompt, updateData])

  const handleGenerateVoiceDesign = useCallback(async () => {
    setIsGenerating(true)
    try {
      const result = await api.generateVoice(data.audioText, data.voiceDescription)
      const samples = result.samples.map((s) => ({ url: s.audio_url, duration: s.duration }))
      audioSampleUrlsRef.current = result.samples.map((s) => s.audio_url)
      updateData({
        generatedAudioSamples: samples,
        selectedAudioIndex: null,
        audioDuration: null,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [data.audioText, data.voiceDescription, updateData])

  const handleGenerateVoiceClone = useCallback(async () => {
    if (!data.cloneAudioFile) return
    setIsGenerating(true)
    try {
      const cloneResult = await api.cloneVoice(data.cloneAudioFile)
      const voiceId = cloneResult.voice_id
      updateData({ clonedVoiceId: voiceId })

      const speechResult = await api.generateClonedVoice(voiceId, data.audioText)
      const sample = { url: speechResult.audio_url, duration: 5.0 }
      audioSampleUrlsRef.current = [speechResult.audio_url]
      updateData({
        generatedAudioSamples: [sample],
        selectedAudioIndex: null,
        audioDuration: null,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [data.cloneAudioFile, data.audioText, updateData])

  const handleSelectAudio = useCallback((index: number) => {
    const sample = data.generatedAudioSamples[index]
    updateData({ 
      selectedAudioIndex: index,
      audioDuration: sample.duration
    })
  }, [updateData, data.generatedAudioSamples])

  const handleGenerateVideo = useCallback(async () => {
    if (!data.generatedImage || data.selectedAudioIndex === null) return
    setIsGenerating(true)
    try {
      const audioDur = data.audioDuration || 5
      const videoDuration = audioDur <= 5 ? 5 : 10
      const generateResult = await api.generateVideo(
        data.generatedImage,
        data.videoPrompt,
        videoDuration
      )
      const statusResult = await api.pollForCompletion(() =>
        api.getVideoStatus(generateResult.prediction_id)
      )
      if (statusResult.status === 'succeeded' && statusResult.output_url) {
        const selectedAudioUrl = audioSampleUrlsRef.current[data.selectedAudioIndex]
        const mergeResult = await api.mergeVideo(statusResult.output_url, selectedAudioUrl)
        updateData({ generatedVideo: mergeResult.output_url })
      }
    } finally {
      setIsGenerating(false)
    }
  }, [data.generatedImage, data.selectedAudioIndex, data.videoPrompt, data.audioDuration, updateData])

  const handleUploadBackground = useCallback(async (file: File) => {
    updateData({ uploadedBackground: file })
    const result = await api.uploadImage(file)
    updateData({ uploadedBackgroundUrl: result.url })
  }, [updateData])

  const handleApplyBackground = useCallback(async () => {
    if (!data.generatedVideo || !data.uploadedBackgroundUrl) return
    setIsGenerating(true)
    try {
      const result = await api.applyBackground(
        data.generatedVideo,
        data.uploadedBackgroundUrl,
        data.characterScale
      )
      updateData({ finalVideo: result.output_url })
    } finally {
      setIsGenerating(false)
    }
  }, [data.generatedVideo, data.uploadedBackgroundUrl, data.characterScale, updateData])

  const handleReset = useCallback(() => {
    setStep(1)
    setData(initialData)
    setShowResult(false)
    audioSampleUrlsRef.current = []
  }, [])

  if (showResult) {
    return <ResultView generatedVideo={data.finalVideo || data.generatedVideo} onReset={handleReset} />
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center">
      <div className="py-6">
        {step === 1 && (
          <StepImage
            uploadedImage={data.uploadedImage}
            imagePrompt={data.imagePrompt}
            generatedImage={data.generatedImage}
            onUploadImage={handleUploadImage}
            onPromptChange={(prompt) => updateData({ imagePrompt: prompt })}
            onGenerate={handleGenerateImage}
            isGenerating={isGenerating}
            onNext={() => setStep(2)}
            canGoNext={data.generatedImage !== null}
          />
        )}
        {step === 2 && (
          <StepVoice
            voiceMode={data.voiceMode}
            audioText={data.audioText}
            voiceDescription={data.voiceDescription}
            cloneAudioFile={data.cloneAudioFile}
            generatedAudioSamples={data.generatedAudioSamples}
            selectedAudioIndex={data.selectedAudioIndex}
            onVoiceModeChange={(mode) => updateData({ voiceMode: mode })}
            onAudioTextChange={(text) => updateData({ audioText: text })}
            onVoiceDescriptionChange={(desc) => updateData({ voiceDescription: desc })}
            onCloneAudioFileChange={(file) => updateData({ cloneAudioFile: file })}
            onSelectAudio={handleSelectAudio}
            onGenerateDesign={handleGenerateVoiceDesign}
            onGenerateClone={handleGenerateVoiceClone}
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
        {step === 4 && (
          <StepBackground
            greenscreenVideo={data.generatedVideo}
            uploadedBackground={data.uploadedBackground}
            finalVideo={data.finalVideo}
            characterScale={data.characterScale}
            onUploadBackground={handleUploadBackground}
            onScaleChange={(scale) => updateData({ characterScale: scale })}
            onApplyBackground={handleApplyBackground}
            isApplying={isGenerating}
            onFinish={() => setShowResult(true)}
            canFinish={data.finalVideo !== null}
          />
        )}
      </div>
    </div>
  )
}
