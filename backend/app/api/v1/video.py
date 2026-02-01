from fastapi import APIRouter, Request, HTTPException

from app.models.video import (
    VideoGenerateRequest,
    VideoGenerateResponse,
    VideoStatusResponse,
    VideoMergeRequest,
    VideoMergeResponse,
    VideoBackgroundRequest,
    VideoBackgroundResponse,
)
from app.services import replicate
from app.services.ffmpeg import merge_audio_video, replace_greenscreen

router = APIRouter(prefix="/video", tags=["video"])


@router.post("/generate", response_model=VideoGenerateResponse)
async def generate_video(body: VideoGenerateRequest):
    result = await replicate.create_video_prediction(
        image_url=body.image_url,
        prompt=body.prompt,
        duration=body.duration,
    )
    return VideoGenerateResponse(
        prediction_id=result["id"],
        status=result["status"],
    )


@router.get("/status/{prediction_id}", response_model=VideoStatusResponse)
async def get_video_status(prediction_id: str):
    result = await replicate.get_prediction_status(prediction_id)
    output_url = None
    if result["status"] == "succeeded" and result.get("output"):
        output = result["output"]
        output_url = output[0] if isinstance(output, list) else output

    return VideoStatusResponse(
        status=result["status"],
        output_url=output_url,
        error=result.get("error"),
    )


@router.post("/merge", response_model=VideoMergeResponse)
async def merge_video(request: Request, body: VideoMergeRequest):
    try:
        relative_url = await merge_audio_video(
            video_url=body.video_url,
            audio_url=body.audio_url,
        )
        base_url = str(request.base_url).rstrip("/")
        return VideoMergeResponse(output_url=f"{base_url}{relative_url}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply-background", response_model=VideoBackgroundResponse)
async def apply_background(request: Request, body: VideoBackgroundRequest):
    try:
        relative_url = await replace_greenscreen(
            video_url=body.video_url,
            background_url=body.background_url,
            scale=body.scale,
        )
        base_url = str(request.base_url).rstrip("/")
        return VideoBackgroundResponse(output_url=f"{base_url}{relative_url}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
