"use client";

import type { Room, Style } from "@/lib/api";

interface ControlsProps {
  rooms: Room[];
  styles: Style[];
  selectedRoom: string;
  selectedStyle: string;
  onRoomChange: (roomId: string) => void;
  onStyleChange: (styleId: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export default function Controls({
  rooms,
  styles,
  selectedRoom,
  selectedStyle,
  onRoomChange,
  onStyleChange,
  onGenerate,
  isGenerating,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-black/50 rounded-lg">
      <div className="flex items-center gap-2">
        <label className="text-white text-sm">Room:</label>
        <select
          value={selectedRoom}
          onChange={(e) => onRoomChange(e.target.value)}
          className="bg-white/10 text-white rounded px-3 py-1.5 cursor-pointer"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id} className="bg-gray-800">
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-white text-sm">Style:</label>
        <select
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          className="bg-white/10 text-white rounded px-3 py-1.5 cursor-pointer"
        >
          {styles.map((style) => (
            <option key={style.id} value={style.id} className="bg-gray-800">
              {style.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-4 py-1.5 rounded cursor-pointer transition-colors"
      >
        {isGenerating ? "Generating..." : "Generate Character"}
      </button>
    </div>
  );
}
