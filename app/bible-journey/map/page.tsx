'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  Trophy, 
  Lock, 
  Check, 
  Crown, 
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { getUserBibleProgress, UserBibleProgress } from '@/lib/bible/repository';
import { BIBLE_LESSONS } from '@/lib/bible/data';

export default function BibleJourneyMap() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, UserBibleProgress>>({});

  useEffect(() => {
    if (!user) return;
    getUserBibleProgress(user.uid).then(p => {
      setProgress(p);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-[#310065] border-t-amber-400 rounded-full animate-spin mb-3" />
        <span className="text-white/60 font-semibold text-xs uppercase tracking-widest">
          Trazando la senda sagrada...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      
      {/* HEADER SUMMARY CARD */}
      <section className="bg-white border border-purple-100/50 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-wider">
            Unidad 1
          </span>
          <h2 className="text-xl font-black text-[#310065] font-serif italic">
            El Comienzo
          </h2>
          <p className="text-[10px] font-bold text-[#1b1b1e]/50 max-w-[200px]">
            Completa las lecciones para desbloquear el examen y coronar la unidad.
          </p>
        </div>

        <div className="w-14 h-14 bg-gradient-to-br from-[#310065] to-[#4a148c] text-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10">
          <Crown size={28} className="drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)] animate-pulse" />
        </div>
      </section>

      {/* ROADMAP NODES CONTAINER */}
      <section className="relative py-12 px-4 flex flex-col items-center gap-12 select-none min-h-[500px]">
        {/* Glowing Vertical Trail Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-purple-200/40 via-purple-300 to-purple-200/40 border-dashed border-l-2 border-[#310065]/20 z-0" />

        {BIBLE_LESSONS.map((lesson, idx) => {
          const lessonProgress = progress[lesson.id];
          const isCompleted = lessonProgress?.status === 'completed';
          const isUnlocked = lessonProgress?.status === 'unlocked';
          const isLocked = !lessonProgress || lessonProgress.status === 'locked';

          // Zig-zag offset algorithm (alternates left, center, right)
          const offsetClass = idx % 3 === 1 
            ? '-translate-x-12 sm:-translate-x-16' 
            : idx % 3 === 2 
              ? 'translate-x-12 sm:translate-x-16' 
              : '';

          return (
            <div 
              key={lesson.id} 
              className={`relative z-10 flex flex-col items-center gap-2 transition-transform duration-500 ${offsetClass}`}
            >
              
              {/* Pulsing Active Light Ring */}
              {isUnlocked && (
                <span className="absolute inset-0 -m-3 rounded-full bg-amber-400/20 border border-amber-400/40 animate-ping z-0" />
              )}

              {/* THE NODE BUTTON */}
              <button
                onClick={() => {
                  if (!isLocked) {
                    router.push(`/bible-journey/lesson/${lesson.id}`);
                  }
                }}
                disabled={isLocked}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative border-4 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-200 active:scale-95 hover:shadow-green-500/20'
                    : isUnlocked
                      ? 'bg-gradient-to-br from-[#310065] to-[#4a148c] text-white border-amber-400 active:scale-95 hover:shadow-purple-500/20 hover:scale-105 animate-pulse'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                {/* Visual content inside the node */}
                {isCompleted ? (
                  lesson.is_boss_level ? (
                    <Crown size={28} className="text-amber-300 drop-shadow-sm" />
                  ) : (
                    <Check size={26} strokeWidth={3} className="drop-shadow-sm" />
                  )
                ) : isLocked ? (
                  <Lock size={20} />
                ) : (
                  lesson.is_boss_level ? (
                    <Crown size={28} className="text-amber-400 animate-bounce" />
                  ) : (
                    <span className="text-2xl font-black font-serif italic tracking-tighter">
                      {lesson.order_number}
                    </span>
                  )
                )}

                {/* Score Tag if perfect */}
                {isCompleted && lessonProgress.score === 100 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-[#310065] text-[8px] font-black rounded-full px-1.5 py-0.5 border border-white shadow-sm flex items-center gap-0.5">
                    <Sparkles size={8} fill="currentColor" />
                    100%
                  </span>
                )}
              </button>

              {/* NODE DESCRIPTIVE TOOLTIP */}
              <div className="flex flex-col items-center text-center max-w-[140px] mt-1 space-y-0.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  isCompleted 
                    ? 'text-green-600' 
                    : isUnlocked 
                      ? 'text-[#310065] font-black animate-pulse' 
                      : 'text-gray-400'
                }`}>
                  {lesson.is_boss_level ? 'Examen de Unidad' : `Lección ${lesson.order_number}`}
                </span>
                <span className="text-[11px] font-black text-[#1b1b1e] tracking-tight leading-tight">
                  {lesson.title}
                </span>
              </div>

            </div>
          );
        })}
      </section>

      {/* REWARD CARD FOOTER */}
      <section className="bg-gradient-to-br from-amber-400/20 to-yellow-300/10 border border-amber-400/30 rounded-3xl p-5 shadow-sm space-y-4 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <Trophy className="text-amber-500 w-8 h-8 drop-shadow" />
          <h4 className="text-sm font-black text-[#310065] uppercase tracking-widest">
            ¡Camino al Éxito!
          </h4>
          <p className="text-[10px] font-semibold text-[#1b1b1e]/70 leading-relaxed max-w-[85%]">
            Cada lección completada te acerca más a la corona dorada. Si fallas alguna pregunta, podrás revisarla en el centro de **Repaso** para ganar de vuelta tus vidas.
          </p>
        </div>

        <button 
          onClick={() => router.push('/bible-journey')}
          className="w-full py-3.5 px-6 bg-white hover:bg-purple-50 text-[#310065] rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border border-purple-100 shadow-sm active:scale-95 transition-all"
        >
          <span>Ir al Panel de Inicio</span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </section>

    </div>
  );
}
