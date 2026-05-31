'use client';

import React, { useState } from 'react';
import DevilCharacter from '../components/DevilCharacter';
import JesusCharacter from '../components/JesusCharacter';
import { 
  type DevilGameEvent, 
  ALL_DEVIL_EVENTS, 
  getDevilImageForEvent, 
  getDevilImageFilename 
} from '../data/devilEmotionMap';
import {
  type JesusGameEvent,
  ALL_JESUS_EVENTS,
  getJesusImageForEvent,
  getJesusImageFilename
} from '../data/jesusEmotionMap';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import { useDevilPower } from '../hooks/useDevilPower';
import { useJesusTrap } from '../../hooks/useJesusTrap';
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
  HelpCircle,
  Shield,
  Heart
} from 'lucide-react';
import Link from 'next/link';

// Iconos y colores premium mapeados para cada botón de evento del Diablo
const DEVIL_EVENT_META: Record<
  DevilGameEvent, 
  { label: string; desc: string; icon: any; color: string; badgeColor: string }
> = {
  devil_enter_screen: {
    label: 'Aparecer (Humo)',
    desc: 'El diablo entra en escena envuelto en humo.',
    icon: Flame,
    color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300',
    badgeColor: 'bg-red-100 text-red-800'
  },
  devil_idle: {
    label: 'Espera (Idle)',
    desc: 'Estado pasivo, respirando tranquilamente.',
    icon: Compass,
    color: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-300',
    badgeColor: 'bg-slate-100 text-slate-800'
  },
  devil_exit_screen: {
    label: 'Desaparecer (Humo)',
    desc: 'El diablo sale de la pantalla disolviéndose.',
    icon: Tv,
    color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-300',
    badgeColor: 'bg-orange-100 text-orange-805'
  },
  user_answer_wrong: {
    label: 'Risa Malvada',
    desc: 'Se burla con regocijo cuando el usuario falla.',
    icon: Skull,
    color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300',
    badgeColor: 'bg-red-105 text-red-805'
  },
  user_lost_game: {
    label: 'Victoria (Diablo)',
    desc: 'Celebra triunfante la derrota definitiva del jugador.',
    icon: Trophy,
    color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  user_won_game: {
    label: 'Derrota (Diablo)',
    desc: 'Sufre humillado al perder contra el jugador.',
    icon: RotateCcw,
    color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  devil_power_activated: {
    label: 'Ataque',
    desc: 'Lanza una habilidad especial o activa trampa.',
    icon: Zap,
    color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:text-purple-300',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  user_two_correct_answers: {
    label: 'Sorprendido',
    desc: 'Reacciona alarmado por la inteligencia del jugador.',
    icon: Maximize2,
    color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 dark:text-cyan-300',
    badgeColor: 'bg-cyan-100 text-cyan-800'
  },
  app_loading: {
    label: 'Pensando',
    desc: 'Medita su próximo movimiento malvado.',
    icon: Layers,
    color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  user_correct_streak: {
    label: 'Enojo',
    desc: 'Enfurecido por la racha perfecta del jugador.',
    icon: Sparkles,
    color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-300',
    badgeColor: 'bg-orange-100 text-orange-800'
  },
  devil_greeting: {
    label: 'Saludo',
    desc: 'Una reverencia elegante al iniciar el duelo.',
    icon: Smile,
    color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:text-teal-300',
    badgeColor: 'bg-teal-100 text-teal-800'
  },
  user_won_against_devil: {
    label: 'Vencido (Humillado)',
    desc: 'El diablo cae derrotado tras las 2 respuestas correctas.',
    icon: RotateCcw,
    color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  user_lost_to_devil: {
    label: 'Triunfante (Victoria)',
    desc: 'El diablo celebra haberte ganado su minijuego.',
    icon: Trophy,
    color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  user_answer_correct: {
    label: 'Acierto (Observador)',
    desc: 'El diablo se sorprende de tu inteligencia.',
    icon: Smile,
    color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  user_bad_streak: {
    label: 'Mala Racha (Observador)',
    desc: 'El diablo celebra triunfante tus continuos fallos.',
    icon: Trophy,
    color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300',
    badgeColor: 'bg-red-100 text-red-800'
  }
};

// Iconos y colores premium mapeados para cada botón de evento de Jesús
const JESUS_EVENT_META: Record<
  JesusGameEvent,
  { label: string; desc: string; icon: any; color: string; badgeColor: string }
> = {
  jesus_appear: {
    label: 'Aparecer (Luz)',
    desc: 'Jesús aparece en escena rodeado de luz cálida.',
    icon: Sparkles,
    color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  jesus_idle: {
    label: 'Sereno (Idle)',
    desc: 'Espera en estado sereno y pacífico.',
    icon: Compass,
    color: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-300',
    badgeColor: 'bg-slate-100 text-slate-800'
  },
  jesus_greeting: {
    label: 'Saludo',
    desc: 'Saluda al jugador transmitiendo paz.',
    icon: Smile,
    color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:text-teal-300',
    badgeColor: 'bg-teal-100 text-teal-800'
  },
  jesus_blessing_start: {
    label: 'Bendición Inicio',
    desc: 'Otorga una bendición divina al comenzar.',
    icon: Heart,
    color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  jesus_celebrate_correct: {
    label: 'Celebración Acierto',
    desc: 'Festeja alegremente cuando el jugador responde bien.',
    icon: Trophy,
    color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  jesus_compassion_wrong: {
    label: 'Compasión Fallo',
    desc: 'Muestra compasión y te alienta tras un error.',
    icon: Smile,
    color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  jesus_reveal_answer: {
    label: 'Revelar Respuesta',
    desc: 'Poder divino que ilumina la respuesta correcta.',
    icon: Zap,
    color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200/60 dark:bg-yellow-950/40 dark:hover:bg-yellow-900/60 dark:text-yellow-300',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  jesus_protect_devil: {
    label: 'Protección Diablo',
    desc: 'Escudo de luz para bloquear al Diablo.',
    icon: Shield,
    color: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 dark:text-sky-300',
    badgeColor: 'bg-sky-100 text-sky-800'
  },
  jesus_divine_wisdom: {
    label: 'Sabiduría Divina',
    desc: 'Reflexiona entregándote luz y guía.',
    icon: Layers,
    color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  jesus_holy_authority: {
    label: 'Autoridad Santa',
    desc: 'Se impone con luz pura disolviendo la maldad.',
    icon: Shield,
    color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 dark:text-purple-300',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  jesus_glorious_victory: {
    label: 'Victoria Gloriosa',
    desc: 'Celebración definitiva de triunfo de la luz.',
    icon: Sparkles,
    color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  jesus_disappear: {
    label: 'Desaparecer (Luz)',
    desc: 'Se retira envuelto en un haz de luz resplandeciente.',
    icon: Tv,
    color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300',
    badgeColor: 'bg-blue-100 text-blue-850'
  }
};

export default function DevilEmotionTestScreen() {
  const [activeTab, setActiveTab] = useState<'emotions' | 'combat'>('emotions');
  const [selectedCharacter, setSelectedCharacter] = useState<'devil' | 'jesus'>('jesus');
  
  // ── ESTADO PESTAÑA EMOCIONES (MANUAL) ──
  const [activeDevilEvent, setActiveDevilEvent] = useState<DevilGameEvent>('devil_idle');
  const [activeJesusEvent, setActiveJesusEvent] = useState<JesusGameEvent>('jesus_idle');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ── ESTADO COMBATE REAL DIABLO ──
  const devilTrap = useDevilTrap();

  const {
    revealedOptionIds,
    revealOption,
    isOptionCovered,
    resetPower,
  } = useDevilPower();

  // ── ESTADO COMBATE REAL JESÚS ──
  const jesusTrap = useJesusTrap({
    isDevilActive: devilTrap.isDevilActive,
    devilState: devilTrap.devilState,
    setDevilEvent: devilTrap.setDevilEvent,
    setDevilState: devilTrap.setDevilState,
    resetDevilTrap: () => {
      devilTrap.resetDevilTrap(true);
      resetPower();
    }
  });

  // Opciones de prueba para la trivia interactiva
  const mockOptions = [
    { id: '1', text: 'Génesis', isCorrect: true },
    { id: '2', text: 'Éxodo', isCorrect: false },
    { id: '3', text: 'Levítico', isCorrect: false },
    { id: '4', text: 'Números', isCorrect: false }
  ];

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    revealOption(optionId);
    if (isCorrect) {
      devilTrap.devilDefeat();
      jesusTrap.reactToCorrectAnswer();
    } else {
      devilTrap.devilCelebrate();
      jesusTrap.reactToWrongAnswer();
    }
  };

  const handleResetCombat = () => {
    devilTrap.resetDevilTrap(true);
    jesusTrap.resetMatchState();
    resetPower();
  };

  const currentRenderEvent = activeTab === 'combat' 
    ? (selectedCharacter === 'devil' ? (devilTrap.devilEvent || 'devil_idle') : (jesusTrap.jesusEvent || 'jesus_idle'))
    : (selectedCharacter === 'devil' ? activeDevilEvent : activeJesusEvent);

  const currentImagePath = selectedCharacter === 'devil' 
    ? getDevilImageForEvent(currentRenderEvent)
    : getJesusImageForEvent(currentRenderEvent);

  const currentFilename = selectedCharacter === 'devil'
    ? getDevilImageFilename(currentRenderEvent)
    : getJesusImageFilename(currentRenderEvent);

  return (
    <div className="min-h-screen w-full bg-[#fbfafc] dark:bg-slate-950 p-4 sm:p-8 font-sans selection:bg-[#eddcff]">
      
      {/* ── ENCABEZADO ── */}
      <header className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-3xl font-serif font-black text-[#0A84FF] dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
            <Sparkles className="w-8 h-8 text-[#0A84FF] animate-pulse drop-shadow-[0_4px_10px_rgba(10,132,255,0.4)]" />
            Estudio de Personajes: Jesús & Diablo
          </h1>
          <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest">
            Simulador interactivo de emociones y ciclo de vida en PhotoArte Studio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-5 py-3 bg-[#0A84FF]/5 border border-[#0A84FF]/10 rounded-2xl text-[12px] font-black text-[#0A84FF] hover:bg-[#0A84FF]/10 transition-all uppercase tracking-widest cursor-pointer active:scale-95"
          >
            Volver a Inicio
          </Link>
        </div>
      </header>

      {/* ── CONFIGURACIÓN DE TABS ── */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Tab principal */}
        <div className="flex bg-[#0A84FF]/5 p-1 rounded-2xl border border-[#0A84FF]/10 max-w-sm w-full">
          <button
            onClick={() => setActiveTab('emotions')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'emotions'
                ? 'bg-[#0A84FF] text-white shadow-md'
                : 'text-[#0A84FF] hover:bg-[#0A84FF]/5'
            }`}
          >
            🎭 Probar Gestos
          </button>
          <button
            onClick={() => setActiveTab('combat')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'combat'
                ? 'bg-[#0A84FF] text-white shadow-md'
                : 'text-[#0A84FF] hover:bg-[#0A84FF]/5'
            }`}
          >
            ⚔️ Simulador Duelo
          </button>
        </div>

        {/* Selector de personaje activo para la vista de cámara */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-205 max-w-xs w-full">
          <button
            onClick={() => setSelectedCharacter('jesus')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
              selectedCharacter === 'jesus'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            😇 Jesús
          </button>
          <button
            onClick={() => setSelectedCharacter('devil')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
              selectedCharacter === 'devil'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            😈 Diablo
          </button>
        </div>

      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: CÁMARA DE RENDERIZADO */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-[24px] p-8 shadow-xl flex items-center justify-center w-full min-h-[380px] relative overflow-hidden">
            
            {/* Fondo de aura dinámico */}
            {selectedCharacter === 'jesus' ? (
              <div className="absolute inset-0 bg-amber-500/5 pointer-events-none z-0" />
            ) : (
              <div className="absolute inset-0 bg-red-650/5 pointer-events-none z-0" />
            )}

            {selectedCharacter === 'jesus' ? (
              <JesusCharacter event={currentRenderEvent} size={340} showEventBadge />
            ) : (
              <DevilCharacter event={currentRenderEvent} size={300} showEventBadge />
            )}
          </div>

          {/* Ficha técnica */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-[24px] p-5 w-full space-y-3 shadow-md">
            <h3 className="text-xs font-black text-[#0F172A] dark:text-slate-300 uppercase tracking-widest">
              Detalles del Elemento Activo
            </h3>
            
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-[#64748B] font-medium">Personaje:</span>
                <span className={`font-black uppercase ${selectedCharacter === 'jesus' ? 'text-amber-600' : 'text-red-500'}`}>
                  {selectedCharacter === 'jesus' ? '😇 Jesús (Divino)' : '😈 Diablo (Oscuridad)'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-[#64748B] font-medium">Evento:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase">
                  {currentRenderEvent}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-[#64748B] font-medium">Archivo PNG:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                  {currentFilename}
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[#64748B] font-medium">Ruta Relativa:</span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-slate-300 overflow-x-auto select-all">
                  {currentImagePath}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SECTORES INTERACTIVOS */}
        <div className="lg:col-span-7">
          
          {/* TAB 1: EMOCIONES MANUALES */}
          {activeTab === 'emotions' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-[24px] p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-black text-[#0F172A] dark:text-white tracking-tight">
                  Probar Gestos del Personaje
                </h2>
                <p className="text-[12px] font-medium text-[#64748B]">
                  Activa cualquiera de las ilustraciones individuales del personaje seleccionado para verificar su renderizado y transparencias.
                </p>
              </div>

              {selectedCharacter === 'jesus' ? (
                /* Grid de Jesús */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ALL_JESUS_EVENTS.map((event) => {
                    const meta = JESUS_EVENT_META[event] || {
                      label: event,
                      desc: 'Acción especial',
                      icon: HelpCircle,
                      color: 'bg-slate-50 text-slate-700'
                    };
                    const Icon = meta.icon;
                    const isSelected = activeJesusEvent === event;

                    return (
                      <button
                        key={event}
                        onClick={() => setActiveJesusEvent(event)}
                        className={`flex items-start gap-4 p-4 rounded-[16px] border text-left cursor-pointer transition-all duration-300 active:scale-[0.97] ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-transparent shadow-lg shadow-amber-500/20 scale-[1.01]'
                            : meta.color
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                          isSelected ? 'bg-white/15' : 'bg-black/5 dark:bg-white/5'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-black tracking-tight leading-tight">{meta.label}</p>
                          <p className={`text-[10px] leading-tight font-medium ${isSelected ? 'text-white/70' : 'text-[#64748B]'}`}>{meta.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Grid del Diablo */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ALL_DEVIL_EVENTS.map((event) => {
                    const meta = DEVIL_EVENT_META[event] || {
                      label: event,
                      desc: 'Acción oscura',
                      icon: HelpCircle,
                      color: 'bg-slate-50 text-slate-700'
                    };
                    const Icon = meta.icon;
                    const isSelected = activeDevilEvent === event;

                    return (
                      <button
                        key={event}
                        onClick={() => setActiveDevilEvent(event)}
                        className={`flex items-start gap-4 p-4 rounded-[16px] border text-left cursor-pointer transition-all duration-300 active:scale-[0.97] ${
                          isSelected
                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-transparent shadow-lg shadow-red-600/20 scale-[1.01]'
                            : meta.color
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                          isSelected ? 'bg-white/15' : 'bg-black/5 dark:bg-white/5'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-black tracking-tight leading-tight">{meta.label}</p>
                          <p className={`text-[10px] leading-tight font-medium ${isSelected ? 'text-white/70' : 'text-[#64748B]'}`}>{meta.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIMULADOR DE COMBATE EN TIEMPO REAL */}
          {activeTab === 'combat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/65 rounded-[24px] p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-black text-[#0F172A] dark:text-white tracking-tight">
                    Simulador Duelo: Jesús vs Diablo
                  </h2>
                  <p className="text-[12px] font-medium text-[#64748B]">
                    Simula la partida activa y las interacciones combinadas de ayuda divina frente a ataques del diablo.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      devilTrap.triggerDevilTrap(mockOptions, true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-650 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    💀 Diablo Ataca
                  </button>
                  <button
                    onClick={() => {
                      jesusTrap.useDivineProtection();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0A84FF] text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    🛡️ Jesús Protege
                  </button>
                  <button
                    onClick={() => {
                      jesusTrap.useRevealCorrectAnswer();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    ✨ Jesús Revela
                  </button>
                  <button
                    onClick={handleResetCombat}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    Reiniciar Duelo
                  </button>
                </div>
              </div>

              {/* Status de Duelo Activo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Diablo */}
                <div className="p-4 rounded-2xl border border-red-100 bg-red-50/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-red-600">👹 Estado Diablo</span>
                    <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-black">
                      {devilTrap.isDevilActive ? devilTrap.devilState.toUpperCase() : 'INACTIVO'}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-700">Evento actual: <strong className="font-mono text-red-600">{devilTrap.devilEvent || 'NINGUNO'}</strong></p>
                </div>

                {/* Status Jesús */}
                <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-600">👼 Estado Jesús</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">
                      {jesusTrap.isJesusActive ? jesusTrap.jesusState.toUpperCase() : 'INACTIVO'}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-700">Evento actual: <strong className="font-mono text-amber-600">{jesusTrap.jesusEvent || 'NINGUNO'}</strong></p>
                </div>
              </div>

              {/* Contador de usos restantes */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-around text-center text-[12px] border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Revelaciones</span>
                  <span className="font-black text-amber-600">{jesusTrap.revealUsesRemaining} restante(s)</span>
                </div>
                <div className="border-r border-slate-200 dark:border-slate-700 h-8 self-center" />
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Protecciones</span>
                  <span className="font-black text-sky-600">{jesusTrap.protectionUsesRemaining} restante(s)</span>
                </div>
                <div className="border-r border-slate-200 dark:border-slate-700 h-8 self-center" />
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Segundas Oport.</span>
                  <span className="font-black text-emerald-600">{jesusTrap.secondChanceUsesRemaining} restante(s)</span>
                </div>
              </div>

              {/* Área interactiva de la trivia simulada */}
              <div className="space-y-4 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-[#0A84FF] uppercase tracking-widest flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-[#0A84FF]" />
                    Simulador de Opciones (Haz clic para responder)
                  </span>
                  <h3 className="font-serif font-black text-slate-800 dark:text-slate-200 text-sm leading-snug">
                    ¿Cuál es el primer libro del Antiguo Testamento de la Biblia?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {mockOptions.map((opt, idx) => {
                    const isCovered = isOptionCovered(opt.id, devilTrap.isDevilActive && devilTrap.devilMode === 'POWER_MODE');
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <DevilAnswerOption
                        key={opt.id}
                        optionId={opt.id}
                        optionText={opt.text}
                        isCovered={isCovered}
                        onRevealAndSelect={() => handleOptionSelect(opt.id, opt.isCorrect)}
                      >
                        <button
                          onClick={() => handleOptionSelect(opt.id, opt.isCorrect)}
                          className={`w-full py-3.5 px-6 rounded-2xl border text-left font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-300 active:scale-[0.99] ${
                            opt.isCorrect 
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-[#0A84FF]">
                              {letter}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            opt.isCorrect 
                              ? 'bg-emerald-200/50 text-emerald-800' 
                              : 'bg-slate-200/50 text-slate-505'
                          }`}>
                            {opt.isCorrect ? 'Correcta' : 'Incorrecta'}
                          </span>
                        </button>
                      </DevilAnswerOption>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
