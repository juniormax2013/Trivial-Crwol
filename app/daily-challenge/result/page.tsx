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
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/lib/i18n/context';

const RESULT_TRANSLATIONS: Record<string, any> = {
  es: {
    challengeCompleted: "Desafío Completado",
    accuracy: "Precisión",
    points: "Puntos",
    successes: "Aciertos",
    errors: "Errores",
    rewardsEarned: "Recompensas obtenidas",
    experience: "Experiencia",
    coins: "Monedas",
    gems: "Gemas",
    streakDays: (n: number) => `${n} ${n === 1 ? 'día' : 'días'} de racha (en el mes)`,
    streakStart: "¡Empieza un mes increíble!",
    streakContinue: "¡Sigue así, no rompas tu racha mensual!",
    nextChallenge: "Próximo desafío",
    goHome: "Volver al inicio",
    shareResult: "Compartir resultado",
    shareText: (percent: number) => `¡Completé el Desafío Diario con ${percent}% de precisión! 🏆`,
    challengeWon: "⚡ Reto Superado (x3)",
    challengeLost: "❌ Reto Fallido (x0.5)",
    bonusActive: "👑 Bonus x2 Activo",
    baseBonus: (base: number, bonus: number) => `Base: ${base} | Bonus: +${bonus}`,
  },
  en: {
    challengeCompleted: "Challenge Completed",
    accuracy: "Accuracy",
    points: "Points",
    successes: "Correct",
    errors: "Errors",
    rewardsEarned: "Rewards Earned",
    experience: "Experience",
    coins: "Coins",
    gems: "Gems",
    streakDays: (n: number) => `${n} day ${n === 1 ? 'streak' : 'streak'} (this month)`,
    streakStart: "Start an amazing month!",
    streakContinue: "Keep it up, don't break your monthly streak!",
    nextChallenge: "Next challenge",
    goHome: "Go to home",
    shareResult: "Share result",
    shareText: (percent: number) => `I completed the Daily Challenge with ${percent}% accuracy! 🏆`,
    challengeWon: "⚡ Challenge Beaten (x3)",
    challengeLost: "❌ Challenge Failed (x0.5)",
    bonusActive: "👑 Bonus x2 Active",
    baseBonus: (base: number, bonus: number) => `Base: ${base} | Bonus: +${bonus}`,
  },
  fr: {
    challengeCompleted: "Défi Complété",
    accuracy: "Précision",
    points: "Points",
    successes: "Succès",
    errors: "Erreurs",
    rewardsEarned: "Récompenses obtenues",
    experience: "Expérience",
    coins: "Pièces",
    gems: "Gemmes",
    streakDays: (n: number) => `${n} ${n === 1 ? 'jour' : 'jours'} de série (ce mois-ci)`,
    streakStart: "Commencez un mois incroyable !",
    streakContinue: "Continuez ainsi, ne brisez pas votre série mensuelle !",
    nextChallenge: "Prochain défi",
    goHome: "Retour à l'accueil",
    shareResult: "Partager le résultat",
    shareText: (percent: number) => `J'ai complété le Défi Quotidien avec ${percent}% de précision ! 🏆`,
    challengeWon: "⚡ Défi Réussi (x3)",
    challengeLost: "❌ Défi Échoué (x0.5)",
    bonusActive: "👑 Bonus x2 Actif",
    baseBonus: (base: number, bonus: number) => `Base : ${base} | Bonus : +${bonus}`,
  },
  ht: {
    challengeCompleted: "Defi Konplete",
    accuracy: "Presizyon",
    points: "Pwen",
    successes: "Aciertos", // map correctly to creole or keep consistency
    errors: "Erè",
    rewardsEarned: "Rekonpans Ou Jwenn",
    experience: "Eksperyans",
    coins: "Pyès",
    gems: "Gèm",
    streakDays: (n: number) => `${n} jou racha (nan mwa a)`,
    streakStart: "Kòmanse yon mwa enkwayab!",
    streakContinue: "Kontinye konsa, pa kase racha mwa w la!",
    nextChallenge: "Pwochen defi",
    goHome: "Tounen nan akèy",
    shareResult: "Pataje rezilta a",
    shareText: (percent: number) => `Mwen fini Defi Jounen an ak ${percent}% presizyon! 🏆`,
    challengeWon: "⚡ Reto Pase (x3)",
    challengeLost: "❌ Reto Echwe (x0.5)",
    bonusActive: "👑 Bonus x2 Aktif",
    baseBonus: (base: number, bonus: number) => `Baz: ${base} | Bonus: +${bonus}`,
  }
};

