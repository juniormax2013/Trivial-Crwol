'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Zap,
  Coins,
  Flame,
  Trophy,
  Clock,
  Home,
  Share2,
  Loader2,
} from 'lucide-react';
import { getMotivationalMessage, getCountdownToMidnight } from '@/lib/daily-challenge/service';
import type { DailyChallengeResult } from '@/lib/daily-challenge/models';

export default function DailyChallengeResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DailyChallengeResult | null>(null);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('daily_challenge_result');
    if (!raw) {
      // No result in session — redirect to challenge intro
      router.replace('/daily-challenge');
      return;
    }
    let parsed: DailyChallengeResult | null = null;
    try {
      parsed = JSON.parse(raw) as DailyChallengeResult;
    } catch {
      router.replace('/daily-challenge');
      return;
    }
    const timer = setTimeout(() => setResult(parsed), 0);
    return () => clearTimeout(timer);
  }, [router]);

  // Countdown to next challenge
  useEffect(() => {
    if (!result) return;
    const tick = () => setCountdown(getCountdownToMidnight());
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  const message = getMotivationalMessage(result.accuracyPercent);
  const isPerfect = result.accuracyPercent === 100;
  const isGood = result.accuracyPercent >= 60;

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col font-sans selection:bg-[#eddcff]">

      {/* ── HERO (gradient based on performance) ── */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 ${
            isPerfect
              ? 'bg-gradient-to-br from-[#1a4a1a] via-[#155a15] to-[#2e7d32]'
              : isGood
              ? 'bg-gradient-to-br from-[#310065] via-[#4a148c] to-[#7345b6]'
              : 'bg-gradient-to-br from-[#2c1100] via-[#4e2000] to-[#7a3a00]'
          }`}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] -mr-24 -mt-24 opacity-10 pointer-events-none" />

        <div className="relative z-10 px-6 pt-14 pb-10 text-center">
          {/* Completion icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-white/15 border border-white/20 flex items-center justify-center mb-5">
            {isPerfect ? (
              <Trophy className="w-10 h-10 text-[#e9c349] fill-[#e9c349]/30" />
            ) : isGood ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-300 fill-emerald-300/20" strokeWidth={1.5} />
            ) : (
              <XCircle className="w-10 h-10 text-orange-300" strokeWidth={1.5} />
            )}
          </div>

          {/* Badge */}
          <span className="inline-block text-[10px] font-bold text-white/60 uppercase tracking-[0.25em] mb-2">
            Desafío Completado
          </span>

          {/* Title */}
          <h1 className="font-serif text-2xl font-black text-white mb-1 leading-tight">
            {result.title}
          </h1>

          {/* Motivational message */}
          <p className="text-white/70 text-[14px] leading-relaxed px-4">{message}</p>

          {/* Accuracy big number */}
          <div className="mt-6 flex items-end justify-center gap-1">
            <span className="font-serif text-[72px] font-black text-white leading-none">
              {result.accuracyPercent}
            </span>
            <span className="font-serif text-3xl font-bold text-white/60 mb-3">%</span>
          </div>
          <p className="text-white/50 text-[12px] uppercase tracking-widest">Precisión</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <main className="flex-1 px-5 py-7 max-w-lg mx-auto w-full space-y-5">

        {/* Score stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="font-serif text-2xl font-black text-[#310065]">{result.score}</p>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-wider mt-0.5">Puntos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="font-serif text-2xl font-black text-emerald-600">{result.correctAnswers}</p>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-wider mt-0.5">Aciertos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="font-serif text-2xl font-black text-[#ba1a1a]">{result.wrongAnswers}</p>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-wider mt-0.5">Errores</p>
          </div>
        </div>

        {/* Rewards earned */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#310065]/5">
          <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-4">
            Recompensas obtenidas
          </p>
          <div className="space-y-3.5">
            {result.xpEarned > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eddcff] flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#4a148c] fill-[#4a148c]/20" />
                  </div>
                  <span className="font-semibold text-[#1b1b1e] text-[15px]">Experiencia</span>
                </div>
                <span className="font-black text-[#4a148c] text-[16px]">+{result.xpEarned} XP</span>
              </div>
            )}

            {result.coinsEarned > 0 && (
              <>
                <div className="h-px bg-[#efedf1]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ffe088] flex items-center justify-center">
                      <Coins className="w-4 h-4 text-[#735c00]" />
                    </div>
                    <span className="font-semibold text-[#1b1b1e] text-[15px]">Monedas</span>
                  </div>
                  <span className="font-black text-[#735c00] text-[16px]">+{result.coinsEarned}</span>
                </div>
              </>
            )}

            {result.gemsEarned > 0 && (
              <>
                <div className="h-px bg-[#efedf1]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <span className="text-lg">💎</span>
                    </div>
                    <span className="font-semibold text-[#1b1b1e] text-[15px]">Gemas</span>
                  </div>
                  <span className="font-black text-blue-700 text-[16px]">+{result.gemsEarned}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Streak card */}
        <div className="bg-gradient-to-r from-[#fffbeb] to-[#fef9e7] border border-[#e9c349]/30 rounded-[1.5rem] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe088] flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-[#735c00] fill-[#cba72f]/40" />
          </div>
          <div className="flex-1">
            <p className="font-black text-[#4e3d00] text-[18px] leading-none">
              {result.monthlyStreakDays ?? result.streakDays} días de racha (en el mes)
            </p>
            <p className="text-[#735c00] text-[12px] mt-0.5">
              {(result.monthlyStreakDays ?? result.streakDays) === 1
                ? '¡Empieza un mes increíble!'
                : '¡Sigue así, no rompas tu racha mensual!'}
            </p>
          </div>
        </div>

        {/* Next challenge countdown */}
        <div className="bg-[#f5f3f7] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7c7483]" />
            <span className="text-[13px] font-medium text-[#7c7483]">Próximo desafío</span>
          </div>
          <span className="font-bold text-[#1b1b1e] text-[15px] tabular-nums">{countdown}</span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 pb-6">
          <Link
            href="/"
            className="w-full py-4 bg-[#310065] hover:bg-[#4a148c] text-white font-black rounded-[1.5rem] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(49,0,101,0.2)] active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Bible Crown',
                  text: `¡Completé el Desafío Diario con ${result.accuracyPercent}% de precisión! 🏆`,
                });
              }
            }}
            className="w-full py-3.5 border-2 border-[#310065]/20 text-[#310065] font-bold rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-[#eddcff]/50 active:scale-[0.98] transition-all text-[14px]"
          >
            <Share2 className="w-4 h-4" />
            Compartir resultado
          </button>
        </div>
      </main>
    </div>
  );
}
