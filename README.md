# Talkaz

> AI-powered character video generator - upload your photo, pick a style, generate a talking avatar video.

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Python 3.13, FastAPI, Pydantic
- **AI Services**:
  - Replicate API (Image Generation - NanoBanana Pro)
  - Replicate API (Video Generation - Kling v2.5)
  - Hume AI (Voice Design - Text-to-Speech)
  - ElevenLabs (Voice Cloning)
- **Video Processing**: FFmpeg
- **Hosting**: Local development

## How to Run

```bash
# Clone the repo
git clone https://github.com/your-team/talkaz.git
cd talkaz

Add your API keys to backend/.env:
# - REPLICATE_API_TOKEN
# - HUME_API_KEY
# - ELEVENLABS_API_KEY

# Run everything (installs dependencies + starts frontend & backend)
npm run start
```

Frontend runs on `http://localhost:3000`, Backend on `http://localhost:8000`.

## Details

### User Flow

1. **Upload Image** - Full-body photo of yourself
2. **Generate Character** - AI transforms your photo into a stylized character (PS2, Anime, Cartoon)
3. **Configure Voice** - Either design a voice from description (Hume) or clone your own voice (ElevenLabs)
4. **Generate Video** - AI creates an animated video of your character speaking

### Architecture

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │
│   (Next.js)     │◀────│   (FastAPI)     │
└─────────────────┘     └────────┬────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │  Replicate  │      │   Hume AI   │      │ ElevenLabs  │
   │ (Image/Video)│      │  (Voice)    │      │(Voice Clone)│
   └─────────────┘      └─────────────┘      └─────────────┘
```

### Hackathon

2-Day AI Hackathon project with a 2-person team.
