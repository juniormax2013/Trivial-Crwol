'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Zap,
  Coins,
  BookOpen,
  Clock,
  Shield,
  ChevronRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { getTodayChallenge, getUserDailyChallengeData, resetDailyChallengeForTesting } from '@/lib/daily-challenge/repository';
import {
  getChallengeAvailabilityStatus,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/lib/daily-challenge/service';
import type {
  DailyChallengeModel,
  UserChallengeData,
  ChallengeAvailabilityStatus,
} from '@/lib/daily-challenge/models';
import { useAuthContext } from '@/components/auth/AuthProvider';
import GameModeHeader from '@/components/GameModeHeader';
import { useT, useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import { subscribeGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';

const IS_DEV = process.env.NODE_ENV === 'development';

export default function DailyChallengeIntroPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const t = useT();
  const { language } = useLanguage();
  const [challenge, setChallenge] = useState<DailyChallengeModel | null>(null);
  const [userData, setUserData] = useState<UserChallengeData | null>(null);
  const [status, setStatus] = useState<ChallengeAvailabilityStatus>('loading');
  const [resetting, setResetting] = useState(false);
  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeGameEngineConfig((config) => {
      setEngineConfig(config);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (engineConfig && !authLoading && user) {
      if (engineConfig.disabledGameModes?.dailyChallenge) {
        toast.error(t.play.modeDisabled || 'Este modo de juego está temporalmente desactivado.');
        router.replace('/arena');
      }
    }
  }, [engineConfig, user, authLoading, router, t]);

  const load = async () => {
    if (!user?.uid) return;
    
    const [ch, ud] = await Promise.all([
      getTodayChallenge(language),
      getUserDailyChallengeData(user.uid),
    ]);
    setChallenge(ch);
    setUserData(ud);
    setStatus(getChallengeAvailabilityStatus(ch, ud, user.uid, user.email));
  };

  useEffect(() => {
    if (!authLoading && user) {
      setStatus('loading');
      load();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, language]);

  const handleReset = async () => {
    if (!user) return;
    setResetting(true);
    await resetDailyChallengeForTesting(user.uid);
    await load();
    setResetting(false);
  };

  /* ─── LOADING ─── */
  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  /* ─── ALREADY COMPLETED ─── */
  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col">
        <GameModeHeader 
          title={t.daily.title} 
          subtitle={t.daily.subtitle}
          icon={<Flame className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={2} />} 
        />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 fill-emerald-600/20" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-black text-[#1b1b1e] mb-2">
              {t.daily.alreadyDone}
            </h1>
            <p className="text-[#7c7483] text-[15px] leading-relaxed">
              {t.daily.alreadyDoneDesc}
            </p>
          </div>
          {userData && (
            <div className="flex items-center gap-2 bg-[#eddcff] px-4 py-2.5 rounded-full">
              <Flame className="w-4 h-4 text-[#4a148c] fill-[#4a148c]/20" />
              <span className="font-bold text-[#310065] text-[14px]">
                {t.daily.streakMsg.replace('{n}', String(userData.monthlyStreakDays ?? userData.streakDays ?? 0))}
              </span>
            </div>
          )}
          <Link
            href="/arena"
            className="w-full max-w-sm py-3.5 bg-[#310065] text-white font-bold rounded-2xl text-center text-[14px] uppercase tracking-wide hover:bg-[#4a148c] transition-colors"
          >
            {t.daily.backHome}
          </Link>
          {IS_DEV && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 text-[12px] text-[#7c7483] hover:text-[#310065] transition-colors"
            >
              {resetting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              [DEV] Resetear para probar
            </button>
          )}
        </main>
      </div>
    );
  }

  /* ─── NO CHALLENGE / UNAVAILABLE ─── */
  if (status === 'no_challenge' || status === 'unavailable') {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col">
        <GameModeHeader 
          title={t.daily.title} 
          subtitle={t.daily.subtitle}
          icon={<Flame className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={2} />} 
        />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <p className="font-serif text-2xl font-bold text-[#1b1b1e]">{t.daily.subtitle}</p>
          <p className="text-[#7c7483] text-[15px]">{t.daily.alreadyDoneDesc}</p>
          <Link href="/arena" className="text-[#310065] font-semibold text-[14px] underline underline-offset-4">
            {t.daily.backHome}
          </Link>
        </main>
      </div>
    );
  }

  /* ─── AVAILABLE (main intro screen) ─── */
  const diffLabel = challenge
    ? (challenge.difficulty === 'hard' ? t.daily.diffHard : challenge.difficulty === 'easy' ? t.daily.diffEasy : t.daily.diffMedium)
    : '';
  const diffColor = challenge ? getDifficultyColor(challenge.difficulty) : '';
  const estimatedMinutes = challenge
    ? Math.ceil((challenge.questionIds.length * 20) / 60)
    : 0;

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col font-sans selection:bg-[#eddcff]">
      {/* ── HEADER ── */}
      <GameModeHeader 
        title={challenge?.title ?? t.daily.title} 
        subtitle={t.daily.subtitle}
        icon={<Flame className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={2} />} 
      />

      {/* ── BODY ── */}
      <main className="flex-1 px-6 py-8 max-w-lg mx-auto w-full space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#310065]/5 flex flex-col gap-2">
            <BookOpen className="w-6 h-6 text-[#310065]" strokeWidth={2} />
            <div>
              <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-0.5">{t.daily.question}</p>
              <p className="text-xl font-bold font-serif text-[#1b1b1e]">
                {challenge?.questionIds.length ?? 5}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#310065]/5 flex flex-col gap-2">
            <Clock className="w-6 h-6 text-[#310065]" strokeWidth={2} />
            <div>
              <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-0.5">{t.daily.timeLeft}</p>
              <p className="text-xl font-bold font-serif text-[#1b1b1e]">~{estimatedMinutes} min</p>
            </div>
          </div>
        </div>

        {/* Rewards */}
        {challenge && (
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#310065]/5">
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-4">
              {t.duel.reward}
            </p>
            <div className="space-y-3.5">
              {challenge.reward.xp > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#eddcff] flex items-center justify-center">
                      <Zap className="w-4.5 h-4.5 text-[#4a148c] fill-[#4a148c]/20" />
                    </div>
                    <span className="font-semibold text-[#1b1b1e] text-[15px]">{t.daily.xpEarned}</span>
                  </div>
                  <span className="font-bold text-[#4a148c] text-[16px]">+{challenge.reward.xp} XP</span>
                </div>
              )}
              {challenge.reward.coins > 0 && (
                <>
                  <div className="h-px bg-[#efedf1]" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#ffe088] flex items-center justify-center">
                        <Coins className="w-4.5 h-4.5 text-[#735c00]" />
                      </div>
                      <span className="font-semibold text-[#1b1b1e] text-[15px]">{t.common.play}</span>
                    </div>
                    <span className="font-bold text-[#735c00] text-[16px]">+{challenge.reward.coins}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="bg-[#f5f3f7] rounded-[1.5rem] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#310065]" strokeWidth={2} />
            <p className="text-[10px] font-bold text-[#310065] uppercase tracking-widest">{t.daily.rulesTitle}</p>
          </div>
          <ul className="space-y-2">
            {[
              t.daily.rule1,
              t.daily.rule2,
              t.daily.rule3,
              t.daily.rule4,
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#4a4452] leading-snug">
                <span className="w-5 h-5 rounded-full bg-[#eddcff] text-[#310065] text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Streak info */}
        {userData && (userData.monthlyStreakDays ?? userData.streakDays ?? 0) > 0 && (
          <div className="flex items-center gap-3 bg-[#fffbeb] border border-[#e9c349]/30 rounded-2xl px-5 py-4">
            <Flame className="w-6 h-6 text-[#cba72f] fill-[#cba72f]/30 flex-shrink-0" />
            <div>
              <p className="font-bold text-[#4e3d00] text-[14px]">
                {t.daily.streakMsg.replace('{n}', String(userData.monthlyStreakDays ?? userData.streakDays))}
              </p>
              <p className="text-[#735c00] text-[12px]">
                {t.daily.streakContinue}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── CTA FIXED FOOTER ── */}
      <div className="sticky bottom-0 bg-white border-t border-[#310065]/5 px-6 py-5 shadow-[0_-8px_30px_rgba(49,0,101,0.08)] pb-safe">
        <div className="max-w-lg mx-auto w-full space-y-3">
          <button
            onClick={() => router.push('/daily-challenge/play')}
            className="w-full py-4 bg-[#310065] hover:bg-[#4a148c] text-white font-black rounded-[1.5rem] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(49,0,101,0.25)] active:scale-[0.98] transition-all text-[15px] uppercase tracking-wide"
          >
            {t.daily.startChallenge}
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>

          {/* DEV Reset button */}
          {IS_DEV && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full py-2.5 text-[12px] text-[#7c7483] flex items-center justify-center gap-1.5 hover:text-[#310065] transition-colors"
            >
              {resetting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              [DEV] Resetear estado diario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
