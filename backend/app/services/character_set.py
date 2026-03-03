from __future__ import annotations

import asyncio
import copy
import io
import json
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from zipfile import ZIP_DEFLATED, ZipFile

import httpx
from fastapi.concurrency import run_in_threadpool
from PIL import Image, ImageOps

from app.config import get_settings
from app.services import replicate

logger = logging.getLogger(__name__)

SOURCE_KEY = "__source__"
TARGET_IMAGE_SIZE = (2048, 2048)
CONTRACT_FILENAMES = [
    "rick_main.jpeg",
    "rick_smiling.jpeg",
    "rick_speak_ae.jpeg",
    "rick_speak_ltsch.jpeg",
    "rick_speak_o.jpeg",
    "rick_speak_pmn.jpeg",
    "rick_work_a.jpeg",
    "rick_work_b.jpeg",
    "rick_work_c.jpeg",
    "rick_work_d.jpeg",
]

if hasattr(Image, "Resampling"):
    RESAMPLING_FILTER = Image.Resampling.LANCZOS
else:
    RESAMPLING_FILTER = Image.LANCZOS


@dataclass(frozen=True)
class FrameDefinition:
    key: str
    filename: str
    input_keys: tuple[str, ...]
    prompt: str


MAIN_FRAME_PROMPT_TEMPLATE = """Create a full-body character render based on the reference image.
Style: {style_prompt}

Rules:
- Keep the exact identity, face, body proportions, hair, outfit, and posture.
- Keep the character centered in a strict 1:1 square composition.
- Output must be clean and stable for animation use.
- Background must be solid pure green (#00FF00), flat and uniform.
- No text, logos, watermarks, props, overlays, gradients, or shadows on background.
"""

SMILING_PROMPT = """Create a variant of the character where ONLY the mouth/expression changes to a subtle natural smile.
Keep identity, pose, framing, lighting, style, and green-screen background exactly the same.
No camera shift and no geometry drift."""

SPEAK_AE_PROMPT = """Create a speech mouth-shape variant for A/E phonemes.
Modify ONLY the mouth: a medium, speech-ready A/E opening.
Keep identity, body, pose, framing, style, and green-screen background exactly unchanged."""

SPEAK_LTSCH_PROMPT = """Create a speech mouth-shape variant for L/T/CH/SH phonemes.
Modify ONLY the mouth to a flatter and slightly wider compressed speaking shape.
Keep identity, body, pose, framing, style, and green-screen background exactly unchanged."""

SPEAK_O_PROMPT = """Create a speech mouth-shape variant for O phoneme.
Modify ONLY the mouth to a clearly rounded circular O shape (not vertical oval).
Keep identity, body, pose, framing, style, and green-screen background exactly unchanged."""

SPEAK_PMN_PROMPT = """Create a speech mouth-shape variant for P/M/N phonemes.
Modify ONLY the mouth to a lightly pressed mostly closed speaking shape.
Keep identity, body, pose, framing, style, and green-screen background exactly unchanged."""

WORK_A_PROMPT = """Create work-idle frame A.
Keep character identity unchanged and add a simple laptop naturally positioned for typing in front of the character.
No desk visible. Keep 1:1 framing and pure green background unchanged."""

WORK_B_PROMPT = """Create work-idle frame B based primarily on frame A.
Add only a very small typing movement while keeping identity, laptop placement, style, framing, and green background unchanged."""

WORK_C_PROMPT = """Create work-idle frame C based primarily on frame B.
Add only a very small typing movement with loop-safe continuity while preserving all visual consistency constraints."""

WORK_D_PROMPT = """Create work-idle frame D based primarily on frame C.
Add subtle typing variation with slight hand lift while preserving identity, framing, style, and green background unchanged."""

