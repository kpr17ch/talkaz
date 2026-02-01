from pydantic import BaseModel


class VideoGenerateRequest(BaseModel):
    image_url: str
    prompt: str
    duration: float = 5.0


class VideoGenerateResponse(BaseModel):
    prediction_id: str
    status: str


class VideoStatusResponse(BaseModel):
    status: str
    output_url: str | None = None
    error: str | None = None


class VideoMergeRequest(BaseModel):
    video_url: str
    audio_url: str


class VideoMergeResponse(BaseModel):
    output_url: str


class VideoBackgroundRequest(BaseModel):
    video_url: str
    background_url: str
    scale: float = 0.6


class VideoBackgroundResponse(BaseModel):
    output_url: str
