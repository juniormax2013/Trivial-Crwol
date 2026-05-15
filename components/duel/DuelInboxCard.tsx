'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, Swords, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import DuelStatusBadge from './DuelStatusBadge';
import { DuelModel } from '@/lib/duel/models';
import { getDuelViewState, getDuelStatusLabel, formatTimeAgo, formatTimeUntil } from '@/lib/duel/service';
import { acceptDuel, declineDuel } from '@/lib/duel/repository';
import { useState, useEffect } from 'react';

import { useAuthContext } from '@/components/auth/AuthProvider';

interface DuelInboxCardProps {
  duel: DuelModel;
  onAction?: (updatedDuel: DuelModel) => void;
  showActions?: boolean;
}

export default function DuelInboxCard({ duel, onAction, showActions = true }: DuelInboxCardProps) {
  const { user } = useAuthContext();
  const DEMO_UID = user?.uid || 'unknown-user';
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const vs = getDuelViewState(duel, DEMO_UID);
  const statusInfo = getDuelStatusLabel(duel, DEMO_UID);

  const canAccept = duel.status === 'pending' && duel.createdBy !== DEMO_UID && showActions;
  const isMyTurn = vs.ctaType === 'play';

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading('accept');
    try {
      const updated = await acceptDuel(duel.id, DEMO_UID);
      onAction?.(updated);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading('decline');
    try {
      const updated = await declineDuel(duel.id, DEMO_UID);
      onAction?.(updated);
    } finally {
      setIsLoading(null);
    }
  };

  const href =
    vs.ctaType === 'play'
      ? `/arena/duels/${duel.id}/play`
      : `/arena/duels/${duel.id}`;

  const otherParticipantsCount = Object.keys(duel.participants).length - 1;

  if (!mounted) {
    return (
      <div className="h-48 bg-gray-100 animate-pulse rounded-[1.75rem] border border-black/5" />
    );
  }

  return (
    <Link
      href={href}
      className="block bg-white rounded-[1.75rem] p-5 border border-[#1b1b1e]/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(49,0,101,0.07)] transition-all group active:scale-[0.99]"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <DuelStatusBadge
          label={statusInfo.label}
          color={statusInfo.color}
          pulse={isMyTurn || (duel.status === 'pending' && duel.participants[DEMO_UID]?.status === 'pending')}
        />
        <span className="text-[10px] text-[#cdc3d4] font-semibold">
          {mounted && (duel.status === 'pending'
            ? formatTimeUntil(duel.expiresAt)
            : formatTimeAgo(duel.lastActionAt))}
        </span>
      </div>

      {/* Players row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#4a148c]/15 shrink-0 shadow-sm">
          <Image
            src={vs.myAvatar}
            alt="Mi avatar"
            width={44}
            height={44}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        {/* Scores */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {duel.status === 'completed' || duel.status === 'active' ? (
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-[#310065] text-[19px] leading-none">
                {vs.myScore}
              </span>
              <Swords className="w-4 h-4 text-[#cdc3d4]" strokeWidth={1.5} />
              <span className="font-serif font-black text-[#7c7483] text-[19px] leading-none">
                {vs.theirScore}
              </span>
            </div>
          ) : (
            <Swords className="w-5 h-5 text-[#cdc3d4]" strokeWidth={1.5} />
          )}
        </div>

        {/* Opponent avatar / Group indicator */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#cdc3d4]/30 shadow-sm">
            <Image
              src={vs.opponentAvatar}
              alt={vs.opponentName}
              width={44}
              height={44}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          {otherParticipantsCount > 1 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#310065] rounded-full border border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm">
              +{otherParticipantsCount - 1}
            </div>
          )}
        </div>
      </div>

      {/* Names */}
      <div className="flex justify-between mb-3">
        <span className="text-[11px] font-bold text-[#310065] truncate max-w-[100px]">Tú</span>
        <span className="text-[11px] font-bold text-[#7c7483] truncate max-w-[120px] text-right">
          {vs.opponentName}{otherParticipantsCount > 1 ? ' y otros' : ''}
        </span>
      </div>

      {/* Round progress pills */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-[10px] text-[#cdc3d4] font-semibold mr-1">Ronda</span>
        {Array.from({ length: duel.totalRounds }, (_, i) => {
          const round = i + 1;
          const isComplete = round < duel.currentRound;
          const isCurrent = round === duel.currentRound && duel.status === 'active';
          return (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                isComplete
                  ? 'bg-[#4a148c]'
                  : isCurrent
                  ? 'bg-[#4a148c]/40'
                  : 'bg-[#f5f3f7]'
              }`}
            />
          );
        })}
        <span className="text-[10px] text-[#cdc3d4] font-semibold ml-1">
          {duel.currentRound}/{duel.totalRounds}
        </span>
      </div>

      {/* Reward chip */}
      <div className="flex items-center gap-1.5 mb-4">
        <Crown className="w-3.5 h-3.5 text-[#cba72f] fill-[#ffe088]" strokeWidth={1} />
        <span className="text-[11px] font-black text-[#735c00]">
          {duel.rewardConfig.crowns} coronas · {duel.rewardConfig.xp} XP
        </span>
      </div>

      {/* CTA row */}
      {canAccept ? (
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleDecline}
            disabled={isLoading !== null}
            className="flex-1 py-3 rounded-[1rem] border border-[#1b1b1e]/10 text-[#7c7483] font-bold text-[13px] hover:bg-[#f5f3f7] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            {isLoading === 'decline' ? 'Rechazando…' : 'Rechazar'}
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading !== null}
            className="flex-[2] py-3 rounded-[1rem] bg-[#310065] text-white font-bold text-[13px] hover:bg-[#4a148c] transition-colors flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(49,0,101,0.25)] disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isLoading === 'accept' ? 'Aceptando…' : 'Aceptar duelo'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          {isMyTurn && (
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider animate-pulse">
              ¡Es tu turno!
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-[#4a148c] group-hover:gap-2 transition-all">
            <span className="text-[13px] font-bold">
              {vs.ctaType === 'play'
                ? 'Jugar'
                : vs.ctaType === 'wait'
                ? 'Ver duelo'
                : vs.ctaType === 'accept'
                ? 'Ver'
                : 'Ver resultados'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </Link>
  );
}