FRAME_PIPELINE = [
    FrameDefinition(
        key="main",
        filename="rick_main.jpeg",
        input_keys=(SOURCE_KEY,),
        prompt="",
    ),
    FrameDefinition(
        key="smiling",
        filename="rick_smiling.jpeg",
        input_keys=("main",),
        prompt=SMILING_PROMPT,
    ),
    FrameDefinition(
        key="speak_ae",
        filename="rick_speak_ae.jpeg",
        input_keys=("main",),
        prompt=SPEAK_AE_PROMPT,
    ),
    FrameDefinition(
        key="speak_ltsch",
        filename="rick_speak_ltsch.jpeg",
        input_keys=("main",),
        prompt=SPEAK_LTSCH_PROMPT,
    ),
    FrameDefinition(
        key="speak_o",
        filename="rick_speak_o.jpeg",
        input_keys=("main",),
        prompt=SPEAK_O_PROMPT,
    ),
    FrameDefinition(
        key="speak_pmn",
        filename="rick_speak_pmn.jpeg",
        input_keys=("main",),
        prompt=SPEAK_PMN_PROMPT,
    ),
    FrameDefinition(
        key="work_a",
        filename="rick_work_a.jpeg",
        input_keys=("main",),
        prompt=WORK_A_PROMPT,
    ),
    FrameDefinition(
        key="work_b",
        filename="rick_work_b.jpeg",
        input_keys=("work_a", "main"),
        prompt=WORK_B_PROMPT,
    ),
    FrameDefinition(
        key="work_c",
        filename="rick_work_c.jpeg",
        input_keys=("work_b", "main"),
        prompt=WORK_C_PROMPT,
    ),
    FrameDefinition(
        key="work_d",
        filename="rick_work_d.jpeg",
        input_keys=("work_c", "main"),
        prompt=WORK_D_PROMPT,
    ),
]

CHARACTER_SET_JOBS: dict[str, dict[str, Any]] = {}
JOBS_LOCK = asyncio.Lock()


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _job_root(job_id: str) -> Path:
    settings = get_settings()
    return Path(settings.upload_dir) / "character_sets" / job_id


def _to_upload_relative_url(file_path: Path) -> str:
    settings = get_settings()
    upload_root = Path(settings.upload_dir).resolve()
    resolved_path = file_path.resolve()
    relative_path = resolved_path.relative_to(upload_root)
    return f"/uploads/{relative_path.as_posix()}"


def _to_absolute_url(base_url: str, relative_url: str | None) -> str | None:
    if relative_url is None:
        return None
    return f"{base_url}{relative_url}"


def _resolve_source_image_path(source_image_url: str) -> Path:
    marker = "/uploads/"
    if marker not in source_image_url:
        raise ValueError("source_image_url must point to an uploaded file under /uploads/")

    relative_path = source_image_url.split(marker, 1)[1].split("?", 1)[0]
    source_path = Path(get_settings().upload_dir) / relative_path
    if not source_path.exists():
        raise FileNotFoundError(f"Source image not found: {source_path}")
    return source_path


async def _update_job(job_id: str, **changes: Any) -> None:
    async with JOBS_LOCK:
        job = CHARACTER_SET_JOBS.get(job_id)
        if job is None:
            return
        job.update(changes)
        job["updated_at"] = _utc_now_iso()


async def create_job(source_image_url: str, style_prompt: str) -> dict[str, Any]:
    job_id = uuid.uuid4().hex
    now = _utc_now_iso()
    job_state = {
        "job_id": job_id,
        "status": "queued",
        "created_at": now,
        "updated_at": now,
        "steps_total": len(FRAME_PIPELINE),
        "steps_completed": 0,
        "current_step": None,
        "source_image_url": source_image_url,
        "style_prompt": style_prompt,
        "frame_urls": {},
        "manifest_relative_url": None,
        "pack_relative_url": None,
        "archive_path": None,
        "error": None,
    }

    async with JOBS_LOCK:
        CHARACTER_SET_JOBS[job_id] = job_state

    asyncio.create_task(
        _run_pipeline(job_id=job_id, source_image_url=source_image_url, style_prompt=style_prompt),
        name=f"character-set-{job_id}",
    )

    return copy.deepcopy(job_state)


async def get_job(job_id: str) -> dict[str, Any] | None:
    async with JOBS_LOCK:
        job = CHARACTER_SET_JOBS.get(job_id)
        if job is None:
            return None
        return copy.deepcopy(job)


def build_status_payload(job: dict[str, Any], base_url: str) -> dict[str, Any]:
    frame_urls = {
        filename: f"{base_url}{relative_url}"
        for filename, relative_url in job["frame_urls"].items()
    }

    steps_total = max(job["steps_total"], 1)
    progress = job["steps_completed"] / steps_total

    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
        "steps_completed": job["steps_completed"],
        "steps_total": job["steps_total"],
        "progress": progress,
        "current_step": job["current_step"],
        "frame_urls": frame_urls,
        "manifest_url": _to_absolute_url(base_url, job["manifest_relative_url"]),
        "pack_url": _to_absolute_url(base_url, job["pack_relative_url"]),
        "download_url": f"{base_url}/api/v1/character-set/download/{job['job_id']}",
        "error": job["error"],
    }


