import asyncio
import uuid
import httpx
import aiofiles
from pathlib import Path

from app.config import get_settings


async def download_file(url: str, filepath: Path):
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=120.0, follow_redirects=True)
        response.raise_for_status()
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(response.content)


async def get_audio_duration(audio_path: Path) -> float:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(audio_path)
    ]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        raise RuntimeError(f"FFprobe failed: {stderr.decode()}")
    
    return float(stdout.decode().strip())


async def trim_video(video_path: Path, duration: float, output_path: Path):
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-t", str(duration),
        "-c:v", "copy",
        "-c:a", "copy",
        str(output_path),
    ]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg trim failed: {stderr.decode()}")


async def get_video_size(video_path: Path) -> tuple[int, int]:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path)
    ]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        raise RuntimeError(f"FFprobe failed: {stderr.decode()}")
    
    lines = stdout.decode().strip().split("\n")
    width = int(lines[0])
    height = int(lines[1])
    return (width, height)


async def merge_audio_video(video_url: str, audio_url: str) -> str:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(exist_ok=True)

    merge_id = str(uuid.uuid4())
    video_path = upload_dir / f"{merge_id}_video.mp4"
    audio_path = upload_dir / f"{merge_id}_audio.mp3"
    trimmed_video_path = upload_dir / f"{merge_id}_trimmed.mp4"
    output_path = upload_dir / f"{merge_id}_merged.mp4"

    await asyncio.gather(
        download_file(video_url, video_path),
        download_file(audio_url, audio_path),
    )

    audio_duration = await get_audio_duration(audio_path)
    await trim_video(video_path, audio_duration, trimmed_video_path)

    cmd = [
        "ffmpeg", "-y",
        "-i", str(trimmed_video_path),
        "-i", str(audio_path),
        "-c:v", "copy",
        "-c:a", "aac",
        str(output_path),
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {stderr.decode()}")

    video_path.unlink(missing_ok=True)
    audio_path.unlink(missing_ok=True)
    trimmed_video_path.unlink(missing_ok=True)

    return f"/uploads/{merge_id}_merged.mp4"


async def replace_greenscreen(video_url: str, background_url: str, scale: float = 0.6) -> str:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(exist_ok=True)

    replace_id = str(uuid.uuid4())
    video_path = upload_dir / f"{replace_id}_video.mp4"
    background_path = upload_dir / f"{replace_id}_background.jpg"
    output_path = upload_dir / f"{replace_id}_final.mp4"

    await asyncio.gather(
        download_file(video_url, video_path),
        download_file(background_url, background_path),
    )

    width, height = await get_video_size(video_path)
    
    fg_width = int(width * scale)
    fg_height = int(height * scale)
    overlay_x = (width - fg_width) // 2
    overlay_y = height - fg_height

    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-loop", "1",
        "-i", str(background_path),
        "-filter_complex",
        f"[1:v]scale={width}:{height}[bg];[0:v]chromakey=0x00FF00:0.3:0.1,scale={fg_width}:{fg_height}[fg];[bg][fg]overlay={overlay_x}:{overlay_y}",
        "-c:a", "copy",
        "-shortest",
        str(output_path),
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg chromakey failed: {stderr.decode()}")

    video_path.unlink(missing_ok=True)
    background_path.unlink(missing_ok=True)

    return f"/uploads/{replace_id}_final.mp4"
