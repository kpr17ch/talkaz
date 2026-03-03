from pydantic import BaseModel, Field


class CharacterSetGenerateRequest(BaseModel):
    source_image_url: str
    style_prompt: str = "Playstation 2"


class CharacterSetGenerateResponse(BaseModel):
    job_id: str
    status: str
    status_url: str
    download_url: str


class CharacterSetStatusResponse(BaseModel):
    job_id: str
    status: str
    created_at: str
    updated_at: str
    steps_completed: int
    steps_total: int
    progress: float
    current_step: str | None = None
    frame_urls: dict[str, str] = Field(default_factory=dict)
    manifest_url: str | None = None
    pack_url: str | None = None
    download_url: str
    error: str | None = None
