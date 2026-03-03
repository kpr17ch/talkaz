from fastapi import APIRouter

from app.api.v1 import character_set, image, voice

router = APIRouter()
router.include_router(image.router)
router.include_router(character_set.router)
router.include_router(voice.router)
