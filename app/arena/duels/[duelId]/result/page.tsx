'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Swords, RotateCcw, Share2, AlertCircle } from 'lucide-react';
import DuelResultBanner from '@/components/duel/DuelResultBanner';
import { DuelResult } from '@/lib/duel/models';
import { getDuelById, getRoundsForDuel, saveDuelResult } from '@/lib/duel/repository';
import { updateUserStats } from '@/lib/user/repository';
import { buildDuelResult } from '@/lib/duel/service';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DuelResultPage({ params }: { params: Promise<{ duelId: string }> }) {
  const { user, loading: authLoading } = useAuthContext();
  const { duelId } = use(params);

  const [result, setResult] = useState<DuelResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until auth is resolved so we always have the real UID
    if (authLoading) return;
    if (!user?.uid) {
      setError('Debes iniciar sesión para ver el resultado.');
      setIsLoading(false);
      return;
    }

    const uid = user.uid;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [duel, rounds] = await Promise.all([
          getDuelById(duelId),
          getRoundsForDuel(duelId),
        ]);

        if (!duel) {
          setError('No se encontró el duelo.');
          return;
        }

        if (duel.status !== 'completed') {
          setError('El duelo aún no ha terminado.');
          return;
        }

        // Build the result from the user's perspective
        const r = buildDuelResult(duel, rounds, uid);
        setResult(r);

        // ── Idempotent reward grant ─────────────────────────────
        // We store a flag in the duel doc to prevent double-awarding.
        // Key: `rewardsGranted_<playerId>` → true
        const rewardKey = `rewardsGranted_${uid}`;
        const duelRef = doc(db, 'duels', duelId);
        const freshSnap = await getDoc(duelRef);
        const alreadyGranted = freshSnap.data()?.[rewardKey] === true;

        if (!alreadyGranted) {
          // Mark first so crashes don't double-grant
          await updateDoc(duelRef, { [rewardKey]: true });

          // Compute total questions played across all rounds
          const totalQuestionsPlayed = rounds.reduce(
            (sum, round) => sum + (round.questionIds?.length ?? 0),
            0
          );

          // Always update stats (even for losses — partial XP)
          try {
            await updateUserStats(uid, {
              xp:     r.xpEarned,
              coins:  r.coinsEarned,
              crowns: r.crownsEarned,
              isWin:  r.outcome === 'win',
              isTie:  r.outcome === 'tie',
              isLoss: r.outcome === 'loss',
              correctAnswers:      r.correctAnswers.mine,
              totalQuestionsPlayed,
            });
          } catch (statError) {
            console.error('[DuelResult] Error updating user stats:', statError);
            // Rollback if stats couldn't be granted so it can be retried on reload
            await updateDoc(duelRef, { [rewardKey]: false });
            throw statError;
          }

          // Save result to history
          try {
            await saveDuelResult(r);
          } catch (historyError) {
            // Usually fails if Firestore Security Rules for duel_results are missing,
            // we catch it to prevent breaking the flow since stats were already updated!
            console.warn('[DuelResult] Error saving to duel history:', historyError);
          }
        }
      } catch (err) {
        console.error('[DuelResult] Error loading result:', err);
        setError('Error al cargar el resultado. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [duelId, user?.uid, authLoading]);

  // ── Loading states ─────────────────────────────────────────────
  if (authLoading || isLoading) {
    return (
      <div className="bg-[#faf9fc] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#4a148c]/20 border-t-[#4a148c] animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-[#faf9fc] min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-[#cdc3d4]" />
        <h2 className="font-serif text-[22px] font-bold text-[#310065]">
          {error ?? 'No se pudo cargar el resultado'}
        </h2>
        <Link href="/arena/duels" className="text-[#4a148c] font-bold">Volver a Arena</Link>
      </div>
    );
  }

  const isWin  = result.outcome === 'win';
  const isTie  = result.outcome === 'tie';
  const isLoss = result.outcome === 'loss';

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">

      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4 max-w-screen-xl mx-auto">
        <Link
          href="/arena/duels"
          className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#7c7483]">Resultado</p>
          <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight">Duelo terminado</h1>
        </div>
      </header>

      <main className="px-5 max-w-screen-xl mx-auto space-y-5">

        {/* Banner */}
        <DuelResultBanner result={result} />

        {/* Rewards card — visible for ALL outcomes */}
        <div className={`rounded-[2rem] p-6 border ${
          isWin  ? 'bg-gradient-to-br from-[#ffe088]/30 to-[#ffe088]/10 border-[#cba72f]/20' :
          isTie  ? 'bg-gradient-to-br from-[#eddcff]/40 to-[#eddcff]/10 border-[#4a148c]/10' :
                   'bg-[#f5f3f7] border-[#1b1b1e]/5'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {isWin  && <span className="text-lg">🏆</span>}
            {isTie  && <span className="text-lg">🤝</span>}
            {isLoss && <span className="text-lg">📖</span>}
            <p className={`text-[10px] font-black uppercase tracking-widest ${
              isWin ? 'text-[#735c00]' : isTie ? 'text-[#4a148c]' : 'text-[#7c7483]'
            }`}>
              {isWin ? 'Recompensas obtenidas' : isTie ? 'Recompensas de empate' : 'XP de participación'}
            </p>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {/* XP — always shown */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#eddcff]/60 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <p className="font-black text-[#310065] text-[20px] leading-none">+{result.xpEarned}</p>
                <p className="text-[10px] font-bold text-[#4a148c] uppercase tracking-wider">XP</p>
              </div>
            </div>

            {/* Coins */}
            {result.coinsEarned > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#ffe088]/20 flex items-center justify-center">
                  <span className="text-xl">🪙</span>
                </div>
                <div>
                  <p className="font-black text-[#735c00] text-[20px] leading-none">+{result.coinsEarned}</p>
                  <p className="text-[10px] font-bold text-[#cba72f] uppercase tracking-wider">Monedas</p>
                </div>
              </div>
            )}

            {/* Crowns — only win/tie */}
            {result.crownsEarned > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#ffe088]/40 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={1} />
                </div>
                <div>
                  <p className="font-black text-[#735c00] text-[20px] leading-none">+{result.crownsEarned}</p>
                  <p className="text-[10px] font-bold text-[#cba72f] uppercase tracking-wider">Coronas</p>
                </div>
              </div>
            )}
          </div>

          {isLoss && (
            <p className="text-[11px] text-[#7c7483] mt-3 font-medium">
              Al ganar obtienes +{result.xpEarned * 5} XP, +{result.coinsEarned * 5} monedas y coronas. ¡A por la revancha!
            </p>
          )}
        </div>

        {/* Round breakdown */}
        {result.roundsDetail.length > 0 && (
          <div className="bg-white rounded-[2rem] p-6 border border-[#1b1b1e]/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="font-serif text-[18px] font-bold text-[#310065] mb-4">Desglose de rondas</h3>
            <div className="space-y-0">
              {result.roundsDetail.map((rd, idx) => {
                const iWon = rd.myScore > rd.theirScore;
                const tied = rd.myScore === rd.theirScore;
                const isDesempate = (rd as any).isTiebreakerRound === true;
                return (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-[#f5f3f7] last:border-0">
                    <div>
                      <p className="font-bold text-[#1b1b1e] text-[14px] flex items-center gap-1.5">
                        {isDesempate && <span className="text-amber-500 text-[12px]">⚡</span>}
                        {isDesempate ? 'Desempate' : `Ronda ${rd.roundNumber}`}
                      </p>
                      <p className="text-[11px] text-[#7c7483]">{rd.categoryName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-serif font-black text-[20px] ${iWon ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                        {rd.myScore}
                      </span>
                      <span className="text-[#cdc3d4] text-[13px]">vs</span>
                      <span className={`font-serif font-black text-[20px] ${!iWon && !tied ? 'text-[#310065]' : 'text-[#cdc3d4]'}`}>
                        {rd.theirScore}
                      </span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        iWon  ? 'bg-emerald-50 text-emerald-700' :
                        tied  ? 'bg-[#f5f3f7] text-[#7c7483]' :
                                'bg-red-50 text-red-600'
                      }`}>
                        {iWon ? 'WON' : tied ? 'TIE' : 'LOST'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          <Link
            href="/arena/duels/new"
            className="flex-1 py-4 rounded-[1.25rem] border-2 border-[#310065] text-[#310065] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#eddcff] transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Revancha
          </Link>
          <Link
            href="/arena/duels"
            className="flex-1 py-4 rounded-[1.25rem] bg-[#310065] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(49,0,101,0.25)] hover:bg-[#4a148c] transition-colors"
          >
            <Swords className="w-4 h-4" /> Mis duelos
          </Link>
        </div>

        {/* Share */}
        <button className="w-full py-4 rounded-[1.25rem] border border-dashed border-[#cdc3d4] text-[#7c7483] font-bold text-[14px] flex items-center justify-center gap-2 hover:border-[#4a148c]/30 hover:text-[#310065] hover:bg-[#faf9fc] transition-all">
          <Share2 className="w-4 h-4" />
          Compartir resultado
        </button>

      </main>
    </div>
  );
}
