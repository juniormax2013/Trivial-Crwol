'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Zap, Coins, Trophy, ChevronRight, CheckCircle2, Clock, Lock } from 'lucide-react';
import { getMockDailyChallenge } from '@/lib/daily-challenge/seed';
import { getUserDailyChallengeData } from '@/lib/daily-challenge/repository';
import { getChallengeAvailabilityStatus, getCountdownToMidnight } from '@/lib/daily-challenge/service';
import type { DailyChallengeModel, UserChallengeData, ChallengeAvailabilityStatus } from '@/lib/daily-challenge/models';

import { useLanguage, useT } from '@/lib/i18n/context';
import { useMockAuth } from '@/hooks/useMockAuth';
import { useAuthContext } from '@/components/auth/AuthProvider';

export default function DailyChallengeCard() {
  const { language, isLoaded } = useLanguage();
  const t = useT();
  const { currentUid: DEMO_UID } = useMockAuth();
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  const [challenge, setChallenge] = useState<DailyChallengeModel | null>(null);
  const [userData, setUserData] = useState<UserChallengeData | null>(null);
  const [status, setStatus] = useState<ChallengeAvailabilityStatus>('loading');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const load = async () => {
      if (!isLoaded) return;
      const ch = getMockDailyChallenge(language);
      const activeUid = user?.uid || DEMO_UID;
      const ud = await getUserDailyChallengeData(activeUid);
      setChallenge(ch);
      setUserData(ud);
      setStatus(getChallengeAvailabilityStatus(ch, ud, activeUid, user?.email));
    };
    load();
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isLoaded, DEMO_UID, user]);

  // Countdown ticker (only when completed)
  useEffect(() => {
    if (status !== 'completed') return;
    const tick = () => setCountdown(getCountdownToMidnight());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status]);

  // Skeleton while loading or SSR
  if (!mounted || status === 'loading') {
    return (
      <div className="rounded-[2rem] overflow-hidden bg-[#eddcff]/50 h-44 animate-pulse" />
    );
  }

  /* ────────────────────────────────────────────────
     COMPLETED state
  ──────────────────────────────────────────────── */
  if (status === 'completed') {
    return (
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1b1325] to-[#2a0f45] p-6 shadow-[0_8px_32px_rgba(49,0,101,0.2)]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#310065] rounded-full blur-[60px] -mr-16 -mt-16 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" strokeWidth={2} />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
              {t.daily.resultTitle}
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-white leading-tight mb-1">
            {challenge?.title || t.daily.title}
          </h3>
          <p className="text-white/50 text-[13px] mb-5">
            {t.daily.alreadyDoneDesc}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-[#e9c349]" />
              <span className="text-[12px] font-bold text-[#e9c349] tabular-nums">{countdown}</span>
            </div>
            {userData && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/30" />
                <span className="text-[12px] font-bold text-white">{userData.streakDays} {t.dashboard.days.toLowerCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────
     UNAVAILABLE / NO CHALLENGE state
  ──────────────────────────────────────────────── */
  if (status === 'unavailable' || status === 'no_challenge') {
    return (
      <div className="relative rounded-[2rem] overflow-hidden bg-[#f5f3f7] border border-[#310065]/10 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#eddcff]/50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#7c7483]" />
          </div>
          <div>
            <h3 className="font-bold text-[#1b1b1e] text-[16px]">Sin desafío disponible</h3>
            <p className="text-[#7c7483] text-[12px]">Vuelve más tarde</p>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────
     AVAILABLE state (main card)
  ──────────────────────────────────────────────── */
  return (
    <Link href="/daily-challenge" className="block group">
      <div className="relative rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(49,0,101,0.18)] transition-transform duration-300 group-active:scale-[0.98]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#310065] via-[#4a148c] to-[#7345b6]" />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#cba72f] rounded-full blur-[80px] -mr-20 -mt-20 opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#d7baff] rounded-full blur-[60px] -ml-16 -mb-16 opacity-15 pointer-events-none" />

        <div className="relative z-10 p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#e9c349]/20 border border-[#e9c349]/40 flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#e9c349] fill-[#e9c349]/40" />
              </div>
              <span className="text-[10px] font-bold text-[#e9c349] uppercase tracking-[0.2em]">
                {t.dashboard.dailyChallenge}
              </span>
            </div>

            {/* Streak badge */}
            {userData && userData.streakDays > 0 && (
              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
                <Flame className="w-3 h-3 text-orange-300 fill-orange-300/40" />
                <span className="text-[11px] font-bold text-white/90">
                  {userData.streakDays} {t.dashboard.days.toLowerCase()}
                </span>
              </div>
            )}
          </div>

          {/* Title & description */}
          <h3 className="font-serif text-[22px] font-bold text-white leading-tight mb-2">
            {challenge?.title || t.daily.title}
          </h3>
          <p className="text-white/70 text-[13px] leading-relaxed mb-5 max-w-[280px]">
            {challenge?.description || t.daily.subtitle}
          </p>

          {/* Reward chips */}
          {challenge && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {challenge.reward.xp > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-[#e9c349] fill-[#e9c349]/40" />
                  <span className="text-[12px] font-bold text-white">+{challenge.reward.xp} XP</span>
                </div>
              )}
              {challenge.reward.coins > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Coins className="w-3.5 h-3.5 text-[#cba72f]" />
                  <span className="text-[12px] font-bold text-white">+{challenge.reward.coins}</span>
                </div>
              )}
              {challenge.reward.crowns > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Trophy className="w-3.5 h-3.5 text-[#cba72f] fill-[#cba72f]/40" />
                  <span className="text-[12px] font-bold text-white">+{challenge.reward.crowns}</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                <span className="text-[12px] font-medium text-white/70">
                  {challenge.questionIds.length} {t.daily.question.toLowerCase()}s
                </span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button className="w-full py-3.5 bg-gradient-to-r from-[#e9c349] to-[#cba72f] text-[#241a00] font-black rounded-[1.25rem] shadow-[0_4px_16px_rgba(115,92,0,0.3)] flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.97] transition-all text-[14px] tracking-wide uppercase">
            {t.daily.startChallenge}
            <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    </Link>
  );
}
