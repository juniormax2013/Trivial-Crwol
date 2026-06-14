'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, X, CheckCircle2, XCircle, Loader2, Shield, Sparkles, AlertTriangle } from 'lucide-react';
import { getTodayChallenge, getChallengeQuestions, getUserDailyChallengeData, DEMO_USER_UID } from '@/lib/daily-challenge/repository';
import { getGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';
import { calculateAnswerPoints, completeDailyChallenge } from '@/lib/daily-challenge/service';
import { checkAndQualifyReferral } from '@/lib/user/repository';
import type {
  DailyChallengeModel,
  QuestionModel,
  SessionAnswer,
  UserChallengeData,
} from '@/lib/daily-challenge/models';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT, useLanguage } from '@/lib/i18n/context';
import { RandomChallengeModal, fireChallengeSuccessConfetti } from '@/components/play/RandomChallengeModal';
import ChallengePlayView from '@/components/play/ChallengePlayView';
import { getRandomChallengeQuestion } from '@/lib/challenge/seed';
import type { ChallengeQuestion } from '@/lib/challenge/models';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import { toast } from 'sonner';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import DevilTrapOverlay from '@/components/play/DevilTrapOverlay';
import DevilTrapOptionText from '@/components/play/DevilTrapOptionText';
import { canUseFramePower } from '@/lib/game/frame-powers';
import { useJesusTrap } from '@/hooks/useJesusTrap';
import JesusTrapOverlay from '@/components/play/JesusTrapOverlay';
import { getJesusSettings } from '@/src/data/jesusSettings';
import { playCorrectSound, playWrongSound } from '@/lib/game/audio';


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
  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);

  const { user, loading: authLoading } = useAuthContext();

  // ── Session state ──────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [errorMsg, setErrorMsg] = useState('');
  const [devilSpawnedCount, setDevilSpawnedCount] = useState(0);
  const [devilDefeatedCount, setDevilDefeatedCount] = useState(0);

  // ── Power-ups state ──────────────────────────────────────────
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [isProcessingPower, setIsProcessingPower] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Random Challenge State
  const [rcConfig, setRcConfig] = useState<{
    hasChallenge: boolean;
    questionIndex: number;
    status: 'pending' | 'accepted' | 'rejected' | 'won' | 'lost' | null;
    showModal: boolean;
  } | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<ChallengeQuestion | null>(null);
  const [showChallengePlay, setShowChallengePlay] = useState(false);

  // Devil Trap Hook
  const {
    isDevilActive,
    devilMode,
    revealedOptions,
    shuffledOptions,
    devilState,
    devilEvent,
    triggerDevilTrap,
    revealOption,
    resetDevilTrap,
    devilDefeat,
    devilCelebrate,
    setDevilEvent,
    setDevilState,
  } = useDevilTrap();

  // Jesus Trap Hook
  const {
    isJesusActive,
    jesusState,
    jesusEvent,
    revealUsesRemaining,
    protectionUsesRemaining,
    secondChanceUsesRemaining,
    evaluateJesusAppearance,
    useRevealCorrectAnswer,
    useDivineProtection,
    useSecondChance,
    reactToCorrectAnswer,
    reactToWrongAnswer,
    triggerVictory,
    triggerDefeat,
    resetMatchState: resetJesusMatchState,
  } = useJesusTrap({
    isDevilActive,
    devilState,
    setDevilEvent,
    setDevilState,
    resetDevilTrap,
  });


  const isInitializing = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const lastInitializedIndexRef = useRef<number>(-1);

  // ── Load data on mount ─────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      router.replace('/login');
      return;
    }
    if (!isLoaded || isInitializing.current) return;
    isInitializing.current = true;

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
        setEngineConfig(gc);
        setDevilSpawnedCount(0);
        setDevilDefeatedCount(0);
        
        // Initialize Random Challenge
        const specialChallengeProb = gc.specialChallenge?.spawnProbability ?? 0.50;
        const hasChallenge = Math.random() < specialChallengeProb;
        setRcConfig({
          hasChallenge,
          questionIndex: hasChallenge ? Math.floor(Math.random() * qs.length) : -1,
          status: 'pending',
          showModal: false
        });
        if (hasChallenge) {
          const randomChQ = getRandomChallengeQuestion(language);
          setChallengeQuestion(randomChQ);
        }

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
      if (lastInitializedIndexRef.current === qIndex) {
        return;
      }
      lastInitializedIndexRef.current = qIndex;

      setTimeLeft(QUESTION_TIME_LIMIT);
      questionStartTimeRef.current = Date.now();
      
      const newActivePowerUps: string[] = [];
      let newHiddenOptionIds: string[] = [];
      let newHasSecondChance = false;

      const q = questions[qIndex];
      
      // Si la partida tiene un Reto Especial programado, el diablo tiene terminantemente prohibido aparecer en toda la partida
      const isDevilAllowedInMatch = !rcConfig?.hasChallenge;

      const canTriggerDevil = q && devilSpawnedCount < 5 && devilDefeatedCount < 2 && isDevilAllowedInMatch;

      if (canTriggerDevil) {
        const wasDevilActiveBefore = isDevilActive;
        const spawned = triggerDevilTrap(q.options, false, engineConfig?.devilTrap, isJesusActive);
        if (spawned && !wasDevilActiveBefore) {
          setDevilSpawnedCount(prev => prev + 1);
        }
      } else {
        // Si no está permitido el diablo o no se triggeró, nos aseguramos de ocultarlo por completo con humo
        resetDevilTrap(true);
      }

      // Evaluar aparición de Jesús en esta pregunta
      if (q && isDevilAllowedInMatch) {
        evaluateJesusAppearance('classic', qIndex === 0);
      }

      
      if (q) {
        if (user?.activeFrame) {
          const isCrown = canUseFramePower(user.activeFrame, user.level ?? 1) && (user.activeFrame === 'crown' || user.activeFrame === 'crow_frame' || user.activeFrame === 'crown_frame');
          const isFire  = canUseFramePower(user.activeFrame, user.level ?? 1) && (user.activeFrame === 'fire'  || user.activeFrame === 'fire_frame');
          
          // Remove 2 incorrect answers
          // Fire frame and Crown frame only do it for the first 5 questions.
          if ((isFire || isCrown) && qIndex < 5) {
             const wrongOptions = q.options.filter(o => o.id !== q.correctOptionId);
             newHiddenOptionIds = [...wrongOptions].sort(() => 0.5 - Math.random()).slice(0, 2).map(o => o.id);
          }
        }
        
        // Second chance is ONLY for Crown frame, and only for the first 5 questions
        if (user?.activeFrame) {
          const isCrown = canUseFramePower(user.activeFrame, user.level ?? 1) && (user.activeFrame === 'crown' || user.activeFrame === 'crow_frame' || user.activeFrame === 'crown_frame');
          if (isCrown && qIndex < 5) {
            newHasSecondChance = true;
            newActivePowerUps.push('secondChance');
          }
        }
      }

      setActivePowerUps(newActivePowerUps);
      setHiddenOptionIds(newHiddenOptionIds);
      setHasSecondChance(newHasSecondChance);
      setShowHint(false);

      // Check if this question is the Random Challenge
      if (rcConfig?.hasChallenge && rcConfig.questionIndex === qIndex && rcConfig.status === 'pending') {
        resetDevilTrap(true);
        setRcConfig(prev => prev ? { ...prev, showModal: true } : null);
      }
    }
  }, [phase, qIndex, questions, user?.activeFrame, rcConfig?.hasChallenge, rcConfig?.questionIndex, rcConfig?.status, triggerDevilTrap, resetDevilTrap, engineConfig, devilSpawnedCount, devilDefeatedCount, isDevilActive]);

  // ── Timer (only runs during 'answering' phase) ─────────────
  useEffect(() => {
    if (phase !== 'answering' || rcConfig?.showModal || showChallengePlay || showExitConfirm) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Since we unpause after modal, we need to adjust start time
    if (!timerRef.current) {
      questionStartTimeRef.current = Date.now() - ((QUESTION_TIME_LIMIT - timeLeft) * 1000);
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
  }, [phase, qIndex, activePowerUps, rcConfig?.showModal, showChallengePlay, showExitConfirm, devilSpawnedCount, devilDefeatedCount, triggerDevilTrap, engineConfig]);

  // ── AUTOMATIC HELP FROM JESUS ──
  useEffect(() => {
    if (phase !== 'answering' || !isJesusActive) return;

    // 1. Proteger automáticamente si el Diablo está activo
    if (isDevilActive && protectionUsesRemaining > 0 && getJesusSettings().canProtectAgainstDevil) {
      const timer = setTimeout(() => {
        const success = useDivineProtection();
        if (success) {
          toast.success("😇 ¡Jesús te protege automáticamente! La trampa del Diablo ha sido desactivada.");
        }
      }, 1000); // 1s delay for visual feedback/appearance animation first
      return () => clearTimeout(timer);
    }

    // 2. Revelar automáticamente la respuesta si no está el Diablo
    if (!isDevilActive && revealUsesRemaining > 0 && getJesusSettings().canRevealCorrectAnswer) {
      const timer = setTimeout(() => {
        const success = useRevealCorrectAnswer();
        if (success) {
          toast.success("😇 ¡Jesús ilumina el camino! Respuesta correcta revelada automáticamente.");
          setShowHint(true);
        }
      }, 1000); // 1s delay for visual feedback/appearance animation first
      return () => clearTimeout(timer);
    }
  }, [
    phase,
    isJesusActive,
    isDevilActive,
    protectionUsesRemaining,
    revealUsesRemaining,
    useDivineProtection,
    useRevealCorrectAnswer
  ]);

  // ── Record an answer ───────────────────────────────────────
  const recordAnswer: (optionId: string | null, question: QuestionModel) => void = useCallback(
    (optionId: string | null, question: QuestionModel) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const responseTimeMs = Date.now() - questionStartTimeRef.current;
      const isCorrect = optionId === question.correctOptionId;

      if (isCorrect && isDevilActive) {
        setDevilDefeatedCount(prev => prev + 1);
      }

      const canUseJesusSecondChance = !isCorrect && optionId !== null && isJesusActive && secondChanceUsesRemaining > 0 && getJesusSettings().canGrantSecondChance;

      if (!isCorrect && (hasSecondChance || canUseJesusSecondChance) && optionId !== null && !isDevilActive) {
        if (canUseJesusSecondChance) {
          useSecondChance();
          toast.success("¡Segunda Oportunidad celestial! Jesús te protege.");
        } else {
          toast.success("Chans an dezyèm itilize! Ou sove.");
          setHasSecondChance(false);
          setActivePowerUps(prev => prev.filter(p => p !== 'secondChance'));
        }
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
                recordAnswer(null, question);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        return;
      }

      let pointsEarned = calculateAnswerPoints(isCorrect, responseTimeMs, gameConfig);
      const isGoldOrCrown = canUseFramePower(user?.activeFrame, user?.level ?? 1) && (user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame');
      if (isGoldOrCrown) {
         pointsEarned *= 2;
      }

      // Audio feedback
      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }

      const answer: SessionAnswer = {
        questionId: question.id,
        selectedOptionId: optionId,
        correctOptionId: question.correctOptionId,
        isCorrect,
        responseTimeMs,
        pointsEarned,
      };
      
      // Handle Random Challenge Outcome
      if (rcConfig?.status === 'accepted' && rcConfig.questionIndex === qIndex) {
        if (isCorrect) {
          setRcConfig(prev => prev ? { ...prev, status: 'won' } : null);
          fireChallengeSuccessConfetti();
        } else {
          setRcConfig(prev => prev ? { ...prev, status: 'lost' } : null);
        }
      }

      // Trigger devil reaction based on answer
      if (isDevilActive) {
        if (isCorrect) {
          devilDefeat();
        } else {
          devilCelebrate();
        }
      }

      // Reacción de Jesús
      if (isJesusActive) {
        if (isCorrect) {
          reactToCorrectAnswer();
        } else {
          reactToWrongAnswer();
        }
      }

      setSelectedOptionId(optionId);
      setAnswers((prev) => [...prev, answer]);
      setPhase('feedback');
    },
    [qIndex, questions, gameConfig, user, activePowerUps, hasSecondChance, isDevilActive, isJesusActive, secondChanceUsesRemaining, rcConfig?.status, rcConfig?.questionIndex, useSecondChance, reactToCorrectAnswer, reactToWrongAnswer]
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

    if (isJesusActive) {
      const correctCount = answers.filter(a => a.isCorrect).length;
      const won = correctCount >= questions.length * 0.6;
      if (won) {
        triggerVictory();
      } else {
        triggerDefeat();
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setPhase('finishing');

    const session = {
      challenge,
      questions,
      currentQuestionIndex: qIndex,
      answers,
      startedAt: new Date(),
      status: 'completed' as const,
    };

    const isGoldOrCrown = canUseFramePower(user?.activeFrame, user?.level ?? 1) && (user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame');
    
    // Calculate Random Challenge Multiplier
    const challengeMultiplier = rcConfig?.status === 'won' ? 3 : rcConfig?.status === 'lost' ? 0.5 : 1;
    
    const result = await completeDailyChallenge(user.uid, session, userData, isGoldOrCrown, challengeMultiplier);

    // Calificar referido si aplica (primera partida completada)
    checkAndQualifyReferral(user.uid).catch(e => console.error("Error qualifying referral:", e));

    // Pass result through sessionStorage to result page
    // Attach challenge info so result page can show it
    const finalResult = {
      ...result,
      challengeOutcome: rcConfig?.status
    };
    sessionStorage.setItem('daily_challenge_result', JSON.stringify(finalResult));
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

  const handleAcceptChallenge = useCallback(() => {
    setRcConfig(prev => prev ? { ...prev, showModal: false, status: 'accepted' } : null);
    setShowChallengePlay(true);
  }, []);

  const handleRejectChallenge = useCallback(() => {
    setRcConfig(prev => prev ? { ...prev, showModal: false, status: 'rejected' } : null);
  }, []);

  const handleChallengeComplete = useCallback((isCorrect: boolean) => {
    setShowChallengePlay(false);
    setRcConfig(prev => prev ? { ...prev, status: isCorrect ? 'won' : 'lost' } : null);
    // Reset timer to full limit for the standard question since they spent their time on the challenge
    setTimeLeft(QUESTION_TIME_LIMIT);
    questionStartTimeRef.current = Date.now();
  }, []);

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
      <RandomChallengeModal 
        isOpen={!!rcConfig?.showModal} 
        onAccept={handleAcceptChallenge} 
        onReject={handleRejectChallenge} 
      />

      {showChallengePlay && challengeQuestion && (
        <ChallengePlayView
          question={challengeQuestion}
          onComplete={handleChallengeComplete}
          onClose={() => setShowChallengePlay(false)}
        />
      )}

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-[0.12]">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] bg-[#310065] blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] bg-[#cba72f] blur-[120px] rounded-full" />
      </div>

      {/* ── TOP BAR ── */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl border-b border-[#310065]/5">
        <div className="flex items-center px-6 h-16 max-w-screen-sm mx-auto w-full gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/60 transition-colors active:scale-95 shrink-0"
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

          {/* New Compact Header Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#310065]/5 shadow-sm shrink-0">
            <span
              className="text-[14px] font-bold tabular-nums"
              style={{ color: timerColor }}
            >
              {phase === 'feedback' ? '✓' : `${timeLeft}s`}
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-grow pt-[80px] pb-12 px-5 flex flex-col max-w-[480px] mx-auto w-full relative z-10">

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
                  <DevilTrapOptionText
                    isDevilActive={isDevilActive}
                    optionId={OPTION_LETTERS[option.id] ?? option.id.toUpperCase()}
                    isRevealed={revealedOptions.includes(option.id)}
                    onReveal={() => revealOption(option.id)}
                    originalText={option.text}
                    language={language}
                    devilMode={devilMode ?? undefined}
                  />
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

        {/* Panel de Poderes de Jesús */}
        {isJesusActive && phase === 'answering' && (
          <div className="flex justify-center gap-3 w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {revealUsesRemaining > 0 && getJesusSettings().canRevealCorrectAnswer && (
              <button
                onClick={() => {
                  const success = useRevealCorrectAnswer();
                  if (success) {
                    toast.success("¡Poder divino! Revelando respuesta...");
                    setShowHint(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full font-bold text-[12px] shadow-sm border border-amber-200/50 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Revelar Respuesta ({revealUsesRemaining})</span>
              </button>
            )}
            {isDevilActive && protectionUsesRemaining > 0 && getJesusSettings().canProtectAgainstDevil && (
              <button
                onClick={() => {
                  const success = useDivineProtection();
                  if (success) {
                    toast.success("¡Barrera divina! Trampa del Diablo desactivada.");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-full font-bold text-[12px] shadow-sm border border-sky-200/50 active:scale-95 transition-all"
              >
                <Shield className="w-4 h-4 text-sky-500" />
                <span>Proteger del Diablo ({protectionUsesRemaining})</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col items-end gap-2">
          <PowerUpsBar 
            onPowerUsed={handlePowerUsed}
            onReport={handleReport}
            isProcessing={isProcessingPower}
            setIsProcessing={setIsProcessingPower}
            disabled={phase !== 'answering'}
            activePowerUps={activePowerUps}
          />
        </div>
      </main>
      <DevilTrapOverlay isActive={isDevilActive} devilState={devilState} devilMode={devilMode ?? undefined} devilEvent={devilEvent ?? undefined} />
      <JesusTrapOverlay isActive={isJesusActive} jesusState={jesusState} jesusEvent={jesusEvent} />
      
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center border border-white/20 shadow-2xl relative flex flex-col items-center gap-6 animate-scale-in">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-inner">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-black text-[#310065] italic">
                {language === 'ht' ? 'Èske ou vle kite jwèt la?' : '¿De verdad quieres salir?'}
              </h3>
              <p className="text-[12px] font-semibold text-[#1b1b1e]/60 leading-relaxed max-w-[90%] mx-auto">
                {language === 'ht' 
                  ? 'Si ou pati kounye a, ou pral pèdi pwogrè pou defi jounen an. Pa abandone!'
                  : 'Si te retiras ahora, perderás el progreso del desafío de hoy. ¡No te rindas!'}
              </p>
            </div>

            <div className="flex gap-4 w-full pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {language === 'ht' ? 'KONTINYE JWE' : 'SEGUIR JUGANDO'}
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  router.push('/daily-challenge');
                }}
                className="flex-1 py-4 bg-[#f5f3f7] hover:bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-transparent shadow-sm hover:scale-105 active:scale-95 transition-transform"
              >
                {language === 'ht' ? 'KITE JWÈT LA' : 'SALIR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
