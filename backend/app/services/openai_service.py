import json
import logging
from openai import OpenAI
from fastapi.concurrency import run_in_threadpool
from app.config import get_settings

logger = logging.getLogger(__name__)


def _get_client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY not set")
    return OpenAI(api_key=settings.openai_api_key)


def _get_meta_prompt(style: str = "Playstation 2") -> str:
    style_descriptions = {
        "Playstation 2": "PS2-era GTA San Andreas style character",
        "Anime": "early 2000s street-anime style character"
    }
    style_description = style_descriptions.get(style, style_descriptions["Playstation 2"])
    
    return f"""You are an expert video prompt engineer specializing in character animation prompts for AI video generation.

Your task is to generate ONLY two specific sections of a video prompt based on:
1. The scene description provided by the user
2. The spoken line that the character will say

CRITICAL RULES - CONSERVATIVE DEFAULTS:

For "Animation instructions":
- DEFAULT: Character keeps the same main pose and body position, camera is static and centered, character looks directly into camera
- ONLY change these defaults if the user EXPLICITLY describes something different (e.g., "look away", "turn around", "move")
- When in doubt, KEEP THE DEFAULTS
- If user says nothing about camera/pose, use defaults exactly

For "Hand and arm gestures":
- Generate expressive, context-appropriate gestures based on the scene description and spoken line
- Match the energy and emotion of the scene
- Keep gestures natural and fitting for a {style_description}
- No chaotic or cartoonish movement

OUTPUT FORMAT:
Return a JSON object with exactly these two keys:
{{
  "animation_instructions": "string with bullet points",
  "hand_arm_gestures": "string with bullet points"
}}

Each section should be formatted as bullet points starting with "- " and be concise but specific.

Example output:
{{
  "animation_instructions": "- The character keeps the same main pose and body position.\\n- The camera is static and centered.\\n- The character is looking directly into the camera at all times.",
  "hand_arm_gestures": "- Expressive, celebratory hand gestures matching the birthday theme.\\n- Raised arms with thumbs up on emphasized words.\\n- Warm, friendly gestures throughout."
}}

Remember: Be conservative with animation instructions - only deviate from defaults if explicitly requested."""


def _debug_log(hypothesis_id: str, message: str, data: dict):
    # #region agent log
    import time
    log_path = "/Users/kai.perich/Projects/Private/talkaz/.cursor/debug.log"
    entry = json.dumps({"hypothesisId": hypothesis_id, "location": "openai_service.py", "message": message, "data": data, "timestamp": int(time.time() * 1000), "sessionId": "debug-session"})
    with open(log_path, "a") as f:
        f.write(entry + "\n")
    # #endregion

def generate_video_prompt_sections_sync(
    spoken_line: str,
    scene_description: str,
    style: str = "Playstation 2"
) -> dict[str, str]:
    client = _get_client()
    meta_prompt = _get_meta_prompt(style)
    
    full_prompt = f"""{meta_prompt}

Scene description: {scene_description}

Spoken line: "{spoken_line}"

Generate the "Animation instructions" and "Hand and arm gestures" sections for the video prompt. Return ONLY valid JSON."""

    # #region agent log
    _debug_log("H5", "API call starting", {"model": "gpt-5.2", "prompt_length": len(full_prompt)})
    # #endregion

    response = client.responses.create(
        model="gpt-5.2",
        input=full_prompt,
        reasoning={
            "effort": "none"
        },
        text={
            "verbosity": "medium"
        }
    )
    
    # #region agent log
    _debug_log("H1", "Response received", {"type": str(type(response)), "attributes": [a for a in dir(response) if not a.startswith("_")]})
    _debug_log("H1", "Full response repr", {"repr": repr(response)[:1000]})
    # #endregion
    
    # Extract content from response - GPT-5.2 uses output_text convenience property
    logger.debug(f"GPT-5.2 response type: {type(response)}")
    
    content = None
    
    # GPT-5.2 responses.create() API: Use output_text convenience property
    if hasattr(response, 'output_text') and response.output_text:
        # #region agent log
        _debug_log("FIX", "Using output_text property", {"output_text": str(response.output_text)[:500]})
        # #endregion
        content = response.output_text
    # Fallback: Extract from nested structure
    elif hasattr(response, 'output') and response.output:
        # #region agent log
        _debug_log("FIX", "Extracting from nested output structure", {"output_length": len(response.output)})
        # #endregion
        try:
            content = response.output[0].content[0].text
            # #region agent log
            _debug_log("FIX", "Extracted text from output[0].content[0].text", {"text": str(content)[:500]})
            # #endregion
        except (IndexError, AttributeError) as e:
            # #region agent log
            _debug_log("FIX", "Failed to extract from nested structure", {"error": str(e)})
            # #endregion
            pass
    
    # #region agent log
    _debug_log("H2", "Extracted content check", {"content_is_none": content is None, "content_type": str(type(content)) if content else "None", "content_preview": str(content)[:500] if content else "None"})
    # #endregion
    
    if not content:
        logger.error(f"Empty response from GPT-5.2. Response object: {response}")
        raise ValueError("Empty response from OpenAI")
    
    logger.debug(f"Extracted content (first 200 chars): {str(content)[:200]}")
    
    # Try to parse JSON from response
    # The response might be wrapped in markdown code blocks
    content_str = str(content).strip()
    
    # #region agent log
    _debug_log("H3", "Content string before processing", {"content_str": content_str[:500], "starts_with_backtick": content_str.startswith("```"), "starts_with_brace": content_str.startswith("{")})
    # #endregion
    
    if content_str.startswith("```"):
        # Extract JSON from code block
        lines = content_str.split("\n")
        json_lines = []
        in_json = False
        for line in lines:
            if line.strip().startswith("```"):
                if "json" in line.lower():
                    in_json = True
                elif in_json:
                    break
                continue
            if in_json:
                json_lines.append(line)
        content_str = "\n".join(json_lines)
    
    # #region agent log
    _debug_log("H4", "Content string after processing", {"content_str": content_str[:500], "length": len(content_str)})
    # #endregion
    
    result = json.loads(content_str)
    
    if "animation_instructions" not in result or "hand_arm_gestures" not in result:
        raise ValueError("Invalid response format from OpenAI")
    
    return {
        "animation_instructions": result["animation_instructions"],
        "hand_arm_gestures": result["hand_arm_gestures"]
    }


async def generate_video_prompt_sections(
    spoken_line: str,
    scene_description: str,
    style: str = "Playstation 2"
) -> dict[str, str]:
    return await run_in_threadpool(
        generate_video_prompt_sections_sync,
        spoken_line,
        scene_description,
        style
    )
