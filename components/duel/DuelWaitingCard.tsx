'use client';

import Image from 'next/image';

interface DuelWaitingCardProps {
  opponentName: string;
  opponentAvatar: string;
  message?: string;
}

export default function DuelWaitingCard({
  opponentName,
  opponentAvatar,
  message = 'Esperando que tu rival juegue…',
}: DuelWaitingCardProps) {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-[#1b1b1e]/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center text-center">
      {/* Avatar with pulsing ring */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-[#eddcff] animate-ping opacity-30 scale-110" />
        <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-[#4a148c]/20 shadow-lg relative">
          <Image
            src={opponentAvatar}
            alt={opponentName}
            width={80} height={80}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      </div>

      <h4 className="font-serif text-[18px] font-bold text-[#310065] mb-2">
        Turno de {opponentName.split(' ')[0]}
      </h4>
      <p className="text-[#7c7483] text-[13px] font-medium leading-relaxed mb-4 max-w-[200px]">
        {message}
      </p>

      {/* Animated dots */}
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#eddcff]"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); background-color: #eddcff; }
          30% { transform: translateY(-6px); background-color: #4a148c; }
        }
      `}</style>
    </div>
  );
}
