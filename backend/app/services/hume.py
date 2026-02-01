import httpx
import base64
import uuid
import aiofiles
from pathlib import Path

from app.config import get_settings

HUME_API_URL = "https://api.hume.ai/v0"


async def generate_voice_samples(text: str, voice_description: str, count: int = 3) -> list[dict]:
    settings = get_settings()
    headers = {
        "X-Hume-Api-Key": settings.hume_api_key,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HUME_API_URL}/tts",
            headers=headers,
            json={
                "utterances": [
                    {
                        "text": text,
                        "description": voice_description,
                    }
                ],
                "num_generations": count,
                "version": "1",
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()

    samples = []
    for generation in data.get("generations", []):
        audio_base64 = generation.get("audio")
        if audio_base64:
            sample_id = generation.get("generation_id", str(uuid.uuid4()))
            audio_url = await _save_audio(audio_base64, sample_id)
            samples.append({
                "id": sample_id,
                "audio_url": audio_url,
                "duration": generation.get("duration", 5.0)
            })

    return samples


async def _save_audio(audio_base64: str, sample_id: str) -> str:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(exist_ok=True)

    filename = f"{sample_id}.mp3"
    filepath = upload_dir / filename

    audio_bytes = base64.b64decode(audio_base64)
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(audio_bytes)

    return f"/uploads/{filename}"
