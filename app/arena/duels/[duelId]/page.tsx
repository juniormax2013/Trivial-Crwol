'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Swords,
  Crown,
  Clock,
  Play,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import DuelPlayerHeader from '@/components/duel/DuelPlayerHeader';
import DuelWaitingCard from '@/components/duel/DuelWaitingCard';
import DuelStatusBadge from '@/components/duel/DuelStatusBadge';
import { DuelModel, DuelRound } from '@/lib/duel/models';
import { getDuelById, getRoundsForDuel, acceptDuel, declineDuel, startDuel, subscribeToDuelById } from '@/lib/duel/repository';
import {
  getDuelViewState,
  getDuelStatusLabel,
  formatTimeAgo,
  formatTimeUntil,
  getOutcome,
  buildDuelResult,
  calculateDuelRewards,
} from '@/lib/duel/service';

import { useAuthContext } from '@/components/auth/AuthProvider';

export default function DuelDetailPage({ params }: { params: Promise<{ duelId: string }> }) {
  const { user } = useAuthContext();
  const DEMO_UID = user?.uid || 'unknown-user';
  const { duelId } = use(params);
  const router = useRouter();

  const [duel, setDuel] = useState<DuelModel | null>(null);
  const [rounds, setRounds] = useState<DuelRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | 'start' | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    setIsLoading(true);

    const loadDuel = async () => {
      // First fetch rounds
      const r = await getRoundsForDuel(duelId);
      setRounds(r);
      
      unsubscribe = subscribeToDuelById(duelId, (d) => {
        setDuel(d);
        setIsLoading(false);
      });
    };

    loadDuel();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [duelId]);

  const handleAccept = async () => {
    if (!duel || actionLoading) return;
    setActionLoading('accept');
    try {
      const updated = await acceptDuel(duel.id, DEMO_UID);
      setDuel(updated);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!duel || actionLoading) return;
    setActionLoading('decline');
    try {
      const updated = await declineDuel(duel.id, DEMO_UID);
      setDuel(updated);
      router.push('/arena/duels');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async () => {
    if (!duel || actionLoading) return;
    setActionLoading('start');
    try {
      const updated = await startDuel(duel.id);
      setDuel(updated);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#faf9fc] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#4a148c]/20 border-t-[#4a148c] animate-spin" />
      </div>
    );
  }

  if (!duel) {
    return (
      <div className="bg-[#faf9fc] min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-[#cdc3d4]" />
        <h2 className="font-serif text-[22px] font-bold text-[#310065]">Duelo no encontrado</h2>
        <Link href="/arena/duels" className="text-[#4a148c] font-bold">Volver a Arena</Link>
      </div>
    );
  }

  const vs = getDuelViewState(duel, DEMO_UID);
  const statusInfo = getDuelStatusLabel(duel, DEMO_UID);
  const outcome = getOutcome(duel, DEMO_UID);

  const me = duel.participants[DEMO_UID];
  // A guest can receive an invitation even if the duel is already active
  const isReceived = (duel.status === 'pending' || duel.status === 'active') && me?.status === 'pending';
  const isSent     = duel.status === 'pending' && duel.createdBy === DEMO_UID;
  const isAccepted = duel.status === 'pending' && me?.status === 'accepted';
  const isActive   = duel.status === 'active';
  const isDone     = ['completed', 'expired', 'declined', 'cancelled'].includes(duel.status);
  
  // Waiting logic:
  // - Creator waiting for responses in pending
  // - Guest who accepted waiting for creator to start
  // - Anyone in active state whose turn it isn't
  const isWaiting  = (isSent && !isReceived) || isAccepted || (isActive && !vs.isMyTurn && me?.status === 'accepted');

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/90 backdrop-blur-xl border-b border-[#1b1b1e]/5">
        <div className="flex items-center gap-3 px-5 py-4 max-w-screen-xl mx-auto">
          <Link
            href="/arena/duels"
            className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7c7483] truncate">
              vs. {vs.opponentName}
            </p>
            <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight">
              Duelo Multijugador
            </h1>
          </div>
          <DuelStatusBadge label={statusInfo.label} color={statusInfo.color} pulse={isActive && vs.isMyTurn} />
        </div>
      </header>

      <main className="pt-[88px] px-5 max-w-screen-xl mx-auto space-y-5 mt-4">

        {/* Score Header */}
        <DuelPlayerHeader
          player1Name={vs.myName}
          player1Avatar={vs.myAvatar}
          player1Score={vs.myScore}
          player1Id={vs.myId}
          player2Name={vs.opponentName}
          player2Avatar={vs.opponentAvatar}
          player2Score={vs.theirScore}
          player2Id={vs.opponentId}
          currentRound={duel.currentRound}
          totalRounds={duel.totalRounds}
          participantsCount={Object.keys(duel.participants).length}
        />

        {/* ── RECEIVED: Accept / Decline ── */}
        {isReceived && (
          <div className="bg-white rounded-[2rem] p-6 border border-[#4a148c]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#4a148c]/10 shrink-0">
                <Image src={duel.participants[duel.createdBy]?.avatarUrl || 'https://api.dicebear.com/9.x/notionists/svg?seed=creator'} alt="Creador" width={48} height={48} className="w-full h-full object-cover" unoptimized />
              </div>
              <div>
                <p className="font-bold text-[#1b1b1e] text-[15px]">{duel.participants[duel.createdBy]?.name || 'Un guerrero'}</p>
                <p className="text-[12px] text-[#7c7483]">te invitó a un duelo {formatTimeAgo(duel.createdAt)}</p>
              </div>
            </div>

            <div className="bg-[#faf9fc] rounded-[1.25rem] p-4 mb-5 space-y-2">
              <div className="flex justify-between">
                <span className="text-[12px] text-[#7c7483]">Participantes</span>
                <span className="text-[12px] font-bold text-[#1b1b1e]">{Object.keys(duel.participants).length} jugadores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[#7c7483]">Categorías</span>
                <span className="text-[12px] font-bold text-[#1b1b1e]">{duel.selectedCategories.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[#7c7483]">Dificultad</span>
                <span className="text-[12px] font-bold text-[#1b1b1e] capitalize">{duel.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[#7c7483]">Expira en</span>
                <span className="text-[12px] font-bold text-amber-600">{formatTimeUntil(duel.expiresAt)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                disabled={actionLoading !== null}
                className="flex-1 py-3 rounded-[1rem] border border-[#1b1b1e]/10 text-[#7c7483] font-bold text-[14px] flex items-center justify-center gap-1.5 hover:bg-[#f5f3f7] transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {actionLoading === 'decline' ? 'Rechazando…' : 'Rechazar'}
              </button>
              <button
                onClick={handleAccept}
                disabled={actionLoading !== null}
                className="flex-[2] py-3 rounded-[1rem] bg-[#310065] text-white font-bold text-[14px] flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(49,0,101,0.25)] hover:bg-[#4a148c] transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading === 'accept' ? 'Aceptando…' : 'Unirse al duelo'}
              </button>
            </div>
          </div>
        )}

        {/* ── SENT/WAITING: Waiting for others to accept or finish ── */}
        {isWaiting && (
          <div className="space-y-4">
            <DuelWaitingCard
              opponentName={vs.opponentName}
              opponentAvatar={vs.opponentAvatar}
              message={
                isSent ? "Esperando que los invitados respondan para iniciar..." : 
                isAccepted ? "¡Aceptaste! Esperando que el creador inicie el duelo..." :
                "El duelo está en curso. Esperando que sea tu turno..."
              }
            />

            {/* Participants Status List */}
            <div className="bg-white rounded-[1.5rem] p-5 border border-[#1b1b1e]/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-[#7c7483]">
                  Estado de los jugadores
                </h4>
                {isSent && Object.values(duel.participants).some(p => p.uid !== DEMO_UID && p.status === 'accepted') && (
                  <button
                    onClick={handleStart}
                    disabled={actionLoading !== null}
                    className="text-[11px] font-black uppercase tracking-widest text-[#4a148c] bg-[#eddcff] px-3 py-1.5 rounded-full hover:bg-[#4a148c] hover:text-white transition-all disabled:opacity-50"
                  >
                    {actionLoading === 'start' ? 'Iniciando...' : 'Iniciar ahora'}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {Object.values(duel.participants).map((p) => (
                  <div key={p.uid} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#1b1b1e]/10">
                        <Image src={p.avatarUrl} alt={p.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                      </div>
                      <span className="text-[13px] font-bold text-[#1b1b1e]">{p.name} {p.uid === DEMO_UID ? '(Tú)' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.status === 'accepted' ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aceptó
                        </span>
                      ) : p.status === 'declined' ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rechazó
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {isSent && !Object.values(duel.participants).some(p => p.uid !== DEMO_UID && p.status === 'accepted') && (
                <p className="mt-4 text-[11px] text-[#7c7483] text-center italic">
                  Podrás iniciar el duelo en cuanto alguien acepte.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVE: your turn → CTA to play ── */}
        {isActive && vs.isMyTurn && (
          <div className={`rounded-[2rem] p-6 text-white shadow-[0_8px_32px_rgba(49,0,101,0.2)] ${
            duel.tiebreakerRoundNumber
              ? 'bg-gradient-to-br from-amber-500 to-orange-500'
              : 'bg-gradient-to-br from-[#310065] to-[#4a148c]'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className={`text-[11px] font-black uppercase tracking-widest ${
                duel.tiebreakerRoundNumber ? 'text-yellow-100' : 'text-emerald-300'
              }`}>
                {duel.tiebreakerRoundNumber ? '⚡ ¡Muerte Súbita!' : '¡Tu turno!'}
              </span>
            </div>
            <h3 className="font-serif text-[22px] font-black mb-1">
              {duel.tiebreakerRoundNumber ? 'Desempate — 1 pregunta' : `Ronda ${duel.currentRound}`}
            </h3>
            <p className="text-white/70 text-[13px] font-medium mb-6">
              Todos juegan al mismo tiempo. ¡Asegura tu ventaja!
            </p>
            <Link
              href={`/arena/duels/${duelId}/play`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white rounded-[1.25rem] text-[#310065] font-bold text-[17px] shadow-[0_4px_12px_rgba(255,255,255,0.2)] hover:opacity-90 transition-all active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-[#310065]" />
              {duel.tiebreakerRoundNumber ? '⚡ Jugar desempate' : 'Jugar ahora'}
            </Link>
          </div>
        )}

        {/* ── ROUNDS BREAKDOWN (always show if active/done) ── */}
        {(isDone || isActive) && rounds.length > 0 && (
          <div className="bg-white rounded-[2rem] p-6 border border-[#1b1b1e]/5">
            <h3 className="font-serif text-[18px] font-bold text-[#310065] mb-4">Rondas</h3>
            <div className="space-y-3">
              {rounds.map((r) => {
                const myScore = r.playerScores[DEMO_UID] || 0;
                // Get the top score of others for comparison
                const otherScores = Object.entries(r.playerScores).filter(([uid]) => uid !== DEMO_UID).map(([, s]) => s);
                const topOtherScore = otherScores.length > 0 ? Math.max(...otherScores) : 0;
                
                const iWon = r.status === 'completed' && myScore > topOtherScore;
                const tied = r.status === 'completed' && myScore === topOtherScore;

                return (
                  <div key={r.id} className="flex items-center justify-between py-3 border-b border-[#f5f3f7] last:border-0">
                    <div>
                      <p className="font-bold text-[#1b1b1e] text-[14px] flex items-center gap-1.5">
                        {r.isTiebreakerRound && <span className="text-amber-500 text-[12px]">⚡</span>}
                        {r.isTiebreakerRound ? 'Desempate' : `Ronda ${r.roundNumber}`}
                      </p>
                      <p className="text-[11px] text-[#7c7483]">{r.categoryName}</p>
                    </div>
                    {r.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-serif font-black text-[18px] ${iWon ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                          {myScore}
                        </span>
                        <span className="text-[#cdc3d4] text-[12px]">vs</span>
                        <span className={`font-serif font-black text-[18px] ${!iWon && !tied ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                          {topOtherScore}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${iWon ? 'bg-emerald-50 text-emerald-700' : tied ? 'bg-[#f5f3f7] text-[#7c7483]' : 'bg-red-50 text-red-600'}`}>
                          {iWon ? 'WON' : tied ? 'TIE' : 'LOST'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#cdc3d4] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> En curso
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COMPLETED: Result banner ── */}
        {isDone && duel.status === 'completed' && (
          <div className={`rounded-[2rem] p-6 text-white ${
            outcome === 'win'  ? 'bg-gradient-to-br from-emerald-700 to-emerald-500' :
            outcome === 'tie'  ? 'bg-gradient-to-br from-[#310065] to-[#4a148c]' :
                                 'bg-gradient-to-br from-[#3d3555] to-[#7c7483]'
          }`}>
            <p className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-2">Resultado final</p>
            <h3 className="font-serif text-[28px] font-black mb-1">
              {outcome === 'win' ? '¡Victoria!' : outcome === 'tie' ? '¡Empate honorable!' : 'Fin del duelo'}
            </h3>
            <div className="flex flex-col gap-1 mb-5">
              <p className="text-white/70 text-[13px] font-medium">
                Puntuación final: <span className="text-white font-bold">{vs.myScore} pts</span>
              </p>
              {isDone && (
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <span className="text-[11px] font-bold">+{calculateDuelRewards(duel, DEMO_UID).xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <span className="text-[11px] font-bold">+{calculateDuelRewards(duel, DEMO_UID).coins}</span>
                    <Image src="/icons/coin.png" alt="Coins" width={12} height={12} className="w-3 h-3" unoptimized />
                  </div>
                  {calculateDuelRewards(duel, DEMO_UID).crowns > 0 && (
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                      <span className="text-[11px] font-bold">+{calculateDuelRewards(duel, DEMO_UID).crowns}</span>
                      <Crown className="w-3 h-3 text-amber-300" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href="/arena/duels/new"
                className="flex-1 py-3 bg-white/20 rounded-[1rem] font-bold text-[14px] text-center hover:bg-white/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Revancha
              </Link>
              <Link
                href="/arena/duels"
                className="flex-1 py-3 bg-white rounded-[1rem] font-bold text-[14px] text-center hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-[#310065]"
              >
                <Swords className="w-4 h-4" /> Ver duelos
              </Link>
            </div>
          </div>
        )}

        {/* ── EXPIRED/DECLINED/CANCELLED ── */}
        {isDone && duel.status !== 'completed' && (
          <div className="bg-white rounded-[2rem] p-6 border border-[#1b1b1e]/5 flex flex-col items-center text-center">
            <AlertCircle className="w-10 h-10 text-[#cdc3d4] mb-3" />
            <h3 className="font-serif text-[18px] font-bold text-[#310065] mb-2">
              {duel.status === 'expired' ? 'Duelo expirado' :
               duel.status === 'declined' ? 'Duelo rechazado' : 'Duelo cancelado'}
            </h3>
            <p className="text-[#7c7483] text-[13px] mb-5">
              {duel.status === 'expired' ? 'El tiempo para responder ha terminado.' :
               duel.status === 'declined' ? 'Tu rival rechazó el desafío.' :
               'Este duelo fue cancelado.'}
            </p>
            <Link
              href="/arena/duels/new"
              className="bg-[#310065] text-white px-6 py-3 rounded-full font-bold text-[14px]"
            >
              Nuevo desafío
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
