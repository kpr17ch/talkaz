from pydantic import BaseModel


class VoiceGenerateRequest(BaseModel):
    text: str
    voice_description: str


class VoiceSample(BaseModel):
    id: str
    audio_url: str
    duration: float


class VoiceGenerateResponse(BaseModel):
    samples: list[VoiceSample]


class VoiceCloneResponse(BaseModel):
    voice_id: str


class VoiceCloneGenerateRequest(BaseModel):
    voice_id: str
    text: str


class VoiceCloneGenerateResponse(BaseModel):
    audio_url: str
