'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Flame, Play, Calendar, Swords, Share2, Book, Landmark, Droplet, Heart } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/context';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationIcon from '@/components/notifications/NotificationIcon';

export default function Dashboard() {
  const { user } = useAuthContext();
  const t = useT();
  const { duelInvitations } = useNotifications();
  const pendingDuelsCount = duelInvitations.length;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-8">
      {/* TopAppBar */}
      <nav className="sticky top-0 w-full z-40 bg-white pt-safe">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center overflow-hidden border-2 border-primary-container/20 relative">
              <Image 
                src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuA5H4koFsQtazU2XokLfTghHi8STlFTmMUDtL0wQwJ8Xw9HVf74AEktBxceDNJuNHfmaJD4j2w4FIPevIMRlivcHv_1UfdbgzDYYzmsaSkCRIn3ia7Xvm3YlhST_8w4O0klPua17oUQWJYeQIwpGmoEyJSJC-goJVy6FYGYJSYfbpYAr4GtL1jy9_FpY4vd1Ivd68yW0TK3CliByvBULY6s1RNbg6sv-D-8o3yygacGSfhDs1Wx31PJNP5MvH0NwXGvGU4JaCCGrgY"} 
                alt="Profile" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.profile.level} {user?.level || 1}</span>
              <span className="text-xs font-bold text-primary">{user?.xp || 0} XP</span>
            </div>
          </div>
          <h1 className="text-lg font-black text-purple-900 tracking-tighter uppercase font-serif">Bible Crown</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-tertiary-fixed/30 px-3 py-1.5 rounded-full">
              <Crown className="text-tertiary w-4 h-4" />
              <span className="font-bold text-on-tertiary-container text-sm">{user?.crowns || 0}</span>
            </div>
            <NotificationIcon />
          </div>
        </div>
        <div className="h-[1px] w-full bg-zinc-200/50"></div>
      </nav>

      <main className="px-6 pt-6 space-y-8">
        {/* Greeting & Streak */}
        <section className="flex justify-between items-end">
          <div>
            <p className="text-zinc-500 font-medium text-sm">{t.dashboard.welcomeBack}</p>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">{t.dashboard.hello}, {user?.firstName || '👋'}</h2>
          </div>
          <div className="flex flex-col items-center bg-surface-container-low px-4 py-2 rounded-2xl">
            <div className="flex items-center gap-1 mb-0.5">
              <Flame className="text-tertiary-container w-5 h-5 fill-tertiary-container" />
              <span className="font-serif text-xl font-black text-on-surface">{user?.streakDays || 0}</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-tighter text-zinc-400">{t.dashboard.days}</span>
          </div>
        </section>

        {/* Main CTA: Play Now */}
        <section className="relative group active:scale-[0.98] transition-transform duration-300">
          <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-purple-600 opacity-90 z-10"></div>
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB21e_Nz-Je1AGq1g1XCzyNOlFwobFoJnxSh03g2uU1hqS89EFNauhOw4j6ZxWEv3cLNQBo8sHlUqsQYRQfr2gyLYMvEEJOpytspobv7o1i_tJgxobTRSyb99sa9Ok_5IaXpb4BWgFUaO58OnxFNIL8ulJ5BnFSh-TYXjCpC9DzbRAtI__iOOV4fMZMimLHm2m_HHRAY5Jrl7QOhJVA78xvniZ-5Et2NUQ12aTDXYd8bXaXEWz_-8qMrVK-_-pFKbdUQrzNTNxaEN8" 
              alt={t.dashboard.ascensionTitle}
              fill 
              className="object-cover mix-blend-overlay z-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
              <div className="space-y-1 mb-4">
                <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest inline-block">{t.dashboard.recommended}</span>
                <h3 className="font-serif text-3xl font-black text-white leading-tight">{t.dashboard.ascensionTitle}</h3>
              </div>
              <Link href="https://trivial-app-bcrown.web.app/arena" className="w-full py-3.5 bg-gradient-to-r from-tertiary-fixed-dim to-tertiary-container text-on-tertiary-fixed font-black rounded-2xl shadow-lg shadow-tertiary/20 flex items-center justify-center gap-2">
                {t.dashboard.playNow}
                <Play className="w-5 h-5 fill-current" />
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid: Daily & Duels */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/daily-challenge" className="bg-surface-container-low p-5 rounded-[2rem] flex flex-col justify-between border border-white/50 min-h-[140px] hover:bg-surface-container-low/80 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center mb-3">
              <Calendar className="text-on-secondary-container w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-base leading-tight mb-1">{t.dashboard.dailyChallenge}</h4>
              <p className="text-[10px] text-zinc-500 font-medium">{t.dashboard.dailyXp}</p>
            </div>
          </Link>

          <Link href="/arena/duels" className="bg-surface-container-low p-5 rounded-[2rem] flex flex-col justify-between border border-white/50 relative overflow-hidden min-h-[140px] hover:bg-surface-container-low/80 active:scale-[0.98] transition-all">
            {pendingDuelsCount > 0 && (
              <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-surface-container-low">
                {pendingDuelsCount}
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center mb-3">
              <Swords className="text-primary w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-base leading-tight mb-1">{t.dashboard.duels}</h4>
              <p className="text-[10px] text-zinc-500 font-medium">{t.dashboard.answerChallenges}</p>
            </div>
          </Link>
        </section>

        {/* Verse of the Day */}
        <section>
          <div className="bg-primary p-6 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tertiary-fixed-dim"></span>
                <span className="text-[10px] font-bold text-tertiary-fixed-dim uppercase tracking-[0.2em]">{t.dashboard.verseOfDay}</span>
              </div>
              <blockquote className="font-serif text-lg text-white font-bold leading-relaxed italic">
                &quot;Lámpara es a mis pies tu palabra, y lumbrera a mi camino.&quot;
              </blockquote>
              <div className="flex justify-between items-center pt-2">
                <span className="text-tertiary-fixed-dim font-bold font-serif text-base">Salmos 119:105</span>
                <button className="text-white/40 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-extrabold text-on-surface tracking-tight">{t.dashboard.categories}</h3>
            <button className="text-primary font-bold text-[10px] uppercase tracking-widest">{t.dashboard.seeAll}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            <div className="min-w-[110px] bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Book className="text-amber-600 w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-on-surface">{t.dashboard.parables}</span>
            </div>
            <div className="min-w-[110px] bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Landmark className="text-purple-600 w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-on-surface">{t.dashboard.prophets}</span>
            </div>
            <div className="min-w-[110px] bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Droplet className="text-blue-600 w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-on-surface">{t.dashboard.miracles}</span>
            </div>
            <div className="min-w-[110px] bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="text-rose-600 w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-on-surface">{t.dashboard.letters}</span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav activeTab="home" showTriggerButton={false} />
    </div>
  );
}
