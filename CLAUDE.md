# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektkontext

Talkaz ist ein **Hackathon-Projekt** (2 Tage, 2-Mann-Team) - eine Web-App wo User ihren eigenen virtuellen Raum mit personalisiertem AI-Charakter erstellen können.

**MVP-Fokus**: Pragmatische Lösungen bevorzugen, Demo-Fähigkeit priorisieren, `main` muss immer präsentierbar sein.

## Tech-Stack

- **Frontend**: Next.js 15+ mit React, TypeScript
- **Backend**: FastAPI (Python 3.11+)
- **Styling**: Tailwind CSS

## Projekt-Struktur

```
talkaz/
├── frontend/          # Next.js App (Person A)
│   ├── src/
│   │   ├── app/      # Next.js App Router
│   │   ├── components/
│   │   └── lib/
│   └── public/
└── backend/           # FastAPI Service (Character-Pipeline Integration)
    ├── app/
    │   ├── api/
    │   └── models/
    └── venv/
```

## Development Commands

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev          # Development Server auf http://localhost:3000
npm run build        # Production Build
npm run lint         # ESLint prüfen
```

### Backend (FastAPI)

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # Development Server auf http://localhost:8000
pytest                            # Tests ausführen
```

## Branch-Strategie

| Branch | Owner | Fokus |
|--------|-------|-------|
| `feat/ui-playground` | Person A | UI, Frontend, Playground, Räume |
| `feat/character-pipeline` | Person B | Character-Erstellung, AI-Pipeline |
| `main` | - | Stabil, jederzeit demo-ready |

Feature Branches werden via PR in `main` gemerged.

## Architektur

### Frontend Responsibilities (Person A)
- Playground UI mit virtuellen Räumen
- Raum-Hintergrund Switcher (verschiedene Environments)
- Ästhetik-Style Switcher (PS2, Comic, etc.)
- Musik/Vibes Player
- Character Display (erhält Character von Backend)

### Backend Responsibilities
- Character-Generierung Pipeline (Person B)
- API Endpoints für Character-Erstellung
- Integration mit AI-Services
- Raum-/Asset-Management

### Frontend ↔ Backend Communication
- REST API zwischen Next.js und FastAPI
- Character-Daten werden vom Backend generiert und ans Frontend geliefert
- Frontend sendet User-Präferenzen (Style, Raum-Typ) ans Backend

## Coding-Prinzipien (Hackathon)

- **Schnell iterieren**: Funktionierende Lösung > Perfekte Architektur
- **Minimaler Code**: Keine Over-Engineering, direkte Implementierung
- **Demo-ready**: Jeder Commit sollte lauffähig sein
- **Einfache Integration**: Code so schreiben dass beide Branches einfach zusammengeführt werden können

## API Konventionen

Backend API Endpoints unter `/api/v1/`:
- `/api/v1/character/generate` - Character erstellen
- `/api/v1/rooms` - Verfügbare Räume
- `/api/v1/styles` - Verfügbare Ästhetik-Styles
