import replicate
import os
from dotenv import load_dotenv

load_dotenv()

VIDEO_URL = "https://replicate.delivery/xezq/ipjGAn65es3cfkPhe7g3IvYQqDfbHeCfBof1ujrrMvb3rQAXKA/tmptucl_ok3.mp4"
AUDIO_URL = "https://replicate.delivery/pbxt/N245edsFrGTRuk6v5OWFet0nsqiahHTlSF8yRfZEbbZCxSzY/replicate-prediction-sz4ehr9vanrme0cpwnp9wr4g8c.mp3"

print("Testing Kling Lip-Sync with public URLs...")
print(f"Video: {VIDEO_URL}")
print(f"Audio: {AUDIO_URL}")

output = replicate.run(
    "kwaivgi/kling-lip-sync",
    input={
        "video_url": VIDEO_URL,
        "audio_file": AUDIO_URL,
    }
)

print(f"\nResult type: {type(output)}")
print(f"Output: {output}")

if hasattr(output, 'url'):
    print(f"\nSuccess! Output URL: {output.url}")
else:
    print(f"\nOutput (raw): {output}")
