# Asset Map (Inputs/Outputs)

## Identity Base
- `CHARACTER_MAIN`

## Mouth Assets (von `CHARACTER_MAIN` abgeleitet)
- `L_MOUTH` (E) -> benötigt Referenz `L`
- `O_MOUTH` -> benötigt Referenz `O`
- `JCHSH_MOUTH` -> benötigt Referenz `JCHSH`
- `BMP_MOUTH` -> benötigt Referenz `BMP`

## Work Idle Frames (sequentiell)
- `FRAME_A_WORK_IDLE` -> Input: `CHARACTER_MAIN`
- `FRAME_B_WORK_IDLE` -> Input: `FRAME_A_WORK_IDLE`
- `FRAME_C_WORK_IDLE` -> Input: `FRAME_B_WORK_IDLE`
- `FRAME_D_WORK_IDLE` -> Input: `FRAME_C_WORK_IDLE`

## Zusatzreferenz
- Mundwinkel-Geometrie: Referenz liegt im **private reference storage**.

## Konstante Settings
- Aspect Ratio: `1:1`
- Background: `#00FF00` (solid green)
- Kein Kamera-/Framing-Shift
- Identität/Style strikt unverändert
