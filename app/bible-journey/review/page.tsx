'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  RotateCcw, 
  Heart, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  X,
  BookOpen,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { 
  getQuestionsForReview, 
  submitReviewAnswer, 
  refillHearts, 
  ReviewQuestion 
} from '@/lib/bible/repository';
import { getLessonById, LessonQuestion } from '@/lib/bible/data';
import { toast } from 'sonner';

export default function BibleReviewCenter() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
  
  // Review Session States
  const [isPlayingReview, setIsPlayingReview] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [showSessionResults, setShowSessionResults] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchReviewQuestions();
  }, [user]);

  const fetchReviewQuestions = async () => {
    try {
      const questions = await getQuestionsForReview(user!.uid);
      setReviewQuestions(questions);
    } catch (err) {
      console.error("Error fetching review questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Start Review Session
  const handleStartReview = (singleQuestionId?: string) => {
    if (reviewQuestions.length === 0) {
      toast.info("¡No tienes preguntas para repasar hoy! Excelente trabajo.", { position: 'top-center' });
      return;
    }

    if (singleQuestionId) {
      const filtered = reviewQuestions.filter(q => q.id === singleQuestionId);
      setReviewQuestions(filtered);
    }

    setActiveIdx(0);
    setSessionCorrectCount(0);
    setIsPlayingReview(true);
    setIsChecked(false);
    setShowSessionResults(false);
    setSelectedOption('');
  };

  // Check Review Answer
  const handleCheckReviewAnswer = async () => {
    const q = reviewQuestions[activeIdx];
    const isAnsCorrect = selectedOption === q.correctAnswer;

    setIsCorrect(isAnsCorrect);
    setIsChecked(true);

    if (isAnsCorrect) {
      setSessionCorrectCount(prev => prev + 1);
    }

    try {
      // Sync answer with Firestore spaced repetition repository
      await submitReviewAnswer(user!.uid, q.id, isAnsCorrect);
    } catch (err) {
      console.error("Error submitting review answer:", err);
    }
  };

  // Continue in review session
  const handleContinueReview = () => {
    if (activeIdx + 1 < reviewQuestions.length) {
      setActiveIdx(prev => prev + 1);
      setSelectedOption('');
      setIsChecked(false);
    } else {
      // Completed all due review questions!
      setShowSessionResults(true);
    }
  };

  const handleFinishReviewSession = () => {
    setIsPlayingReview(false);
    fetchReviewQuestions(); // Reload list
  };

  // Map Lesson Image helpers
  const getLessonThumbnail = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    return lesson?.thumbnail_url || '/images/bible-journey/image (1).png';
  };

  const getLessonChapterRange = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    if (!lesson) return 'Génesis';
    return `Génesis ${lesson.chapter_start}:${lesson.chapter_end === lesson.chapter_start ? '1-31' : '4-25'}`;
  };

  const getLessonName = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    return lesson?.title || 'Historia Bíblica';
  };

  const getQuestionTypeLabel = (typeStr: string) => {
    switch (typeStr) {
      case 'multiple_choice': return 'Selección múltiple';
      case 'true_false': return 'Verdadero o falso';
      case 'fill_blanks': return 'Completar espacio';
      case 'order_events': return 'Ordenar eventos';
      case 'match_columns': return 'Relacionar columnas';
      default: return 'Comprensión';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-[#310065] border-t-amber-400 rounded-full animate-spin mb-3" />
        <span className="text-white/60 font-semibold text-xs uppercase tracking-widest">
          Abriendo el diario de estudio...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative pb-16">
      
      {/* 1. HERO REPASO WELCOME CARD */}
      <section className="bg-gradient-to-br from-[#11002c] via-[#310065] to-[#4a148c] rounded-[2rem] p-6 shadow-xl border border-white/10 relative overflow-hidden group">
        <div className="absolute -top-16 -right-16 text-[9rem] opacity-5 pointer-events-none select-none rotate-45">
          🔄
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-400/30">
              Repaso Inteligente
            </span>
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif italic tracking-tight leading-tight">
              Repaso Diario
            </h2>
            <p className="text-white/60 text-xs font-semibold max-w-[85%] leading-relaxed">
              Refuerza lo que has fallado en tus lecciones. Responde bien para recuperar tus corazones de sabiduría perdidos y consolidar tu aprendizaje bíblico.
            </p>
          </div>
        </div>
      </section>

      {/* 2. REVISE BANNER PROMPT */}
      <section className="bg-amber-400/10 border border-amber-400/25 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-[#310065] uppercase tracking-wider">
            {reviewQuestions.length} Preguntas Pendientes
          </h4>
          <p className="text-[10px] font-bold text-[#1b1b1e]/65 max-w-[200px]">
            ¡Recupera tus corazones! Responder bien te otorga +1 Corazón de vida.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-red-500 font-black text-xs bg-white shadow-sm px-3 py-1.5 rounded-full border border-purple-100">
          <Heart size={14} fill="currentColor" className="animate-bounce" />
          <span>Recupera Corazón</span>
        </div>
      </section>

      {/* 3. FAILED QUESTIONS LIST */}
      <section className="space-y-3.5">
        <h3 className="text-xs font-black text-[#310065] uppercase tracking-widest pl-2">
          Preguntas falladas en el Camino
        </h3>

        {reviewQuestions.length === 0 ? (
          <div className="bg-white border border-purple-100/40 rounded-3xl p-8 text-center flex flex-col items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center shadow-inner">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-black text-[#1b1b1e]">¡Felicidades, estás al día!</h5>
              <p className="text-[10px] text-[#1b1b1e]/55 font-bold max-w-[220px]">
                No tienes preguntas pendientes de repasar hoy. Sigue avanzando en el Mapa para adquirir nuevos conocimientos.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewQuestions.map((q) => (
              <div 
                key={q.id}
                className="bg-white border border-purple-100/50 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:px-5 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Circular Illustration Thumbnail */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-100 shadow-sm relative shrink-0">
                    <Image 
                      src={getLessonThumbnail(q.lessonId)} 
                      alt="Historia" 
                      fill
                      sizes="48px"
                      className="object-cover" 
                    />
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-[11px] font-black text-[#1b1b1e] tracking-tight leading-tight">
                      {getLessonChapterRange(q.lessonId)}. {getLessonName(q.lessonId)}
                    </h5>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-purple-50 text-[#310065] rounded-full text-[8px] font-black uppercase tracking-wider border border-purple-100/20">
                        {getQuestionTypeLabel(q.question_type)}
                      </span>
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[8px] font-black uppercase tracking-wider border border-red-100">
                        Fallada
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartReview(q.id)}
                  className="py-2.5 px-4 bg-[#310065] hover:bg-[#4a148c] text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                >
                  Repasar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. PERSISTENT START SESSION FOOTER */}
      {reviewQuestions.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => handleStartReview()}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] hover:from-amber-300 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-400/10 active:scale-95 transition-all group"
          >
            <BookOpen size={16} />
            <span>Comenzar repaso global</span>
            <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* ==========================================
          🎯 INTERACTIVE REVIEW SESSION OVERLAY MODAL
      ========================================== */}
      {isPlayingReview && !showSessionResults && reviewQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-[#faf9fc] flex flex-col justify-between p-4 select-none animate-fade-in">
          
          {/* Header */}
          <header className="py-4 px-2 border-b border-purple-100/40 flex items-center justify-between max-w-xl mx-auto w-full">
            <button 
              onClick={() => setIsPlayingReview(false)}
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500 border border-gray-100"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            <span className="font-serif italic font-black text-[#310065] text-md">Repaso de hoy</span>
            <span className="text-[10px] font-black text-amber-500 tabular-nums">Pregunta {activeIdx + 1} de {reviewQuestions.length}</span>
          </header>

          {/* Main Gameplay Screen */}
          <main className="flex-grow max-w-xl mx-auto w-full px-2 py-8 flex flex-col justify-center gap-4">
            <div className="bg-white border border-purple-100/40 rounded-[2rem] p-6 shadow-md flex flex-col gap-6 relative">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-[#310065]">
                  Repaso • {getQuestionTypeLabel(reviewQuestions[activeIdx].question_type)}
                </span>
                <h3 className="text-sm sm:text-md font-black text-[#1b1b1e] tracking-tight leading-snug">
                  {reviewQuestions[activeIdx].questionText}
                </h3>
              </div>

              {/* Dynamic Answer Options */}
              <div className="space-y-3 pt-2">
                {/* Fallback to custom MCQ or True/False selections */}
                {(reviewQuestions[activeIdx].options || ['Verdadero', 'Falso']).map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSel = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      disabled={isChecked}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 text-left border-2 font-bold text-xs uppercase tracking-wide transition-all shadow-sm ${
                        isSel 
                          ? 'border-amber-400 bg-amber-50/20 text-[#310065]' 
                          : 'border-purple-100/30 hover:border-purple-200/50 text-[#1b1b1e]/80 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] ${
                        isSel ? 'border-amber-500 bg-amber-400 text-white font-black' : 'border-purple-100 text-purple-300'
                      }`}>
                        {letter}
                      </div>
                      <span className="font-extrabold text-[#1b1b1e]/85 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Footer controls check */}
          <footer className={`p-4 max-w-xl mx-auto w-full rounded-t-2xl border-t transition-all ${
            isChecked 
              ? isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              : 'bg-white border-purple-100/40'
          }`}>
            <div className="flex flex-col gap-4">
              {isChecked && (
                <div className="flex gap-4 items-start animate-slide-up">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0 ${
                    isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-shake'
                  }`}>
                    {isCorrect ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-sm font-black font-serif italic ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? '¡Repaso Correcto!' : '¡Oops! Sigue estudiando'}
                    </h4>
                    {!isCorrect && (
                      <span className="text-[9px] font-black text-red-700 block uppercase tracking-wider">
                        CORRECTO: {reviewQuestions[activeIdx].correctAnswer}
                      </span>
                    )}
                    <p className={`text-[9px] font-bold leading-relaxed ${isCorrect ? 'text-green-700/80' : 'text-red-700/80'}`}>
                      {reviewQuestions[activeIdx].explanation}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={isChecked ? handleContinueReview : handleCheckReviewAnswer}
                disabled={!selectedOption}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider active:scale-95 transition-all ${
                  isChecked
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : selectedOption
                      ? 'bg-[#310065] text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <span>{isChecked ? 'Continuar' : 'Comprobar'}</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </footer>

        </div>
      )}

      {/* ==========================================
          🏆 REVIEW RESULTS CONGRATULATIONS OVERLAY
      ========================================== */}
      {isPlayingReview && showSessionResults && (
        <div className="fixed inset-0 z-50 bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="max-w-md space-y-6 flex flex-col items-center animate-scale-in">
            
            <div className="w-18 h-18 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center shadow-lg relative animate-bounce">
              <CheckCircle2 size={36} fill="currentColor" className="text-white fill-green-600" />
              <span className="absolute text-yellow-400 text-xl top-0 right-0 animate-ping">✨</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#310065] font-serif italic">
                ¡Repaso completado!
              </h2>
              <p className="text-xs font-semibold text-[#1b1b1e]/65 leading-relaxed max-w-[85%] mx-auto">
                Excelente trabajo reforzando tu aprendizaje. Has respondido correctamente a las preguntas falladas y, como recompensa, **¡has recuperado tus corazones de vida!**
              </p>
            </div>

            {/* Reward chips */}
            <div className="flex gap-4 pt-2">
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-2 flex items-center gap-1.5 text-red-500 text-xs font-black shadow-sm">
                <Heart size={14} fill="currentColor" className="animate-pulse" />
                <span>+5 Corazones Refill</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2 flex items-center gap-1.5 text-amber-600 text-xs font-black shadow-sm">
                <Sparkles size={14} fill="currentColor" />
                <span>+25 XP Practicado</span>
              </div>
            </div>

            <button
              onClick={handleFinishReviewSession}
              className="w-full max-w-[280px] py-4 px-6 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] hover:from-amber-300 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              <span>Regresar al Panel</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
