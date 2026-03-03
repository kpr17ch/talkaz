# Character Pipeline Docs (Rick)

Diese Dateien dokumentieren die WhatsApp-Spezifikation (David, 03.03.2026) so, dass ein AI-Agent die Character-Assets konsistent erzeugen kann.

## Ziel
- Einheitliche Generierung von Rick-Assets für Lip-Sync und Work-Idle-Animation
- Klare Input/Output-Abhängigkeiten
- Copy/Paste-fähige Prompts pro Asset

## Reihenfolge
1. `RICK_MAIN` als Identity Base sicherstellen
2. Mouth-Varianten aus `RICK_MAIN` generieren (`L`, `O`, `JCHSH`, `BMP`)
3. Work-Idle-Frames sequentiell generieren (`A -> B -> C -> D`)

## Wichtige Regeln
- Für **Work-Frames** immer den **vorherigen Frame** als primären Input benutzen.
- Für **Mundwinkel-Feinheiten** ist die Referenz in **SecureCloud** hinterlegt (zusätzliche Geometrie-Hilfe).
- Style, Framing, Character-Identität und Green-Screen bleiben streng konstant.

Siehe: [pipeline.md](./pipeline.md), [asset-map.md](./asset-map.md) und `prompts/*.md`.
