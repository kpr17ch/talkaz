# Pipeline und Abhängigkeiten

## 1) Mouth-Asset-Pipeline

```text
RICK_MAIN (Identity Base)
   ├─> L_MOUTH (E)     + Ref: "L"
   ├─> O_MOUTH         + Ref: "O"
   ├─> JCHSH_MOUTH     + Ref: "JCHSH"
   └─> BMP_MOUTH       + Ref: "BMP"
```

Regel: `RICK_MAIN` ist immer die primäre Identitätsquelle. Die jeweiligen Referenzen steuern nur die Mundgeometrie.

## 2) Work-Idle-Loop-Pipeline

```text
RICK_MAIN
  -> FRAME_A_WORK_IDLE
  -> FRAME_B_WORK_IDLE
  -> FRAME_C_WORK_IDLE
  -> FRAME_D_WORK_IDLE
```

Regel: Für Work gilt immer `Frame N-1` als primärer Input (nicht zurück auf `RICK_MAIN`, außer für Identitätsabgleich).

## 3) Globale Invarianten
- Exakte Character-Identität (Rick Sanchez)
- 1:1 Square, gleiches Framing, kein Camera Shift
- Gleiches Shading/Linework im Rick-and-Morty-Stil
- Green Screen Hintergrund: `#00FF00`, flach, ohne Gradient/Texture/Shadows
- Keine unnötigen Geometrieänderungen, kein Flicker, kein Motion Blur
