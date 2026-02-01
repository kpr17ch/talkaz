from pydantic import BaseModel


class ImageUploadResponse(BaseModel):
    id: str
    url: str


class ImageGenerateRequest(BaseModel):
    source_image_url: str
    style_prompt: str


class ImageGenerateResponse(BaseModel):
    output_url: str


class ImageStatusResponse(BaseModel):
    status: str
    output_url: str | None = None
    error: str | None = None
