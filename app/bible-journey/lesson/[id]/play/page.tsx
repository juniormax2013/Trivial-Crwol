'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  Heart, 
  Flame, 
  HelpCircle, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Volume2
} from 'lucide-react';
import { getLessonById, LessonQuestion, QuestionType } from '@/lib/bible/data';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  getUserHearts, 
  consumeHeart, 
  addQuestionToReview, 
  completeBibleLesson 
} from '@/lib/bible/repository';
import { toast } from 'sonner';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import DevilTrapOverlay from '@/components/play/DevilTrapOverlay';
import DevilTrapOptionText from '@/components/play/DevilTrapOptionText';
import { getGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';
import { playCorrectSound, playWrongSound } from '@/lib/game/audio';

export default function BibleLessonPlay() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  
  const lessonId = params.id as string;
  const lesson = getLessonById(lessonId);

  // Gameplay State
  const [hearts, setHearts] = useState(5);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>(''); // For MCQ & True/False
  const [fillBlankWord, setFillBlankWord] = useState<string>(''); // For Fill in the Blanks
  const [orderedList, setOrderedList] = useState<{ id: number; text: string }[]>([]); // For Order events
  
  // For Column Matching
  const [selectedLeft, setSelectedLeft] = useState<string>('');
  const [selectedRight, setSelectedRight] = useState<string>('');
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // Maps Left -> Right
  const [failedMatch, setFailedMatch] = useState<boolean>(false);

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

  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);
  const [devilSpawnedCount, setDevilSpawnedCount] = useState(0);
  const [devilDefeatedCount, setDevilDefeatedCount] = useState(0);

  // Interaction State
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFailedOut, setIsFailedOut] = useState(false); // Hearts = 0

  // Timer
  const startTimeRef = useRef<number>(0);
  const lastInitializedIndexRef = useRef<number>(-1);

  useEffect(() => {
    startTimeRef.current = Date.now();
    (async () => {
      const gc = await getGameEngineConfig();
      setEngineConfig(gc);
    })();
  }, []);

  const questions = lesson?.questions || [];
  const currentQuestion = questions[currentIdx];

  // Initialize ordered events or matching structures for specific question types
  useEffect(() => {
    if (!currentQuestion) return;
    if (lastInitializedIndexRef.current === currentIdx) {
      return;
    }
    lastInitializedIndexRef.current = currentIdx;
    
    // Reset inputs
    setSelectedOption('');
    setFillBlankWord('');
    setSelectedLeft('');
    setSelectedRight('');
    setMatchedPairs({});
    setIsChecked(false);
    setShowHint(false);

    if (currentQuestion.question_type === 'multiple_choice' && devilSpawnedCount < 5 && devilDefeatedCount < 2) {
      const wasDevilActiveBefore = isDevilActive;
      const spawned = triggerDevilTrap(currentQuestion.options || [], false, engineConfig?.devilTrap, false);
      if (spawned && !wasDevilActiveBefore) {
        setDevilSpawnedCount(prev => prev + 1);
      }
    } else {
      resetDevilTrap();
    }

    if (currentQuestion.question_type === 'order_events' && currentQuestion.ordered_events) {
      // Shuffle ordered list for play start
      const shuffled = [...currentQuestion.ordered_events].sort(() => Math.random() - 0.5);
      setOrderedList(shuffled);
    }
  }, [currentIdx, currentQuestion, triggerDevilTrap, resetDevilTrap, engineConfig, devilSpawnedCount, devilDefeatedCount, isDevilActive]);

  // Load Initial Hearts
  useEffect(() => {
    if (!user) return;
    getUserHearts(user.uid).then(h => {
      setHearts(h.heartsRemaining);
      if (h.heartsRemaining <= 0) {
        setIsFailedOut(true);
      }
    });
  }, [user]);

  if (!lesson || questions.length === 0) {
    return <div className="p-8 text-center">Cargando lección...</div>;
  }

  // Calculate Progress Percentage
  const progressPercent = Math.round((currentIdx / questions.length) * 100);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // Shift Event items in Order Events type
  const moveEvent = (index: number, direction: 'up' | 'down') => {
    if (isChecked) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderedList.length) return;

    const list = [...orderedList];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    setOrderedList(list);
  };

  // Match columns selection logic
  const handleColumnSelect = (type: 'left' | 'right', value: string) => {
    if (isChecked) return;
    if (type === 'left') {
      setSelectedLeft(value);
      if (selectedRight) {
        processPairMatch(value, selectedRight);
      }
    } else {
      setSelectedRight(value);
      if (selectedLeft) {
        processPairMatch(selectedLeft, value);
      }
    }
  };

  const processPairMatch = (left: string, right: string) => {
    if (!currentQuestion.match_pairs) return;
    
    // Find if this is a correct match pair in currentQuestion
    const pair = currentQuestion.match_pairs.find(p => p.left === left && p.right === right);

    if (pair) {
      // Matched correctly! Add to matched map
      setMatchedPairs(prev => ({ ...prev, [left]: right }));
      setSelectedLeft('');
      setSelectedRight('');
      
      // Auto check if all matches are completed
      const totalPairsCount = currentQuestion.match_pairs.length;
      const completedPairsCount = Object.keys(matchedPairs).length + 1;
      
      if (completedPairsCount === totalPairsCount) {
        // Complete columns match successfully
        setIsCorrect(true);
      }
    } else {
      // Match failed! Play visual shake and reset selection
      setFailedMatch(true);
      setTimeout(() => {
        setFailedMatch(false);
        setSelectedLeft('');
        setSelectedRight('');
      }, 800);
    }
  };

  // Check Answer Button Logic
  const handleCheckAnswer = async () => {
    if (isChecked) {
      // Continue to next question or complete lesson
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // End of lesson! Calculate final results
        const finalScore = Math.round((correctCount / questions.length) * 100);
        const elapsedTime = Math.round((Date.now() - startTimeRef.current) / 1000); // in seconds
        
        try {
          // Sync with Firestore repository
          const rewards = await completeBibleLesson(user!.uid, lessonId, {
            score: finalScore,
            correctAnswers: correctCount,
            totalQuestions: questions.length
          });

          // Redirect to Result Screen
          router.push(
            `/bible-journey/lesson/${lessonId}/result?score=${finalScore}&correct=${correctCount}&total=${questions.length}&time=${elapsedTime}`
          );
        } catch (error) {
          console.error("Error saving lesson completion:", error);
          // Fallback redirect
          router.push(`/bible-journey/lesson/${lessonId}/result?score=${finalScore}&correct=${correctCount}&total=${questions.length}&time=${elapsedTime}`);
        }
      }
      return;
    }

    let isAnswerCorrect = false;

    // Validate based on question type
    if (currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false' || currentQuestion.question_type === 'comprehension') {
      isAnswerCorrect = selectedOption === currentQuestion.correct_answer;
    } else if (currentQuestion.question_type === 'fill_blanks') {
      isAnswerCorrect = fillBlankWord === currentQuestion.correct_answer;
    } else if (currentQuestion.question_type === 'order_events') {
      const orderStr = orderedList.map(e => e.id).join(',');
      isAnswerCorrect = orderStr === currentQuestion.correct_answer;
    } else if (currentQuestion.question_type === 'match_columns') {
      // For columns matching, correctness was calculated dynamically as matching pairs filled up
      isAnswerCorrect = isCorrect; 
    }

    setIsCorrect(isAnswerCorrect);
    setIsChecked(true);

    if (isAnswerCorrect) {
      playCorrectSound();
      setCorrectCount(prev => prev + 1);
      if (currentQuestion.question_type === 'multiple_choice' && isDevilActive) {
        setDevilDefeatedCount(prev => prev + 1);
        devilDefeat();
      }
      // Soft audio or haptic success indicator can trigger here
    } else {
      playWrongSound();
      // Answer Incorrect: consume a heart and add question to spaced repetition database
      if (isDevilActive) devilCelebrate();
      try {
        const updatedHearts = await consumeHeart(user!.uid);
        setHearts(updatedHearts.heartsRemaining);
        
        await addQuestionToReview(user!.uid, currentQuestion);

        if (updatedHearts.heartsRemaining <= 0) {
          setIsFailedOut(true);
        }
      } catch (err) {
        console.error("Error updating heart loss:", err);
      }
    }
  };

  const isAnswerSelected = () => {
    if (currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false' || currentQuestion.question_type === 'comprehension') {
      return !!selectedOption;
    }
    if (currentQuestion.question_type === 'fill_blanks') {
      return !!fillBlankWord;
    }
    if (currentQuestion.question_type === 'order_events') {
      return true; // Always has order
    }
    if (currentQuestion.question_type === 'match_columns') {
      // Must matched all columns pairs to enable validation check
      return Object.keys(matchedPairs).length === (currentQuestion.match_pairs?.length || 0);
    }
    return false;
  };

  // Exit Lesson Flow
  const handleExitLesson = () => {
    setShowExitConfirm(true);
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col justify-between text-[#1b1b1e] antialiased select-none font-sans relative">
      
      {/* 1. TOP HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl border-b border-[#310065]/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExitLesson}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/50 transition-colors active:scale-95 duration-200"
            >
              <X className="w-[22px] h-[22px] text-[#310065]" strokeWidth={2.5} />
            </button>
          </div>
          <div className="text-[19px] font-black text-[#310065] tracking-tighter uppercase font-body flex items-center">
            BIBLE JOURNEY
          </div>
          <div className="w-10 h-10"></div> {/* Spacer to keep title centered */}
        </div>
      </header>

      {/* 2. MAIN INTERACTIVE CARD FEED */}
      <main className="flex-grow pt-[88px] pb-28 px-6 flex flex-col max-w-xl mx-auto w-full relative z-10 gap-4">
        
        {/* Progress & Hearts Section */}
        <div className="flex items-end justify-between gap-4 mb-4">
          {/* Dynamic Green Progress Bar */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[11px] font-bold tracking-[0.15em] text-[#755978] uppercase">{lesson.title}</span>
              <span className="text-[13px] font-extrabold text-[#735c00]">{currentIdx + 1} de {questions.length}</span>
            </div>
            <div className="h-2 w-full bg-[#e3e2e6] rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full text-red-500 text-xs font-black shadow-sm shrink-0">
            <Heart size={14} fill="currentColor" className="animate-bounce" />
            <span className="tabular-nums font-bold">{hearts}/5</span>
          </div>
        </div>
        
        {/* HINT OVERLAY CARD */}
        {showHint && currentQuestion.hint && (
          <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-scale-in">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center shadow-inner shrink-0">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block">PISTA BÍBLICA</span>
              <p className="text-[11px] font-bold text-[#1b1b1e]/85 leading-relaxed">{currentQuestion.hint}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-purple-100/50 rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col gap-6 relative">
          
          {/* Question Title Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">
                Ejercicio {currentIdx + 1} de {questions.length} • {currentQuestion.difficulty === 'easy' ? 'Fácil' : currentQuestion.difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </span>
              <h2 className="text-md sm:text-lg font-black text-[#1b1b1e] tracking-tight leading-snug">
                {currentQuestion.question_text}
              </h2>
            </div>

            {currentQuestion.hint && (
              <button 
                onClick={() => {
                  if (isDevilActive) {
                    toast.error("Pouvwa yo bloke pandan dyab la la! 😈");
                    return;
                  }
                  setShowHint(!showHint);
                }}
                disabled={isDevilActive}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm border active:scale-95 transition-all ${
                  isDevilActive
                    ? 'opacity-50 grayscale bg-gray-50 border-gray-100 cursor-not-allowed'
                    : showHint 
                    ? 'bg-amber-100 border-amber-300 text-amber-600' 
                    : 'bg-white border-purple-100/40 text-[#310065]/60 hover:bg-purple-50/50'
                }`}
              >
                <HelpCircle size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* ==========================================
              DYNAMIC RENDERER FOR EXERCISE TYPES
          ========================================== */}
          <div className="flex-1 flex flex-col gap-3.5">
            
            {/* TYPE 1: MULTIPLE CHOICE */}
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options?.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSel = selectedOption === opt;
              const isAdmin = user?.email === 'juniormax2013@gmail.com';
              const isCorrectAnswer = opt === currentQuestion.correct_answer;
              
              return (
                <button
                  key={idx}
                  onClick={() => !isChecked && setSelectedOption(opt)}
                  disabled={isChecked}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left border-2 font-bold text-xs uppercase tracking-wide transition-all shadow-sm ${
                    isSel 
                      ? 'border-amber-400 bg-amber-50/30 text-[#310065]' 
                      : isAdmin && isCorrectAnswer
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse'
                      : 'border-purple-100/30 hover:border-purple-200/50 text-[#1b1b1e]/80 hover:bg-purple-50/30'
                  } active:scale-98`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSel ? 'border-amber-500 bg-amber-400 text-white font-black' : isAdmin && isCorrectAnswer ? 'border-emerald-500 bg-emerald-500 text-white font-black' : 'border-purple-100 text-purple-300'
                  }`}>
                    {letter}
                  </div>
                  <DevilTrapOptionText
                    isDevilActive={isDevilActive}
                    optionId={letter}
                    isRevealed={revealedOptions.includes(opt)}
                    onReveal={() => revealOption(opt)}
                    originalText={opt}
                    language="es"
                    devilMode={devilMode ?? undefined}
                  />
                </button>
              );
            })}

            {/* TYPE 2: TRUE / FALSE */}
            {currentQuestion.question_type === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                {['Verdadero', 'Falso'].map((opt, idx) => {
                  const isSel = selectedOption === opt;
                  const isAdmin = user?.email === 'juniormax2013@gmail.com';
                  const isCorrectAnswer = opt === currentQuestion.correct_answer;
                  return (
                    <button
                      key={idx}
                      onClick={() => !isChecked && setSelectedOption(opt)}
                      disabled={isChecked}
                      className={`py-8 px-4 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 font-black uppercase tracking-wider text-sm transition-all shadow-sm ${
                        isSel 
                          ? 'border-amber-400 bg-amber-50/30 text-[#310065]' 
                          : isAdmin && isCorrectAnswer
                          ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse'
                          : 'border-purple-100/30 hover:border-purple-200/50 text-[#1b1b1e]/80 hover:bg-purple-50/30'
                      } active:scale-95`}
                    >
                      <span className="text-3xl">{opt === 'Verdadero' ? '👍' : '👎'}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: FILL IN THE BLANKS */}
            {currentQuestion.question_type === 'fill_blanks' && (
              <div className="space-y-6 py-4 flex flex-col items-center">
                {/* Visual blank spot indicator in sentence */}
                <div className="text-center p-5 bg-purple-50/30 border border-purple-100/30 rounded-2xl max-w-sm">
                  <p className="text-sm font-black text-[#1b1b1e] leading-loose">
                    {currentQuestion.question_text.replace('______', fillBlankWord ? `「 ${fillBlankWord} 」` : '_______')}
                  </p>
                </div>

                {/* Blanks Options tray */}
                <div className="flex flex-wrap justify-center gap-3 pt-2 max-w-sm">
                  {currentQuestion.options?.map((opt, idx) => {
                    const isSel = fillBlankWord === opt;
                    const isAdmin = user?.email === 'juniormax2013@gmail.com';
                    const isCorrectAnswer = opt === currentQuestion.correct_answer;
                    return (
                      <button
                        key={idx}
                        onClick={() => !isChecked && setFillBlankWord(isSel ? '' : opt)}
                        disabled={isChecked}
                        className={`py-3 px-5 rounded-2xl border-2 font-black text-xs uppercase tracking-wider shadow-sm transition-all ${
                          isSel 
                            ? 'border-amber-400 bg-amber-400 text-white shadow-md' 
                            : isAdmin && isCorrectAnswer
                            ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse'
                            : 'border-purple-100/30 bg-white text-[#1b1b1e]/75 hover:bg-purple-50/20 active:scale-95'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE 4: ORDER EVENTS ACCESSIBLE SORT */}
            {currentQuestion.question_type === 'order_events' && (
              <div className="space-y-3.5">
                {orderedList.map((item, idx) => (
                  <div 
                    key={item.id}
                    className="bg-white border border-purple-100/30 p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-6 h-6 rounded-full bg-purple-50 text-[#310065] flex items-center justify-center text-[10px] font-black border border-purple-100/30">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-extrabold text-[#1b1b1e]/85 leading-snug">{item.text}</span>
                    </div>

                    {/* Up/Down arrow controllers */}
                    {!isChecked && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => moveEvent(idx, 'up')}
                          disabled={idx === 0}
                          className="w-8 h-8 rounded-xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-50 transition-colors"
                        >
                          <ArrowUp size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => moveEvent(idx, 'down')}
                          disabled={idx === orderedList.length - 1}
                          className="w-8 h-8 rounded-xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-gray-50 transition-colors"
                        >
                          <ArrowDown size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TYPE 5: COLUMN MATCHING */}
            {currentQuestion.question_type === 'match_columns' && (
              <div className="grid grid-cols-2 gap-4 py-2">
                {/* Left Column (Concepts) */}
                <div className="space-y-3">
                  <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest pl-2 block">Día / Elemento</span>
                  {currentQuestion.match_pairs?.map((pair, idx) => {
                    const isMatched = !!matchedPairs[pair.left];
                    const isSel = selectedLeft === pair.left;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleColumnSelect('left', pair.left)}
                        disabled={isChecked || isMatched}
                        className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-wider border-2 text-center shadow-sm transition-all ${
                          isMatched 
                            ? 'border-green-100 bg-green-50/50 text-green-700 opacity-60' 
                            : isSel 
                              ? 'border-amber-400 bg-amber-50/30 text-[#310065]' 
                              : 'border-purple-100/30 bg-white hover:bg-purple-50/30 text-[#1b1b1e]/75 active:scale-95'
                        }`}
                      >
                        {pair.left}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column (Meanings - Shuffled in content originally) */}
                <div className="space-y-3">
                  <span className="text-[8px] font-black text-[#1b1b1e]/30 uppercase tracking-widest pl-2 block">Obra / Significado</span>
                  {currentQuestion.match_pairs?.map((pair, idx) => {
                    // Find if right element is matched to any left element
                    const matchedLeftKey = Object.keys(matchedPairs).find(k => matchedPairs[k] === pair.right);
                    const isMatched = !!matchedLeftKey;
                    const isSel = selectedRight === pair.right;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleColumnSelect('right', pair.right)}
                        disabled={isChecked || isMatched}
                        className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-wider border-2 text-center shadow-sm transition-all h-[52px] flex items-center justify-center ${
                          isMatched 
                            ? 'border-green-100 bg-green-50/50 text-green-700 opacity-60' 
                            : isSel 
                              ? 'border-amber-400 bg-amber-50/30 text-[#310065]' 
                              : 'border-purple-100/30 bg-white hover:bg-purple-50/30 text-[#1b1b1e]/75 active:scale-95'
                        } ${failedMatch && isSel ? 'animate-shake border-red-400 bg-red-50 text-red-700' : ''}`}
                      >
                        <span className="leading-tight line-clamp-2">{pair.right}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE 6: COMPREHENSION */}
            {currentQuestion.question_type === 'comprehension' && (
              <div className="space-y-4">
                {/* Short text reminder context */}
                <div className="p-4 bg-purple-50/20 border border-purple-100/20 rounded-2xl text-[11px] font-bold text-[#1b1b1e]/70 leading-relaxed text-justify shadow-inner max-h-40 overflow-y-auto">
                  {currentQuestion.hint || "Estudia bien las opciones y escoge la respuesta correcta basándote en la historia sagrada."}
                </div>

                {/* Options list */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSel = selectedOption === opt;
                    const isAdmin = user?.email === 'juniormax2013@gmail.com';
                    const isCorrectAnswer = opt === currentQuestion.correct_answer;
                    return (
                      <button
                        key={idx}
                        onClick={() => !isChecked && setSelectedOption(opt)}
                        disabled={isChecked}
                        className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left border-2 font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm ${
                          isSel 
                            ? 'border-amber-400 bg-amber-50/30 text-[#310065]' 
                            : isAdmin && isCorrectAnswer
                            ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse'
                            : 'border-purple-100/30 hover:border-purple-200/50 text-[#1b1b1e]/80 hover:bg-purple-50/30'
                        } active:scale-98`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSel ? 'border-amber-500 bg-amber-400 text-white font-black text-[9px]' : isAdmin && isCorrectAnswer ? 'border-emerald-500 bg-emerald-500 text-white font-black text-[9px]' : 'border-purple-100 text-purple-300 text-[9px]'
                        }`}>
                          {letter}
                        </div>
                        <span className="font-extrabold text-[#1b1b1e]/80 leading-tight">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 3. IMMEDIATE FEEDBACK POPUP FOOTER */}
      <footer className={`fixed bottom-0 left-0 right-0 z-50 p-6 max-w-xl mx-auto rounded-t-[2.5rem] border-t transition-all duration-300 ${
        isChecked 
          ? isCorrect
            ? 'bg-green-50 border-green-200 shadow-[0_-8px_30px_rgba(34,197,94,0.12)]'
            : 'bg-red-50 border-red-200 shadow-[0_-8px_30px_rgba(239,68,68,0.12)]'
          : 'bg-white border-purple-100/40 shadow-[0_-8px_30px_rgba(49,0,101,0.04)]'
      }`}>
        <div className="flex flex-col gap-4">
          
          {/* Answer Check Result Overlay details */}
          {isChecked && (
            <div className="flex gap-4 items-start animate-slide-up">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
                isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-shake'
              }`}>
                {isCorrect ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <AlertTriangle size={20} strokeWidth={2.5} />}
              </div>
              <div className="space-y-1">
                <h4 className={`text-md font-black font-serif italic ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '¡Excelente trabajo!' : '¡Oops! Sigue aprendiendo'}
                </h4>
                {!isCorrect && (
                  <span className="text-[10px] font-black text-red-700 block uppercase tracking-wider">
                    RESPUESTA CORRECTA: {currentQuestion.correct_answer}
                  </span>
                )}
                <p className={`text-[10px] font-bold leading-relaxed ${isCorrect ? 'text-green-700/85' : 'text-red-700/85'}`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Core validation trigger button */}
          <button
            onClick={handleCheckAnswer}
            disabled={!isAnswerSelected()}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-98 transition-all ${
              isChecked
                ? isCorrect
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/10'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10'
                : isAnswerSelected()
                  ? 'bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] shadow-lg shadow-amber-400/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <span>{isChecked ? 'Continuar' : 'Comprobar'}</span>
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </footer>

      {/* ==========================================
          ⚠️ EXIT CONFIRMATION MODAL OVERLAY
      ========================================== */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#faf9fc] w-full max-w-md rounded-[2rem] p-6 text-center border border-white/20 shadow-2xl relative flex flex-col items-center gap-5 animate-scale-in">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
              <AlertTriangle size={28} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-[#310065] font-serif italic">
                ¿De verdad quieres salir?
              </h3>
              <p className="text-[11px] font-semibold text-[#1b1b1e]/60 leading-relaxed max-w-[85%] mx-auto">
                Si te retiras a mitad de camino, perderás todo el progreso y las vidas invertidas en esta lección. ¡No te rindas!
              </p>
            </div>

            <div className="flex gap-3 w-full pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] rounded-xl font-black text-xs uppercase tracking-wider shadow-md"
              >
                Seguir jugando
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  router.push('/bible-journey');
                }}
                className="flex-1 py-3.5 bg-white hover:bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-wider border border-purple-100 shadow-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          💔 DEFEAT / NO HEARTS OVERLAY
      ========================================== */}
      {isFailedOut && (
        <div className="fixed inset-0 z-50 bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="max-w-md space-y-6 flex flex-col items-center">
            
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-lg relative animate-bounce">
              <Heart size={44} fill="currentColor" />
              <span className="absolute text-white font-black text-lg -rotate-12">💔</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#310065] font-serif italic">
                ¡Sin corazones!
              </h2>
              <p className="text-xs font-semibold text-[#1b1b1e]/65 leading-relaxed max-w-[85%] mx-auto">
                Has agotado tus vidas de sabiduría. No te preocupes, el camino del aprendizaje requiere constancia. Practica en el **Centro de Repasos** para recuperar corazones de inmediato o espera a que se recarguen de forma natural.
              </p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <button
                onClick={() => router.push('/bible-journey/review')}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-md"
              >
                Ir a Repaso Diario (+1 Corazón)
              </button>
              <button
                onClick={() => router.push('/bible-journey')}
                className="w-full py-4 px-6 bg-white hover:bg-purple-50 text-[#310065] rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest border border-purple-100 shadow-sm"
              >
                Volver al Panel Principal
              </button>
            </div>

          </div>
        </div>
      )}

      <DevilTrapOverlay isActive={isDevilActive} devilState={devilState} devilMode={devilMode ?? undefined} devilEvent={devilEvent ?? undefined} />
    </div>
  );
}
