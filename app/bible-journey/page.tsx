'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Flame, Heart, Check, BookOpen, Crown, Lock, Home, RotateCcw, UserCircle, Play, Loader2 } from 'lucide-react';
import { getUserBibleProgress, getBibleStreak, getUserHearts, UserBibleProgress } from '@/lib/bible/repository';
import { BIBLE_LESSONS } from '@/lib/bible/data';
import GameModeHeader from '@/components/GameModeHeader';

export default function BibleJourneyDashboard() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, UserBibleProgress>>({});
  const [streakDays, setStreakDays] = useState(0);
  const [hearts, setHearts] = useState(5);
  
  const nextLesson = BIBLE_LESSONS.find(l => progress[l.id]?.status === 'unlocked')
    || BIBLE_LESSONS.find(l => progress[l.id]?.status !== 'completed')
    || BIBLE_LESSONS[BIBLE_LESSONS.length - 1];

  const activeLessonId = nextLesson?.id;

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      try {
        const userProgress = await getUserBibleProgress(user.uid);
        setProgress(userProgress);
        
        const streakData = await getBibleStreak(user.uid);
        setStreakDays(streakData.currentStreak);

        const heartState = await getUserHearts(user.uid);
        setHearts(heartState.heartsRemaining);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white flex justify-center items-center min-h-screen font-sans selection:bg-[#eddcff]">
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#310065] animate-spin mb-4" />
          <span className="text-[#5c5464] font-black text-sm tracking-widest uppercase">Cargando...</span>
        </div>
      </div>
    );
  }

  const getAlignmentClass = (index: number) => {
    const mod = index % 4;
    let base = "relative z-10 flex flex-col items-center mb-[100px] ";
    if (index === 0) base += "mt-[60px] ";
    if (mod === 0) return base;
    if (mod === 1) return base + "-ml-[30%]";
    if (mod === 2) return base;
    if (mod === 3) return base + "ml-[30%]";
    return base;
  };

  // Dynamically calculate exact node centers for a perfect SVG path connection
  const startY = 40 + 60; // py-10 (40px) + mt-[60px] (60px) = 100px top offset
  let currentY = startY;
  
  const points = BIBLE_LESSONS.map((lesson, index) => {
    const mod = index % 4;
    let x = 50;
    if (mod === 1) x = 20;
    if (mod === 3) x = 80;

    const isActive = lesson.id === activeLessonId;
    const nodeHeight = isActive ? 80 : 64; // h-20 vs h-16
    
    const y = currentY + (nodeHeight / 2);
    currentY += nodeHeight + 100; // Add this node's height + mb-[100px]

    return { x, y };
  });

  const svgHeight = currentY;

  const generatePath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const diffY = curr.y - prev.y;
      const cpY1 = prev.y + (diffY * 0.45);
      const cpY2 = curr.y - (diffY * 0.45);
      d += ` C ${prev.x} ${cpY1}, ${curr.x} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const pathD = generatePath(points);
  
  let activeIndex = BIBLE_LESSONS.findIndex(l => l.id === activeLessonId);
  if (activeIndex === -1) activeIndex = BIBLE_LESSONS.length - 1; // All completed
  const progressPoints = points.slice(0, activeIndex + 1);
  const progressPathD = generatePath(progressPoints);

  return (
    <div className="bg-white flex justify-center items-center min-h-screen font-sans selection:bg-[#eddcff]">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-[0_0_50px_rgba(49,0,101,0.03)] overflow-hidden pb-20">
        
        {/* Top Navigation / Header */}
        <GameModeHeader 
          title="El Viaje de Fe"
          subtitle="Modo Historia"
          icon={<BookOpen className="w-5 h-5 text-[#310065] fill-[#310065]/20" strokeWidth={2} />}
          backHref="/"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#fff0f3] px-2.5 py-1 rounded-full border border-[#ffe0e6]/40 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-[#ff2d55] fill-[#ff2d55]" />
              <span className="text-[#ff2d55] font-black text-[11px] font-mono">{hearts}</span>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/40 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-[#cba72f] fill-[#ffe088]" />
              <span className="text-[#735c00] font-black text-[11px] font-mono">{streakDays}</span>
            </div>
          </div>
        </GameModeHeader>

        {/* Contenido Principal - Roadmap */}
        <main className="relative w-full overflow-y-auto no-scrollbar" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Unidad Header Premium */}
          <div className="mx-6 mt-6 mb-8 p-6 bg-gradient-to-tr from-[#310065] to-[#4a148c] text-white rounded-[2rem] shadow-[0_12px_30px_rgba(49,0,101,0.15)] relative z-10 overflow-hidden">
            {/* Efecto de luz de catedral de fondo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase block mb-1">El Viaje de Fe</span>
            <h2 className="text-2xl font-serif font-black tracking-tight leading-none mb-1">Unidad 1</h2>
            <p className="text-purple-200 text-xs font-bold font-sans">Fundamentos de la Fe</p>
          </div>

          {/* Contenedor del Camino */}
          <div className="relative w-full pt-6 pb-36 flex flex-col items-center">
              
            {/* SVG LINEA DEL CAMINO */}
            <svg className="absolute top-0 left-0 w-full z-0 pointer-events-none" style={{ height: svgHeight }} viewBox={`0 0 100 ${svgHeight}`} preserveAspectRatio="none">
               {/* Background path */}
               <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#f3e5f5" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
               />
               {/* Progress path */}
                <path 
                  d={progressPathD} 
                  fill="none" 
                  stroke="#310065" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
               />
            </svg>

            {BIBLE_LESSONS.map((lesson, index) => {
              const lessonProgress = progress[lesson.id];
              const isCompleted = lessonProgress?.status === 'completed';
              const isActive = lesson.id === activeLessonId;
              const isLocked = !isCompleted && !isActive;

              const alignClass = getAlignmentClass(index);

              if (isActive) {
                return (
                  <div key={lesson.id} className={alignClass}>
                    {/* Tooltip Premium */}
                    <div className="absolute -top-16 bg-gradient-to-r from-[#310065] to-[#4a148c] text-white px-5 py-2.5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(49,0,101,0.2)] font-black text-xs uppercase tracking-widest whitespace-nowrap animate-bounce z-20 border border-purple-500/10">
                      <span className="text-[#ffe088] mr-1">★</span> ¡Empezar!
                      <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-[#4a148c] rotate-45 rounded-sm"></div>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/bible-journey/lesson/${lesson.id}`)}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#310065] to-[#4a148c] flex justify-center items-center text-white shadow-[0_12px_32px_rgba(49,0,101,0.25)] transform transition hover:scale-105 active:scale-95 ring-4 ring-purple-200/60 ring-offset-2 z-10"
                    >
                      <Play fill="currentColor" size={28} className="ml-1 text-white animate-pulse" />
                    </button>
                    
                    <span className="absolute top-full mt-3 text-[13px] font-black text-[#310065] w-36 text-center leading-tight tracking-tight uppercase font-sans">{lesson.title}</span>
                  </div>
                );
              }

              if (isCompleted) {
                return (
                  <div key={lesson.id} className={alignClass}>
                    <button 
                      onClick={() => router.push(`/bible-journey/lesson/${lesson.id}`)}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#310065]/90 to-[#4a148c]/90 flex justify-center items-center text-white shadow-lg transform transition hover:scale-105 active:scale-95 z-10"
                    >
                      <Check strokeWidth={3.5} size={24} className="text-[#ffe088]" />
                    </button>
                    <span className="absolute top-full mt-3 text-[12px] font-extrabold text-[#7c7483] w-36 text-center leading-tight tracking-tight uppercase font-sans">{lesson.title}</span>
                  </div>
                );
              }

              // Locked
              return (
                <div key={lesson.id} className={alignClass}>
                  <button className="w-16 h-16 rounded-full bg-[#f5f3f7] flex justify-center items-center text-[#b3abb8] shadow-[0_4px_10px_rgba(49,0,101,0.01)] cursor-not-allowed z-10">
                    <Lock strokeWidth={2.5} size={20} />
                  </button>
                  <span className="absolute top-full mt-3 text-[12px] font-bold text-[#b3abb8] w-36 text-center leading-tight tracking-tight uppercase font-sans">{lesson.title}</span>
                </div>
              );
            })}
          </div>
        </main>

        {/* Bottom Navigation Glassmorphism */}
        <nav className="absolute bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md pb-safe pt-2.5 px-6 shadow-[0_-8px_32px_rgba(49,0,101,0.03)] border-t border-purple-100/20">
          <div className="flex justify-between items-center mb-1">
            <Link href="/" className="flex flex-col items-center gap-1.5 p-2 text-[#7c7483] hover:text-[#310065] transition-all duration-300 flex-1 group">
              <Home size={22} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Inicio</span>
            </Link>
            <Link href="/bible-journey" className="flex flex-col items-center gap-1.5 p-2 text-[#310065] flex-1">
              <BookOpen size={22} className="fill-[#310065]/10 scale-105" />
              <span className="text-[10px] font-black uppercase tracking-wider font-sans">Aprender</span>
            </Link>
            <Link href="/bible-journey/review" className="flex flex-col items-center gap-1.5 p-2 text-[#7c7483] hover:text-[#310065] transition-all duration-300 flex-1 group">
              <RotateCcw size={22} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Repaso</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1.5 p-2 text-[#7c7483] hover:text-[#310065] transition-all duration-300 flex-1 group">
              <UserCircle size={22} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Perfil</span>
            </Link>
          </div>
        </nav>

      </div>
    </div>
  );
}
