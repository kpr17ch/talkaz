"use client";

interface RoomProps {
  backgroundUrl: string;
  children?: React.ReactNode;
}

export default function Room({ backgroundUrl, children }: RoomProps) {
  return (
    <div
      className="relative w-full h-[600px] bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      {children}
    </div>
  );
}
