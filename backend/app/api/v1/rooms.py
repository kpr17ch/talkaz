from fastapi import APIRouter

from app.models.schemas import Room

router = APIRouter()

ROOMS = [
    Room(id="cozy-room", name="Cozy Room", background_url="/rooms/cozy-room.svg"),
    Room(id="cyber-lounge", name="Cyber Lounge", background_url="/rooms/cyber-lounge.svg"),
    Room(id="nature-retreat", name="Nature Retreat", background_url="/rooms/nature-retreat.svg"),
]


@router.get("/rooms", response_model=list[Room])
def get_rooms():
    return ROOMS
