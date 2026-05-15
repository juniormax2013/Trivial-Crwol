'use client';

import { DuelResult } from '@/lib/duel/models';

interface DuelResultBannerProps {
  result: DuelResult;
}

export default function DuelResultBanner({ result }: DuelResultBannerProps) {
  const isWin  = result.outcome === 'win';
  const isTie  = result.outcome === 'tie';

  const config = {
    win: {
      gradient: 'from-emerald-700 via-emerald-600 to-teal-500',
      emoji: '👑',
      title: '¡Victoria!',
      subtitle: 'Has dominado este duelo',
      glow: 'shadow-[0_20px_60px_rgba(16,185,129,0.35)]',
    },
    tie: {
      gradient: 'from-[#310065] via-[#4a148c] to-[#6d27c4]',
      emoji: '🤝',
      title: 'Empate honorable',
      subtitle: 'Dos rivales igualmente sabios',
      glow: 'shadow-[0_20px_60px_rgba(74,20,140,0.35)]',
    },
    loss: {
      gradient: 'from-[#3d3555] via-[#5a4f70] to-[#7c7483]',
      emoji: '📖',
      title: 'Derrota',
      subtitle: 'Cada batalla es una lección',
      glow: 'shadow-[0_20px_60px_rgba(60,50,90,0.25)]',
    },
  };

  const c = config[result.outcome];

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${c.gradient} p-8 text-white ${c.glow}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Emoji */}
        <div className="text-6xl mb-4 drop-shadow-lg">{c.emoji}</div>

        {/* Title */}
        <h2 className="font-serif text-[32px] font-black leading-tight mb-1">{c.title}</h2>
        <p className="text-white/70 text-[14px] font-medium mb-6">{c.subtitle}</p>

        {/* Score */}
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Tú</p>
            <p className="font-serif font-black text-[40px] leading-none">{result.finalScore.mine}</p>
          </div>
          <div className="text-white/30 font-bold text-[18px]">vs</div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 truncate max-w-[80px]">
              {result.opponentName.split(' ')[0]}
            </p>
            <p className="font-serif font-black text-[40px] leading-none text-white/60">{result.finalScore.theirs}</p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-4 text-[13px] font-semibold text-white/70">
          <span>✓ {result.correctAnswers.mine} correctas</span>
          <span>·</span>
          <span>vs rival: {result.correctAnswers.theirs}</span>
        </div>
      </div>
    </div>
  );
}
