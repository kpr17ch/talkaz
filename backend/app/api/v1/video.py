import logging
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
from app.services import openai_service
from app.services.ffmpeg import replace_greenscreen

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/video", tags=["video"])


@router.post("/generate", response_model=VideoGenerateResponse)
async def generate_video(body: VideoGenerateRequest):
    animation_instructions = None
    hand_arm_gestures = None
    
    if body.scene_description:
        try:
            logger.info(f"Generating dynamic prompt sections with OpenAI. Scene: {body.scene_description}, Spoken line: {body.spoken_line}, Style: {body.style}")
            dynamic_sections = await openai_service.generate_video_prompt_sections(
                spoken_line=body.spoken_line,
                scene_description=body.scene_description,
                style=body.style
            )
            animation_instructions = dynamic_sections["animation_instructions"]
            hand_arm_gestures = dynamic_sections["hand_arm_gestures"]
            logger.info(f"OpenAI generated sections - Animation Instructions: {animation_instructions}")
            logger.info(f"OpenAI generated sections - Hand/Arm Gestures: {hand_arm_gestures}")
        except Exception as e:
            logger.error(f"Failed to generate dynamic prompt sections: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate dynamic prompt sections: {str(e)}"
            )
    else:
        logger.info("No scene description provided, using default animation instructions and gestures")
    
    result = await replicate.create_video_prediction(
        image_url=body.image_url,
        spoken_line=body.spoken_line,
        duration=body.duration,
        animation_instructions=animation_instructions,
        hand_arm_gestures=hand_arm_gestures,
        style=body.style,
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
        video_url = body.video_url
        audio_path_or_url = body.audio_url
        
        logger.info(f"Applying lip sync - Video: {video_url}, Audio: {audio_path_or_url}")
        
        output_url = await replicate.apply_lipsync(
            video_url=video_url,
            audio_path_or_url=audio_path_or_url,
        )
        
        return VideoMergeResponse(output_url=output_url)
    except Exception as e:
        logger.error(f"Failed to apply lip sync: {str(e)}")
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
