'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Swords, 
  BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeQuestion, ChallengeOption } from '@/lib/challenge/models';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import DevilTrapOverlay from '@/components/play/DevilTrapOverlay';
import DevilTrapOptionText from '@/components/play/DevilTrapOptionText';
import { getGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';

interface ChallengePlayViewProps {
  question: ChallengeQuestion;
  onComplete: (isCorrect: boolean) => void;
  onClose: () => void;
}

const QUESTION_TIME_LIMIT = 20; // seconds
const TIMER_RADIUS = 30;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

// Localized UI helper
const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    title: '¡Reto Especial!',
    timeUp: '¡Tiempo agotado!',
    correct: '¡Correcto!',
    incorrect: '¡Incorrecto!',
    explanation: 'Explicación',
    continueBtn: 'Continuar',
    trueText: 'Verdadero',
    falseText: 'Falso',
    matchLeft: 'Columna A',
    matchRight: 'Columna B',
    fillBlankHint: 'Selecciona una palabra para rellenar el espacio en blanco:'
  },
  ht: {
    title: 'Reto Espesyal!',
    timeUp: 'Tan an fini!',
    correct: 'Kòrèk!',
    incorrect: 'Enkòrèk!',
    explanation: 'Eksplikasyon',
    continueBtn: 'Kontinye',
    trueText: 'Verite / Vre',
    falseText: 'Manti',
    matchLeft: 'Kolòn A',
    matchRight: 'Kolòn B',
    fillBlankHint: 'Chwazi yon mo pou ranpli espas vid la:'
  },
  fr: {
    title: 'Défi Spécial !',
    timeUp: 'Temps écoulé !',
    correct: 'Correct !',
    incorrect: 'Incorrect !',
    explanation: 'Explication',
    continueBtn: 'Continuer',
    trueText: 'Vrai',
    falseText: 'Faux',
    matchLeft: 'Colonne A',
    matchRight: 'Colonne B',
    fillBlankHint: 'Sélectionnez un mot pour remplir le vide :'
  }
};

