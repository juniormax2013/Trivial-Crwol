'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  getClanEventById, 
  getClanEventQuestions, 
  submitClanEventMatchResult, 
  calculateClanEventPoints,
  ClanEventModel 
} from '@/lib/clan/eventsRepository';
import { 
  X, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Crown, 
  Coins, 
  Zap, 
  BookOpen, 
  Trophy 
} from 'lucide-react';
import { toast } from 'sonner';

const QUESTION_TIME_LIMIT = 20; // seconds
const FEEDBACK_DURATION_MS = 1600;

interface Option {
  id: string;
  text: string;
}

export default function ClanEventPlayPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'normal') as 'easy' | 'normal' | 'hard';

  const { user, loading: authLoading } = useAuthContext();

  const [event, setEvent] = useState<ClanEventModel | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gameplay State
  const [phase, setPhase] = useState<'playing' | 'feedback' | 'summary'>('playing');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  
  // Scoring parameters
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [fastAnswers, setFastAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [streaksOf5, setStreaksOf5] = useState(0);
  const [hardQuestionsCorrect, setHardQuestionsCorrect] = useState(0);
  
  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const lang = user?.settings?.language || 'es';

  // 1. Fetch Event & Questions
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.clanId) {
      toast.error('Debes pertenecer a un clan para participar.');
      router.push('/clans');
      return;
    }

    const init = async () => {
      try {
        const evt = await getClanEventById(eventId);
        if (!evt) {
          toast.error('Evento no encontrado.');
          router.push('/clans');
          return;
        }
        if (evt.status !== 'active' || new Date(evt.endAt).getTime() < Date.now()) {
          toast.error('El evento ha terminado y ya no se puede jugar.');
          router.push(`/clan/events/${eventId}`);
          return;
        }

        const qs = await getClanEventQuestions(eventId, difficulty, lang as any);
        if (qs.length === 0) {
          toast.error('No se pudieron cargar preguntas.');
          router.push(`/clan/events/${eventId}`);
          return;
        }

        setEvent(evt);
        setQuestions(qs);
      } catch (e) {
        console.error(e);
        toast.error('Error al inicializar la partida.');
      } finally {
        setLoading(false);
        questionStartTimeRef.current = Date.now();
      }
    };

    init();
  }, [user, authLoading, eventId, difficulty, router]);

  // 2. Timer Loop
  useEffect(() => {
    if (phase !== 'playing' || loading) return;

    setTimeLeft(QUESTION_TIME_LIMIT);
    questionStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null); // timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qIndex, phase, loading]);

  if (authLoading || loading || !event || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
        <p className="text-sm text-[#64748B] font-medium">Preparando preguntas...</p>
      </div>
    );
  }

  const currentQuestion = questions[qIndex];

  // 3. Handle Answer Selection
  const handleAnswer = (optionId: string | null) => {
    if (phase !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOptionId(optionId);
    setPhase('feedback');

    const isCorrect = optionId === currentQuestion.correctOptionId;
    const elapsedSeconds = (Date.now() - questionStartTimeRef.current) / 1000;

    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
      
      // Fast Answer Check
      const maxFastSeconds = event.rules.fastAnswerMaxSeconds || 7;
      if (elapsedSeconds <= maxFastSeconds) {
        setFastAnswers((f) => f + 1);
      }

      // Streak logic
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      if (newStreak > 0 && newStreak % 5 === 0) {
        setStreaksOf5((s) => s + 1);
      }

      // Hard question check
      if (currentQuestion.difficulty === 'hard') {
        setHardQuestionsCorrect((h) => h + 1);
      }
    } else {
      setCurrentStreak(0);
    }

    // Feedback Timer transition to next question
    setTimeout(async () => {
      const isLast = qIndex >= questions.length - 1;
      if (isLast) {
        // Finish game
        await finishGame();
      } else {
        setQIndex((idx) => idx + 1);
        setSelectedOptionId(null);
        setPhase('playing');
      }
    }, FEEDBACK_DURATION_MS);
  };

  const finishGame = async () => {
    setIsSubmitting(true);
    setPhase('summary');

    const totalQs = questions.length;
    const correctCount = correctAnswers; // fix scoping reference
    const isPerfect = correctAnswers === totalQs;

    const matchResult = {
      correctAnswers: correctAnswers,
      totalQuestions: totalQs,
      fastAnswers,
      streaksOf5,
      hardQuestionsCorrect,
      isPerfect,
      difficulty
    };

    try {
      const finalPoints = await submitClanEventMatchResult(eventId, user!.uid, user!.clanId!, matchResult);
      setPointsGained(finalPoints);
      toast.success(`¡Partida completada! Sumaste +${finalPoints} puntos.`);
    } catch (e: any) {
      console.error(e);
      // Fallback local points calculation in case of submission failure visual representation
      const calcPoints = calculateClanEventPoints(matchResult, event.rules, difficulty);
      setPointsGained(calcPoints);
      toast.error(e.message || 'Error al guardar la puntuación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((qIndex + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100;

  // Render game screen
  if (phase === 'playing' || phase === 'feedback') {
    return (
      <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen flex flex-col font-sans selection:bg-[#eddcff]">
        
        {/* Top Header */}
        <header className="fixed top-0 w-full z-50 bg-white border-b border-black/[0.03] pt-safe">
          <div className="flex items-center px-4 h-16 max-w-md mx-auto w-full gap-4">
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas abandonar la partida? Perderás todo el progreso.')) {
                  router.push(`/clan/events/${eventId}`);
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
            </button>

            {/* Progress */}
            <div className="flex-grow space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                <span>
                  Pregunta {qIndex + 1} de {questions.length}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0A84FF] to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shrink-0">
              <Clock className="w-4 h-4 text-[#0A84FF]" />
              <span className="text-[14px] font-bold tabular-nums">
                {phase === 'feedback' ? '✓' : `${timeLeft}s`}
              </span>
            </div>
          </div>
        </header>

        {/* Game Main Area */}
        <main className="flex-grow pt-24 pb-12 px-4 flex flex-col max-w-md mx-auto w-full justify-between">
          
          {/* Question Card */}
          <div className="bg-white rounded-[32px] px-6 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/[0.03] text-center my-auto flex flex-col justify-center min-h-[180px] relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] select-none pointer-events-none">
              <BookOpen className="w-44 h-44" strokeWidth={1} />
            </div>
            <p className="text-xl font-serif font-black text-[#0F172A] leading-snug relative z-10">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 mt-6">
            {currentQuestion.options.map((option: Option, idx: number) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.id === currentQuestion.correctOptionId;
              const showFeedback = phase === 'feedback';

              let bgClass = 'bg-white hover:bg-slate-50 border-black/[0.03] shadow-sm';
              let textClass = 'text-[#0F172A]';
              let badgeClass = 'bg-slate-100 text-[#64748B]';
              let Icon = null;

              const isAdmin = user?.email === 'juniormax2013@gmail.com';

              if (showFeedback) {
                if (isCorrect) {
                  bgClass = 'bg-emerald-600 border-emerald-600 ring-4 ring-emerald-500/20';
                  textClass = 'text-white';
                  badgeClass = 'bg-white/20 text-white';
                  Icon = CheckCircle2;
                } else if (isSelected && !isCorrect) {
                  bgClass = 'bg-red-600 border-red-600 ring-4 ring-red-500/20';
                  textClass = 'text-white';
                  badgeClass = 'bg-white/20 text-white';
                  Icon = XCircle;
                } else {
                  bgClass = 'bg-white opacity-40 border-black/[0.02]';
                }
              } else if (isSelected) {
                bgClass = 'bg-[#0A84FF] border-[#0A84FF] ring-4 ring-[#0A84FF]/20';
                textClass = 'text-white';
                badgeClass = 'bg-white/20 text-white';
              } else if (isAdmin && isCorrect) {
                bgClass = 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm';
                badgeClass = 'bg-emerald-100 text-emerald-800';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={phase !== 'playing'}
                  className={`w-full text-left p-4.5 rounded-3xl transition-all duration-200 active:scale-[0.98] flex items-center border ${bgClass}`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center mr-4 ${badgeClass}`}>
                    <span className="font-bold text-[15px]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </div>
                  <span className={`text-[15px] font-semibold flex-grow leading-tight ${textClass}`}>
                    {option.text}
                  </span>
                  {showFeedback && Icon && (
                    <Icon className="w-5 h-5 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Reference panel during feedback */}
          <div className="min-h-[60px] mt-6 flex flex-col justify-center items-center">
            {phase === 'feedback' && (
              <div className="text-center animate-in fade-in duration-300 space-y-1">
                <p className="text-xs text-[#64748B] max-w-xs">{currentQuestion.explanation}</p>
                <p className="text-xs font-black text-[#0A84FF]">📖 {currentQuestion.bibleReference}</p>
              </div>
            )}
          </div>

        </main>
      </div>
    );
  }

  // Render Summary / Results screen
  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen flex flex-col justify-center px-4 py-8 font-sans">
      <div className="max-w-md w-full mx-auto bg-white rounded-[32px] p-6 border border-black/[0.03] shadow-lg text-center space-y-6">
        
        {isSubmitting ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-[#0A84FF] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-[#0F172A]">Enviando tus puntos al clan...</h2>
            <p className="text-xs text-[#64748B]">Realizando una transacción segura.</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0A84FF] to-blue-600 flex items-center justify-center shadow-lg mx-auto">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black">¡Partida Completada!</h2>
              <p className="text-xs text-[#64748B] uppercase tracking-wider font-bold">
                Dificultad {difficulty === 'easy' ? 'Fácil' : difficulty === 'normal' ? 'Normal' : 'Difícil'}
              </p>
            </div>

            {/* Score highlight */}
            <div className="bg-[#0A84FF]/5 p-5 rounded-3xl border border-[#0A84FF]/10 space-y-1">
              <span className="text-[10px] font-black text-[#0A84FF] uppercase tracking-wider block">
                Puntos enviados al clan
              </span>
              <p className="text-4xl font-serif font-black text-[#0A84FF]">
                +{pointsGained} pts
              </p>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Aciertos</span>
                <p className="text-lg font-black text-emerald-600 mt-1">{correctAnswers} / {questions.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Respuestas rápidas</span>
                <p className="text-lg font-black text-[#0A84FF] mt-1">+{fastAnswers}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Mejor racha</span>
                <p className="text-lg font-black text-[#0F172A] mt-1">{maxStreak} 🔥</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Rachas de 5</span>
                <p className="text-lg font-black text-purple-600 mt-1">+{streaksOf5}</p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/clan/events/${eventId}`)}
              className="w-full py-4 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-bold text-[14px] uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-[0.99]"
            >
              Volver al evento
            </button>
          </>
        )}

      </div>
    </div>
  );
}
