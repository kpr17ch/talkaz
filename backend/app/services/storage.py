import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile

from app.config import get_settings


async def save_upload(file: UploadFile) -> tuple[str, str]:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(exist_ok=True)

    ext = Path(file.filename).suffix if file.filename else ".bin"
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    filepath = upload_dir / filename

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    return file_id, f"/uploads/{filename}"
