'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swords } from 'lucide-react';

interface DuelPlayerHeaderProps {
  player1Name: string;
  player1Avatar: string;
  player1Score: number;
  player1Id?: string;
  player2Name: string;
  player2Avatar: string;
  player2Score: number;
  player2Id?: string;
  currentRound: number;
  totalRounds: number;
  labelLeft?: string;
  labelRight?: string;
  participantsCount?: number;
}

export default function DuelPlayerHeader({
  player1Name,
  player1Avatar,
  player1Score,
  player1Id,
  player2Name,
  player2Avatar,
  player2Score,
  player2Id,
  currentRound,
  totalRounds,
  labelLeft = 'Tú',
  labelRight,
  participantsCount = 2,
}: DuelPlayerHeaderProps) {
  const p2Label = labelRight ?? player2Name.split(' ')[0];
  const otherOpponentsCount = participantsCount - 2;

  return (
    <div className="bg-white rounded-[2rem] p-5 border border-[#1b1b1e]/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* Round indicator */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-1.5 bg-[#eddcff]/60 px-4 py-1.5 rounded-full">
          <span className="text-[10px] font-black text-[#4a148c] uppercase tracking-widest">
            {participantsCount > 2 ? 'Duelo Grupal' : 'Duelo 1vs1'} · Ronda {currentRound} de {totalRounds}
          </span>
        </div>
      </div>

      {/* Score area */}
      <div className="flex items-center justify-between gap-3">
        {/* Player 1 */}
        <div className="flex flex-col items-center flex-1">
          {player1Id ? (
            <Link href={`/profile/${player1Id}`} className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-[#4a148c]/20 shadow-md mb-2 hover:opacity-80 transition-opacity">
              <Image
                src={player1Avatar}
                alt={player1Name}
                width={60} height={60}
                className="w-full h-full object-cover"
                unoptimized
              />
            </Link>
          ) : (
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-[#4a148c]/20 shadow-md mb-2">
              <Image
                src={player1Avatar}
                alt={player1Name}
                width={60} height={60}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          )}
          <span className="text-[11px] font-bold text-[#7c7483] mb-1 truncate max-w-[80px] text-center">
            {labelLeft}
          </span>
          <span className="font-serif font-black text-[32px] text-[#310065] leading-none">
            {player1Score}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1">
          <Swords className="w-6 h-6 text-[#cdc3d4]" strokeWidth={1.5} />
          {/* Round dots */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: totalRounds }, (_, i) => {
              const round = i + 1;
              const isComplete = round < currentRound;
              const isCurrent = round === currentRound;
              return (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    isComplete ? 'bg-[#4a148c]' : isCurrent ? 'bg-[#4a148c]/40 ring-2 ring-[#4a148c]/20' : 'bg-[#f5f3f7]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Player 2 */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative">
            {player2Id ? (
              <Link href={`/profile/${player2Id}`} className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-[#cdc3d4]/40 shadow-md mb-2 hover:opacity-80 transition-opacity block">
                <Image
                  src={player2Avatar}
                  alt={player2Name}
                  width={60} height={60}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </Link>
            ) : (
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-[#cdc3d4]/40 shadow-md mb-2">
                <Image
                  src={player2Avatar}
                  alt={player2Name}
                  width={60} height={60}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
            {otherOpponentsCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#310065] rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">
                +{otherOpponentsCount}
              </div>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#7c7483] mb-1 truncate max-w-[80px] text-center">
            {p2Label}{otherOpponentsCount > 0 ? ' y otros' : ''}
          </span>
          <span className="font-serif font-black text-[32px] text-[#310065] leading-none">
            {player2Score}
          </span>
        </div>
      </div>
    </div>
  );
}
