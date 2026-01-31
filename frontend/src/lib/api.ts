const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Room {
  id: string;
  name: string;
  background_url: string;
}

export interface Style {
  id: string;
  name: string;
  description: string;
}

export interface Character {
  id: string;
  image_url: string;
  animation_data: Record<string, unknown>;
}

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE}/api/v1/rooms`);
  return res.json();
}

export async function getStyles(): Promise<Style[]> {
  const res = await fetch(`${API_BASE}/api/v1/styles`);
  return res.json();
}

export async function generateCharacter(
  style: string,
  roomId: string,
  userPreferences: Record<string, unknown> = {}
): Promise<Character> {
  const res = await fetch(`${API_BASE}/api/v1/character/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      style,
      room_id: roomId,
      user_preferences: userPreferences,
    }),
  });
  return res.json();
}