export default function DailyChallengeResultPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { language: userLanguage } = useLanguage();
  const [result, setResult] = useState<DailyChallengeResult | null>(null);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lang = ((userLanguage as string) === 'fr' || (userLanguage as string) === 'es' || (userLanguage as string) === 'en' || (userLanguage as string) === 'ht') ? (userLanguage as 'fr' | 'es' | 'en' | 'ht') : 'ht';
  const localT = RESULT_TRANSLATIONS[lang];

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
    const initialTick = setTimeout(tick, 0);
    timerRef.current = setInterval(tick, 1000);
    return () => {
      clearTimeout(initialTick);
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

  const message = getMotivationalMessage(result.accuracyPercent, lang);
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
            {localT.challengeCompleted}
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
          <p className="text-white/50 text-[12px] uppercase tracking-widest">{localT.accuracy}</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <main className="flex-1 px-5 py-7 max-w-lg mx-auto w-full space-y-5">

        {/* Score stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="font-serif text-2xl font-black text-[#310065]">{result.score}</p>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-wider mt-0.5">{localT.points}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="font-serif text-2xl font-black text-emerald-600">{result.correctAnswers}</p>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-wider mt-0.5">{localT.successes}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="font-serif text-2xl font-black text-[#ba1a1a]">{result.wrongAnswers}</p>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-wider mt-0.5">{localT.errors}</p>
          </div>
        </div>

        {/* Rewards earned */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#310065]/5 relative overflow-hidden">
          {/* Random Challenge Indicator */}
          {((result as any).challengeOutcome === 'won') && (
             <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-emerald-200 z-10">
               {localT.challengeWon}
             </div>
          )}
          {((result as any).challengeOutcome === 'lost') && (
             <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-red-200 z-10">
               {localT.challengeLost}
             </div>
          )}
          {/* Gold Frame Indicator */}
          {user && (user.activeFrame === 'gold' || user.activeFrame === 'crown' || user.activeFrame === 'gold_frame' || user.activeFrame === 'crow_frame') && (
            <div className={`absolute ${((result as any).challengeOutcome === 'won' || (result as any).challengeOutcome === 'lost') ? 'top-6 right-0 rounded-bl-xl border-t' : 'top-0 right-0 rounded-bl-xl'} bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 border-b border-l border-amber-200 z-10`}>
              {localT.bonusActive}
            </div>
          )}
          
          <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-4 mt-2">
            {localT.rewardsEarned}
          </p>
          <div className="space-y-3.5">
            {result.xpEarned > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eddcff] flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#4a148c] fill-[#4a148c]/20" />
                  </div>
                  <span className="font-semibold text-[#1b1b1e] text-[15px]">{localT.experience}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#4a148c] text-[16px]">+{result.xpEarned} XP</span>
                </div>
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
                    <span className="font-semibold text-[#1b1b1e] text-[15px]">{localT.coins}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#735c00] text-[16px]">+{result.coinsEarned}</span>
                    {user && (user.activeFrame === 'gold' || user.activeFrame === 'crown' || user.activeFrame === 'gold_frame' || user.activeFrame === 'crow_frame') && (
                      <div className="text-[10px] text-amber-600 font-bold tracking-wide mt-0.5">
                        {localT.baseBonus(result.coinsEarned / 2, result.coinsEarned / 2)}
                      </div>
                    )}
                  </div>
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
                    <span className="font-semibold text-[#1b1b1e] text-[15px]">{localT.gems}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-blue-700 text-[16px]">+{result.gemsEarned}</span>
                  </div>
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
              {localT.streakDays(result.monthlyStreakDays ?? result.streakDays)}
            </p>
            <p className="text-[#735c00] text-[12px] mt-0.5">
              {(result.monthlyStreakDays ?? result.streakDays) === 1
                ? localT.streakStart
                : localT.streakContinue}
            </p>
          </div>
        </div>

        {/* Next challenge countdown */}
        <div className="bg-[#f5f3f7] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7c7483]" />
            <span className="text-[13px] font-medium text-[#7c7483]">{localT.nextChallenge}</span>
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
            {localT.goHome}
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Bible Crown',
                  text: localT.shareText(result.accuracyPercent),
                });
              }
            }}
            className="w-full py-3.5 border-2 border-[#310065]/20 text-[#310065] font-bold rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-[#eddcff]/50 active:scale-[0.98] transition-all text-[14px]"
          >
            <Share2 className="w-4 h-4" />
            {localT.shareResult}
          </button>
        </div>
      </main>
    </div>
  );
}
