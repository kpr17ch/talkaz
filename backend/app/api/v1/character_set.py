from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

from app.models.character_set import (
    CharacterSetGenerateRequest,
    CharacterSetGenerateResponse,
    CharacterSetStatusResponse,
)
from app.services import character_set

router = APIRouter(prefix="/character-set", tags=["character-set"])


@router.post("/generate", response_model=CharacterSetGenerateResponse)
async def generate_character_set(request: Request, body: CharacterSetGenerateRequest):
    job = await character_set.create_job(
        source_image_url=body.source_image_url,
        style_prompt=body.style_prompt,
    )
    base_url = str(request.base_url).rstrip("/")
    return CharacterSetGenerateResponse(
        job_id=job["job_id"],
        status=job["status"],
        status_url=f"{base_url}/api/v1/character-set/status/{job['job_id']}",
        download_url=f"{base_url}/api/v1/character-set/download/{job['job_id']}",
    )


@router.get("/status/{job_id}", response_model=CharacterSetStatusResponse)
async def get_character_set_status(request: Request, job_id: str):
    job = await character_set.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Character-set job not found")

    base_url = str(request.base_url).rstrip("/")
    payload = character_set.build_status_payload(job=job, base_url=base_url)
    return CharacterSetStatusResponse(**payload)


@router.get("/download/{job_id}")
async def download_character_set(job_id: str):
    job = await character_set.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Character-set job not found")
    if job["status"] != "succeeded":
        raise HTTPException(status_code=409, detail="Character-set pack is not ready yet")

    archive_path = character_set.get_archive_path(job)
    if archive_path is None or not archive_path.exists():
        raise HTTPException(status_code=404, detail="Character-set pack file not found")

    return FileResponse(
        path=archive_path,
        media_type="application/zip",
        filename=archive_path.name,
    )