def get_archive_path(job: dict[str, Any]) -> Path | None:
    archive_path = job.get("archive_path")
    if archive_path is None:
        return None
    return Path(archive_path)


async def _run_pipeline(job_id: str, source_image_url: str, style_prompt: str) -> None:
    try:
        source_path = _resolve_source_image_path(source_image_url)
        job_root = _job_root(job_id)
        frames_dir = job_root / "frames"
        frames_dir.mkdir(parents=True, exist_ok=True)

        await _update_job(job_id, status="processing")

        generated_frames: dict[str, Path] = {SOURCE_KEY: source_path}
        ordered_frame_paths: list[Path] = []
        frame_urls: dict[str, str] = {}

        for index, frame in enumerate(FRAME_PIPELINE, start=1):
            await _update_job(job_id, current_step=frame.filename)

            prompt = frame.prompt
            if frame.key == "main":
                prompt = MAIN_FRAME_PROMPT_TEMPLATE.format(style_prompt=style_prompt)

            input_paths = [generated_frames[input_key] for input_key in frame.input_keys]
            output_url = await replicate.create_nano_banana_image(
                prompt=prompt,
                image_paths=input_paths,
                aspect_ratio="1:1",
                output_format="png",
            )

            frame_path = frames_dir / frame.filename
            await _download_and_normalize_image(output_url=output_url, destination_path=frame_path)

            generated_frames[frame.key] = frame_path
            ordered_frame_paths.append(frame_path)
            frame_urls[frame.filename] = _to_upload_relative_url(frame_path)

            async with JOBS_LOCK:
                job = CHARACTER_SET_JOBS.get(job_id)
                if job is None:
                    return
                job["steps_completed"] = index
                job["frame_urls"] = copy.deepcopy(frame_urls)
                job["updated_at"] = _utc_now_iso()

        manifest_path = job_root / "manifest.json"
        manifest_payload = {
            "job_id": job_id,
            "generated_at": _utc_now_iso(),
            "source_image_url": source_image_url,
            "style_prompt": style_prompt,
            "contract_filenames": CONTRACT_FILENAMES,
            "frames": [
                {
                    "filename": frame.filename,
                    "relative_url": frame_urls.get(frame.filename),
                }
                for frame in FRAME_PIPELINE
            ],
        }
        manifest_path.write_text(json.dumps(manifest_payload, indent=2), encoding="utf-8")

        archive_path = job_root / f"talka_frame_pack_{job_id}.zip"
        await run_in_threadpool(
            _create_archive,
            archive_path,
            ordered_frame_paths,
            manifest_path,
        )

        await _update_job(
            job_id,
            status="succeeded",
            current_step=None,
            manifest_relative_url=_to_upload_relative_url(manifest_path),
            pack_relative_url=_to_upload_relative_url(archive_path),
            archive_path=str(archive_path.resolve()),
        )
        logger.info("Character-set job %s completed successfully", job_id)
    except Exception as exc:
        logger.exception("Character-set job %s failed", job_id)
        await _update_job(
            job_id,
            status="failed",
            current_step=None,
            error=str(exc),
        )


async def _download_and_normalize_image(output_url: str, destination_path: Path) -> None:
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        response = await client.get(output_url)
        response.raise_for_status()
        image_bytes = response.content

    await run_in_threadpool(_normalize_to_jpeg_2048, image_bytes, destination_path)


def _normalize_to_jpeg_2048(image_bytes: bytes, destination_path: Path) -> None:
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(io.BytesIO(image_bytes)) as source_image:
        rgb_image = source_image.convert("RGB")
        normalized = ImageOps.fit(
            rgb_image,
            TARGET_IMAGE_SIZE,
            method=RESAMPLING_FILTER,
            centering=(0.5, 0.5),
        )
        normalized.save(
            destination_path,
            format="JPEG",
            quality=95,
            optimize=True,
        )


def _create_archive(archive_path: Path, frame_paths: list[Path], manifest_path: Path) -> None:
    with ZipFile(archive_path, "w", compression=ZIP_DEFLATED) as archive:
        for frame_path in frame_paths:
            archive.write(frame_path, arcname=frame_path.name)
        archive.write(manifest_path, arcname="manifest.json")
