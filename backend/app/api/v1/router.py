from fastapi import APIRouter

from app.api.v1 import image, voice, video

router = APIRouter()
router.include_router(image.router)
router.include_router(voice.router)
router.include_router(video.router)
