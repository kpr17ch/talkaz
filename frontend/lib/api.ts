const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ImageUploadResponse {
  id: string
  url: string
}

export interface ImageGenerateResponse {
  output_url: string
}

export interface VoiceSample {
  id: string
  audio_url: string
  duration: number
}

export interface VoiceGenerateResponse {
  samples: VoiceSample[]
}

export interface VoiceCloneResponse {
  voice_id: string
}

export interface VoiceCloneGenerateResponse {
  audio_url: string
}

export interface VideoGenerateResponse {
  prediction_id: string
  status: string
}

export interface VideoStatusResponse {
  status: string
  output_url: string | null
  error: string | null
}

export interface VideoMergeResponse {
  output_url: string
}

export interface VideoBackgroundRequest {
  video_url: string
  background_url: string
}

export interface VideoBackgroundResponse {
  output_url: string
}

export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/api/v1/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload image')
  }

  return response.json()
}

export async function generateImage(sourceImageUrl: string, stylePrompt: string): Promise<ImageGenerateResponse> {
  const response = await fetch(`${API_URL}/api/v1/image/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_image_url: sourceImageUrl,
      style_prompt: stylePrompt,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate image')
  }

  return response.json()
}

export async function generateVoice(text: string, voiceDescription: string): Promise<VoiceGenerateResponse> {
  const response = await fetch(`${API_URL}/api/v1/voice/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice_description: voiceDescription,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate voice')
  }

  return response.json()
}

export async function cloneVoice(audioFile: File): Promise<VoiceCloneResponse> {
  const formData = new FormData()
  formData.append('file', audioFile)

  const response = await fetch(`${API_URL}/api/v1/voice/clone`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to clone voice')
  }

  return response.json()
}

export async function generateClonedVoice(voiceId: string, text: string): Promise<VoiceCloneGenerateResponse> {
  const response = await fetch(`${API_URL}/api/v1/voice/clone/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_id: voiceId,
      text,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate cloned voice')
  }

  return response.json()
}

export async function generateVideo(imageUrl: string, prompt: string, duration: number = 5): Promise<VideoGenerateResponse> {
  const response = await fetch(`${API_URL}/api/v1/video/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      duration,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate video')
  }

  return response.json()
}

export async function getVideoStatus(predictionId: string): Promise<VideoStatusResponse> {
  const response = await fetch(`${API_URL}/api/v1/video/status/${predictionId}`)

  if (!response.ok) {
    throw new Error('Failed to get video status')
  }

  return response.json()
}

export async function mergeVideo(videoUrl: string, audioUrl: string): Promise<VideoMergeResponse> {
  const response = await fetch(`${API_URL}/api/v1/video/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_url: videoUrl,
      audio_url: audioUrl,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to merge video')
  }

  return response.json()
}

export async function applyBackground(
  videoUrl: string,
  backgroundUrl: string,
  scale: number = 0.6
): Promise<VideoBackgroundResponse> {
  const response = await fetch(`${API_URL}/api/v1/video/apply-background`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_url: videoUrl,
      background_url: backgroundUrl,
      scale,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to apply background')
  }

  return response.json()
}

export async function pollForCompletion<T extends { status: string }>(
  pollFn: () => Promise<T>,
  interval: number = 2000,
  maxAttempts: number = 150
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollFn()
    if (result.status === 'succeeded' || result.status === 'failed') {
      return result
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  throw new Error('Polling timeout')
}
