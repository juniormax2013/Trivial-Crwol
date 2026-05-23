'use client';

import React, { useState } from 'react';
import DevilCharacter from '../components/DevilCharacter';
import { 
  type DevilGameEvent, 
  ALL_DEVIL_EVENTS, 
  getDevilImageForEvent, 
  getDevilImageFilename 
} from '../data/devilEmotionMap';
import { useDevilEvent } from '../hooks/useDevilEvent';
import { useDevilPower } from '../hooks/useDevilPower';
import DevilAnswerOption from '../components/DevilAnswerOption';
import { 
  Sparkles, 
  Flame, 
  Skull, 
  Trophy, 
  Tv, 
  Smile, 
  RotateCcw, 
  Maximize2, 
  Zap, 
  Compass, 
  Layers,
  Sword,
  Play,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

// Iconos y colores premium mapeados para cada botón de evento
const EVENT_META: Record<
  DevilGameEvent, 
  { label: string; desc: string; icon: any; color: string; badgeColor: string }
> = {
  devil_enter_screen: {
    label: 'Aparecer (Humo)',
    desc: 'El diablo entra en escena envuelto en humo.',
    icon: Flame,
    color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-805',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  },
  devil_idle: {
    label: 'Espera (Idle)',
    desc: 'Estado pasivo, respirando tranquilamente.',
    icon: Compass,
    color: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-805',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
  },
  devil_exit_screen: {
    label: 'Desaparecer (Humo)',
    desc: 'El diablo sale de la pantalla disolviéndose.',
    icon: Tv,
    color: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 dark:text-sky-300 dark:border-sky-805',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
  },
  user_answer_wrong: {
    label: 'Risa Malvada',
    desc: 'Se burla con regocijo cuando el usuario falla.',
    icon: Skull,
    color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-805',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  user_lost_game: {
    label: 'Victoria (Diablo)',
    desc: 'Celebra triunfante la derrota definitiva del jugador.',
    icon: Trophy,
    color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-850',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  },
  user_won_game: {
    label: 'Derrota (Diablo)',
    desc: 'Sufre humillado al perder contra el jugador.',
    icon: RotateCcw,
    color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-850',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
  },
  devil_power_activated: {
    label: 'Ataque',
    desc: 'Lanza una habilidad especial o activa trampa.',
    icon: Zap,
    color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:text-purple-300 dark:border-purple-805',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  user_two_correct_answers: {
    label: 'Sorprendido',
    desc: 'Reacciona alarmado por la inteligencia del jugador.',
    icon: Maximize2,
    color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 dark:text-cyan-300 dark:border-cyan-805',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
  },
  app_loading: {
    label: 'Pensando',
    desc: 'Medita su próximo movimiento malvado.',
    icon: Layers,
    color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-805',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  },
  user_correct_streak: {
    label: 'Enojo',
    desc: 'Enfurecido por la racha perfecta del jugador.',
    icon: Sparkles,
    color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-300 dark:border-orange-805',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  devil_greeting: {
    label: 'Saludo',
    desc: 'Una reverencia elegante al iniciar el duelo.',
    icon: Smile,
    color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:text-teal-300 dark:border-teal-805',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
  },
  user_won_against_devil: {
    label: 'Vencido (Humillado)',
    desc: 'El diablo cae derrotado tras las 2 respuestas correctas.',
    icon: RotateCcw,
    color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-805',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
  },
  user_lost_to_devil: {
    label: 'Triunfante (Victoria)',
    desc: 'El diablo celebra haberte ganado su minijuego.',
    icon: Trophy,
    color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-805',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  },
  user_answer_correct: {
    label: 'Acierto (Observador)',
    desc: 'El diablo se sorprende de tu inteligencia.',
    icon: Smile,
    color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-805',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  },
  user_bad_streak: {
    label: 'Mala Racha (Observador)',
    desc: 'El diablo celebra triunfante tus continuos fallos.',
    icon: Trophy,
    color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-805',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
};

export default function DevilEmotionTestScreen() {
  // Pestaña activa ('emotions' o 'combat')
  const [activeTab, setActiveTab] = useState<'emotions' | 'combat'>('emotions');
  
  // ── ESTADO PESTAÑA EMOCIONES (MANUAL) ──
  const [activeEvent, setActiveEvent] = useState<DevilGameEvent>('devil_idle');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ── ESTADO PESTAÑA COMBATE REAL ──
  const {
    devilActive,
    devilMode,
    devilHasAppeared,
    isDevilPowerActive,
    devilCorrectCounter,
    devilWrongCounter,
    playerCorrectStreak,
    playerWrongStreak,
    devilEvent,
    devilDefeated,
    devilWon,
    forceAppearance,
    forceExit,
    registerCorrectAnswer,
    registerWrongAnswer,
    resetMatchState,
    triggerUserWonGame,
    triggerUserLostGame,
    evaluateAppearance,
  } = useDevilEvent();

  const {
    revealedOptionIds,
    revealOption,
    isOptionCovered,
    resetPower,
  } = useDevilPower();

  // Opciones de prueba para la trivia interactiva
  const mockOptions = [
    { id: '1', text: 'Génesis', isCorrect: true },
    { id: '2', text: 'Éxodo', isCorrect: false },
    { id: '3', text: 'Levítico', isCorrect: false },
    { id: '4', text: 'Números', isCorrect: false }
  ];

  // Resolver la visualización del diablo según la pestaña activa
  const currentRenderEvent = activeTab === 'combat' ? devilEvent : activeEvent;
  const currentImagePath = getDevilImageForEvent(currentRenderEvent);
  const currentFilename = getDevilImageFilename(currentRenderEvent);

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    // 1. Revelar visualmente la carta tapada
    revealOption(optionId);

    // 2. Registrar el resultado en la lógica de combate del diablo
    if (isCorrect) {
      registerCorrectAnswer();
    } else {
      registerWrongAnswer();
    }
  };

  const handleResetCombat = () => {
    resetMatchState();
    resetPower();
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfafc] dark:bg-slate-950 p-4 sm:p-8 font-sans selection:bg-[#eddcff]">
      
      {/* ── ENCABEZADO PREMIUM ── */}
      <header className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-3xl font-serif font-black text-[#310065] dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
            <Flame className="w-8 h-8 text-red-500 animate-pulse drop-shadow-[0_4px_10px_rgba(239,68,68,0.4)]" />
            Estudio del Diablo Elegante
          </h1>
          <p className="text-[12px] font-bold text-[#7c7483] uppercase tracking-widest">
            Prueba de emociones estáticas y simulador de combate de partida real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-5 py-3 bg-[#310065]/5 border border-[#310065]/10 rounded-2xl text-[12px] font-black text-[#310065] dark:text-[#cba72f] hover:bg-[#310065]/10 transition-all uppercase tracking-widest cursor-pointer active:scale-95"
          >
            Volver a Inicio
          </Link>
        </div>
      </header>

      {/* ── SELECTOR DE PESTAÑAS ── */}
      <div className="max-w-5xl mx-auto mb-6 flex bg-[#310065]/5 p-1 rounded-2xl border border-[#310065]/10 max-w-sm">
        <button
          onClick={() => setActiveTab('emotions')}
          className={`flex-1 py-2 px-4 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'emotions'
              ? 'bg-[#310065] text-white shadow-md'
              : 'text-[#310065] hover:bg-[#310065]/5 dark:text-purple-300'
          }`}
        >
          🎭 Emociones
        </button>
        <button
          onClick={() => setActiveTab('combat')}
          className={`flex-1 py-2 px-4 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'combat'
              ? 'bg-[#310065] text-white shadow-md'
              : 'text-[#310065] hover:bg-[#310065]/5 dark:text-purple-300'
          }`}
        >
          ⚔️ Simulador Partida
        </button>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: RENDERIZACIÓN DEL PERSONAJE */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-3xl p-8 shadow-xl flex items-center justify-center w-full min-h-[360px] relative overflow-hidden">
            
            {/* Indicador de combate activo en el fondo */}
            {activeTab === 'combat' && devilActive && (
              <div className="absolute inset-0 bg-red-950/15 pointer-events-none z-0 border border-red-500/20 rounded-3xl animate-pulse" />
            )}

            <DevilCharacter event={currentRenderEvent} size={300} />
          </div>

          {/* Información del Estado Actual */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-3xl p-5 w-full space-y-3 shadow-md">
            <h3 className="text-xs font-black text-[#310065] dark:text-slate-300 uppercase tracking-widest">
              Información de la Imagen
            </h3>
            
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400 font-medium">Evento Actual:</span>
                <span className="font-bold text-red-500 dark:text-red-400 font-mono uppercase">
                  {currentRenderEvent}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400 font-medium">Archivo PNG:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                  {currentFilename}
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-slate-400 font-medium">Ruta del Proyecto:</span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-slate-300 overflow-x-auto select-all">
                  {currentImagePath}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PANELES INTERACTIVOS */}
        <div className="lg:col-span-7">
          
          {/* TAB 1: GESTIÓN DE EMOCIONES MANUALES */}
          {activeTab === 'emotions' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-black text-[#310065] dark:text-white tracking-tight">
                  Emociones y Eventos Estáticos
                </h2>
                <p className="text-[12px] font-medium text-slate-400">
                  Haz clic en cualquier emoción para disparar su ilustración manual y animaciones CSS inmediatas.
                </p>
              </div>

              {/* Grid de Botones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ALL_DEVIL_EVENTS.map((event) => {
                  const meta = EVENT_META[event] || {
                    label: event,
                    desc: 'Evento especial',
                    icon: HelpCircle,
                    color: 'bg-slate-50 text-slate-700 border-slate-200'
                  };
                  const Icon = meta.icon;
                  const isSelected = activeEvent === event;

                  return (
                    <button
                      key={event}
                      onClick={() => setActiveEvent(event)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 active:scale-[0.97] ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#310065] to-[#511696] text-white border-transparent shadow-lg shadow-[#310065]/20 scale-[1.01]'
                          : meta.color
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                        isSelected ? 'bg-white/15' : 'bg-black/5 dark:bg-white/5'
                      }`}>
                        <Icon className="w-5 h-5 animate-pulse" strokeWidth={isSelected ? 2.5 : 2} />
                      </div>
                      
                      <div className="space-y-1 min-w-0">
                        <p className="text-[13px] font-black tracking-tight leading-none">
                          {meta.label}
                        </p>
                        <p className={`text-[10px] leading-tight font-medium ${
                          isSelected ? 'text-white/70' : 'text-slate-400 dark:text-slate-400'
                        }`}>
                          {meta.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Consola de depuración JSON */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Consola de Eventos
                </span>
                <pre className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-2xl border border-slate-800/80 overflow-x-auto shadow-inner leading-relaxed">
{mounted ? JSON.stringify(
  {
    current_event: activeEvent,
    file_name: currentFilename,
    path_resolved: currentImagePath,
    folder: "public/images/Devil image/",
    timestamp: new Date().toISOString(),
    sandbox_render: true
  },
  null,
  2
) : '// Conectando consola de depuración...'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULADOR DE COMBATE EN TIEMPO REAL */}
          {activeTab === 'combat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-black text-[#310065] dark:text-white tracking-tight">
                    Simulador de Combate en Trivia
                  </h2>
                  <p className="text-[12px] font-medium text-slate-400">
                    Prueba el modo de cartas cubiertas (POWER_MODE) o de observador pasivo (OBSERVER_MODE).
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => forceAppearance('POWER_MODE')}
                    disabled={devilActive}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed"
                    title="Activar trampa con cartas cubiertas"
                  >
                    <Sword className="w-3.5 h-3.5" />
                    + Power Mode
                  </button>
                  <button
                    onClick={() => forceAppearance('OBSERVER_MODE')}
                    disabled={devilActive}
                    className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed"
                    title="Activar diablo observador pasivo"
                  >
                    <Play className="w-3.5 h-3.5" />
                    + Observer Mode
                  </button>
                  <button
                    onClick={() => evaluateAppearance('classic')}
                    disabled={devilActive}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed"
                    title="Simular tirada probabilística automática secuencial"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    🎲 Tirada Auto
                  </button>
                  <button
                    onClick={forceExit}
                    disabled={!devilActive}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed"
                    title="Hacer salir al diablo en humo"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    Salida
                  </button>
                  <button
                    onClick={handleResetCombat}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-200/50 dark:border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reiniciar
                  </button>
                </div>
              </div>

              {/* Indicador de Estado Activo */}
              {devilActive && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-[11px] font-black uppercase tracking-wider ${
                  devilMode === 'POWER_MODE'
                    ? 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:border-purple-900 dark:text-purple-300 animate-pulse'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/20 dark:border-cyan-900 dark:text-cyan-300'
                }`}>
                  <span className="flex items-center gap-1.5">
                    {devilMode === 'POWER_MODE' ? '⚔️ Modo Activo: POWER_MODE (Trampa)' : '👁️ Modo Activo: OBSERVER_MODE (Observando)'}
                  </span>
                  <span className="text-[9px] bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-lg border border-current">
                    {devilMode === 'POWER_MODE' ? 'Cartas Tapadas' : 'El diablo está observando la partida'}
                  </span>
                </div>
              )}

              {/* Estadísticas Contextuales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#310065]/[0.02] p-4 border border-[#310065]/5 rounded-2xl text-[12px]">
                <div className="space-y-0.5 border-r border-slate-200/40 dark:border-slate-800 pr-2">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">¿Diablo Activo?</span>
                  <span className={`font-black ${devilActive ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                    {devilActive ? 'SÍ (En pantalla)' : 'NO (Oculto)'}
                  </span>
                </div>
                <div className="space-y-0.5 border-r border-slate-200/40 dark:border-slate-800 pr-2 sm:pl-2">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">¿Cartas Ocultas?</span>
                  <span className={`font-black ${isDevilPowerActive ? 'text-purple-500 animate-pulse' : 'text-slate-500'}`}>
                    {isDevilPowerActive ? 'SÍ (Tapa texto)' : 'NO (Normal)'}
                  </span>
                </div>
                
                {/* Estadísticas de Power Mode */}
                {(!devilMode || devilMode === 'POWER_MODE') ? (
                  <>
                    <div className="space-y-0.5 border-r border-slate-200/40 dark:border-slate-800 pr-2 sm:pl-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Aciertos Trampa</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {devilCorrectCounter} / 2
                      </span>
                    </div>
                    <div className="space-y-0.5 sm:pl-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Fallos Trampa</span>
                      <span className="font-black text-rose-600 dark:text-rose-400">
                        {devilWrongCounter} / 3
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Estadísticas de Observer Mode */}
                    <div className="space-y-0.5 border-r border-slate-200/40 dark:border-slate-800 pr-2 sm:pl-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Racha Aciertos</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {playerCorrectStreak} seguidos
                      </span>
                    </div>
                    <div className="space-y-0.5 sm:pl-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Racha Fallos</span>
                      <span className="font-black text-rose-600 dark:text-rose-400">
                        {playerWrongStreak} seguidos
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Estados de Conclusión del combate */}
              {(devilDefeated || devilWon) && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-bounce ${
                  devilDefeated 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900' 
                    : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900'
                }`}>
                  {devilDefeated ? (
                    <CheckCircle className="w-6 h-6 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 shrink-0 text-red-500" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-black uppercase tracking-wider text-[13px]">
                      {devilDefeated ? '¡Venciste al Diablo!' : '¡El Diablo te ganó!'}
                    </span>
                    <p className="text-[11px] opacity-80">
                      {devilDefeated 
                        ? 'Lograste acertar 2 veces consecutivas. Se ha retirado en cenizas.' 
                        : 'Cometiste 3 errores acumulados. El diablo se va riendo victorioso.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Área interactiva de la trivia simulada */}
              <div className="space-y-4 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-purple-500" />
                    Vista del Jugador (Pregunta de Trivia)
                  </span>
                  <h3 className="font-serif font-black text-slate-800 dark:text-slate-200 text-sm leading-snug">
                    ¿Cuál es el primer libro del Antiguo Testamento de la Biblia?
                  </h3>
                </div>

                {/* Grid de Opciones cubiertas/reveladas */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {mockOptions.map((opt, idx) => {
                    const isCovered = isOptionCovered(opt.id, isDevilPowerActive);
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <DevilAnswerOption
                        key={opt.id}
                        optionId={opt.id}
                        optionText={opt.text}
                        isCovered={isCovered}
                        onRevealAndSelect={() => handleOptionSelect(opt.id, opt.isCorrect)}
                      >
                        {/* Botón original de juego */}
                        <button
                          onClick={() => handleOptionSelect(opt.id, opt.isCorrect)}
                          className={`w-full py-3.5 px-6 rounded-2xl border text-left font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-300 active:scale-[0.99] ${
                            opt.isCorrect 
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-[#310065] dark:text-purple-300">
                              {letter}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {/* Badge de resultado */}
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            opt.isCorrect 
                              ? 'bg-emerald-200/50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' 
                              : 'bg-slate-200/50 text-slate-500 dark:bg-slate-800/50'
                          }`}>
                            {opt.isCorrect ? 'Correcta' : 'Incorrecta'}
                          </span>
                        </button>
                      </DevilAnswerOption>
                    );
                  })}
                </div>
              </div>

              {/* Botones de simulación directa y racha para OBSERVER_MODE */}
              {devilActive && devilMode === 'OBSERVER_MODE' && (
                <div className="space-y-3 p-4 border border-cyan-200/40 rounded-2xl bg-cyan-50/10">
                  <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block mb-1">
                    ⚡ Simulación de Acciones en OBSERVER_MODE
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={registerCorrectAnswer}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      Acierto (Sorprendido)
                    </button>
                    <button
                      onClick={() => {
                        registerCorrectAnswer();
                        registerCorrectAnswer();
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      Racha Correcta x2 (Muy Sorprendido)
                    </button>
                    <button
                      onClick={() => {
                        registerCorrectAnswer();
                        registerCorrectAnswer();
                        registerCorrectAnswer();
                      }}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      Racha Correcta x3 (Enojo)
                    </button>
                    <button
                      onClick={registerWrongAnswer}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      Fallo (Risa)
                    </button>
                    <button
                      onClick={() => {
                        registerWrongAnswer();
                        registerWrongAnswer();
                      }}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                    >
                      Mala Racha x2 (Victoria Diablo)
                    </button>
                    <button
                      onClick={triggerUserWonGame}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      title="Usuario gana con diablo observando (devil_derrota)"
                    >
                      Usuario Gana
                    </button>
                    <button
                      onClick={triggerUserLostGame}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      title="Usuario pierde con diablo observando (devil_victoria)"
                    >
                      Usuario Pierde
                    </button>
                    <button
                      onClick={forceExit}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      title="Diablo sale de OBSERVER_MODE"
                    >
                      Diablo Sale
                    </button>
                  </div>
                </div>
              )}

              {/* Guía rápida de flujo del Combate real */}
              <div className="bg-[#310065]/[0.02] border border-[#310065]/5 rounded-2xl p-4 text-[11px] font-semibold text-slate-500 space-y-1.5 leading-relaxed">
                <span className="font-black text-[#310065] dark:text-white uppercase tracking-wider block mb-1 text-[11.5px]">
                  💡 Guías de Flujo de Juego:
                </span>
                <p>
                  • <strong className="text-purple-600 font-extrabold uppercase text-[10px] tracking-wider">Modo ⚔️ POWER_MODE</strong>: Las respuestas se muestran cubiertas. El usuario debe acertar **2 preguntas** consecutivas para disolver al diablo en cenizas, o cometer **3 fallos** acumulados para que el diablo gane la trampa y se vaya.
                </p>
                <p>
                  • <strong className="text-cyan-600 font-extrabold uppercase text-[10px] tracking-wider">Modo 👁️ OBSERVER_MODE</strong>: Las respuestas **nunca se cubren**. El diablo permanece de fondo, gesticulando ante cada acierto o fallo del jugador sin alterar las reglas del juego. Muestra un badge indicativo en la parte superior.
                </p>
              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
