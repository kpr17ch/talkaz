import uuid
import aiofiles
from io import BytesIO
from pathlib import Path
from fastapi.concurrency import run_in_threadpool
from elevenlabs.client import ElevenLabs

from app.config import get_settings


def _get_client() -> ElevenLabs:
    settings = get_settings()
    return ElevenLabs(api_key=settings.elevenlabs_api_key)


def clone_voice_sync(audio_bytes: bytes, name: str) -> str:
    client = _get_client()
    voice = client.voices.ivc.create(
        name=name,
        files=[BytesIO(audio_bytes)]
    )
    return voice.voice_id


def generate_speech_sync(voice_id: str, text: str) -> bytes:
    client = _get_client()
    audio_generator = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )
    audio_bytes = b"".join(audio_generator)
    return audio_bytes


async def clone_voice(audio_bytes: bytes, name: str) -> str:
    return await run_in_threadpool(clone_voice_sync, audio_bytes, name)


async def generate_speech(voice_id: str, text: str) -> str:
    audio_bytes = await run_in_threadpool(generate_speech_sync, voice_id, text)
    audio_url = await _save_audio(audio_bytes)
    return audio_url


async def _save_audio(audio_bytes: bytes) -> str:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(exist_ok=True)

    filename = f"{uuid.uuid4()}.mp3"
    filepath = upload_dir / filename

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(audio_bytes)

    return f"/uploads/{filename}"
