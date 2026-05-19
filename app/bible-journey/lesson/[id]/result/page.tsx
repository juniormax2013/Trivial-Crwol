'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Crown, 
  Award, 
  Check, 
  X, 
  Clock, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getLessonById } from '@/lib/bible/data';

export default function BibleLessonResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  
  const lessonId = params.id as string;
  const lesson = getLessonById(lessonId);

  // Parse stats from URL queries
  const score = parseInt(searchParams.get('score') || '0');
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const timeSeconds = parseInt(searchParams.get('time') || '0');

  // Format Elapsed Time as MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const mistakes = Math.max(0, total - correct);
  const xpReward = (lesson?.xp_reward || 10) + (score === 100 ? 5 : 0);

  if (!lesson) {
    return <div className="p-8 text-center">Resultados de lección...</div>;
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      
      {/* 1. CONFETTI & VICTORY CROWN HEADER */}
      <section className="flex flex-col items-center text-center gap-4 py-6 relative overflow-hidden">
        
        {/* Floating sparkles background effects */}
        <div className="absolute inset-0 pointer-events-none select-none text-2xl opacity-40">
          <span className="absolute top-4 left-6 animate-bounce text-yellow-400">✨</span>
          <span className="absolute top-10 right-8 animate-pulse text-amber-400">🌟</span>
          <span className="absolute bottom-6 left-12 animate-pulse text-yellow-300">🎉</span>
          <span className="absolute bottom-10 right-14 animate-bounce text-amber-500">✨</span>
        </div>

        {/* Crown Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-300 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-amber-400/20 relative z-10 animate-scale-in">
          <Crown size={44} className="drop-shadow-[0_2px_6px_rgba(115,92,0,0.4)] text-[#735c00] animate-pulse" />
        </div>

        <div className="space-y-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#310065] font-serif italic tracking-tight leading-tight">
            ¡Lección completada!
          </h1>
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] block">
            {lesson.title}
          </span>
        </div>

        {/* XP Reward Badge */}
        <div className="bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] border-2 border-white px-5 py-2.5 rounded-full font-black text-sm uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-bounce">
          <Award size={18} />
          <span>+{xpReward} XP</span>
        </div>
      </section>

      {/* 2. CORE GAMEPLAY STATS GRID */}
      <section className="bg-white border border-purple-100/50 rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Top summary percentage slider */}
        <div className="flex justify-between items-center text-center border-b border-purple-50/50 pb-4">
          <div className="flex-1 space-y-0.5">
            <span className="text-3xl font-black text-[#310065] font-serif italic tracking-tight">{score}%</span>
            <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest block">Precisión</span>
          </div>
          <div className="w-[1px] h-10 bg-purple-100/60" />
          <div className="flex-1 space-y-0.5">
            <span className="text-xl font-black text-green-600 font-serif italic tracking-tight">
              {score >= 90 ? '¡Excelente!' : score >= 70 ? '¡Muy bien!' : '¡Sigue así!'}
            </span>
            <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest block">Calificación</span>
          </div>
        </div>

        {/* Detail list item grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          
          <div className="bg-green-50/50 border border-green-100 p-3.5 rounded-2xl space-y-1">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-sm">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[13px] font-black text-green-700 block tabular-nums">{correct} Aciertos</span>
          </div>

          <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-2xl space-y-1">
            <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-sm">
              <X size={14} strokeWidth={3} />
            </div>
            <span className="text-[13px] font-black text-red-700 block tabular-nums">{mistakes} Errores</span>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded-2xl space-y-1">
            <div className="w-7 h-7 rounded-full bg-[#310065] text-white flex items-center justify-center mx-auto shadow-sm">
              <Clock size={14} />
            </div>
            <span className="text-[13px] font-black text-[#310065] block tabular-nums">{formatTime(timeSeconds)}</span>
          </div>

        </div>

        {/* Next Unlocked Lesson Indicator */}
        <div className="bg-purple-50/30 border border-purple-100/30 rounded-2xl p-4 flex items-center justify-between text-xs font-bold">
          <div className="flex gap-2.5 items-center">
            <BookOpen size={16} className="text-[#310065] shrink-0" />
            <span className="text-[#1b1b1e]/70">Nueva lección disponible:</span>
          </div>
          <span className="text-[#310065] font-black uppercase tracking-wider">
            {lesson.order_number < 5 ? `Lección ${lesson.order_number + 1}` : 'Unidad 2'}
          </span>
        </div>
      </section>

      {/* 3. DEVOTIONAL INSPIRATION CARD */}
      <section className="bg-white border border-purple-100/50 rounded-[2rem] p-5 shadow-sm flex items-center gap-5 relative overflow-hidden group">
        
        {/* Pathway to Cross cover image */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-purple-100 shadow-sm relative shrink-0">
          <Image 
            src="/images/bible-journey/image (5).png" 
            alt="El sendero" 
            fill
            sizes="80px"
            className="object-cover" 
          />
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-black text-[#310065] uppercase tracking-wider flex items-center gap-1">
            <span>Dios te está guiando</span>
            <span className="text-amber-500">💛</span>
          </h4>
          <p className="text-[10px] font-bold text-[#1b1b1e]/60 leading-relaxed text-justify max-w-[220px]">
            Cada paso que das en Su Palabra te acerca más a Su propósito. El estudio constante bendice tu vida y te llena de Su luz. ¡Sigue adelante!
          </p>
        </div>
      </section>

      {/* 4. RESULT ACTION TRIGGERS */}
      <section className="flex flex-col gap-3 pt-2">
        <button
          onClick={() => router.push('/bible-journey/map')}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-[#e9c349] hover:from-amber-300 hover:to-amber-400 text-[#310065] rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-400/10 active:scale-95 transition-all group"
        >
          <span>Continuar el camino</span>
          <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={() => router.push('/bible-journey/review')}
          className="w-full py-4 px-6 bg-white hover:bg-purple-50 text-[#310065] rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border border-purple-100 shadow-sm active:scale-95 transition-all"
        >
          <RotateCcw size={14} />
          <span>Repasar errores</span>
        </button>
      </section>

    </div>
  );
}
