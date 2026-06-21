'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, MessageCircle } from 'lucide-react';
import { DuelModel, DuelRound, DuelQuestion, DuelAnswer } from '@/lib/duel/models';
import { getDuelById, getRoundsForDuel, submitRoundAnswers } from '@/lib/duel/repository';
import { getDuelViewState, calculateAnswerPoints } from '@/lib/duel/service';
import { getQuestionsByIds } from '@/lib/duel/seed';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT, useLanguage } from '@/lib/i18n/context';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import ChatRoom from '@/components/chat/ChatRoom';
import { toast } from 'sonner';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTimestampMs } from '@/lib/chat/chatService';
import { X } from 'lucide-react';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import DevilTrapOverlay from '@/components/play/DevilTrapOverlay';
import DevilTrapOptionText from '@/components/play/DevilTrapOptionText';
import { getGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';
import { canUseFramePower } from '@/lib/game/frame-powers';
import { playCorrectSound, playWrongSound } from '@/lib/game/audio';
import { motion } from 'motion/react';

type PhaseType = 'loading' | 'ready' | 'question' | 'feedback' | 'round_done' | 'error';

export default function DuelPlayPage({ params }: { params: Promise<{ duelId: string }> }) {
  const { user } = useAuthContext();
  const t = useT();
  const DEMO_UID = user?.uid || 'unknown-user';
  const { language: userLanguage } = useLanguage();
  const { duelId } = use(params);
  const router = useRouter();

  const [duel, setDuel] = useState<DuelModel | null>(null);
  const [currentRound, setCurrentRound] = useState<DuelRound | null>(null);
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DuelAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [phase, setPhase] = useState<PhaseType>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isProcessingPower, setIsProcessingPower] = useState(false);
  const [devilSpawnedCount, setDevilSpawnedCount] = useState(0);
  const [devilDefeatedCount, setDevilDefeatedCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!duelId) return;
    const chatId = `match_${duelId}`;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(20));

    const unsubscribe = onSnapshot(q, {
      next: (snapshot: any) => {
        const lastReadString = localStorage.getItem('last_read_chats') || '{}';
        const lastReadMap = JSON.parse(lastReadString);
        const lastReadTime = lastReadMap[chatId] || 0;

        let count = 0;
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.senderId !== DEMO_UID && !data.deleted) {
            const msgTime = getTimestampMs(data.createdAt) || Date.now();
            if (msgTime > lastReadTime) {
              count++;
            }
          }
        });
        setUnreadMessages(count);
      },
      error: (err) => {
        if (err.code === 'permission-denied') {
          console.warn('Chat no inicializado aún o sin permisos de lectura para esta sala de chat.');
        } else {
          console.error('Error en snapshot de chat:', err);
        }
      }
    });

    const handleChatRead = (e: any) => {
      if (e.detail?.chatId === chatId) {
        setUnreadMessages(0);
      }
    };
    window.addEventListener('chat-read', handleChatRead);

    return () => {
      unsubscribe();
      window.removeEventListener('chat-read', handleChatRead);
    };
  }, [duelId, DEMO_UID]);
  
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
  } = useDevilTrap();

  // Power-ups state
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hasSecondChance, setHasSecondChance] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInitializedIndexRef = useRef<number>(-1);
  const isInitializing = useRef(false);

  // ── Initial Data Fetch ─────────────────────────────────────
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    (async () => {
      const [d, gc] = await Promise.all([
        getDuelById(duelId),
        getGameEngineConfig()
      ]);
      if (!d) { setPhase('error'); return; }
      
      setEngineConfig(gc);
      const vs = getDuelViewState(d, DEMO_UID);
      if (!vs.isMyTurn) {
        // Not the user's turn — redirect back to detail
        router.replace(`/arena/duels/${duelId}`);
        return;
      }

      const rounds = await getRoundsForDuel(duelId);
      const round = rounds.find((r) => r.roundNumber === d.currentRound) ?? null;
      if (!round) { setPhase('error'); return; }

      const qs = getQuestionsByIds(round.questionIds, userLanguage);
      if (qs.length === 0) {
        setErrorMessage(`questions empty for round ${round.roundNumber}, ids: ${JSON.stringify(round.questionIds)}`);
        setPhase('error');
        return;
      }

      setDuel(d);
      setCurrentRound(round);
      setQuestions(qs);
      setPhase('ready');
    })().catch(err => {
      setErrorMessage(err.message);
      setPhase('error');
    });
  }, [duelId, router, DEMO_UID, userLanguage]);

  // ── Reset timer on new question ───────────────────────────
  useEffect(() => {
    if (phase === 'question') {
      if (lastInitializedIndexRef.current === questionIndex) {
        return;
      }
      lastInitializedIndexRef.current = questionIndex;

      setTimeLeft(duel?.turnTimeLimitSeconds ?? 20);
      setQuestionStartTime(Date.now());
      setActivePowerUps([]);

      const currentQ = questions[questionIndex];
      if (currentQ && devilSpawnedCount < 5 && devilDefeatedCount < 2) {
        const wasDevilActiveBefore = isDevilActive;
        const spawned = triggerDevilTrap(currentQ.options, false, engineConfig?.devilTrap, false);
        if (spawned && !wasDevilActiveBefore) {
          setDevilSpawnedCount(prev => prev + 1);
        }
      } else {
        resetDevilTrap();
      }

      // Lógica de Poderes Pasivos de Marcos
      const isFire  = canUseFramePower(user?.activeFrame, user?.level ?? 1) && (user?.activeFrame === 'fire'  || user?.activeFrame === 'fire_frame');
      const isCrown = canUseFramePower(user?.activeFrame, user?.level ?? 1) && (user?.activeFrame === 'crown' || user?.activeFrame === 'crow_frame' || user?.activeFrame === 'crown_frame');
      
      if ((isFire || isCrown) && questionIndex < 5) {
        // 1. Ocultar 2 opciones incorrectas automáticamente
        if (currentQ) {
          const wrongOptions = currentQ.options.filter(o => o.id !== currentQ.correctOptionId);
          const toHide = [...wrongOptions].sort(() => 0.5 - Math.random()).slice(0, 2).map(o => o.id);
          setHiddenOptionIds(toHide);
        }
      } else {
        setHiddenOptionIds([]);
      }

      if (isCrown && questionIndex < 5) {
        // 2. Dar segunda oportunidad pasiva automáticamente solo para Crown en las primeras 5
        setHasSecondChance(true);
        setActivePowerUps(['secondChance']);
      } else {
        setHasSecondChance(false);
      }

      setShowHint(false);
    }
  }, [phase, questionIndex, duel?.turnTimeLimitSeconds, user?.activeFrame, questions, triggerDevilTrap, engineConfig, devilSpawnedCount, devilDefeatedCount, resetDevilTrap, isDevilActive]);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'question') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (activePowerUps.includes('freezeTime')) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex, activePowerUps]);

  const timeLimit = duel?.turnTimeLimitSeconds ?? 20;
  const timerProgress = (timeLeft / timeLimit) * 100;

  // ── Handlers ──────────────────────────────────────────────────
  const startPlaying = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setTotalScore(0);
    setCorrectCount(0);
    setDevilSpawnedCount(0);
    setDevilDefeatedCount(0);
    setQuestionStartTime(Date.now());
    setPhase('question');
  };

  const handleSelect = (optionId: string) => {
    if (phase !== 'question' || selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const responseTimeMs = Date.now() - questionStartTime;
    const q = questions[questionIndex];
    const correct = optionId === q.correctOptionId;
    if (correct && isDevilActive) {
      setDevilDefeatedCount(prev => prev + 1);
    }
    
    if (!correct && hasSecondChance && !isDevilActive) {
      toast.success("Chans an dezyèm itilize! Ou sove.");
      setHasSecondChance(false);
      setActivePowerUps(prev => prev.filter(p => p !== 'secondChance'));
      setSelectedOption(null);
      // Resume timer if it was stopped by freezeTime? 
      // Actually handleSelect clears the timer. We need to restart it if we give a second chance.
      if (!activePowerUps.includes('freezeTime')) {
        setQuestionStartTime(Date.now()); // Reset start time for better points calculation or just keep it?
        // Let's just restart the interval
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => {
            if (activePowerUps.includes('freezeTime')) return t;
            if (t <= 1) {
              clearInterval(timerRef.current!);
              handleTimeout();
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      }
      return;
    }

    let points = calculateAnswerPoints(correct, responseTimeMs, timeLimit);
    const isGoldOrCrown = canUseFramePower(user?.activeFrame, user?.level ?? 1) && (user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame');
    if (isGoldOrCrown) {
      points *= 2;
    }

    setSelectedOption(optionId);
    setIsCorrect(correct);

    // Audio feedback
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
    
    if (correct && isGoldOrCrown) {
      toast.success("Rekonpans Doub x2 👑");
    }

    const answer: DuelAnswer = {
      questionId: q.id,
      selectedOptionId: optionId,
      correctOptionId: q.correctOptionId,
      isCorrect: correct,
      responseTimeMs,
      pointsEarned: points,
    };

    setAnswers((prev) => [...prev, answer]);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setTotalScore((s) => s + points);
    }
    // Trigger devil reaction
    if (isDevilActive) {
      if (correct) devilDefeat();
      else devilCelebrate();
    }

    setPhase('feedback');

    setTimeout(() => advance([...answers, answer]), 1500);
  };

  const handleTimeout = () => {
    if (phase !== 'question') return;
    const q = questions[questionIndex];
    const answer: DuelAnswer = {
      questionId: q.id,
      selectedOptionId: null,
      correctOptionId: q.correctOptionId,
      isCorrect: false,
      responseTimeMs: timeLimit * 1000,
      pointsEarned: 0,
    };
    setSelectedOption(null);
    setIsCorrect(false);
    setPhase('feedback');
    const updated = [...answers, answer];
    setAnswers(updated);
    setTimeout(() => advance(updated), 1500);
  };

  const advance = (allAnswers: DuelAnswer[]) => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < questions.length) {
      setQuestionIndex(nextIdx);
      setSelectedOption(null);
      setIsCorrect(null);
      setQuestionStartTime(Date.now());
      setPhase('question');
      // Reset power-up effects for next question
      setHiddenOptionIds([]);
      setShowHint(false);
      setActivePowerUps([]);
      setTimeLeft(duel?.turnTimeLimitSeconds ?? 20);
    } else {
      finishRound(allAnswers);
    }
  };

  const finishRound = async (allAnswers: DuelAnswer[]) => {
    if (!duel || !currentRound) return;
    setPhase('round_done');

    const roundScore = allAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const correct = allAnswers.filter((a) => a.isCorrect).length;

    try {
      const { isDuelComplete } = await submitRoundAnswers(
        duelId,
        currentRound.roundNumber,
        DEMO_UID,
        allAnswers,
        roundScore,
        correct
      );

      // Navigate after brief pause
      setTimeout(() => {
        if (isDuelComplete) {
          router.push(`/match-result?duelId=${duelId}`);
        } else {
          router.push(`/arena/duels/${duelId}`);
        }
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(String(err));
      }
      setPhase('error');
    }
  };

  const handlePowerUsed = (powerId: string) => {
    const currentQ = questions[questionIndex];
    if (!currentQ) return;

    setActivePowerUps(prev => [...prev, powerId]);

    switch (powerId) {
      case 'removeTwo':
        const wrongOptions = currentQ.options.filter(o => o.id !== currentQ.correctOptionId);
        const toHide = [...wrongOptions].sort(() => 0.5 - Math.random()).slice(0, 2).map(o => o.id);
        setHiddenOptionIds(toHide);
        break;
      case 'hint':
        setShowHint(true);
        break;
      case 'freezeTime':
        // Handled in timer interval effect
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      case 'secondChance':
        setHasSecondChance(true);
        break;
    }
  };

  // ── Current question ──────────────────────────────────────────
  const q = questions[questionIndex];

  // ── Render ────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="bg-[#faf9fc] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#4a148c]/20 border-t-[#4a148c] animate-spin" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-16 h-16 text-[#2d1b69]/30 mb-4" />
        <h2 className="text-2xl font-bold text-[#2d1b69] mb-6">{t.duel.errorLoadingRound}</h2>
        <p className="text-[#e53935] mb-6 text-sm">{errorMessage}</p>
        <Link href="/arena/duels" className="font-semibold text-[#4a148c]">
          {t.duel.backToArena}
        </Link>
      </div>
    );
  }

  if (phase === 'round_done') {
    const isTiebreaker = currentRound?.isTiebreakerRound === true;
    return (
      <div className="bg-[#faf9fc] min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-2 ${
          isTiebreaker ? 'bg-amber-100' : 'bg-emerald-100'
        }`}>
          <span className="text-4xl">{isTiebreaker ? '⚡' : '✅'}</span>
        </div>
        <h2 className="font-serif text-[26px] font-black text-[#310065]">
          {isTiebreaker ? t.duel.tiebreakerPlayed : t.duel.roundComplete}
        </h2>
        <p className="text-[#7c7483] text-[15px]">
          {totalScore} pts · {correctCount}/{questions.length}
        </p>
        <p className="text-[#cdc3d4] text-[13px] font-medium mt-2">
          {t.duel.waitingRival}
        </p>
        <button
          onClick={async () => {
            const { createMatchChat } = await import('@/lib/chat/chatService');
            const opponentId = duel ? Object.keys(duel.participants).find(id => id !== DEMO_UID) || '' : '';
            try {
              const chatId = await createMatchChat(duelId, [DEMO_UID, opponentId]);
              router.push(`/chat?id=${chatId}`);
            } catch (e) {
              toast.error('Error al abrir el chat');
            }
          }}
          className="mt-6 flex items-center gap-2 bg-[#0A84FF] hover:bg-blue-600 text-white px-5 py-3 rounded-full font-bold text-[14px] shadow-sm transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          {userLanguage === 'es' ? 'Chat de la Partida' : userLanguage === 'fr' ? 'Chat de Match' : 'Chat match la'}
        </button>
      </div>
    );
  }

  if (phase === 'ready' && duel && currentRound) {
    const isTiebreaker = currentRound.isTiebreakerRound === true;
    const vs = getDuelViewState(duel, DEMO_UID);

    return (
      <div className="bg-[#faf9fc] min-h-screen flex flex-col pt-safe">
        <header className="flex items-center gap-3 px-5 py-4">
          <Link href={`/arena/duels/${duelId}`} className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#310065]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7c7483]">{t.duel.duelVs} {vs.opponentName}</p>
            <h1 className="font-serif text-[20px] font-black text-[#310065]">
              {isTiebreaker ? `⚡ ${t.duel.suddenDeath}` : `${t.duel.round} ${currentRound.roundNumber}`}
            </h1>
          </div>
          <button
            onClick={async () => {
              const { createMatchChat } = await import('@/lib/chat/chatService');
              try {
                const chatId = await createMatchChat(duelId, [DEMO_UID, vs.opponentId]);
                router.push(`/chat?id=${chatId}`);
              } catch (e) {
                toast.error(userLanguage === 'es' ? 'Error al abrir el chat' : 'Error');
              }
            }}
            className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#0A84FF] hover:bg-blue-50 transition-colors active:scale-95 shrink-0 ml-auto"
            title="Chat de partida"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {isTiebreaker ? (
            <div className="w-20 h-20 rounded-[2rem] bg-amber-100 flex items-center justify-center mb-5 shadow-sm">
              <span className="text-4xl">⚡</span>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-[2rem] bg-[#eddcff]/60 flex items-center justify-center mb-5 shadow-sm">
              <span className="text-4xl">⚔️</span>
            </div>
          )}

          {isTiebreaker ? (
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-1.5 rounded-full mb-4">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                {t.duel.tieAlert.split('!')[0]}!
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-[#eddcff]/60 px-4 py-1.5 rounded-full mb-4">
              <span className="text-[10px] font-black text-[#4a148c] uppercase tracking-widest">
                {t.duel.round} {currentRound.roundNumber} {t.duel.of} {duel.totalRounds}
              </span>
            </div>
          )}

          <h2 className="font-serif text-[26px] font-black text-[#310065] mb-2">{currentRound.categoryName}</h2>
          <p className={`text-[14px] font-medium mb-8 ${isTiebreaker ? 'text-amber-600 font-bold' : 'text-[#7c7483]'}`}>
            {isTiebreaker
              ? t.duel.tiebreakerDesc
              : t.duel.questionsAndSeconds
                  .replace('{count}', String(questions.length))
                  .replace('{seconds}', String(timeLimit))}
          </p>

          <button
            onClick={startPlaying}
            className={`w-full max-w-[320px] py-4 text-white rounded-[1.25rem] font-bold text-[17px] hover:opacity-90 transition-all active:scale-[0.99] ${
              isTiebreaker
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_8px_20px_rgba(245,158,11,0.3)]'
                : 'bg-gradient-to-r from-[#310065] to-[#4a148c] shadow-[0_8px_20px_rgba(49,0,101,0.2)]'
            }`}
          >
            {isTiebreaker ? `⚡ ${t.duel.playTiebreaker}` : t.duel.startRound}
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTION SCREEN ──────────────────────────────────────────
  if ((phase === 'question' || phase === 'feedback') && q) {
    const vs = duel ? getDuelViewState(duel, DEMO_UID) : null;
    return (
      <div className="bg-[#faf9fc] min-h-screen flex flex-col font-sans pt-safe">

        {/* Top bar with timer */}
        <div className="px-5 pt-16 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#7c7483] uppercase tracking-widest">
              {questionIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[16px] border-4 transition-colors ${
                timeLeft > 10 ? 'border-[#4a148c] text-[#310065]' :
                timeLeft > 5 ? 'border-amber-400 text-amber-600' :
                'border-red-400 text-red-600 animate-pulse'
              }`}>
                {timeLeft}
              </div>
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-2 bg-[#f5f3f7] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                timeLeft > 10 ? 'bg-[#4a148c]' : timeLeft > 5 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${timerProgress}%` }}
            />
          </div>

          {/* Score strip */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#7c7483] font-semibold">{currentRound?.categoryName}</span>
            <span className="font-black text-[#310065]">{totalScore} pts</span>
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1 px-5 flex flex-col gap-4">
          <div className={`rounded-[2rem] p-6 border transition-colors ${
            phase === 'feedback' && isCorrect === true  ? 'bg-emerald-50 border-emerald-300' :
            phase === 'feedback' && isCorrect === false ? 'bg-red-50 border-red-300' :
            'bg-white border-[#1b1b1e]/5'
          } shadow-[0_4px_20px_rgba(0,0,0,0.04)]`}>
            <p className="font-serif text-[19px] font-bold text-[#1b1b1e] leading-snug mb-2">
              {q.questionText}
            </p>
            {phase === 'feedback' && (
              <p className="text-[12px] text-[#7c7483] mt-2 leading-relaxed">
                {q.explanation} — <span className="font-bold text-[#4a148c]">{q.bibleReference}</span>
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = opt.id === q.correctOptionId;
              let cls = 'bg-white border-[#1b1b1e]/5 text-[#1b1b1e]';
              const isAdmin = user?.email === 'juniormax2013@gmail.com';
              if (phase === 'question' && isAdmin && isCorrectOpt) {
                cls = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400/20';
              } else if (phase === 'feedback') {
                if (isCorrectOpt) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                else if (isSelected && !isCorrectOpt) cls = 'bg-red-50 border-red-400 text-red-700';
              }
              if (hiddenOptionIds.includes(opt.id)) return null;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={phase !== 'question'}
                  className={`w-full py-4 px-5 rounded-[1.25rem] border-2 font-semibold text-[15px] text-left transition-all flex items-center gap-3 ${cls} ${phase === 'question' ? 'hover:border-[#4a148c]/40 hover:shadow-sm active:scale-[0.99]' : ''} ${(showHint && isCorrectOpt && phase === 'question') ? 'ring-2 ring-[#cba72f] shadow-[0_0_15px_rgba(203,167,47,0.3)]' : ''}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${
                    phase === 'feedback' && isCorrectOpt ? 'bg-emerald-500 text-white' :
                    phase === 'feedback' && isSelected && !isCorrectOpt ? 'bg-red-500 text-white' :
                    (showHint && isCorrectOpt && phase === 'question') ? 'bg-[#ffe088] text-[#735c00]' :
                    'bg-[#f5f3f7] text-[#7c7483]'
                  }`}>
                    {opt.id.toUpperCase()}
                  </span>
                  <DevilTrapOptionText
                    isDevilActive={isDevilActive}
                    optionId={opt.id.toUpperCase()}
                    isRevealed={revealedOptions.includes(opt.id)}
                    onReveal={() => revealOption(opt.id)}
                    originalText={opt.text}
                    language={userLanguage}
                    devilMode={devilMode ?? undefined}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Power Ups Bar (Left Side) */}
        {phase === 'question' && (
          <div className="px-5 mt-auto pb-6 pb-safe">
            <PowerUpsBar 
              onPowerUsed={handlePowerUsed}
              onReport={() => {
                toast.success("Mèsi! Nou resevwa rapò w la.");
              }}
              isProcessing={isProcessingPower}
              setIsProcessing={setIsProcessingPower}
              disabled={phase !== 'question'}
              activePowerUps={activePowerUps}
            />
          </div>
        )}

        {/* Draggable Floating Chat Button (Opposite side to Powers, same height) */}
        {vs && (
          <motion.div 
            drag
            dragMomentum={false}
            dragConstraints={{ left: -350, right: 20, top: -650, bottom: 20 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] right-5 z-40 cursor-grab active:cursor-grabbing select-none touch-none"
          >
            <div className="relative">
              <button
                onClick={async () => {
                  const { createMatchChat } = await import('@/lib/chat/chatService');
                  try {
                    await createMatchChat(duelId, [DEMO_UID, vs.opponentId]);
                  } catch (e) {
                    console.error("Error creating chat room:", e);
                  }
                  setIsChatOpen(true);
                }}
                className="w-14 h-14 rounded-full bg-white border border-[#1b1b1e]/10 shadow-lg flex items-center justify-center text-[#0A84FF] active:scale-95 transition-transform"
                title="Chat de partida"
              >
                <MessageCircle className="w-7 h-7" />
              </button>
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none animate-bounce">
                  {unreadMessages}
                </span>
              )}
            </div>
          </motion.div>
        )}

        <DevilTrapOverlay isActive={isDevilActive} devilState={devilState} devilMode={devilMode ?? undefined} devilEvent={devilEvent ?? undefined} />

        {/* Floating slide-up chat drawer */}
        {isChatOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-t-[2.5rem] h-[60vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />
              <div className="flex-1 overflow-hidden relative pb-safe">
                <ChatRoom chatId={`match_${duelId}`} onBack={() => setIsChatOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
