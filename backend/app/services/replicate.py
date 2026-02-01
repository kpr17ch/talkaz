import replicate
import os
from pathlib import Path
from app.config import get_settings


def _ensure_replicate_token():
    settings = get_settings()
    token = settings.replicate_api_token
    if token and not os.environ.get("REPLICATE_API_TOKEN"):
        os.environ["REPLICATE_API_TOKEN"] = token

STYLE_PROMPTS = {
    "Playstation 2": """Create an authentic early 2000s PlayStation 2 (PS2) video game character
in the style of GTA San Andreas (2004), based EXACTLY on the person
in the reference image.

This must be a FULL BODY character render.
The ENTIRE body must be visible from head to feet.

IMPORTANT: Do NOT crop the body.
IMPORTANT: Do NOT cut off the legs, knees, feet, or shoes.
The feet and shoes must be fully visible and clearly rendered.

Preserve the real person's identity as accurately as possible:
- same face shape, jawline, eyes, nose, mouth
- same hairstyle and hairline
- same body proportions
- same clothing and outfit
- same pose, stance, and posture
- same camera angle and perspective

Style conversion only:
- PS2 era low-poly 3D character
- GTA San Andreas NPC / cutscene look
- simple facial geometry
- stiff, slightly uncanny pose
- low resolution textures (128x128 or 256x256)
- blurry texture filtering
- flat baked lighting
- no modern rendering
- slight green/brown PS2 color cast
- authentic PlayStation 2 aesthetic

Rendering rules:
- full body visible, head to shoes
- character centered
- SOLID PURE GREEN BACKGROUND (GREEN SCREEN)
- flat, even green color (#00FF00)
- no gradients, no shadows, no lighting variation on the background
- no environment, no props
- no text, no symbols, no overlays
- looks like a raw in-game character model export prepared for chroma keying""",
    "Anime": """Create an authentic early 2000s anime-style character,
in a gritty, sharp, and edgy style inspired by street samurai aesthetics,
based EXACTLY on the person in the reference image.

This must be a FULL BODY character render.
The ENTIRE body must be visible from head to feet.

IMPORTANT: Do NOT crop the body.
IMPORTANT: Do NOT cut off the legs, knees, feet, or shoes.
The feet and shoes must be fully visible and clearly rendered.

Preserve the real person's identity as accurately as possible:
- same face shape, jawline, eyes, nose, mouth
- same hairstyle and hairline
- same body proportions
- same clothing and outfit
- same pose, stance, and posture
- same camera angle and perspective

Style conversion only:
- early 2000s anime aesthetic
- sharp, angular character design
- spiky, edgy linework
- strong jawlines and defined facial features
- gritty street-samurai vibe
- hip-hop influenced anime style
- minimal softness, no cute or moe features
- raw, expressive faces
- limited color palette
- high-contrast cel shading
- visible ink lines and rough outlines
- stylized proportions, slightly exaggerated but grounded
- cinematic anime look, not modern glossy anime
- mature, cool, dangerous energy

Rendering rules:
- full body visible, head to shoes
- character centered
- SOLID PURE GREEN BACKGROUND (GREEN SCREEN)
- flat, even green color (#00FF00)
- no gradients, no shadows, no lighting variation on the background
- no environment, no props
- no text, no symbols, no overlays
- looks like a raw anime character render prepared for chroma keying""",
}

