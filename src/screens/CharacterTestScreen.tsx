'use client';

import React, { useState } from 'react';
import AnimatedCharacter from '../components/AnimatedCharacter';
import { GameEvent } from '../hooks/useCharacterAction';
import { Swords, Flame, Sparkles, AlertCircle, RefreshCw, Zap, Shield, Play, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function CharacterTestScreen() {
  const [activeEvent, setActiveEvent] = useState<GameEvent>('default_state');

  // Lista de eventos de juego ordenados por relevancia para pruebas rápidas
  const eventsList: { event: GameEvent; label: string; desc: string; icon: any; color: string }[] = [
    {
      event: 'default_state',
      label: 'Esperar (Idle)',
      desc: 'El diablo está relajado esperando el turno del usuario.',
      icon: RefreshCw,
      color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/60',
    },
    {
      event: 'app_loading',
      label: 'Analizar (Pensando)',
      desc: 'Pensando e investigando la táctica del oponente.',
      icon: HelpCircle,
      color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-850',
    },
    {
      event: 'user_answer_wrong',
      label: 'Burlarse (Risa Malvada)',
      desc: 'El usuario se equivoca de respuesta y el diablo se ríe.',
      icon: Flame,
      color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-850',
    },
    {
      event: 'devil_power_activated',
      label: 'Atacar (Ataque)',
      desc: 'Se activa un poder del diablo (ej. Trampa del Diablo).',
      icon: Zap,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:text-purple-300 dark:border-purple-850',
    },
    {
      event: 'user_two_correct_answers',
      label: 'Alarmarse (Sorprendido)',
      desc: 'El usuario acierta dos veces seguidas de forma asombrosa.',
      icon: AlertCircle,
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-850',
    },
    {
      event: 'user_correct_streak',
      label: 'Rabia (Enojo)',
      desc: 'Enojo persistente porque el usuario lleva racha perfecta.',
      icon: Sparkles,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-300 dark:border-orange-850',
    },
    {
      event: 'devil_enter_screen',
      label: 'Entrar (Aparecer Humo)',
      desc: 'El diablo es convocado y entra en pantalla en humo.',
      icon: Play,
      color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:text-teal-300 dark:border-teal-850',
    },
    {
      event: 'devil_exit_screen',
      label: 'Salir (Desaparecer Humo)',
      desc: 'El diablo sale del juego disolviéndose en humo.',
      icon: Shield,
      color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 dark:text-cyan-300 dark:border-cyan-850',
    },
    {
      event: 'user_lost_game',
      label: 'Ganar (Victoria)',
      desc: 'El usuario pierde la partida y el diablo festeja triunfante.',
      icon: Swords,
      color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-850',
    },
    {
      event: 'user_won_game',
      label: 'Perder (Derrota)',
      desc: 'El usuario gana la partida y el diablo es destruido.',
      icon: Swords,
      color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-850',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#fcfbfe] dark:bg-slate-950 p-4 sm:p-8 font-sans selection:bg-[#eddcff]">
      
      {/* ── HEADER DE PRUEBAS ── */}
      <header className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-3xl font-serif font-black text-[#310065] dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
            <Swords className="w-8 h-8 text-[#e9c349] drop-shadow-[0_4px_10px_rgba(233,195,73,0.3)]" />
            Rive Character Animation Studio
          </h1>
          <p className="text-[13px] font-bold text-[#7c7483] uppercase tracking-widest">
            Simulador de Eventos de Combate · Rival Diablo Elegante
          </p>
        </div>

        <Link
          href="/"
          className="px-5 py-3 bg-[#310065]/5 border border-[#310065]/10 rounded-2xl text-[12px] font-black text-[#310065] dark:text-[#cba72f] hover:bg-[#310065]/10 transition-colors uppercase tracking-widest cursor-pointer"
        >
          Volver a Inicio
        </Link>
      </header>

      {/* ── CONTENIDO PRINCIPAL EN REJILLA ── */}
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: VISUALIZACIÓN DEL DIABLO */}
        <div className="md:col-span-5 flex flex-col items-center gap-4 sticky top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-[3rem] p-6 shadow-xl flex items-center justify-center w-full">
            <AnimatedCharacter event={activeEvent} />
          </div>

          {/* Guía rápida de perspectiva */}
          <div className="bg-[#310065]/[0.02] border border-[#310065]/5 rounded-3xl p-4 text-[11px] font-semibold text-[#7c7483] dark:text-slate-400 space-y-1.5 w-full leading-relaxed">
            <span className="font-black text-[#310065] dark:text-white uppercase tracking-wider block mb-1 text-[12px]">
              👉 Perspectiva del Rival:
            </span>
            <p>
              • <strong className="text-emerald-600 dark:text-emerald-400">Victoria</strong> = El diablo gana porque tú perdiste.
            </p>
            <p>
              • <strong className="text-rose-600 dark:text-rose-400">Derrota</strong> = El diablo queda destruido porque tú ganaste.
            </p>
            <p>
              • <strong className="text-orange-600 dark:text-orange-400">Enojo</strong> = Ocurre al acumular una racha perfecta de respuestas correctas.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE EVENTOS */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-[3rem] p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-black text-[#310065] dark:text-white tracking-tight">
                Panel de Disparadores
              </h2>
              <p className="text-[12px] font-bold text-gray-400 dark:text-slate-400">
                Selecciona un evento de juego para evaluar la reacción y el mapeo del State Machine
              </p>
            </div>

            {/* Grid de Botones de Evento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventsList.map(item => {
                const Icon = item.icon;
                const isSelected = activeEvent === item.event;

                return (
                  <button
                    key={item.event}
                    onClick={() => setActiveEvent(item.event)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#310065] to-[#4a148c] text-white border-transparent shadow-lg shadow-[#310065]/20 scale-[1.01]'
                        : item.color
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                      isSelected ? 'bg-white/15' : 'bg-black/5 dark:bg-white/5'
                    }`}>
                      <Icon className="w-5 h-5" strokeWidth={isSelected ? 2.5 : 2} />
                    </div>
                    
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[13px] font-black tracking-tight truncate leading-tight">
                        {item.label}
                      </p>
                      <p className={`text-[10px] font-bold leading-tight ${
                        isSelected ? 'text-white/60' : 'text-gray-400'
                      }`}>
                        {item.event}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Consola de depuración JSON del estado activo */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#475569] dark:text-slate-400 uppercase tracking-widest ml-1">
                Depuración de Evento Activo (JSON)
              </span>
              <pre className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-2xl border border-slate-800 overflow-x-auto shadow-inner leading-relaxed">
{JSON.stringify(
  {
    event: activeEvent,
    timestamp: new Date().toISOString(),
    isMockBypassEnabled: typeof window !== 'undefined' && localStorage.getItem('bc_mock_user') === 'true',
    device: "iPhone 14 Simulation (iOS/NextJS)",
    resolution: "640x1136 @3x"
  },
  null,
  2
)}
              </pre>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
