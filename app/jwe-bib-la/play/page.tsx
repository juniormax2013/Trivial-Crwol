'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  CheckCircle2, 
  Heart, 
  Zap,
  BookOpen,
  Crown as CrownIcon,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Flame,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n/context';
import { ALL_DUEL_QUESTIONS } from '@/lib/duel/seed';
import { consumeJweEnergy, consumeJweHeart, grantJweRewards, saveGamePlay, checkAndQualifyReferral } from '@/lib/user/repository';
import { RandomChallengeModal, fireChallengeSuccessConfetti } from '@/components/play/RandomChallengeModal';
import ChallengePlayView from '@/components/play/ChallengePlayView';
import { getRandomChallengeQuestion } from '@/lib/challenge/seed';
import type { ChallengeQuestion } from '@/lib/challenge/models';
import { DuelQuestion } from '@/lib/duel/models';
import { runTransaction, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import { toast } from 'sonner';
import { getGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import DevilTrapOverlay from '@/components/play/DevilTrapOverlay';
import DevilTrapOptionText from '@/components/play/DevilTrapOptionText';
import { canUseFramePower } from '@/lib/game/frame-powers';

const PERSEVERANCE_VERSES = [
  { text: "Men, moun ki va kenbe fèm jouk sa kaba, se li ki va sove.", ref: "MATYE 24:13" },
  { text: "Pa bouke fè byen. Paske, lè lè a rive, n' ap rekòlte si n pa bay legen.", ref: "GALASI 6:9" },
  { text: "Mwen kapab fè tout bagay grasa Kris la ki ban mwen fòs.", ref: "FILIPYEN 4:13" },
  { text: "Benediksyon pou moun ki kenbe fèm anba tantasyon. Lè l'a fin pase anba tantasyon an, la resevwa kouwon lavi a.", ref: "JAK 1:12" },
  { text: "Seyè a se fòs mwen ak pwoteksyon mwen. Nan li mwen mete konfyans mwen.", ref: "SÒM 28:7" }
];

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


const PLAY_TRANSLATIONS = {
  es: {
    wonTitle: "¡Ganaste!",
    wonDesc: "¡Felicidades! Respondiste todas las preguntas correctamente.",
    rewardsTitle: "Tus Recompensas",
    continueBtn: "CONTINUAR",
    lostDesc: "¡Buena suerte para la próxima sesión de juego!",
    questionProgress: "Pregunta {n} de 7",
    loadingQuestion: "Cargando pregunta...",
    nextQuestion: "Siguiente Pregunta",
    finishGame: "Terminar Juego",
    loginToSkip: "Debes iniciar sesión para saltar preguntas",
    noHeartsToSkip: "No tienes suficientes vidas para saltar esta pregunta",
    skippedAlert: "Pregunta saltada. Perdiste 1 vida.",
    thanksReport: "¡Gracias! Hemos recibido tu reporte.",
    exitTitle: "¿De verdad quieres salir?",
    exitDesc: "Si te retiras ahora, perderás tu progreso en esta partida. ¡No te rindas!",
    keepPlaying: "SEGUIR JUGANDO",
    exitBtn: "SALIR",
  },
  ht: {
    wonTitle: "Ou Genyen!",
    wonDesc: "Felisitasyon! Ou reponn tout kesyon yo kòrèkteman.",
    rewardsTitle: "Rekonpans Ou",
    continueBtn: "KONTINYE",
    lostDesc: "Bon chans pou pwochen sesyon jwèt la!",
    questionProgress: "Kesyon {n} sou 7",
    loadingQuestion: "Chaje kesyon...",
    nextQuestion: "Kesyon Pwochèn",
    finishGame: "Fini Jwèt la",
    loginToSkip: "Ou dwe konekte pou sote kesyon",
    noHeartsToSkip: "Ou pa gen ase lavi pou sote kesyon sa a",
    skippedAlert: "Kesyon sote. Ou pèdi 1 lavi.",
    thanksReport: "Mèsi! Nou resevwa rapò w la.",
    exitTitle: "Èske ou vle kite jwèt la?",
    exitDesc: "Si ou pati kounye a, ou pral pèdi pwogrè pou jwèt sa a. Pa abandone!",
    keepPlaying: "KONTINYE JWE",
    exitBtn: "KITE JWÈT LA",
  },
  fr: {
    wonTitle: "Vous avez gagné !",
    wonDesc: "Félicitations ! Vous avez répondu correctement à toutes les questions.",
    rewardsTitle: "Vos Récompenses",
    continueBtn: "CONTINUER",
    lostDesc: "Bonne chance pour la prochaine session de jeu !",
    questionProgress: "Question {n} sur 7",
    loadingQuestion: "Chargement de la question...",
    nextQuestion: "Question Suivante",
    finishGame: "Finir le jeu",
    loginToSkip: "Vous devez vous connecter pour sauter des questions",
    noHeartsToSkip: "Vous n'avez pas assez de vies pour sauter cette question",
    skippedAlert: "Question sautée. Vous avez perdu 1 vie.",
    thanksReport: "Merci ! Nous avons reçu votre rapport.",
    exitTitle: "Voulez-vous vraiment quitter ?",
    exitDesc: "Si vous partez maintenant, vous perdrez votre progression. N'abandonnez pas !",
    keepPlaying: "CONTINUER À JOUER",
    exitBtn: "QUITTER",
  },
  en: {
    wonTitle: "You Won!",
    wonDesc: "Congratulations! You answered all questions correctly.",
    rewardsTitle: "Your Rewards",
    continueBtn: "CONTINUE",
    lostDesc: "Good luck for the next game session!",
    questionProgress: "Question {n} of 7",
    loadingQuestion: "Loading question...",
    nextQuestion: "Next Question",
    finishGame: "Finish Game",
    loginToSkip: "You must log in to skip questions",
    noHeartsToSkip: "You do not have enough lives to skip this question",
    skippedAlert: "Question skipped. You lost 1 life.",
    thanksReport: "Thank you! We have received your report.",
    exitTitle: "Do you really want to leave?",
    exitDesc: "If you leave now, you will lose your progress in this match. Don't give up!",
    keepPlaying: "KEEP PLAYING",
    exitBtn: "EXIT",
  }
};

export default function JweBibLaPlay() {
  const { user } = useAuth();
  const { language: userLanguage } = useLanguage();
  const router = useRouter();
  
  const lang = ((userLanguage as string) === 'fr' || (userLanguage as string) === 'es' || (userLanguage as string) === 'en' || (userLanguage as string) === 'ht') ? (userLanguage as 'fr' | 'es' | 'en' | 'ht') : 'ht';
  const localT = PLAY_TRANSLATIONS[lang];
  
  // Game state
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [energy, setEnergy] = useState(28);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPower, setIsProcessingPower] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Power-ups state
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Random Challenge State
  const [rcConfig, setRcConfig] = useState<{
    hasChallenge: boolean;
    questionIndex: number;
    status: 'pending' | 'accepted' | 'rejected' | 'won' | 'lost' | null;
    showModal: boolean;
  } | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<ChallengeQuestion | null>(null);
  const [showChallengePlay, setShowChallengePlay] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(20);
  const isInitializing = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInitializedIndexRef = useRef<number>(-1);
  
  const [randomVerse, setRandomVerse] = useState(PERSEVERANCE_VERSES[0]);
  const [embers, setEmbers] = useState<{ left: string; size: string; opacity: number; duration: string; delay: string }[]>([]);

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

  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);
  const [devilSpawnedCount, setDevilSpawnedCount] = useState(0);
  const [devilDefeatedCount, setDevilDefeatedCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(async (optionId: string) => {
    if (isAnswered || isGameOver) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelectedOption(optionId);
    setIsAnswered(true);
    
    const correct = optionId === currentQuestion.correctOptionId;
    setIsCorrect(correct);

    if (correct && isDevilActive) {
      setDevilDefeatedCount(prev => prev + 1);
      devilDefeat();
    } else if (!correct && isDevilActive) {
      devilCelebrate();
    }

    if (!correct) {
      if (hasSecondChance && optionId !== 'TIMEOUT' && !isDevilActive) {
        toast.success("Chans an dezyèm itilize! Ou sove.");
        setHasSecondChance(false);
        setActivePowerUps(prev => prev.filter(p => p !== 'secondChance'));
        setSelectedOption(null);
        setIsAnswered(false);
        
        // Restart timer
        setTimeLeft(20);
        return;
      }
      
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (user) await consumeJweHeart(user.uid).catch(console.error);
      
      if (newHearts <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
          setIsWin(false);
        }, 1200);
        return;
      }
    } else {
      // Correct answer
      if (rcConfig?.status === 'accepted' && rcConfig.questionIndex === currentIndex) {
        setRcConfig(prev => prev ? { ...prev, status: 'won' } : null);
        fireChallengeSuccessConfetti();
      }
    }
    // Check if lost random challenge
    if (!correct && rcConfig?.status === 'accepted' && rcConfig.questionIndex === currentIndex) {
        setRcConfig(prev => prev ? { ...prev, status: 'lost' } : null);
    }
  }, [isAnswered, isGameOver, currentQuestion, hasSecondChance, hearts, user, rcConfig, currentIndex, isDevilActive]);

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
    setTimeLeft(20); // Reset standard timer to 20s
  }, []);
  const nextQuestion = useCallback(async () => {
    if (currentIndex >= 6) {
      setIsGameOver(true);
      setIsWin(true);
      if (user) {
        const isGoldOrCrown = canUseFramePower(user?.activeFrame, user?.level ?? 1) && (user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame');
        if (isGoldOrCrown) {
          toast.success("Rekonpans Doub x2 👑");
        }
        const challengeMultiplier = rcConfig?.status === 'won' ? 3 : rcConfig?.status === 'lost' ? 0.5 : 1;
        await grantJweRewards(user.uid, isGoldOrCrown, challengeMultiplier);
        // Calificar referido si aplica (primera partida completada)
        await checkAndQualifyReferral(user.uid);
      }
      return;
    }
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, user, rcConfig]);

  // ── Reset timer on new question ───────────────────────────
  useEffect(() => {
    if (!isLoading && !isGameOver && questions.length > 0) {
      if (lastInitializedIndexRef.current === currentIndex) {
        return;
      }
      lastInitializedIndexRef.current = currentIndex;

      setTimeLeft(20);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      
      const newActivePowerUps: string[] = [];
      let newHiddenOptionIds: string[] = [];
      let newHasSecondChance = false;

      const q = questions[currentIndex];
      
      // Si la partida tiene un Reto Especial programado, el diablo tiene terminantemente prohibido aparecer en toda la partida
      const isDevilAllowedInMatch = !rcConfig?.hasChallenge;

      const canTriggerDevil = q && devilSpawnedCount < 5 && devilDefeatedCount < 2 && isDevilAllowedInMatch;

      if (canTriggerDevil) {
        const wasDevilActiveBefore = isDevilActive;
        const spawned = triggerDevilTrap(q.options, false, engineConfig?.devilTrap, false);
        if (spawned && !wasDevilActiveBefore) {
          setDevilSpawnedCount(prev => prev + 1);
        }
      } else {
        // Si no está permitido el diablo o no se triggeró, nos aseguramos de ocultarlo por completo con humo
        resetDevilTrap(true);
      }

      if (user?.activeFrame) {
        const isFire  = canUseFramePower(user.activeFrame, user.level ?? 1) && (user.activeFrame === 'fire'  || user.activeFrame === 'fire_frame');
        const isCrown = canUseFramePower(user.activeFrame, user.level ?? 1) && (user.activeFrame === 'crown' || user.activeFrame === 'crow_frame' || user.activeFrame === 'crown_frame');
        
        if ((isFire || isCrown) && currentIndex < 5) {
          if (q) {
             const wrongOptions = q.options.filter(o => o.id !== q.correctOptionId);
             newHiddenOptionIds = shuffle(wrongOptions).slice(0, 2).map(o => o.id);
          }
        }

        if (isCrown && currentIndex < 5) {
          newHasSecondChance = true;
          newActivePowerUps.push('secondChance');
        }
      }

      setActivePowerUps(newActivePowerUps);
      setHiddenOptionIds(newHiddenOptionIds);
      setHasSecondChance(newHasSecondChance);
      setShowHint(false);

      if (rcConfig?.hasChallenge && rcConfig.questionIndex === currentIndex && rcConfig.status === 'pending') {
        resetDevilTrap(true);
        setRcConfig(prev => prev ? { ...prev, showModal: true } : null);
      }
    }
  }, [currentIndex, isLoading, questions.length, questions, user?.activeFrame, rcConfig?.hasChallenge, rcConfig?.questionIndex, rcConfig?.status, triggerDevilTrap, engineConfig, devilSpawnedCount, devilDefeatedCount, isDevilActive, resetDevilTrap]);

  const handlePowerUsed = useCallback((powerId: string) => {
    setActivePowerUps(prev => {
      if (prev.includes(powerId)) return prev;
      return [...prev, powerId];
    });

    switch (powerId) {
      case 'removeTwo': {
        if (!currentQuestion) return;
        const wrongOptions = currentQuestion.options.filter(o => o.id !== currentQuestion.correctOptionId);
        const toHide = shuffle(wrongOptions).slice(0, 2).map(o => o.id);
        setHiddenOptionIds(toHide);
        break;
      }
      case 'hint':
        setShowHint(true);
        break;
      case 'freezeTime':
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        break;
      case 'secondChance':
        setHasSecondChance(true);
        break;
    }
  }, [currentQuestion]);

  // Pick random values in a side effect to keep render pure
  useEffect(() => {
    if (isGameOver) {
      const verse = PERSEVERANCE_VERSES[Math.floor(Math.random() * PERSEVERANCE_VERSES.length)];
      setRandomVerse(verse);

      const newEmbers = [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 4 + 2}px`,
        opacity: Math.random() * 0.5 + 0.3,
        duration: `${Math.random() * 5 + 5}s`,
        delay: `${Math.random() * 10}s`
      }));
      setEmbers(newEmbers);
    }
  }, [isGameOver]);

  const hasSavedHistory = useRef(false);
  useEffect(() => {
    if (isGameOver && user && !hasSavedHistory.current) {
      hasSavedHistory.current = true;
      const outcome = isWin ? 'win' : 'loss';
      saveGamePlay(user.uid, {
        gameMode: 'jwe_bib_la',
        score: currentIndex, // Number of questions correctly answered (current index represents progress)
        outcome
      }).catch(e => console.error("Error saving jwe-bib-la history:", e));
    }
  }, [isGameOver, user, isWin, currentIndex]);

  // Initialize game
  useEffect(() => {
    if (user && questions.length === 0 && !isGameOver && !isInitializing.current) {
      if (user.jweEnergy === undefined) return;
      
      isInitializing.current = true;
      
      const initGame = async () => {
        try {
          const gc = await getGameEngineConfig();
          setEngineConfig(gc);

          const currentHearts = user.jweHearts ?? 0;
          const currentEnergy = user.jweEnergy ?? 0;

          if (currentEnergy < 7) {
            setIsGameOver(true);
            setIsWin(false);
            setIsLoading(false);
            return;
          }

          setHearts(5);
          setEnergy(currentEnergy);
          setDevilSpawnedCount(0);
          setDevilDefeatedCount(0);

          // Use user's selected language; fall back to 'ht' if no questions available
          const langPool = ALL_DUEL_QUESTIONS.filter(q => q.language === userLanguage);
          const questionPool = langPool.length >= 7 ? langPool : ALL_DUEL_QUESTIONS.filter(q => q.language === 'ht');
          const selected = shuffle(questionPool).slice(0, 7).map(q => ({
            ...q,
            options: shuffle(q.options)
          }));
          
          setQuestions(selected);
          
          const specialChallengeProb = gc.specialChallenge?.spawnProbability ?? 0.50;
          const hasChallenge = Math.random() < specialChallengeProb;
          setRcConfig({
            hasChallenge,
            questionIndex: hasChallenge ? Math.floor(Math.random() * selected.length) : -1,
            status: 'pending',
            showModal: false
          });
          if (hasChallenge) {
            const randomChQ = getRandomChallengeQuestion(userLanguage);
            setChallengeQuestion(randomChQ);
          }

          setIsLoading(false);

          await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await transaction.get(userDocRef);
            
            if (!userSnap.exists()) return;
            
            const userData = userSnap.data();
            if (userData?.email === 'juniormax2013@gmail.com') {
              return;
            }
            const currentBalance = userData.jweEnergy ?? 0;
            
            if (currentBalance < 7) {
              throw new Error('Insifisan enèji');
            }
            
            transaction.update(userDocRef, {
              jweEnergy: currentBalance - 7,
              jweHearts: 5,
              updatedAt: new Date().toISOString()
            });
          });
          
          if (user.email === 'juniormax2013@gmail.com') {
            setEnergy(999999);
            setHearts(999999);
          } else {
            setEnergy(prev => prev - 7);
            setHearts(5);
          }
        } catch (error) {
          console.error('Deduction failed:', error);
          setIsGameOver(true);
          setIsLoading(false);
        }
      };

      initGame();
    }
  }, [user, questions.length, isGameOver]);

  // Timer logic
  useEffect(() => {
    // Helper to clear timer safely
    const clearCurrentTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Always clear existing interval when dependencies change
    clearCurrentTimer();

    // Conditions to stop/not start the timer
    const shouldStopTimer = 
      isLoading || 
      isGameOver || 
      isAnswered || 
      questions.length === 0 || 
      activePowerUps.includes('freezeTime') ||
      rcConfig?.showModal ||
      showChallengePlay ||
      showExitConfirm;

    if (shouldStopTimer) {
      return;
    }

    // Start a new interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearCurrentTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount or dependency change
    return clearCurrentTimer;
  }, [isLoading, isGameOver, isAnswered, currentIndex, questions.length, activePowerUps, rcConfig?.showModal, showChallengePlay, showExitConfirm]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered && !isGameOver && questions.length > 0) {
      handleAnswer('TIMEOUT');
    }
  }, [timeLeft, isAnswered, isGameOver, questions.length, handleAnswer]);




  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#310065]"></div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 text-center py-12 overflow-hidden bg-white font-serif pt-safe pb-safe">
        {/* Premium Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#fdfbfb_0%,#ebedee_100%)] opacity-50"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-30 w-full flex flex-col items-center">
          {isWin ? (
             <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-[#310065]/10 shadow-2xl">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 text-green-600 border border-green-100">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-[32px] font-black text-[#310065] mb-2 uppercase tracking-tighter">
                {localT.wonTitle}
              </h1>
              <p className="text-[#4a4452] mb-8 max-w-[300px] font-sans">
                {localT.wonDesc}
              </p>
              <div className="bg-[#f2f2f7] rounded-[2rem] p-8 shadow-inner w-full max-w-[320px] mb-8 border border-[#310065]/5 relative overflow-hidden">
                {/* Random Challenge Indicator */}
                {(rcConfig?.status === 'won') && (
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg border-b border-l border-emerald-200">
                    ⚡ Reto (x3)
                  </div>
                )}
                {(rcConfig?.status === 'lost') && (
                  <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg border-b border-l border-red-200">
                    ❌ Reto (x0.5)
                  </div>
                )}
                {/* Gold Frame Indicator */}
                {user && (user.activeFrame === 'gold' || user.activeFrame === 'crown' || user.activeFrame === 'gold_frame' || user.activeFrame === 'crow_frame') && (
                  <div className={`absolute ${rcConfig?.status === 'won' || rcConfig?.status === 'lost' ? 'top-5 right-0 rounded-bl-lg border-t' : 'top-0 right-0 rounded-bl-lg'} bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 border-b border-l border-amber-200`}>
                    👑 Bonus (x2)
                  </div>
                )}

                <h3 className="text-[12px] font-black text-[#7c7483] uppercase tracking-widest mb-6 mt-2">{localT.rewardsTitle}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-1 text-[#310065]">
                    <CrownIcon className="text-[#cba72f] fill-[#ffe088]" size={24} />
                    <span className="font-bold">{Math.ceil(3 * (rcConfig?.status === 'won' ? 3 : rcConfig?.status === 'lost' ? 0.5 : 1) * ((user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame') ? 2 : 1))}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[#310065]">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black italic border border-blue-200">XP</div>
                    <span className="font-bold">{Math.ceil(25 * (rcConfig?.status === 'won' ? 3 : rcConfig?.status === 'lost' ? 0.5 : 1))}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[#310065]">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 text-[#735c00] flex items-center justify-center text-[12px] font-black border border-yellow-200">$</div>
                    <span className="font-bold">{Math.ceil(7 * (rcConfig?.status === 'won' ? 3 : rcConfig?.status === 'lost' ? 0.5 : 1) * ((user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame') ? 2 : 1))}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => router.push('/arena')}
                className="premium-game-btn w-full max-w-[260px] py-4.5 text-[#f2e6cf] font-black text-[18px] tracking-[0.25em] transition-all hover:scale-105 active:scale-95 z-40 mb-12 shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              >
                {localT.continueBtn}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full mt-4 min-h-[90vh]">
              {/* Particle Layer (Embers) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                {embers.map((ember, i) => (
                  <div 
                    key={i}
                    className="ember absolute bg-orange-500 rounded-full blur-[1px]"
                    style={{
                      left: ember.left,
                      bottom: '-20px',
                      width: ember.size,
                      height: ember.size,
                      opacity: ember.opacity,
                      animation: `float-ember ${ember.duration} linear infinite`,
                      animationDelay: ember.delay
                    }}
                  />
                ))}
              </div>

              {/* Hero Section: Extreme 3D Layered Heart */}
              <div className="relative mt-8 mb-4 h-[380px] w-full flex items-center justify-center">
                {/* Bible Under-light Glows */}
                <div className="absolute top-[240px] w-64 h-32 bg-orange-600/40 blur-[70px] rounded-full animate-flicker-glow"></div>
                <div className="absolute top-[250px] w-48 h-24 bg-yellow-400/30 blur-[50px] rounded-full animate-flicker-strong"></div>

                {/* Projected Shadow on Bible (Deformable) */}
                <div className="absolute top-[260px] w-36 h-14 bg-black/70 blur-[20px] rounded-full animate-deforming-shadow z-10"></div>

                {/* complex 3D Heart Assembly */}
                <div className="heart-3d-scene relative z-30 scale-110"> {/* Scaled up slightly for impact */}
                  <div className="heart-3d-assembly animate-float-heart">
                    <div className="heart-rotate-wrapper animate-full-3d-spin">
                      {/* 3D Sandwich Extrusion (24 Layers for extra depth) */}
                      {[...Array(24)].map((_, i) => {
                        const zPosition = (i - 12) * 1.8; // More depth
                        const isFront = i === 23;
                        const isBack = i === 0;
                        const isCore = i > 8 && i < 16;
                        
                        return (
                          <div 
                            key={i}
                            className={`absolute inset-0 w-[260px] h-[260px] flex items-center justify-center ${isFront ? 'z-50' : 'z-20'}`}
                            style={{ 
                              transform: `translateZ(${zPosition}px)`,
                              opacity: isFront ? 1 : (isBack ? 0.7 : 0.9)
                            }}
                          >
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                              <defs>
                                <linearGradient id={`heart-grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  {/* Royal gradient palette */}
                                  <stop offset="0%" stopColor={isFront ? "#ff1a1a" : (isBack ? "#1a0000" : "#4d0000")} />
                                  <stop offset="40%" stopColor={isFront ? "#cc0000" : (isBack ? "#0a0000" : "#330000")} />
                                  <stop offset="70%" stopColor={isFront ? "#990000" : "#220000"} />
                                  <stop offset="100%" stopColor={isFront ? "#ffcc33" : "#884400"} /> {/* Biblic gold glow at bottom */}
                                </linearGradient>
                                
                                {isFront && (
                                  <filter id="premium-aesthetic-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    {/* Glassy surface reflection */}
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
                                    <feSpecularLighting in="blur" surfaceScale="10" specularConstant="2.5" specularExponent="60" lightingColor="#ffffff" result="specular">
                                      <fePointLight x="-150" y="-150" z="500" />
                                    </feSpecularLighting>
                                    <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularIn"/>
                                    
                                    {/* Bloom effect */}
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="bloomBlur" />
                                    <feColorMatrix in="bloomBlur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -11" result="bloomMask" />
                                    <feComposite in="SourceGraphic" in2="bloomMask" operator="over" result="withBloom" />
                                    
                                    <feComposite in="specularIn" in2="withBloom" operator="over" />
                                  </filter>
                                )}
                              </defs>
                              
                              {/* Main Heart Halves - Refined elegant path */}
                              <path 
                                d="M50 32 C35 5 0 5 0 42 C0 68 35 88 48 98 L50 98 L50 85 L48 70 L50 50 L48 32 Z" 
                                fill={`url(#heart-grad-${i})`}
                                filter={isFront ? "url(#premium-aesthetic-glow)" : "none"}
                                style={{ transform: 'translateX(-3px) rotateY(-5deg)', stroke: isFront ? 'rgba(255,255,255,0.1)' : 'none', strokeWidth: '0.5' }}
                              />
                              <path 
                                d="M50 32 C65 5 100 5 100 42 C100 68 65 88 52 98 L50 98 L50 85 L52 70 L50 50 L52 32 Z" 
                                fill={`url(#heart-grad-${i})`}
                                filter={isFront ? "url(#premium-aesthetic-glow)" : "none"}
                                style={{ transform: 'translateX(3px) rotateY(5deg)', stroke: isFront ? 'rgba(255,255,255,0.1)' : 'none', strokeWidth: '0.5' }}
                              />
                            </svg>
                            
                            {/* Moving Surface Gloss Overlay (Enhanced) */}
                            {isFront && (
                              <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-[20%]">
                                <div className="w-[300%] h-full animate-specular-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg]"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              <h1 className="text-[24px] sm:text-[30px] font-bold text-[#310065] mb-6 max-w-[320px] leading-tight z-30 uppercase tracking-tighter">
                {localT.lostDesc}
              </h1>
              
              <div className="verse-card-premium w-full max-w-[360px] p-8 mb-10 z-30">
                <div className="ornament-corner-gold top-left"></div>
                <div className="ornament-corner-gold top-right"></div>
                <div className="ornament-corner-gold bottom-left"></div>
                <div className="ornament-corner-gold bottom-right"></div>
                
                <p className="text-[17px] sm:text-[19px] text-[#310065]/95 leading-relaxed font-serif italic mb-6">
                  "{randomVerse.text}"
                </p>
                <div className="flex justify-center items-center gap-4">
                   <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-[#310065]"></div>
                   <p className="text-[14px] font-bold text-[#310065]/60 tracking-widest uppercase">
                      {randomVerse.ref}
                   </p>
                   <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-[#310065]"></div>
                </div>
              </div>

              <button 
                onClick={() => router.push('/arena')}
                className="premium-game-btn w-full max-w-[260px] py-4.5 text-white font-black text-[18px] tracking-[0.25em] transition-all hover:scale-105 active:scale-95 z-40 mb-12 shadow-xl shadow-[#310065]/20"
              >
                {localT.continueBtn}
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes float-ember {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.4; }
            100% { transform: translateY(-800px) rotate(360deg); opacity: 0; }
          }
          @keyframes flicker-glow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
            75% { opacity: 0.5; transform: scale(1.05); }
          }
          @keyframes flicker-strong {
            0%, 100% { opacity: 0.2; transform: scale(0.9); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
          @keyframes float-heart {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
          }
          @keyframes deforming-shadow {
            0%, 100% { transform: scale(1) skewX(5deg); opacity: 0.5; }
            25% { transform: scale(1.2) skewX(10deg); opacity: 0.3; }
            50% { transform: scale(1.5) skewX(2deg); opacity: 0.2; }
            75% { transform: scale(1.2) skewX(-10deg); opacity: 0.3; }
          }
          @keyframes full-3d-spin {
            0% { transform: rotateY(0deg) rotateX(10deg); }
            100% { transform: rotateY(360deg) rotateX(10deg); }
          }
          @keyframes specular-sweep {
            0% { transform: translateX(-150%) skewX(-30deg); }
            100% { transform: translateX(150%) skewX(-30deg); }
          }
          
          .heart-3d-scene {
            perspective: 2500px;
            width: 240px;
            height: 240px;
          }
          .heart-3d-assembly {
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
          }
          .heart-rotate-wrapper {
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
          }

          .animate-deforming-shadow {
            animation: deforming-shadow 10s ease-in-out infinite;
          }

          .animate-specular-sweep {
            animation: specular-sweep 3s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
          }

          .animate-float-heart {
            animation: float-heart 4s ease-in-out infinite;
          }

          .animate-full-3d-spin {
            animation: full-3d-spin 10s linear infinite;
          }
          
          .verse-card-premium {
            background: linear-gradient(135deg, #ffffff 0%, #f2f2f7 100%);
            border: 2px solid #310065;
            position: relative;
            backdrop-filter: blur(15px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(49, 0, 101, 0.1), inset 0 0 20px rgba(49, 0, 101, 0.05);
          }
          
          .ornament-corner-gold {
            position: absolute;
            width: 25px;
            height: 25px;
            border: 2px solid #d4af37;
            pointer-events: none;
          }
          .top-left { top: -2px; left: -2px; border-right: 0; border-bottom: 0; border-radius: 10px 0 0 0; }
          .top-right { top: -2px; right: -2px; border-left: 0; border-bottom: 0; border-radius: 0 10px 0 0; }
          .bottom-left { bottom: -2px; left: -2px; border-right: 0; border-top: 0; border-radius: 0 0 0 10px; }
          .bottom-right { bottom: -2px; right: -2px; border-left: 0; border-top: 0; border-radius: 0 0 10px 0; }
          
          .premium-game-btn {
            background: linear-gradient(180deg, #4a148c 0%, #310065 100%);
            border: 2px solid #eddcff;
            border-radius: 12px;
            position: relative;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            box-shadow: 0 4px 0 #450a0a, 0 10px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
          }
          .premium-game-btn:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #450a0a, 0 5px 10px rgba(0,0,0,0.3);
          }
          .premium-game-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%);
            border-radius: 10px;
          }
          .cinematic-glow {
            text-shadow: 0 0 15px rgba(255, 230, 150, 0.4), 0 0 30px rgba(255, 100, 0, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans relative">
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
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.1]">
        <div className="absolute top-0 left-0 w-full h-full bg-[#310065] blur-[150px] rounded-full scale-150"></div>
      </div>

      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl border-b border-[#310065]/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowExitConfirm(true)} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/50 transition-colors active:scale-95 duration-200"
            >
              <X className="w-[22px] h-[22px] text-[#310065]" strokeWidth={2.5} />
            </button>
          </div>
          <div className="text-[19px] font-black text-[#310065] tracking-tighter uppercase font-body flex items-center">
            JWE BIB LA
          </div>
          <div className="w-10 h-10"></div> {/* Spacer to keep title centered */}
        </div>
      </header>

      <main className="flex-grow pt-[88px] pb-12 px-6 flex flex-col max-w-[480px] mx-auto w-full relative z-10">
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold tracking-[0.15em] text-[#755978] uppercase">{localT.questionProgress.replace('{n}', (currentIndex + 1).toString())}</span>
            <span className="text-[13px] font-extrabold text-[#735c00]">
              {Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#e3e2e6] rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#e9c349] to-[#cba72f] rounded-full shadow-[0_0_12px_rgba(203,167,47,0.4)] transition-all duration-300"
              style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-red-50 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                <Heart className="w-4 h-4 text-red-500 fill-red-500 mr-1.5" />
                <span className="text-[13px] font-black text-red-600">{hearts}</span>
              </div>
              <div className="flex items-center bg-[#ffe088]/30 px-3 py-1.5 rounded-full border border-[#cba72f]/20 shadow-sm">
                <Zap className="w-4 h-4 text-[#cba72f] fill-[#ffe088] mr-1.5" />
                <span className="text-[13px] font-black text-[#735c00]">{energy}</span>
              </div>
            </div>
            
            {/* Timer Display */}
            {!isAnswered && !isGameOver && (
              <div className={`flex items-center px-3 py-1.5 rounded-full border shadow-sm ${
                timeLeft > 5 ? 'bg-white border-[#310065]/10' : 'bg-red-50 border-red-200 animate-pulse'
              }`}>
                <Clock className={`w-4 h-4 mr-1.5 ${timeLeft > 5 ? 'text-[#310065]' : 'text-red-500'}`} />
                <span className={`text-[13px] font-black ${timeLeft > 5 ? 'text-[#310065]' : 'text-red-600'}`}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] px-8 py-10 shadow-sm mb-8 relative border border-[#1b1b1e]/5">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
            <BookOpen size={120} />
          </div>
          <p className="text-[24px] font-serif font-bold text-[#1b1b1e] leading-tight text-center relative z-10">
            {currentQuestion ? currentQuestion.questionText : localT.loadingQuestion}
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;
            
            let btnClass = "w-full text-left p-5 rounded-[1.5rem] transition-all flex items-center border shadow-sm ";
            let labelClass = "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-4 font-bold text-[16px] ";
            
            if (hiddenOptionIds.includes(option.id)) return null;

            const isAdmin = user?.email === 'juniormax2013@gmail.com';

            if (!isAnswered) {
              if (isAdmin && isCorrectOption) {
                btnClass += "bg-green-50 text-green-800 border-green-400 ring-2 ring-green-400/20 shadow-sm";
                labelClass = "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-4 font-bold text-[16px] bg-green-100 text-green-800 border border-green-200";
              } else {
                btnClass += "bg-[#f5f3f7] hover:bg-[#eddcff]/30 border-transparent active:scale-[0.98]";
                labelClass += "bg-[#e3e2e6] text-[#7c7483]";
                
                if (showHint && isCorrectOption) {
                  btnClass += " ring-2 ring-[#cba72f] shadow-[0_0_15px_rgba(203,167,47,0.3)]";
                  labelClass = "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-4 font-bold text-[16px] bg-[#ffe088] text-[#735c00]";
                }
              }
            } else if (isCorrectOption) {
              btnClass += "bg-green-500 text-white border-green-400 shadow-green-200 ring-4 ring-green-500/20";
              labelClass += "bg-white/20 text-white";
            } else if (isSelected && !isCorrect) {
              btnClass += "bg-red-500 text-white border-red-400 shadow-red-200 ring-4 ring-red-500/20";
              labelClass += "bg-white/20 text-white";
            } else {
              btnClass += "bg-[#f5f3f7] border-transparent opacity-60";
              labelClass += "bg-[#e3e2e6] text-[#7c7483]";
            }

            return (
              <button 
                key={option.id}
                disabled={isAnswered}
                onClick={() => handleAnswer(option.id)}
                className={btnClass}
              >
                <div className={labelClass}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-[17px] font-bold flex-grow">
                  <DevilTrapOptionText
                    isDevilActive={isDevilActive}
                    optionId={String.fromCharCode(65 + idx)}
                    isRevealed={revealedOptions.includes(option.id)}
                    onReveal={() => revealOption(option.id)}
                    originalText={option.text}
                    language={lang}
                    devilMode={devilMode ?? undefined}
                  />
                </span>
                {isAnswered && isCorrectOption && <CheckCircle2 className="w-6 h-6" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <button 
            onClick={nextQuestion}
            className="mt-auto w-full bg-[#310065] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#310065]/20 animate-in fade-in slide-in-from-bottom-4"
          >
            {currentIndex >= 6 ? localT.finishGame : localT.nextQuestion}
            <ChevronRight size={20} />
          </button>
        )}

        <div className="flex flex-col items-end gap-2">
          <PowerUpsBar 
            onPowerUsed={handlePowerUsed}
            onSkip={async () => {
              if (!user) {
                toast.error(localT.loginToSkip);
                return;
              }
              if (hearts <= 0) {
                toast.error(localT.noHeartsToSkip);
                return;
              }
              const newHearts = hearts - 1;
              setHearts(newHearts);
              await consumeJweHeart(user.uid).catch(console.error);
              toast.info(localT.skippedAlert);
              nextQuestion();
            }}

            onReport={() => {
              toast.success(localT.thanksReport);
            }}
            isProcessing={isProcessingPower}
            setIsProcessing={setIsProcessingPower}
            disabled={isAnswered || isGameOver}
            activePowerUps={activePowerUps}
            heartsCount={hearts}
          />
        </div>
      </main>
      <DevilTrapOverlay isActive={isDevilActive} devilState={devilState} devilMode={devilMode ?? undefined} devilEvent={devilEvent ?? undefined} />
      
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center border border-white/20 shadow-2xl relative flex flex-col items-center gap-6 animate-scale-in">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-inner">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-black text-[#310065] italic">
                {localT.exitTitle}
              </h3>
              <p className="text-[12px] font-semibold text-[#1b1b1e]/60 leading-relaxed max-w-[90%] mx-auto">
                {localT.exitDesc}
              </p>
            </div>

            <div className="flex gap-4 w-full pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {localT.keepPlaying}
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  router.push('/arena');
                }}
                className="flex-1 py-4 bg-[#f5f3f7] hover:bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-transparent shadow-sm hover:scale-105 active:scale-95 transition-transform"
              >
                {localT.exitBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