VIDEO_PROMPT = """Animate the provided image into a short video.

The character must remain EXACTLY the same as in the input image.  
Do not change the character's identity, face, body, clothing, proportions, or style.

Video timing (VERY IMPORTANT):
- The character should appear to be speaking continuously for the full duration.
- Mouth movement must be active and consistent from start to end.
- Short natural pauses are allowed only where indicated.

Style:
- Authentic early 2000s PlayStation 2 video game character
- GTA San Andreas era graphics
- Low-poly 3D character
- Low-resolution textures
- Flat baked lighting
- Slightly stiff PS2 animation style

Animation instructions:
- The character keeps the same main pose and body position.
- The camera is static and centered.
- The character is looking directly into the camera at all times.

Speaking behavior:
- Mouth movement follows the rhythm and emphasis of the following line.
- Mouth opening varies based on emphasis.
- Stronger mouth movement on emphasized words.
- Do NOT move the mouth at a constant speed.

Spoken line (for rhythm and emphasis reference ONLY):
"What's UP, dawg?  
You wanna go grab some FOOD?  
Don't WORRY — it's on ME.  
I know your BROKE ass can't pay for SHIT."

Emphasis rules:
- Words in ALL CAPS are strongly emphasized.
- Slight pause after each line break.
- Higher energy and stronger mouth opening on emphasized words.
- More relaxed mouth movement on non-emphasized words.

Hand and arm gestures:
- Expressive, street-style hand gestures that follow the emphasis.
- Stronger, punchy gestures on emphasized words.
- Smaller gestures during calm parts.
- Natural, confident GTA-style attitude.
- No chaotic or cartoonish movement.

Restrictions:
- Do NOT change stance or posture.
- Do NOT add walking, turning, or dancing.
- Do NOT add background elements.
- Do NOT add text or visual effects.

Background:
- SOLID PURE GREEN BACKGROUND (GREEN SCREEN)
- Flat, even green color (#00FF00)
- No gradients, no shadows, no lighting variation on the background

Overall feeling:
A PS2-era GTA San Andreas NPC delivering a confident, street-smart line  
directly to the camera in a cutscene,  
with attitude, personality, and emphasis,  
authentic early-2000s low-budget game animation."""

VIDEO_NEGATIVE_PROMPT = """text, words, letters, typography,
subtitles, captions, speech bubbles,
on-screen text, overlay text,
logos, signs, labels, symbols,
watermark, watermark text,
UI elements, interface,
numbers, characters,
random text, floating text,
any written content of any kind"""


def create_image_sync(source_image_url: str, style_prompt: str) -> str:
    _ensure_replicate_token()
    prompt = STYLE_PROMPTS.get(style_prompt, style_prompt)
    
    settings = get_settings()
    relative_path = source_image_url.split("/uploads/")[-1]
    file_path = Path(settings.upload_dir) / relative_path
    
    with open(file_path, "rb") as f:
        output = replicate.run(
            "google/nano-banana-pro",
            input={
                "prompt": prompt,
                "image_input": [f],
                "aspect_ratio": "4:3",
                "output_format": "png",
            }
        )
    
    if hasattr(output, 'url'):
        return output.url
    elif isinstance(output, str):
        return output
    elif isinstance(output, list) and len(output) > 0:
        item = output[0]
        return item.url if hasattr(item, 'url') else str(item)
    else:
        return str(output)


def create_video_sync(image_url: str, prompt: str, duration: float = 5.0) -> str:
    _ensure_replicate_token()
    output = replicate.run(
        "kwaivgi/kling-v2.5-turbo-pro",
        input={
            "start_image": image_url,
            "prompt": VIDEO_PROMPT,
            "negative_prompt": VIDEO_NEGATIVE_PROMPT,
            "duration": int(duration),
            "aspect_ratio": "9:16",
        }
    )
    return output.url if hasattr(output, 'url') else str(output)


async def create_video_prediction(image_url: str, prompt: str, duration: float = 5.0) -> dict:
    _ensure_replicate_token()
    prediction = replicate.predictions.create(
        model="kwaivgi/kling-v2.5-turbo-pro",
        input={
            "start_image": image_url,
            "prompt": VIDEO_PROMPT,
            "negative_prompt": VIDEO_NEGATIVE_PROMPT,
            "duration": int(duration),
            "aspect_ratio": "9:16",
        }
    )
    return {
        "id": prediction.id,
        "status": prediction.status,
    }


async def get_prediction_status(prediction_id: str) -> dict:
    _ensure_replicate_token()
    prediction = replicate.predictions.get(prediction_id)
    output_url = None
    if prediction.status == "succeeded" and prediction.output:
        output = prediction.output
        if isinstance(output, list) and len(output) > 0:
            output_url = output[0].url if hasattr(output[0], 'url') else str(output[0])
        elif hasattr(output, 'url'):
            output_url = output.url
        else:
            output_url = str(output)
    
    return {
        "status": prediction.status,
        "output": output_url,
        "error": prediction.error,
    }
