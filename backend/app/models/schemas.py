from pydantic import BaseModel


class Room(BaseModel):
    id: str
    name: str
    background_url: str


class Style(BaseModel):
    id: str
    name: str
    description: str


class CharacterRequest(BaseModel):
    style: str
    room_id: str
    user_preferences: dict = {}


class CharacterResponse(BaseModel):
    id: str
    image_url: str
    animation_data: dict = {}
