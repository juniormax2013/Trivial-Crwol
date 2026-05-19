'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  Trophy, 
  Award, 
  BookOpen, 
  Flame, 
  ShieldCheck, 
  Footprints, 
  Sparkles,
  Lock,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { getUserAchievements, getUserBibleProgress, getBibleStreak, BibleAchievement } from '@/lib/bible/repository';
import { BIBLE_LESSONS } from '@/lib/bible/data';

export default function BibleJourneyAchievements() {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<BibleAchievement[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchStatsAndAchievements = async () => {
      try {
        const achs = await getUserAchievements(user.uid);
        setAchievements(achs);

        const progress = await getUserBibleProgress(user.uid);
        const completed = Object.values(progress).filter(l => l.status === 'completed').length;
        setCompletedCount(completed);

        const streak = await getBibleStreak(user.uid);
        setStreakDays(streak.currentStreak);
      } catch (err) {
        console.error("Error loading achievements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-[#310065] border-t-amber-400 rounded-full animate-spin mb-3" />
        <span className="text-white/60 font-semibold text-xs uppercase tracking-widest">
          Abriendo el salón de triunfos...
        </span>
      </div>
    );
  }

  // Calculate percentage of grand hito (50 completed lessons)
  const milestoneTarget = 50;
  const milestonePercentage = Math.round((completedCount / milestoneTarget) * 100);

  // Map icon strings to Lucide components
  const getIconComponent = (iconName: string, isUnlocked: boolean) => {
    const size = 26;
    const colorClass = isUnlocked ? 'text-[#310065]' : 'text-gray-400';
    
    switch (iconName) {
      case 'footprint':
        return <Footprints size={size} className={colorClass} />;
      case 'book':
        return <BookOpen size={size} className={colorClass} />;
      case 'fire':
        return <Flame size={size} className={colorClass} fill={isUnlocked ? 'currentColor' : 'none'} />;
      case 'shield':
        return <ShieldCheck size={size} className={colorClass} />;
      default:
        return <Award size={size} className={colorClass} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. HERO ACHIEVEMENTS MEDAL CARD */}
      <section className="bg-gradient-to-br from-[#11002c] via-[#310065] to-[#4a148c] rounded-[2rem] p-6 shadow-xl border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/[0.03] rounded-full blur-[80px]" />
        <div className="absolute -top-10 -right-10 text-[8rem] opacity-5 pointer-events-none select-none">
          🏅
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-3 py-4">
          <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-400/5 animate-pulse">
            <Trophy size={36} className="drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white font-serif italic tracking-tight">
              Tus Logros
            </h2>
            <p className="text-white/60 text-xs font-semibold max-w-[80%] mx-auto leading-relaxed">
              Celebra tu constancia en el estudio. Cada hito alcanzado te corona de sabiduría.
            </p>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER ROW */}
      <section className="grid grid-cols-3 gap-3 bg-white border border-purple-100/50 rounded-2xl p-4 shadow-sm text-center">
        <div className="space-y-0.5 border-r border-purple-100/40">
          <span className="text-[18px] font-black text-[#310065] block font-serif italic tracking-tight tabular-nums">
            {user?.xp || 0}
          </span>
          <span className="text-[9px] font-black text-[#1b1b1e]/40 uppercase tracking-wider block">
            XP Total
          </span>
        </div>
        <div className="space-y-0.5 border-r border-purple-100/40">
          <span className="text-[18px] font-black text-amber-500 block font-serif italic tracking-tight flex items-center justify-center gap-1 tabular-nums animate-pulse">
            <Flame size={16} fill="currentColor" />
            {streakDays || user?.streakDays || 0}
          </span>
          <span className="text-[9px] font-black text-[#1b1b1e]/40 uppercase tracking-wider block">
            Días de Racha
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[18px] font-black text-green-600 block font-serif italic tracking-tight tabular-nums">
            {completedCount} / {BIBLE_LESSONS.length}
          </span>
          <span className="text-[9px] font-black text-[#1b1b1e]/40 uppercase tracking-wider block">
            Completadas
          </span>
        </div>
      </section>

      {/* 3. ACHIEVEMENTS LIST */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-[#310065] uppercase tracking-widest pl-2">
          Medallas Desbloqueadas
        </h3>

        <div className="space-y-3.5">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={`bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all relative ${
                ach.unlocked 
                  ? 'border-purple-100/60 hover:px-5' 
                  : 'border-purple-100/30 opacity-60'
              }`}
            >
              {ach.unlocked && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/5 rounded-bl-full flex items-center justify-end pr-2 pt-1 border-l border-b border-amber-400/10 pointer-events-none">
                  <Sparkles size={10} className="text-amber-500" />
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Gold Coin Icon container */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-inner ${
                  ach.unlocked
                    ? 'bg-amber-100 border-amber-300 shadow-amber-400/20 text-[#310065] animate-pulse'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                  {getIconComponent(ach.icon, ach.unlocked)}
                </div>

                <div className="space-y-0.5 max-w-[200px]">
                  <h4 className="text-xs font-black text-[#1b1b1e] tracking-tight">
                    {ach.title}
                  </h4>
                  <p className="text-[10px] text-[#1b1b1e]/50 font-bold leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {ach.unlocked ? (
                  <span className="px-2.5 py-1 bg-amber-400/20 text-amber-700 border border-amber-400/30 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <CheckCircle2 size={10} strokeWidth={3} className="text-amber-600" />
                    Completado
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Lock size={9} />
                    Bloqueado
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 4. GRAND MILESTONE GIFT CHEST */}
      <section className="bg-gradient-to-br from-amber-400/20 to-yellow-300/10 border border-amber-400/30 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-white/60 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Gift size={28} className="animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-[#310065] uppercase tracking-wider">
              Próximo gran premio: ¡Gran Hito!
            </h4>
            <p className="text-[10px] font-semibold text-[#1b1b1e]/70 leading-relaxed">
              Completa 50 lecciones bíblicas en el Camino para desbloquear este cofre celestial cargado de monedas, gemas y bendiciones exclusivas.
            </p>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-[9px] font-black text-[#310065] tracking-widest">
            <span>PROGRESO DE HITOS</span>
            <span className="text-amber-600 font-black">{completedCount} / {milestoneTarget} LECCIONES</span>
          </div>
          <div className="h-3 w-full bg-white/80 rounded-full overflow-hidden shadow-inner border border-purple-100/40">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(5, milestonePercentage))}%` }}
            />
          </div>
        </div>
      </section>

    </div>
  );
}
