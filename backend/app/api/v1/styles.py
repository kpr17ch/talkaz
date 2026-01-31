from fastapi import APIRouter

from app.models.schemas import Style

router = APIRouter()

STYLES = [
    Style(id="ps2", name="PS2 Era", description="Low-poly retro gaming aesthetic"),
    Style(id="comic", name="Comic", description="Bold lines and vibrant colors"),
    Style(id="anime", name="Anime", description="Japanese animation style"),
    Style(id="pixel", name="Pixel Art", description="Retro 8-bit/16-bit style"),
]


@router.get("/styles", response_model=list[Style])
def get_styles():
    return STYLES
