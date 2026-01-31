# Talkaz Setup

## Quick Start (Hackathon Ready!)

Einfach einmal ausführen und alles läuft:

```bash
npm run start
```

Das macht:
1. ✅ Installiert alle Frontend Dependencies (Next.js)
2. ✅ Erstellt Python Virtual Environment (venv) automatisch
3. ✅ Installiert alle Backend Dependencies (Python/FastAPI) im venv
4. ✅ Startet beide Services parallel

## Services

- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:8000 (FastAPI)
- **API Docs**: http://localhost:8000/docs (Swagger UI)

## Manuelle Commands (optional)

```bash
# Nur Setup
npm run setup

# Nur Dev Server starten (ohne Setup)
npm run dev

# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend
```

## Requirements

- Node.js (v18+)
- Python (v3.11+)
- npm

## First Time Setup

```bash
# Repo klonen
git clone https://github.com/kpr17ch/talkaz.git
cd talkaz

# Alles starten (macht automatisch Setup)
npm run start
```

## Branch wechseln

```bash
# UI Playground
git checkout feat/ui-playground
npm run start

# Character Pipeline
git checkout feat/character-pipeline
npm run start
```

Dependencies werden automatisch neu installiert wenn sich was geändert hat!
