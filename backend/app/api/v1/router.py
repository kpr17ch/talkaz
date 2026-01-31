from fastapi import APIRouter

from app.api.v1 import character, rooms, styles

router = APIRouter(prefix="/api/v1")

router.include_router(rooms.router)
router.include_router(styles.router)
router.include_router(character.router)
