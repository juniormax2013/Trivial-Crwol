'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Map, RotateCcw, Trophy, ArrowLeft, Heart, Flame } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getUserHearts, getBibleStreak } from '@/lib/bible/repository';

export default function BibleJourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthContext();
  
  const [heartsState, setHeartsState] = useState<{ heartsRemaining: number; maxHearts: number } | null>(null);
  const [streakState, setStreakState] = useState<number>(0);

  // Sync Hearts and Streak states in the layout header
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const hearts = await getUserHearts(user.uid);
        setHeartsState(hearts);
        
        const streak = await getBibleStreak(user.uid);
        setStreakState(streak.currentStreak);
      } catch (err) {
        console.error("Error fetching header stats:", err);
      }
    };
    
    fetchStats();
    
    // Refresh stats periodically or when path changes
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#310065] border-t-amber-400 rounded-full animate-spin mb-4" />
        <p className="text-[#1b1b1e] font-bold text-sm tracking-wide font-sans">
          Cargando tu santuario de aprendizaje...
        </p>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    {
      label: 'Inicio',
      href: '/bible-journey',
      icon: Home,
      isActive: pathname === '/bible-journey'
    },
    {
      label: 'Aprender',
      href: '/bible-journey/map',
      icon: Map,
      isActive: pathname === '/bible-journey/map' || pathname.includes('/lesson/')
    },
    {
      label: 'Repaso',
      href: '/bible-journey/review',
      icon: RotateCcw,
      isActive: pathname === '/bible-journey/review'
    },
    {
      label: 'Perfil',
      href: '/bible-journey/achievements',
      icon: Trophy,
      isActive: pathname === '/bible-journey/achievements'
    }
  ];

  const showHeader = !pathname.includes('/play');

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col text-[#1b1b1e] antialiased select-none font-sans relative pb-28">
      
      {/* 1. TOP GLOBAL HEADER */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-[#faf9fc]/90 backdrop-blur-md border-b border-purple-100/40 px-4 py-4 flex items-center justify-between shadow-[0_2px_15px_rgba(49,0,101,0.02)]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (pathname === '/bible-journey') {
                  router.push('/');
                } else {
                  router.back();
                }
              }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#310065] hover:bg-purple-50 active:scale-95 transition-all border border-purple-100/30"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <span className="font-serif italic font-black text-lg tracking-tight text-[#310065]">
              Camino de la Biblia
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white shadow-sm border border-purple-100/30 px-4 py-2 rounded-full">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm animate-pulse">
              <Flame size={18} fill="currentColor" />
              <span className="tabular-nums font-bold">{streakState || user.streakDays || 0}</span>
            </div>

            <div className="w-[1px] h-4 bg-purple-100" />

            {/* Hearts Indicator */}
            <div className="flex items-center gap-1.5 text-red-500 font-black text-sm">
              <Heart size={18} fill="currentColor" className="drop-shadow-[0_2px_4px_rgba(239,68,68,0.2)] animate-bounce" />
              <span className="tabular-nums font-bold">
                {heartsState ? `${heartsState.heartsRemaining}/${heartsState.maxHearts}` : '5/5'}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* 2. MAIN SCROLLABLE CONTAINER */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-6 pb-12 overflow-x-hidden">
        {children}
      </main>

      {/* 3. PERSISTENT BIBLE BOTTOM NAVBAR */}
      {showHeader && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-purple-100/60 shadow-[0_-8px_30px_rgba(49,0,101,0.06)] py-3 px-6 flex items-center justify-around rounded-t-[2rem] max-w-xl mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link 
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 group relative py-1 px-4 active:scale-95 transition-all"
              >
                <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${
                  item.isActive 
                    ? 'bg-[#310065]/10 text-[#310065]' 
                    : 'text-[#1b1b1e]/40 group-hover:text-[#310065]/60 group-hover:bg-purple-50/50'
                }`}>
                  <Icon size={20} strokeWidth={item.isActive ? 2.5 : 2} />
                </div>
                
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                  item.isActive 
                    ? 'text-[#310065] font-black' 
                    : 'text-[#1b1b1e]/40 font-bold group-hover:text-[#310065]/60'
                }`}>
                  {item.label}
                </span>

                {item.isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      )}

    </div>
  );
}
