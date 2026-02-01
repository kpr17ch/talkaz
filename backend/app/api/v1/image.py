from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.concurrency import run_in_threadpool

from app.models.image import (
    ImageUploadResponse,
    ImageGenerateRequest,
    ImageGenerateResponse,
)
from app.services.storage import save_upload
from app.services import replicate

router = APIRouter(prefix="/image", tags=["image"])


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(request: Request, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_id, relative_url = await save_upload(file)
    base_url = str(request.base_url).rstrip("/")
    full_url = f"{base_url}{relative_url}"

    return ImageUploadResponse(id=file_id, url=full_url)


@router.post("/generate", response_model=ImageGenerateResponse)
async def generate_image(request: ImageGenerateRequest):
    output_url = await run_in_threadpool(
        replicate.create_image_sync,
        request.source_image_url,
        request.style_prompt,
    )
    return ImageGenerateResponse(output_url=output_url)
