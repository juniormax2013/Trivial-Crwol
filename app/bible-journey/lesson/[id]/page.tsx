'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  CheckCircle2, 
  Award, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';
import { getLessonById, BibleLesson } from '@/lib/bible/data';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { getUserHearts } from '@/lib/bible/repository';
import { toast } from 'sonner';

export default function BibleLessonIntro() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  
  const lessonId = params.id as string;
  const lesson = getLessonById(lessonId);

  const [heartsCount, setHeartsCount] = useState(5);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserHearts(user.uid).then(h => {
      setHeartsCount(h.heartsRemaining);
    });
  }, [user]);

  if (!lesson) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-black text-[#310065]">Lección no encontrada</h3>
        <p className="text-xs text-[#1b1b1e]/60 font-semibold">El camino seleccionado no es válido.</p>
        <button 
          onClick={() => router.push('/bible-journey/map')}
          className="py-2.5 px-6 bg-[#310065] text-white rounded-xl text-xs font-black uppercase tracking-wider"
        >
          Volver al Mapa
        </button>
      </div>
    );
  }

  // Scripture text database for summaries
  const SCRIPTURE_SUMMARIES: Record<string, { title: string; passage: string }> = {
    'genesis_l1': {
      title: 'Resumen Bíblico: Génesis 1 (La Creación)',
      passage: 'En el principio, Dios creó los cielos y la tierra. La tierra estaba desordenada y vacía. El Día 1, Dios dijo "Sea la luz", separándola de las tinieblas. El Día 2, separó las aguas creando la expansión de los cielos. El Día 3, reunió las aguas inferiores revelando la tierra seca y produciendo plantas y árboles frutales. El Día 4, colocó el sol, la luna y las estrellas para señales de tiempos y días. El Día 5, creó las criaturas marinas y las aves del cielo. El Día 6, creó los animales terrestres y finalmente al hombre y la mujer a su imagen y semejanza, encomendándoles señorear sobre la tierra. Vio Dios todo lo que había hecho, y era bueno en gran manera. El Día 7, Dios reposó de toda su obra.'
    },
    'genesis_l2': {
      title: 'Resumen Bíblico: Génesis 2 (El Huerto y el Matrimonio)',
      passage: 'Dios formó al hombre del polvo de la tierra y sopló en su nariz aliento de vida, convirtiéndolo en un ser viviente. Plantó luego un huerto en Edén, al oriente, colocando allí al hombre. En medio del huerto puso el Árbol de la Vida y el Árbol de la Ciencia del Bien y del Mal. Mandó Dios al hombre comer de todo árbol del huerto, excepto del árbol prohibido, pues el día que de él comiere, moriría. Dios encargó al hombre labrar y guardar el huerto, y poner nombre a todos los animales terrestres y aves. Al ver que el hombre estaba solo, Dios declaró que no era bueno, hizo caer a Adán en sueño profundo, tomó una de sus costillas y formó a la mujer, Eva, como su ayuda idónea.'
    },
    'genesis_l3': {
      title: 'Resumen Bíblico: Génesis 3 (La Caída)',
      passage: 'La serpiente astuta sembró la duda en Eva sobre el mandato divino, afirmando que si comían del árbol prohibido serían como Dios, conociendo el bien y el mal. Eva vio que el árbol era agradable a los ojos, comió de su fruto y dio también a Adán, quien comió. De inmediato, sus ojos fueron abiertos, sintieron vergüenza al verse desnudos y cosieron hojas de higuera. Al oír la voz de Dios en el huerto, se escondieron por miedo. Dios los confrontó y pronunció juicios: la serpiente fue maldita a arrastrarse; la mujer recibiría dolores en la maternidad; y el hombre cultivaría la tierra con fatiga, sudor y espinos. Dios les vistió con pieles de animales y los expulsó del huerto para cultivar la tierra, colocando querubines con una espada encendida para guardar el Árbol de la Vida.'
    },
    'genesis_l4': {
      title: 'Resumen Bíblico: Génesis 4 (Caín y Abel)',
      passage: 'Adán y Eva tuvieron a Caín (labrador de la tierra) y a Abel (pastor de ovejas). Pasado el tiempo, Caín presentó a Dios una ofrenda de los frutos del campo, mientras que Abel ofreció de los primogénitos de sus ovejas y lo más gordo de ellas. Dios miró con agrado a Abel y su ofrenda, pero no la de Caín. Caín se enojó extremadamente y decayó su rostro. Dios le advirtió que el pecado estaba acechando a su puerta, pero que debía dominarlo. Ignorando la advertencia, Caín llevó a Abel al campo y le quitó la vida. Cuando Dios le preguntó por su hermano, Caín respondió con soberbia: "¿Soy yo acaso guarda de mi hermano?". Dios maldijo a Caín a ser extranjero y errante en la tierra de Nod, pero colocó una marca protectora en él.'
    },
    'genesis_l5': {
      title: 'Resumen de la Unidad: Génesis 1–4 (El Comienzo)',
      passage: 'Esta unidad recorre los cuatro hitos fundamentales de los comienzos del hombre. Primero, la creación soberana de Dios, estableciendo orden y valor sobre el universo. Segundo, el diseño idílico de la comunión y la intimidad humana en el huerto de Edén a través de Adán y Eva. Tercero, la dramática entrada del pecado en el mundo debido a la desobediencia y la duda sembrada por la tentación. Y cuarto, el crecimiento de la rebelión humana manifestada en el celo homicida de Caín y la pérdida de la hermandad. Estos capítulos sientan las bases eternas de la santidad divina, la fragilidad humana y la necesidad de redención.'
    }
  };

  const currentSummary = SCRIPTURE_SUMMARIES[lesson.id] || SCRIPTURE_SUMMARIES['genesis_l1'];

  const handleStartLesson = () => {
    if (heartsCount <= 0) {
      toast.error("¡No te quedan corazones! Practica repasos en el menú para ganar corazones de vuelta.", {
        position: 'top-center',
        duration: 4000
      });
      return;
    }
    router.push(`/bible-journey/lesson/${lesson.id}/play`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      
      {/* 1. HEADER STORY IMAGE COVER */}
      <section className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden border border-purple-100 shadow-md">
        <Image 
          src={lesson.image_url} 
          alt={lesson.title} 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 576px"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Absolute back arrow on image */}
        <button 
          onClick={() => router.push('/bible-journey/map')}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>

        <div className="absolute bottom-5 left-5 right-5 space-y-1 text-white">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400">
            Lección {lesson.order_number}
          </span>
          <h1 className="text-xl sm:text-2xl font-black font-serif italic tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </div>
      </section>

      {/* 2. DESCRIPTION TEXT */}
      <section className="bg-white border border-purple-100/50 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-[#310065] uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen size={14} />
          Introducción Histórica
        </h3>
        <p className="text-[#1b1b1e]/80 text-xs font-semibold leading-relaxed">
          {lesson.description}
        </p>
      </section>

      {/* 3. LEARNING CHECKLIST OBJECTIVES */}
      <section className="bg-white border border-purple-100/50 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-[#310065] uppercase tracking-widest pl-1">
          Aprenderás a:
        </h3>

        <div className="space-y-3">
          {lesson.learning_goals.map((goal, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-[#1b1b1e]/75 leading-relaxed">
                {goal}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. REWARDS AND STATS GRID */}
      <section className="grid grid-cols-3 gap-3 bg-white border border-purple-100/50 rounded-2xl p-4 shadow-sm text-center">
        <div className="flex flex-col items-center gap-1 py-1 border-r border-purple-100/40">
          <Award size={18} className="text-amber-500 animate-pulse" />
          <span className="text-[11px] font-black text-[#1b1b1e] tracking-tight">{lesson.xp_reward} XP</span>
          <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest">Premio</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-1 border-r border-purple-100/40">
          <Clock size={18} className="text-[#310065]" />
          <span className="text-[11px] font-black text-[#1b1b1e] tracking-tight">{lesson.estimated_time}</span>
          <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest">Duración</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-1">
          <CheckCircle2 size={18} className="text-green-500" />
          <span className="text-[11px] font-black text-[#1b1b1e] tracking-tight">{lesson.exercises_count} Ejercicios</span>
          <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest">Preguntas</span>
        </div>
      </section>

      {/* 5. PLAY ACTION BUTTONS */}
      <section className="flex flex-col gap-3 pt-2">
        <button
          onClick={handleStartLesson}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-[#e9c349] hover:from-amber-300 hover:to-amber-400 text-[#310065] rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-400/10 active:scale-95 transition-all group"
        >
          <span>Comenzar Lección</span>
          <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={() => setShowSummaryModal(true)}
          className="w-full py-4 px-6 bg-white hover:bg-purple-50 text-[#310065] rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border border-purple-100 shadow-sm active:scale-95 transition-all"
        >
          Ver Resumen Bíblico
        </button>
      </section>

      {/* ==========================================
          📖 SCRIPTURE READ-ONLY OVERLAY MODAL
      ========================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#faf9fc] w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 border border-white/20 shadow-2xl relative flex flex-col gap-5 max-h-[85vh] animate-scale-in">
            {/* Close Button */}
            <button 
              onClick={() => setShowSummaryModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white text-[#1b1b1e]/60 flex items-center justify-center hover:bg-purple-50 shadow-sm active:scale-95 transition-all border border-purple-100/30"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            {/* Header Icon */}
            <div className="flex items-center gap-2.5 pr-8">
              <div className="w-9 h-9 rounded-xl bg-[#310065]/10 text-[#310065] flex items-center justify-center shadow-inner shrink-0">
                <BookOpen size={16} />
              </div>
              <h4 className="text-md sm:text-lg font-black text-[#310065] font-serif italic leading-snug">
                {currentSummary.title}
              </h4>
            </div>

            {/* Scripture text container */}
            <div className="flex-1 overflow-y-auto pr-2 bg-white border border-purple-100/30 rounded-2xl p-5 shadow-inner">
              <p className="text-[#1b1b1e] text-xs font-semibold leading-relaxed text-justify first-letter:text-2xl first-letter:font-black first-letter:text-[#310065] first-letter:mr-1 first-letter:font-serif first-letter:float-left">
                {currentSummary.passage}
              </p>
            </div>

            {/* Action close button */}
            <button 
              onClick={() => setShowSummaryModal(false)}
              className="w-full py-3.5 bg-[#310065] hover:bg-[#4a148c] text-white rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md"
            >
              Entendido, volver
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
