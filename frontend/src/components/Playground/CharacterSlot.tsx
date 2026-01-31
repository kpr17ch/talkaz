"use client";

import type { Character } from "@/lib/api";

interface CharacterSlotProps {
  character: Character | null;
  isLoading?: boolean;
}

export default function CharacterSlot({ character, isLoading }: CharacterSlotProps) {
  if (isLoading) {
    return (
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="w-32 h-48 bg-white/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="w-32 h-48 border-2 border-dashed border-white/40 rounded-lg flex items-center justify-center">
          <span className="text-white/60 text-sm">Character</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
      <img
        src={character.image_url}
        alt="Character"
        className="w-32 h-48 object-contain"
      />
    </div>
  );
}
