# Talkaz - AI Character Video Generator

## Projekt

SaaS-Plattform zur Generierung personalisierter Character-Videos. User lädt ein Foto hoch, beschreibt per Prompt den gewünschten Stil, und erhält ein animiertes Video mit Custom-Stimme.

## User Flow

1. **Bild hochladen** - Full-Body-Foto der Person
2. **Character-Stil prompten** - Ästhetik beschreiben (PS2, Anime, Cartoon, etc.)
3. **Bild generieren** - Replicate API (NanoBanana o.ä.) erstellt stylisiertes Character-Bild
4. **Stimme konfigurieren** - Per Prompt beschreiben wie der Character klingen soll
5. **Stimme auswählen** - 3 Vorschläge von Hume/ElevenLabs, User wählt oder promptet neu
6. **Video generieren** - AI kombiniert Bild + Stimme zu animiertem Video

## Use Cases

- Grußvideos / Geburtstags-Gratulationen
- Film-/Spiel-Szenen mit eigenem Character nachstellen
- Personalisierte Animationen

## Tech Stack

### Backend
- Python 3.13 / FastAPI
- Replicate API (Bild-Generierung)
- Hume / ElevenLabs API (Voice)
- Video-Generation API (TBD)

### Frontend
- Next.js / React / TypeScript
- TailwindCSS
- Cleanes, minimalistisches SaaS-Interface

## API Integrationen

- **Replicate**: Character-Bild aus Foto + Style-Prompt
- **Hume/ElevenLabs**: Voice-Generierung aus Beschreibung
- **Video AI**: Bild + Voice zu animiertem Video

## Commands

```bash
# Setup
./setup.sh

# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

## Projektstruktur

```
backend/          # FastAPI Backend
  app/
    api/v1/       # API Endpoints
    models/       # Pydantic Schemas
    services/     # API Integrationen (Replicate, Hume, etc.)
frontend/         # Next.js Frontend
  src/
    app/          # Pages
    components/   # UI Components
```
