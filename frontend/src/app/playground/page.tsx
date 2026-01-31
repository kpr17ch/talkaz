"use client";

import { useEffect, useState } from "react";
import Room from "@/components/Playground/Room";
import CharacterSlot from "@/components/Playground/CharacterSlot";
import Controls from "@/components/Playground/Controls";
import {
  getRooms,
  getStyles,
  generateCharacter,
  type Room as RoomType,
  type Style,
  type Character,
} from "@/lib/api";

export default function PlaygroundPage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [roomsData, stylesData] = await Promise.all([getRooms(), getStyles()]);
        setRooms(roomsData);
        setStyles(stylesData);
        if (roomsData.length > 0) setSelectedRoom(roomsData[0].id);
        if (stylesData.length > 0) setSelectedStyle(stylesData[0].id);
      } catch {
        setError("Failed to load data. Is the backend running?");
      }
    }
    loadData();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newCharacter = await generateCharacter(selectedStyle, selectedRoom);
      setCharacter(newCharacter);
    } catch {
      setError("Failed to generate character");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentRoom = rooms.find((r) => r.id === selectedRoom);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">Talkaz Playground</h1>

        <Room backgroundUrl={currentRoom?.background_url || "/rooms/cozy-room.png"}>
          <CharacterSlot character={character} isLoading={isGenerating} />
        </Room>

        {rooms.length > 0 && styles.length > 0 && (
          <Controls
            rooms={rooms}
            styles={styles}
            selectedRoom={selectedRoom}
            selectedStyle={selectedStyle}
            onRoomChange={setSelectedRoom}
            onStyleChange={setSelectedStyle}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
}
