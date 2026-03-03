# Asset Map (Inputs/Outputs)

## Identity Base
- `RICK_MAIN`

## Mouth Assets (von `RICK_MAIN` abgeleitet)
- `L_MOUTH` (E) -> benötigt Referenz `L`
- `O_MOUTH` -> benötigt Referenz `O`
- `JCHSH_MOUTH` -> benötigt Referenz `JCHSH`
- `BMP_MOUTH` -> benötigt Referenz `BMP`

## Work Idle Frames (sequentiell)
- `FRAME_A_WORK_IDLE_RICK` -> Input: `RICK_MAIN`
- `FRAME_B_WORK_IDLE_RICK` -> Input: `FRAME_A_WORK_IDLE_RICK`
- `FRAME_C_WORK_IDLE_RICK` -> Input: `FRAME_B_WORK_IDLE_RICK`
- `FRAME_D_WORK_IDLE_RICK` -> Input: `FRAME_C_WORK_IDLE_RICK`

## Zusatzreferenz
- Mundwinkel-Geometrie: Referenz liegt in **SecureCloud**.

## Konstante Settings
- Aspect Ratio: `1:1`
- Background: `#00FF00` (solid green)
- Kein Kamera-/Framing-Shift
- Identität/Style strikt unverändert