export default function ChallengePlayView({ question, onComplete, onClose }: ChallengePlayViewProps) {
  const lang = question.language || 'es';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.es;

  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null); // For MCQ
  const [trueFalseSelection, setTrueFalseSelection] = useState<string | null>(null); // For True/False
  const [fillBlankSelection, setFillBlankSelection] = useState<string | null>(null); // For Fill in the Blank
  
  // For Column Matching
  const [selectedLeft, setSelectedLeft] = useState<string>('');
  const [selectedRight, setSelectedRight] = useState<string>('');
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // Left -> Right mapping
  const [shuffledRightOptions, setShuffledRightOptions] = useState<string[]>([]);
  const [shakeMatch, setShakeMatch] = useState(false);

  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Devil Trap Hook
  const {
    isDevilActive,
    revealedOptions,
    shuffledOptions,
    triggerDevilTrap,
    revealOption,
    resetDevilTrap
  } = useDevilTrap();

  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);

  useEffect(() => {
    (async () => {
      const gc = await getGameEngineConfig();
      setEngineConfig(gc);
    })();
  }, []);

  // Initialize and shuffle column matching
  useEffect(() => {
    if (question.questionType === 'match_columns' && question.matchPairs) {
      const rightList = question.matchPairs.map(p => p.right);
      const shuffled = [...rightList].sort(() => Math.random() - 0.5);
      setShuffledRightOptions(shuffled);
    }
  }, [question]);

  // Devil Trap Trigger on Question Change
  useEffect(() => {
    if (phase === 'answering') {
      if (question.questionType === 'multiple_choice' && question.options) {
        const devilProb = engineConfig?.devilTrap?.spawnProbability ?? 0.15;
        triggerDevilTrap(question.options, false, devilProb);
      } else {
        resetDevilTrap();
      }
    }
  }, [question, phase, triggerDevilTrap, resetDevilTrap, engineConfig]);

  // Fire confetti animation
  const fireSuccessConfetti = () => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleFinishAnswer = (correct: boolean, selection: string | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswerCorrect(correct);
    setPhase('feedback');
    if (correct) {
      fireSuccessConfetti();
    }
  };

  // Handle countdown
  useEffect(() => {
    if (phase !== 'answering') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishAnswer(false, null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Validate MCQ
  const handleMCQSelect = (optionId: string) => {
    if (phase !== 'answering') return;
    setSelectedOptionId(optionId);
    const correct = optionId === question.correctAnswer;
    setTimeout(() => {
      handleFinishAnswer(correct, optionId);
    }, 300);
  };

  // Validate True/False
  const handleTrueFalseSelect = (value: string) => {
    if (phase !== 'answering') return;
    setTrueFalseSelection(value);
    const correct = value === question.correctAnswer;
    setTimeout(() => {
      handleFinishAnswer(correct, value);
    }, 300);
  };

  // Validate Fill in Blank
  const handleFillBlankSelect = (word: string) => {
    if (phase !== 'answering') return;
    setFillBlankSelection(word);
    const correct = word.toLowerCase() === question.correctAnswer.toLowerCase();
    setTimeout(() => {
      handleFinishAnswer(correct, word);
    }, 400);
  };

  // Validate Column Matching
  const handleColumnClick = (side: 'left' | 'right', value: string) => {
    if (phase !== 'answering') return;

    if (side === 'left') {
      setSelectedLeft(value);
      if (selectedRight) {
        processMatching(value, selectedRight);
      }
    } else {
      setSelectedRight(value);
      if (selectedLeft) {
        processMatching(selectedLeft, value);
      }
    }
  };

  const processMatching = (leftVal: string, rightVal: string) => {
    const pair = question.matchPairs?.find(p => p.left === leftVal && p.right === rightVal);

    if (pair) {
      setMatchedPairs(prev => {
        const next = { ...prev, [leftVal]: rightVal };
        const allCompleted = Object.keys(next).length === (question.matchPairs?.length || 0);
        if (allCompleted) {
          setTimeout(() => {
            handleFinishAnswer(true, null);
          }, 300);
        }
        return next;
      });
      setSelectedLeft('');
      setSelectedRight('');
    } else {
      setShakeMatch(true);
      setTimeout(() => {
        setShakeMatch(false);
        setSelectedLeft('');
        setSelectedRight('');
      }, 600);
    }
  };

  const timerDashOffset = TIMER_CIRCUMFERENCE * (1 - timeLeft / QUESTION_TIME_LIMIT);
  const timerColor = timeLeft > 8 ? '#e9c349' : timeLeft > 4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1b1b1e]/95 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-br from-[#1a003b] to-[#3a0875] border border-[#7345b6]/30 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl text-white overflow-hidden"
      >
        {/* Glow details */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#e9c349] opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-500 opacity-10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="flex w-full items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-[#e9c349] flex items-center justify-center shadow-inner shrink-0">
                <Swords className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#d7baff] uppercase tracking-wider block">
                  {t.title}
                </span>
                <span className="text-xs font-bold text-amber-300">
                  Recompensas x3 / Pérdida x0.5
                </span>
              </div>
            </div>

            {/* Circular Timer */}
            {phase === 'answering' && (
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36" cy="36" r={TIMER_RADIUS}
                    fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4"
                  />
                  <circle
                    cx="36" cy="36" r={TIMER_RADIUS}
                    fill="transparent"
                    stroke={timerColor}
                    strokeWidth="4"
                    strokeDasharray={TIMER_CIRCUMFERENCE}
                    strokeDashoffset={timerDashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="text-sm font-black tracking-tight" style={{ color: timerColor }}>
                  {timeLeft}
                </span>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div className="w-full bg-white/5 rounded-2xl p-5 mb-6 border border-white/10 relative">
            <p className="text-[17px] md:text-[19px] font-bold text-center leading-relaxed text-slate-100">
              {question.questionType === 'fill_blanks' && fillBlankSelection
                ? question.questionText.replace('______', `「 ${fillBlankSelection} 」`)
                : question.questionText
              }
            </p>
          </div>

          {/* ==========================================
              INTERACTIVE AREA BY QUESTION TYPE
          ========================================== */}
          <div className="w-full flex-grow flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {phase === 'answering' ? (
                <motion.div
                  key="answering-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col gap-3"
                >
                  {/* TYPE 1: MULTIPLE CHOICE */}
                  {question.questionType === 'multiple_choice' && question.options?.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleMCQSelect(opt.id)}
                        className="w-full p-4 rounded-xl flex items-center gap-4 text-left border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition-all font-bold text-sm text-slate-200"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#3a0875] border border-[#7345b6]/30 flex items-center justify-center shrink-0 font-extrabold text-amber-300">
                          {letter}
                        </div>
                        <DevilTrapOptionText
                          isDevilActive={isDevilActive}
                          optionId={letter}
                          isRevealed={revealedOptions.includes(opt.id)}
                          onReveal={() => revealOption(opt.id)}
                          originalText={opt.text}
                          language={lang}
                        />
                      </button>
                    );
                  })}

                  {/* TYPE 2: TRUE / FALSE */}
                  {question.questionType === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <button
                        onClick={() => handleTrueFalseSelect('Verdadero')}
                        className="py-6 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 active:scale-95 transition-all text-sm font-bold"
                      >
                        <span className="text-4xl">👍</span>
                        <span>{t.trueText}</span>
                      </button>
                      <button
                        onClick={() => handleTrueFalseSelect('Falso')}
                        className="py-6 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 active:scale-95 transition-all text-sm font-bold"
                      >
                        <span className="text-4xl">👎</span>
                        <span>{t.falseText}</span>
                      </button>
                    </div>
                  )}

                  {/* TYPE 3: FILL IN THE BLANKS */}
                  {question.questionType === 'fill_blanks' && (
                    <div className="flex flex-col gap-4 py-2 items-center">
                      <p className="text-xs font-semibold text-slate-300 mb-2">
                        {t.fillBlankHint}
                      </p>
                      <div className="flex flex-wrap justify-center gap-3 w-full">
                        {question.options?.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleFillBlankSelect(opt.text)}
                            className="py-3 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-amber-400 hover:text-[#1a003b] active:scale-95 transition-all font-bold text-xs uppercase tracking-wider shadow-md"
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE 4: COLUMN MATCHING */}
                  {question.questionType === 'match_columns' && question.matchPairs && (
                    <div className={`grid grid-cols-2 gap-4 py-2 ${shakeMatch ? 'animate-shake' : ''}`}>
                      {/* Left Column */}
                      <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">
                          {t.matchLeft}
                        </span>
                        {question.matchPairs.map((pair, idx) => {
                          const isMatched = !!matchedPairs[pair.left];
                          const isSel = selectedLeft === pair.left;

                          return (
                            <button
                              key={`left-${idx}`}
                              onClick={() => handleColumnClick('left', pair.left)}
                              disabled={isMatched}
                              className={`w-full p-3.5 rounded-xl font-bold text-xs border text-center transition-all ${
                                isMatched
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 opacity-60'
                                  : isSel
                                    ? 'border-amber-400 bg-amber-400/20 text-white'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10 active:scale-95'
                              }`}
                            >
                              {pair.left}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">
                          {t.matchRight}
                        </span>
                        {shuffledRightOptions.map((rightText, idx) => {
                          const matchedLeftKey = Object.keys(matchedPairs).find(k => matchedPairs[k] === rightText);
                          const isMatched = !!matchedLeftKey;
                          const isSel = selectedRight === rightText;

                          return (
                            <button
                              key={`right-${idx}`}
                              onClick={() => handleColumnClick('right', rightText)}
                              disabled={isMatched}
                              className={`w-full p-3.5 rounded-xl font-bold text-xs border text-center transition-all ${
                                isMatched
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 opacity-60'
                                  : isSel
                                    ? 'border-amber-400 bg-amber-400/20 text-white'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10 active:scale-95'
                              }`}
                            >
                              {rightText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="feedback-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center text-center gap-6"
                >
                  {/* Correct/Incorrect Header */}
                  <div className="flex flex-col items-center gap-3">
                    {isAnswerCorrect ? (
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shadow-lg ring-4 ring-red-500/30 animate-bounce">
                        <XCircle className="w-10 h-10" />
                      </div>
                    )}
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {isAnswerCorrect ? t.correct : timeLeft === 0 ? t.timeUp : t.incorrect}
                    </h3>
                  </div>

                  {/* Explanation card */}
                  <div className="w-full bg-white/5 rounded-2xl p-5 border border-white/10 text-left">
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block mb-2">
                      {t.explanation}
                    </span>
                    <p className="text-xs leading-relaxed text-slate-200">
                      {question.explanation}
                    </p>
                    <p className="text-xs font-bold text-amber-300 mt-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 shrink-0" />
                      {question.bibleReference}
                    </p>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => onComplete(isAnswerCorrect)}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-amber-400 to-[#cba72f] hover:from-amber-300 hover:to-[#b09025] text-[#1b1b1e] font-black text-base uppercase tracking-wider active:scale-98 transition-all"
                  >
                    {t.continueBtn}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Shake Keyframe animations style tag */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <DevilTrapOverlay isActive={isDevilActive} />
    </div>
  );
}
