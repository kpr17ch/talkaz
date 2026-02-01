import uuid
from fastapi import APIRouter, Request, UploadFile, File, HTTPException

from app.models.voice import (
    VoiceGenerateRequest,
    VoiceGenerateResponse,
    VoiceSample,
    VoiceCloneResponse,
    VoiceCloneGenerateRequest,
    VoiceCloneGenerateResponse,
)
from app.services import hume
from app.services import elevenlabs

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/generate", response_model=VoiceGenerateResponse)
async def generate_voice(request: Request, body: VoiceGenerateRequest):
    samples_data = await hume.generate_voice_samples(
        text=body.text,
        voice_description=body.voice_description,
    )

    base_url = str(request.base_url).rstrip("/")
    samples = [
        VoiceSample(
            id=s["id"],
            audio_url=f"{base_url}{s['audio_url']}",
            duration=s["duration"],
        )
        for s in samples_data
    ]

    return VoiceGenerateResponse(samples=samples)


@router.post("/clone", response_model=VoiceCloneResponse)
async def clone_voice(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    audio_bytes = await file.read()
    voice_name = f"clone_{uuid.uuid4().hex[:8]}"

    try:
        voice_id = await elevenlabs.clone_voice(audio_bytes, voice_name)
        return VoiceCloneResponse(voice_id=voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clone voice: {str(e)}")


@router.post("/clone/generate", response_model=VoiceCloneGenerateResponse)
async def generate_cloned_voice(request: Request, body: VoiceCloneGenerateRequest):
    try:
        audio_url = await elevenlabs.generate_speech(body.voice_id, body.text)
        base_url = str(request.base_url).rstrip("/")
        return VoiceCloneGenerateResponse(audio_url=f"{base_url}{audio_url}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")
