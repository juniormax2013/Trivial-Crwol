'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getTodayChallenge, getChallengeQuestions, getUserDailyChallengeData, DEMO_USER_UID } from '@/lib/daily-challenge/repository';
import { getGameEngineConfig } from '@/lib/admin/settings-repository';
import { calculateAnswerPoints, completeDailyChallenge } from '@/lib/daily-challenge/service';
import type {
  DailyChallengeModel,
  QuestionModel,
  SessionAnswer,
  UserChallengeData,
} from '@/lib/daily-challenge/models';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT, useLanguage } from '@/lib/i18n/context';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import { toast } from 'sonner';

const QUESTION_TIME_LIMIT = 20; // seconds per question
const FEEDBACK_DURATION_MS = 1600; // show correct/wrong for this long

// Timer SVG constants
const TIMER_RADIUS = 44;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

type GamePhase = 'loading' | 'error' | 'answering' | 'feedback' | 'finishing';

interface OptionLetter {
  [key: string]: string;
}
const OPTION_LETTERS: OptionLetter = { a: 'A', b: 'B', c: 'C', d: 'D' };

export default function DailyChallengePlayPage() {
  const router = useRouter();
  const { language, isLoaded } = useLanguage();
  const t = useT();

  // ── Game data ──────────────────────────────────────────────
  const [challenge, setChallenge] = useState<DailyChallengeModel | null>(null);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [userData, setUserData] = useState<UserChallengeData | null>(null);
  const [gameConfig, setGameConfig] = useState<any>(null);

  const { user, loading: authLoading } = useAuthContext();

  // ── Session state ──────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Power-ups state ──────────────────────────────────────────
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [isProcessingPower, setIsProcessingPower] = useState(false);

  // Timer refs to prevent stale closures
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // ── Load data on mount ─────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      router.replace('/login');
      return;
    }
    if (!isLoaded) return;

    const init = async () => {
      try {
        const [ch, ud, gc] = await Promise.all([
          getTodayChallenge(language),
          getUserDailyChallengeData(user.uid),
          getGameEngineConfig(),
        ]);
        if (!ch) {
          setErrorMsg('No hay un desafío disponible hoy.');
          setPhase('error');
          return;
        }
        const qs = await getChallengeQuestions(ch.questionIds, language);
        if (!qs.length) {
          setErrorMsg('El desafío no tiene preguntas válidas.');
          setPhase('error');
          return;
        }
        setChallenge(ch);
        setQuestions(qs);
        setUserData(ud);
        setGameConfig(gc.dailyChallenge);
        questionStartTimeRef.current = Date.now();
        setPhase('answering');
      } catch {
        setErrorMsg('Error al cargar el desafío. Intenta de nuevo.');
        setPhase('error');
      }
    };
    init();
  }, [user?.uid, authLoading, router, language, isLoaded]);

  // ── Reset timer on new question ───────────────────────────
  useEffect(() => {
    if (phase === 'answering') {
      setTimeLeft(QUESTION_TIME_LIMIT);
      questionStartTimeRef.current = Date.now();
      setActivePowerUps([]);
      setHiddenOptionIds([]);
      setShowHint(false);
    }
  }, [phase, qIndex]);

  // ── Timer (only runs during 'answering' phase) ─────────────
  useEffect(() => {
    if (phase !== 'answering') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (activePowerUps.includes('freezeTime')) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, activePowerUps]);

  // ── Record an answer ───────────────────────────────────────
  const recordAnswer = useCallback(
    (optionId: string | null, question: QuestionModel) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const responseTimeMs = Date.now() - questionStartTimeRef.current;
      const isCorrect = optionId === question.correctOptionId;

      if (!isCorrect && hasSecondChance && optionId !== null) {
        toast.success("Chans an dezyèm itilize! Ou sove.");
        setHasSecondChance(false);
        setActivePowerUps(prev => prev.filter(p => p !== 'secondChance'));
        setSelectedOptionId(null);
        // Reset timer if it was a real attempt
        setTimeLeft(QUESTION_TIME_LIMIT);
        questionStartTimeRef.current = Date.now();
        // Start timer again if it was stopped
        if (!activePowerUps.includes('freezeTime')) {
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current!);
                handleTimeout();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        return;
      }

      const pointsEarned = calculateAnswerPoints(isCorrect, responseTimeMs, gameConfig);

      const answer: SessionAnswer = {
        questionId: question.id,
        selectedOptionId: optionId,
        correctOptionId: question.correctOptionId,
        isCorrect,
        responseTimeMs,
        pointsEarned,
      };

      setSelectedOptionId(optionId);
      setAnswers((prev) => [...prev, answer]);
      setPhase('feedback');
    },
    [gameConfig, hasSecondChance, activePowerUps]
  );

  // ── Handle timeout (no answer selected) ───────────────────
  const handleTimeout = useCallback(() => {
    const q = questions[qIndex];
    if (!q) return;
    recordAnswer(null, q);
  }, [questions, qIndex, recordAnswer]);

  // ── User selects an option ─────────────────────────────────
  const handleSelectOption = (optionId: string) => {
    if (phase !== 'answering') return;
    const q = questions[qIndex];
    if (!q) return;
    recordAnswer(optionId, q);
  };

  // ── Advance after feedback ─────────────────────────────────
  useEffect(() => {
    if (phase !== 'feedback') return;

    const timeout = setTimeout(async () => {
      const isLast = qIndex >= questions.length - 1;
      if (isLast) {
        await handleFinish();
      } else {
        setQIndex((i) => i + 1);
        setSelectedOptionId(null);
        setHiddenOptionIds([]);
        setShowHint(false);
        setActivePowerUps([]);
        setPhase('answering');
      }
    }, FEEDBACK_DURATION_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, questions.length]);

  // ── Finish game ────────────────────────────────────────────
  const handleFinish = async () => {
    if (!challenge || !userData || !user?.uid) return;
    setPhase('finishing');

    const session = {
      challenge,
      questions,
      currentQuestionIndex: qIndex,
      answers,
      startedAt: new Date(),
      status: 'completed' as const,
    };

    const result = await completeDailyChallenge(user.uid, session, userData);

    // Pass result through sessionStorage to result page
    sessionStorage.setItem('daily_challenge_result', JSON.stringify(result));
    router.push('/daily-challenge/result');
  };

  // ── Power-up handlers ──────────────────────────────────────
  const handlePowerUsed = (powerId: string) => {
    setActivePowerUps(prev => [...prev, powerId]);

    const q = questions[qIndex];
    if (!q) return;

    switch (powerId) {
      case 'removeTwo':
        const wrongOptions = q.options.filter(o => o.id !== q.correctOptionId);
        const toHide = [...wrongOptions].sort(() => 0.5 - Math.random()).slice(0, 2).map(o => o.id);
        setHiddenOptionIds(toHide);
        break;
      case 'hint':
        setShowHint(true);
        break;
      case 'freezeTime':
        // Timer stopped by useEffect due to activePowerUps inclusion
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        break;
      case 'secondChance':
        setHasSecondChance(true);
        break;
    }
  };

  const handleReport = () => {
    toast.success("Mèsi! Nou resevwa rapò w la.");
  };

  // ── RENDER: Loading ────────────────────────────────────────
  if (phase === 'loading' || phase === 'finishing') {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#310065] animate-spin" />
        <p className="text-[#7c7483] font-medium text-[14px]">
          {phase === 'loading' ? t.common.loading : t.common.saving}
        </p>
      </div>
    );
  }

  // ── RENDER: Error ──────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center px-6 gap-5 text-center">
        <XCircle className="w-16 h-16 text-[#ba1a1a]" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl font-bold text-[#1b1b1e]">{t.common.somethingWentWrong}</h1>
        <p className="text-[#7c7483] text-[14px]">{errorMsg}</p>
        <button
          onClick={() => router.push('/daily-challenge')}
          className="px-6 py-3 bg-[#310065] text-white font-bold rounded-2xl text-[14px]"
        >
          {t.common.goBack}
        </button>
      </div>
    );
  }

  // ── Current question ───────────────────────────────────────
  const currentQuestion = questions[qIndex];
  const progressPercent = ((qIndex + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100;
  const timerDashOffset = TIMER_CIRCUMFERENCE * (1 - timeLeft / QUESTION_TIME_LIMIT);
  const timerColor = timeLeft > 8 ? '#cba72f' : timeLeft > 4 ? '#f59e0b' : '#ba1a1a';

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans selection:bg-[#eddcff] relative">

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-[0.12]">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] bg-[#310065] blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] bg-[#cba72f] blur-[120px] rounded-full" />
      </div>

      {/* ── TOP BAR ── */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl border-b border-[#310065]/5">
        <div className="flex items-center px-6 h-16 max-w-screen-sm mx-auto w-full gap-3">
          <button
            onClick={() => router.push('/daily-challenge')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/60 transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-[#310065]" strokeWidth={2.5} />
          </button>

          {/* Progress bar */}
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest">
                {t.daily.question} {Math.min(qIndex + 1, questions.length)} {t.daily.of} {questions.length}
              </span>
              <span className="text-[11px] font-bold text-[#735c00]">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#e3e2e6] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e9c349] to-[#cba72f] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-grow pt-[88px] pb-12 px-5 flex flex-col max-w-[480px] mx-auto w-full relative z-10">

        {/* Timer */}
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48" cy="48" r={TIMER_RADIUS}
              fill="transparent" stroke="#e9e7eb" strokeWidth="6"
            />
            <circle
              cx="48" cy="48" r={TIMER_RADIUS}
              fill="transparent"
              stroke={timerColor}
              strokeWidth="6"
              strokeDasharray={TIMER_CIRCUMFERENCE}
              strokeDashoffset={phase === 'feedback' ? TIMER_CIRCUMFERENCE : timerDashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(203,167,47,0.4)]"
            />
          </svg>
          <div className="flex flex-col items-center justify-center">
            <span
              className="text-[32px] font-serif font-black leading-none transition-colors duration-300"
              style={{ color: timerColor }}
            >
              {phase === 'feedback' ? '✓' : timeLeft}
            </span>
            <span className="text-[8px] font-black text-[#7c7483] uppercase tracking-[0.1em]">
              {phase === 'feedback' ? '' : t.duel.seg || 'seg'}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[2.5rem] px-7 py-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] mb-7 relative overflow-hidden border border-[#1b1b1e]/5">
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] select-none pointer-events-none">
            <BookOpen className="w-44 h-44" strokeWidth={1} />
          </div>
          <p className="text-[24px] md:text-[26px] font-serif font-bold text-[#1b1b1e] leading-tight text-center relative z-10">
            {currentQuestion?.questionText}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion?.options.map((option) => {
            if (hiddenOptionIds.includes(option.id)) return null;

            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === currentQuestion.correctOptionId;
            const showFeedback = phase === 'feedback';

            let bgClass =
              'bg-[#f5f3f7] hover:bg-[#e9e7eb] border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.01)]';
            let textClass = 'text-[#1b1b1e]';
            let badgeClass = 'bg-[#e3e2e6] text-[#7c7483]';
            let Icon = null;

            if (showFeedback) {
              if (isCorrect) {
                bgClass = 'bg-emerald-600 ring-4 ring-emerald-400/30 shadow-[0_6px_20px_rgba(5,150,105,0.25)]';
                textClass = 'text-white';
                badgeClass = 'bg-white/20 text-white';
                Icon = CheckCircle2;
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-[#ba1a1a] ring-4 ring-red-300/30 shadow-[0_6px_20px_rgba(186,26,26,0.2)]';
                textClass = 'text-white';
                badgeClass = 'bg-white/20 text-white';
                Icon = XCircle;
              } else {
                bgClass = 'bg-[#f5f3f7] opacity-50 border-transparent';
              }
            } else if (isSelected) {
              bgClass = 'bg-[#310065] ring-4 ring-[#4a148c]/30 shadow-[0_8px_20px_rgba(49,0,101,0.25)]';
              textClass = 'text-white';
              badgeClass = 'bg-white/20 text-white';
            } else if (showHint && isCorrect) {
              bgClass = 'bg-[#fffbeb] border-[#fde68a] ring-2 ring-[#fde68a] shadow-[0_0_15px_rgba(251,191,36,0.2)]';
              badgeClass = 'bg-[#fef3c7] text-[#92400e]';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={phase !== 'answering'}
                className={`w-full text-left p-[17px] rounded-[1.25rem] transition-all duration-200 active:scale-[0.98] flex items-center border ${bgClass} ${phase === 'answering' ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-[0.75rem] flex items-center justify-center mr-4 ${badgeClass}`}>
                  <span className="font-bold text-[16px]">
                    {OPTION_LETTERS[option.id] ?? option.id.toUpperCase()}
                  </span>
                </div>
                <span className={`text-[16px] font-semibold flex-grow ${textClass}`}>
                  {option.text}
                </span>
                {showFeedback && Icon && (
                  <Icon className="w-5 h-5 text-white shrink-0 ml-2" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>

        {/* Bible reference (shows during feedback) */}
        {phase === 'feedback' && currentQuestion && (
          <div className="text-center animate-in fade-in duration-300">
            <p className="text-[12px] text-[#7c7483]">
              {currentQuestion.explanation}
            </p>
            <p className="text-[11px] font-bold text-[#cba72f] mt-1">
              📖 {currentQuestion.bibleReference}
            </p>
          </div>
        )}

        <PowerUpsBar 
          onPowerUsed={handlePowerUsed}
          onReport={handleReport}
          isProcessing={isProcessingPower}
          setIsProcessing={setIsProcessingPower}
          disabled={phase !== 'answering'}
          activePowerUps={activePowerUps}
        />
      </main>
    </div>
  );
}
