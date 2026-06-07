'use client';

import React, { useEffect, useState } from 'react';

interface DevilTrapOptionTextProps {
  isDevilActive: boolean;
  optionId: string;
  isRevealed: boolean;
  onReveal: () => void;
  originalText: string;
  language?: string; // 'es' | 'ht' | 'fr'
  devilMode?: 'POWER_MODE' | 'OBSERVER_MODE';
}

export default function DevilTrapOptionText({
  isDevilActive,
  optionId,
  isRevealed,
  onReveal,
  originalText,
  language = 'es',
  devilMode = 'OBSERVER_MODE',
}: DevilTrapOptionTextProps) {
  const [animateReveal, setAnimateReveal] = useState(false);

  useEffect(() => {
    if (isRevealed && isDevilActive && devilMode !== 'OBSERVER_MODE') {
      setAnimateReveal(true);
      const timer = setTimeout(() => setAnimateReveal(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, isDevilActive, devilMode]);

  // If the trap is not active or we are in OBSERVER_MODE, just render the original text
  if (!isDevilActive || devilMode === 'OBSERVER_MODE') {
    return <span className="transition-all duration-300">{originalText}</span>;
  }

  // Determine label based on language
  let hiddenLabel = '🔥 Revelar Opción 🔥';
  if (language === 'ht') {
    hiddenLabel = '🔥 Revele Opsyon 🔥';
  } else if (language === 'fr') {
    hiddenLabel = "🔥 Révéler l'option 🔥";
  }

  return (
    <div className="relative w-full h-full flex items-center justify-between overflow-hidden min-h-[1.5rem]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes devil-burn-sweep {
          0% {
            left: -100%;
          }
          100% {
            left: 150%;
          }
        }
        @keyframes devil-crackling-embers {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }
      ` }} />

      {/* Burn Sweep Overlay when revealed */}
      {animateReveal && (
        <div 
          className="absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent skew-x-12 z-20 pointer-events-none animate-[devil-burn-sweep_0.6s_ease-out_forwards]"
        />
      )}

      {isRevealed ? (
        <span 
          className="animate-in fade-in zoom-in-95 duration-500 font-bold text-orange-950 dark:text-orange-200 transition-all duration-300 drop-shadow-[0_0_2px_rgba(249,115,22,0.4)]"
        >
          {originalText}
        </span>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation(); // Prevent trigger parent button onClick immediately
            onReveal();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              onReveal();
            }
          }}
          className="w-full h-full text-left py-1 text-[13px] md:text-[14px] font-black uppercase tracking-wider text-orange-500/90 hover:text-orange-400 flex items-center gap-2 group transition-all duration-300 cursor-pointer"
        >
          {/* Ash / Soot Background overlay for the parent option button */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#211514] via-[#1a0e0c] to-[#251817] z-10 pointer-events-none border border-orange-900/40 rounded-2xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] opacity-95 transition-opacity group-hover:opacity-90 flex items-center px-4">
            {/* Crackling brasa glowing dots */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.12),transparent)] animate-[devil-crackling-embers_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(239,68,68,0.1),transparent)] animate-[devil-crackling-embers_3s_ease-in-out_infinite_delay-1000]" />
            
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-950/80 border border-orange-700/50 flex items-center justify-center text-[10px] text-orange-400 font-bold shadow-[0_0_5px_rgba(249,115,22,0.3)]">
                {optionId}
              </span>
              <span className="text-[12px] md:text-[13px] font-black text-orange-500/90 tracking-widest animate-pulse flex items-center gap-1.5">
                {hiddenLabel}
              </span>
            </div>
          </div>
          <span className="opacity-0 pointer-events-none">{originalText}</span>
        </div>
      )}
    </div>
  );
}
