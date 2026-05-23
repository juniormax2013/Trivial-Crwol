'use client';

import React from 'react';
import { Flame, Eye } from 'lucide-react';

interface DevilAnswerCoverProps {
  /** Acción ejecutada cuando el usuario presiona para revelar la carta */
  onReveal: () => void;
  /** Clase CSS adicional para maquetar alturas o anchos */
  className?: string;
}

/**
 * COMPONENTE: DevilAnswerCover
 * Tapa la respuesta de trivia con un diseño premium y misterioso en degradado
 * púrpura-fuego, invitando al jugador a tocar para revelar la respuesta oculta.
 */
export default function DevilAnswerCover({
  onReveal,
  className = '',
}: DevilAnswerCoverProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Evita que se dispare la selección de respuesta directamente antes de revelar
        onReveal();
      }}
      className={`relative w-full min-h-[56px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#210041] via-[#3a015c] to-[#1a0033] border border-red-500/35 hover:border-red-500/70 shadow-lg hover:shadow-red-950/40 text-left transition-all duration-300 transform hover:scale-[1.015] active:scale-[0.99] flex items-center justify-between cursor-pointer group select-none overflow-hidden ${className}`}
    >
      {/* Luz trasera animada */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 transform -translateX-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      {/* Glow de esquinas */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-red-500/20 group-hover:ring-red-500/40 transition-colors" />

      {/* Lado izquierdo: Misterio y Texto */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-500/25 flex items-center justify-center text-red-500 shadow-inner group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
          <Flame className="w-4.5 h-4.5 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[12px] font-black uppercase tracking-widest text-red-300 group-hover:text-white transition-colors">
            Opción Oculta
          </span>
          <p className="text-[9px] font-bold text-purple-400 group-hover:text-purple-200 uppercase tracking-widest">
            ¿Será la correcta?
          </p>
        </div>
      </div>

      {/* Lado derecho: Acción de Revelación */}
      <div className="flex items-center gap-2 text-red-400 font-black uppercase text-[10px] tracking-widest relative z-10 bg-red-950/30 border border-red-500/20 px-3 py-1 rounded-xl group-hover:bg-red-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
        <Eye className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        <span>Revelar</span>
      </div>
    </button>
  );
}
