import uuid

from fastapi import APIRouter

from app.models.schemas import CharacterRequest, CharacterResponse

router = APIRouter()


@router.post("/character/generate", response_model=CharacterResponse)
def generate_character(request: CharacterRequest):
    return CharacterResponse(
        id=str(uuid.uuid4()),
        image_url=f"/characters/placeholder-{request.style}.png",
        animation_data={"idle": True},
    )
