'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  AlertTriangle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Check,
  Award,
  Zap,
  Bookmark,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage, useT } from '@/lib/i18n/context';
import { getSacredQuestions, SacredQuestion } from '@/lib/reto-sagrado/questions';
import { progressSyncQueue } from '@/lib/cache/answers-queue';
import { getCachedSacredQuestionsByIds, saveSacredQuestionsToCache, getCachedSacredQuestions } from '@/lib/game/questionCache';
import { playCorrectSound, playWrongSound } from '@/lib/game/audio';
import { grantJweRewards, saveGamePlay, checkAndQualifyReferral } from '@/lib/user/repository';
import { toast } from 'sonner';
import { collection, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** Small animated progress bar shown after answering — signals auto-advance in 1.5s */
const SACRED_TRANSLATIONS: Record<string, any> = {
  es: {
    nextQuestion: "Siguiente pregunta...",
    victory: "¡Victoria!",
    defeat: "¡Derrota!",
    tie: "¡Empate!",
    gameOver: "Fin del Juego",
    winDesc: "¡Felicitaciones! Has superado el Reto Sagrado.",
    lostDesc: "¡Sigue practicando la palabra para vencer la próxima vez!",
    resultsTitle: "RESULTADOS DE LA PARTIDA",
    questions: "Aciertos",
    xp: "XP",
    crowns: "Coronas",
    continueBtn: "CONTINUAR",
    nextRound: "SIGUIENTE RONDA",
    imReady: "¡Estoy Listo!",
    checkOrder: "Comprobar orden",
    questionProgress: (current: number, total: number) => `Pregunta ${current} de ${total}`,
    exitTitle: "¿De verdad quieres salir?",
    exitDesc: "Si te retiras ahora, perderás el progreso actual del Reto Sagrado. ¡No te rindas!",
    keepPlaying: "SEGUIR JUGANDO",
    exitBtn: "SALIR",
  },
  en: {
    nextQuestion: "Next question...",
    victory: "Victory!",
    defeat: "Defeat!",
    tie: "Tie!",
    gameOver: "Game Over",
    winDesc: "Congratulations! You have overcome the Sacred Challenge.",
    lostDesc: "Keep practicing the word to win next time!",
    resultsTitle: "MATCH RESULTS",
    questions: "Correct",
    xp: "XP",
    crowns: "Crowns",
    continueBtn: "CONTINUE",
    nextRound: "NEXT ROUND",
    imReady: "I'm Ready",
    checkOrder: "Check order",
    questionProgress: (current: number, total: number) => `Question ${current} of ${total}`,
    exitTitle: "Do you really want to leave?",
    exitDesc: "If you leave now, you will lose the current progress of the Sacred Challenge. Don't give up!",
    keepPlaying: "KEEP PLAYING",
    exitBtn: "EXIT",
  },
  fr: {
    nextQuestion: "Question suivante...",
    victory: "Victoire !",
    defeat: "Défaite !",
    tie: "Égalité !",
    gameOver: "Fin du Jeu",
    winDesc: "Félicitations ! Vous avez surmonté le Défi Sacré.",
    lostDesc: "Continuez à pratiquer la parole pour vaincre la prochaine fois !",
    resultsTitle: "RÉSULTATS DE LA PARTIE",
    questions: "Succès",
    xp: "XP",
    crowns: "Couronnes",
    continueBtn: "CONTINUER",
    nextRound: "PROCHAIN ROUND",
    imReady: "Je suis prêt",
    checkOrder: "Vérifier l'ordre",
    questionProgress: (current: number, total: number) => `Question ${current} sur ${total}`,
    exitTitle: "Voulez-vous vraiment quitter ?",
    exitDesc: "Si vous partez maintenant, vous perdrez la progression actuelle du Défi Sacré. N'abandonnez pas !",
    keepPlaying: "CONTINUER À JOUER",
    exitBtn: "QUITTER",
  },
  ht: {
    nextQuestion: "Pwochen kesyon...",
    victory: "Ou Genyen!",
    defeat: "Ou Pèdi!",
    tie: "Egalite!",
    gameOver: "Jwèt Fini!",
    winDesc: "Felisitasyon! Ou pase tès sagrado sa a.",
    lostDesc: "Pran kouraj, eseye ankò pou w vin pi fò!",
    resultsTitle: "REZILTA PATI AN",
    questions: "Kesyon",
    xp: "XP",
    crowns: "Kouwòn",
    continueBtn: "KONTINYE",
    nextRound: "PWOCHÈN WON",
    imReady: "Mwen Pare",
    checkOrder: "Tcheke Lòd",
    questionProgress: (current: number, total: number) => `Kesyon ${current} sou ${total}`,
    exitTitle: "Èske ou vle kite jwèt la?",
    exitDesc: "Si ou pati kounye a, ou pral pèdi tout pwogrè ak enèji ou te envesti nan pati sa a. Pa abandone!",
    keepPlaying: "KONTINYE JWE",
    exitBtn: "KITE JWÈT LA",
  }
};

function AutoAdvanceBar({ text }: { text: string }) {
  return (
    <div className="w-full flex flex-col items-center gap-2 py-3">
      <div className="w-full h-1 bg-[#e3e2e6] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0A84FF] rounded-full"
          style={{ animation: 'autoAdvanceProgress 1.5s linear forwards' }}
        />
      </div>
      <span className="text-[11px] font-semibold text-[#64748B]">
        {text}
      </span>
      <style>{`
        @keyframes autoAdvanceProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default function RetoSagradoPlay() {
  const { user } = useAuthContext();
  const { language, isLoaded } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMultiplayer = searchParams.get('multiplayer') === 'true';

  const lang = ((language as string) === 'fr' || (language as string) === 'es' || (language as string) === 'en' || (language as string) === 'ht') ? (language as 'fr' | 'es' | 'en' | 'ht') : 'es';
  const localT = SACRED_TRANSLATIONS[lang];

  // Game state
  const [questions, setQuestions] = useState<SacredQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showTypeAnnouncement, setShowTypeAnnouncement] = useState(true);

  const currentQuestion = questions[currentIdx];

  // Syncing to Firestore for multiplayer
  const [opponentsProgress, setOpponentsProgress] = useState<Record<string, { name: string; avatarUrl: string; score: number; currentQuestion: number; isFinished: boolean }>>({});
  const roomId = searchParams.get('room');

  // Initial lobby join & status listener for multiplayer rooms
  useEffect(() => {
    if (!isLoaded || !user || !isMultiplayer || !roomId) return;

    const playerRef = doc(db, `reto_sagrado_rooms/${roomId}/players`, user.uid);
    const now = new Date().toISOString();

    // Set initial player record in room
    setDoc(playerRef, {
      id: user.uid,
      userId: user.uid,
      name: user.fullName || user.username || 'Guerrero',
      avatarUrl: user.photoURL || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.uid}`,
      score: 0,
      currentQuestion: 1,
      isFinished: false,
      updatedAt: now
    }, { merge: true }).catch(console.error);

    // Subscribe to all players in the room
    const roomPlayersRef = collection(db, `reto_sagrado_rooms/${roomId}/players`);
    const unsubscribe = onSnapshot(roomPlayersRef, (snap) => {
      const progresses: Record<string, any> = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.id !== user.uid) {
          progresses[data.id] = {
            name: data.name || 'Rival',
            avatarUrl: data.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${data.id}`,
            score: data.score || 0,
            currentQuestion: data.currentQuestion || 0,
            isFinished: data.isFinished || false
          };
        }
      });
      setOpponentsProgress(progresses);
    }, (error) => {
      console.error("Error subscribing to reto_sagrado_room players:", error);
    });

    return () => unsubscribe();
  }, [isLoaded, user, isMultiplayer, roomId]);

  // Update progress in Firestore whenever player progress changes
  useEffect(() => {
    if (!user || !isMultiplayer || !roomId) return;
    
    progressSyncQueue.enqueue('reto_sagrado', roomId, user.uid, score, currentIdx + 1, isGameOver);
    
    if (isGameOver) {
      progressSyncQueue.forceFlush(roomId, user.uid).catch(console.error);
    }
  }, [user, isMultiplayer, roomId, score, currentIdx, isGameOver]);

  const hasSavedHistory = useRef(false);
  useEffect(() => {
    if (isGameOver && user && !hasSavedHistory.current) {
      hasSavedHistory.current = true;
      let outcome: 'win' | 'loss' | 'tie' = 'win';
      let opponentName = '';
      let opponentScore = 0;

      const opponentIds = Object.keys(opponentsProgress);
      if (opponentIds.length > 0) {
        const op = opponentsProgress[opponentIds[0]];
        opponentName = op.name;
        opponentScore = op.score;

        if (score > opponentScore) {
          outcome = 'win';
        } else if (score < opponentScore) {
          outcome = 'loss';
        } else {
          outcome = 'tie';
        }
      } else {
        outcome = (score >= 3 && hearts > 0) ? 'win' : 'loss';
      }

      saveGamePlay(user.uid, {
        gameMode: 'reto_sagrado',
        score,
        outcome,
        opponentName: opponentName || undefined,
        opponentScore: opponentName ? opponentScore : undefined
      }).catch(e => console.error("Error saving reto sagrado history:", e));

      // Calificar referido si aplica (primera partida completada)
      checkAndQualifyReferral(user.uid).catch(e => console.error("Error qualifying referral:", e));
    }
  }, [isGameOver, user, score, opponentsProgress, hearts]);

  // Ref to always have the latest handleNext (avoids stale closure in auto-advance)
  const handleNextRef = useRef<() => void>(() => {});

  const isInitializing = useRef(false);

  // Initialize questions
  useEffect(() => {
    if (!isLoaded || isInitializing.current) return;
    isInitializing.current = true;

    const initQuestions = async () => {
      const activeLang = (language === 'es' || language === 'fr' || language === 'ht') ? language : 'es';
      let combined = await getSacredQuestions(activeLang);

      if (isMultiplayer) {
        if (!roomId) return;
        try {
          // Fetch the room document to get the synchronized question IDs once (no listener to avoid reset bug)
          const roomRef = doc(db, `reto_sagrado_rooms/${roomId}`);
          const snap = await getDoc(roomRef);
          const data = snap.data();
          if (data && data.questionIds && data.questionIds.length > 0) {
            const syncedIds = data.questionIds as string[];
            
            // Intentar obtener de IndexedDB primero
            let resolvedQuestions = await getCachedSacredQuestionsByIds(syncedIds, activeLang);
            
            // Fallback a combined si faltan en caché
            if (resolvedQuestions.length < syncedIds.length) {
              const fallback = syncedIds.map(id => combined.find(q => q.id === id)).filter(Boolean) as SacredQuestion[];
              resolvedQuestions = syncedIds.map(id => resolvedQuestions.find(q => q.id === id) || fallback.find(q => q.id === id)).filter(Boolean) as SacredQuestion[];
              
              // Guardar en caché local para offline
              if (resolvedQuestions.length > 0) {
                await saveSacredQuestionsToCache(resolvedQuestions).catch(console.error);
              }
            }

            if (resolvedQuestions.length > 0) {
              setQuestions(resolvedQuestions);
              setIsLoading(false);
            } else {
              // Fallback de seguridad
              const easyPool = combined.filter(q => q.difficulty === 'easy' || !q.difficulty);
              const selectedEasy = [...easyPool].sort(() => Math.random() - 0.5).slice(0, 15);
              setQuestions(selectedEasy);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error('[RETO_SAGRADO] Error loading room questions:', error);
          toast.error("Error al cargar la sala de juego");
        }
      } else {
        // Modo un jugador
        try {
          // Primero intentamos buscar en IndexedDB si ya tenemos guardadas preguntas del tipo e idioma
          let resolvedQuestions = await getCachedSacredQuestions(activeLang);
          if (resolvedQuestions.length === 0) {
            // Guardar asíncronamente en cache
            saveSacredQuestionsToCache(combined).catch(console.error);
            resolvedQuestions = combined;
          }

          // Determine number of questions based on difficulty
          const diff = searchParams.get('difficulty') || 'easy';
          let questionCount = 10;
          if (diff === 'medium') questionCount = 20;
          else if (diff === 'hard') questionCount = 30;

          // Distribute among different types
          const allTypes = ['multiple_choice', 'true_false', 'complete_sentence', 'trick_question', 'order_events', 'image_question'];
          const activeTypes = [...allTypes].sort(() => Math.random() - 0.5);
          
          let perType = 2;
          if (questionCount === 20) perType = 4;
          else if (questionCount === 30) perType = 6;
          
          const chosen: SacredQuestion[] = [];
          for (const t of activeTypes) {
            const ofType = resolvedQuestions.filter((q: SacredQuestion) => q.type === t);
            if (ofType.length > 0) {
              const shuffledOfType = [...ofType].sort(() => Math.random() - 0.5).slice(0, perType);
              chosen.push(...shuffledOfType);
            }
            if (chosen.length >= questionCount) break;
          }

          const finalSelection = chosen.slice(0, questionCount);
          // Sort to group identical types together
          finalSelection.sort((a, b) => a.type.localeCompare(b.type));

          setQuestions(finalSelection);
          setIsLoading(false);
        } catch (error) {
          console.error('[RETO_SAGRADO] Error initializing questions:', error);
          setIsLoading(false);
        }
      }
    };

    initQuestions();
  }, [language, isMultiplayer, roomId, isLoaded]);

  // Set up order_events items when entering an ordering question
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'order_events') {
      const items = [...currentQuestion.options].sort(() => Math.random() - 0.5);
      setOrderedItems(items);
    }
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIdx, currentQuestion]);

  // Auto-advance to next question after 1.5s (only when answered and still has hearts)
  useEffect(() => {
    if (!isAnswered || hearts <= 0 || isGameOver) return;
    const timer = setTimeout(() => {
      handleNextRef.current();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAnswered, hearts, isGameOver]);

  const handleOrderChange = (index: number, direction: 'up' | 'down') => {
    if (isAnswered) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderedItems.length) return;

    const list = [...orderedItems];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    setOrderedItems(list);
  };

  // optionOverride: used when called directly from an option click (state not updated yet)
  const handleCheckAnswer = (optionOverride?: string) => {
    if (isAnswered || !currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'order_events') {
      const answers = currentQuestion.correctAnswer as string[];
      correct = orderedItems.every((val, i) => val === answers[i]);
    } else {
      const chosen = optionOverride ?? selectedOption;
      correct = chosen === currentQuestion.correctAnswer;
      // Also reflect the selection visually when called from option click
      if (optionOverride) setSelectedOption(optionOverride);
    }

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      // Defer audio so React renders the answer state immediately
      setTimeout(() => playCorrectSound(), 0);
      setScore(prev => prev + 1);
      toast.success(language === 'ht' ? 'Bravo! Bon repons' : '¡Excelente! Respuesta correcta');
    } else {
      // Defer audio so React renders the answer state immediately
      setTimeout(() => playWrongSound(), 0);
      const newHearts = hearts - 1;
      setHearts(newHearts);
      toast.error(
        language === 'ht' 
          ? `Manti! Repons la se: ${Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(' -> ') : currentQuestion.correctAnswer}` 
          : `Incorrecto. La respuesta es: ${Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(' -> ') : currentQuestion.correctAnswer}`
      );

      if (newHearts <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1500);
      }
    }
  };

  const handleNext = async () => {
    const nextIdx = currentIdx + 1;
    const isLast = nextIdx >= questions.length;
    if (isLast) {
      setIsGameOver(true);
      if (user?.uid && score > 0) {
        // Grant some rewards on finish asynchronously to prevent UI freezing
        grantJweRewards(user.uid, false, 1.5).catch(e => {
          console.error("Error granting sacred challenge rewards:", e);
        });
      }
    } else {
      const nextQuestion = questions[nextIdx];
      if (nextQuestion.type !== currentQuestion.type) {
        setShowTypeAnnouncement(true);
      }
      setCurrentIdx(nextIdx);
    }
  };

  // Keep the ref always up-to-date with the latest handleNext
  handleNextRef.current = handleNext;

  // Render SVG illustrations inside image questions
  const renderImageIllustration = (type?: string) => {
    switch (type) {
      case 'tablets':
        return (
          <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-200/50 shadow-inner relative">
            <Bookmark className="w-16 h-16 text-amber-600 fill-amber-500/20" strokeWidth={1.5} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-1 pt-1">
              <div className="w-5 h-8 bg-amber-100 border border-amber-300 rounded-sm flex flex-col gap-1 p-0.5 justify-around">
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
              </div>
              <div className="w-5 h-8 bg-amber-100 border border-amber-300 rounded-sm flex flex-col gap-1 p-0.5 justify-around">
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-200/50 shadow-inner">
            <ImageIcon className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
          </div>
        );
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF]"></div>
      </div>
    );
  }

  // GAME OVER / SUMMARY SCREEN
  if (isGameOver) {
    // If multiplayer, compute vs opponent stats
    let isWin = score >= 3 && hearts > 0;
    let opponentName = '';
    let opponentScore = 0;
    let opponentFinished = false;
    let hasOpponent = false;

    const opponentIds = Object.keys(opponentsProgress);
    if (opponentIds.length > 0) {
      hasOpponent = true;
      const op = opponentsProgress[opponentIds[0]];
      opponentName = op.name;
      opponentScore = op.score;
      opponentFinished = op.isFinished;

      // In multiplayer, win condition is getting more points/correct answers
      if (score > opponentScore) {
        isWin = true;
      } else if (score < opponentScore) {
        isWin = false;
      } else {
        // Tie
        isWin = false; // Evaluated below
      }
    }

    const isTie = hasOpponent && score === opponentScore;
    const titleText = isTie 
      ? localT.tie 
      : isWin 
        ? localT.victory 
        : hasOpponent 
          ? localT.defeat 
          : localT.gameOver;

    const descText = isTie
      ? (language === 'ht' ? 'Ou fè menm pwen ak advèsè w la!' : language === 'fr' ? 'Égalité parfaite avec votre adversaire !' : '¡Empate perfecto con tu oponente!')
      : isWin 
        ? (language === 'ht' ? 'Felisitasyon! Ou bat advèsè w la!' : language === 'fr' ? 'Félicitations ! Vous avez battu votre adversaire !' : '¡Felicidades! Has vencido a tu oponente.')
        : hasOpponent
          ? (language === 'ht' ? 'Pran kouraj, advèsè w la fè plis pwen fwa sa a.' : language === 'fr' ? 'Votre adversaire a obtenu plus de points cette fois.' : 'Tu oponente obtuvo más puntos esta vez. ¡Sigue practicando!')
          : localT.lostDesc;

    // Premium rewards calculations
    const xpRewarded = isTie ? 30 : isWin ? 60 : 15;
    const crownsRewarded = isWin ? 3 : 0;
    const coinsRewarded = isTie ? 5 : isWin ? 10 : 2;

    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 text-center py-12 overflow-hidden bg-white pt-safe pb-safe">
        {/* Decorative ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#fdfbfb_0%,#ebedee_100%)] opacity-50 -z-10"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-[#0A84FF]/10 shadow-2xl flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border ${
            isTie
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : isWin 
                ? 'bg-green-50 text-green-600 border-green-100' 
                : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            <Award size={48} />
          </div>

          <h1 className="text-[32px] font-black text-[#0f172a] mb-2 uppercase tracking-tighter">
            {titleText}
          </h1>
          
          <p className="text-[#64748B] mb-8 text-[14px] font-medium max-w-[280px]">
            {descText}
          </p>

          {/* Opponent score comparison card if multiplayer */}
          {hasOpponent && (
            <div className="bg-[#f8fafc] rounded-[2rem] p-6 shadow-inner w-full mb-6 border border-[#0A84FF]/5 space-y-4">
              <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                {language === 'ht' ? 'KONSÈY PWEN RIVAL' : language === 'fr' ? 'COMPARAISON DES POINTS' : 'COMPARACIÓN DE PUNTOS'}
              </h3>
              
              <div className="flex items-center justify-between px-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0A84FF]">
                    <img src={user?.photoURL || `https://api.dicebear.com/9.x/notionists/svg?seed=${user?.uid}`} alt="Tú" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-black text-[#0F172A] truncate max-w-[70px]">{language === 'ht' ? 'Ou' : language === 'fr' ? 'Vous' : 'Tú'}</span>
                  <span className="text-lg font-extrabold text-[#0A84FF]">{score}</span>
                </div>

                <div className="text-xs font-black text-[#64748B] px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                  VS
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200">
                    <img src={Object.values(opponentsProgress)[0]?.avatarUrl} alt="Opponent" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-black text-[#64748B] truncate max-w-[70px]">{opponentName}</span>
                  <span className="text-lg font-extrabold text-slate-500">{opponentScore}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reward cards */}
          <div className="bg-[#f8fafc] rounded-[2rem] p-6 shadow-inner w-full mb-8 border border-[#0A84FF]/5">
            <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-4">
              {localT.resultsTitle}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-1 text-[#0f172a]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">{language === 'ht' ? 'Lajan' : language === 'fr' ? 'Monnaies' : 'Monedas'}</span>
                <span className="font-extrabold text-[18px] text-amber-600">+{coinsRewarded}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[#0f172a]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">{localT.xp}</span>
                <span className="font-extrabold text-[18px] text-[#0A84FF]">+{xpRewarded}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[#0f172a]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">{localT.crowns}</span>
                <span className="font-extrabold text-[18px] text-amber-500">+{crownsRewarded}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/reto-sagrado')}
            className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform"
          >
            {localT.continueBtn}
          </button>
        </div>
      </div>
    );
  }

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return language === 'ht' ? 'Chwa Miltip' : language === 'fr' ? 'Choix Multiple' : 'Selección Múltiple';
      case 'true_false':
        return language === 'ht' ? 'Verite oswa Manti' : language === 'fr' ? 'Vrai ou Faux' : 'Verdadero o Falso';
      case 'complete_sentence':
        return language === 'ht' ? 'Ranpli Fraz la' : language === 'fr' ? 'Compléter la Phrase' : 'Completar la Frase';
      case 'order_events':
        return language === 'ht' ? 'Mete Evènman yo nan Lòd' : language === 'fr' ? 'Ordonner les Événements' : 'Ordenar Eventos';
      case 'image_question':
        return language === 'ht' ? 'Kesyon ak Ilistrasyon' : language === 'fr' ? 'Question avec Illustration' : 'Pregunta con Ilustración';
      case 'trick_question':
        return language === 'ht' ? 'Kesyon Pyèj' : language === 'fr' ? 'Question Piège' : 'Pregunta con Trampa';
      default:
        return language === 'ht' ? 'Nouvo Mòd' : language === 'fr' ? 'Nouveau Mode' : 'Nuevo Tipo';
    }
  };

  const getTypeDesc = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return language === 'ht' 
          ? 'Chwazi sèl repons ki kòrèk la pami kat opsyon yo.' 
          : language === 'fr' 
          ? 'Choisissez la seule bonne réponse parmi les quatre options.' 
          : 'Elige la única respuesta correcta de las cuatro opciones.';
      case 'true_false':
        return language === 'ht' 
          ? 'Deside si deklarasyon an se verite oswa manti.' 
          : language === 'fr' 
          ? 'Décidez si l\'affirmation est vraie ou fausse.' 
          : 'Decide si la afirmación es verdadera o falsa.';
      case 'complete_sentence':
        return language === 'ht' 
          ? 'Ranpli espas ki vid la ak opsyon ki pi apwopriye a.' 
          : language === 'fr' 
          ? 'Remplissez le vide avec l\'option la plus appropriée.' 
          : 'Completa el espacio en blanco con la opción más adecuada.';
      case 'order_events':
        return language === 'ht' 
          ? 'Deplase eleman yo pou mete yo nan lòd kwonolojik kòrèk la.' 
          : language === 'fr' 
          ? 'Déplacez les éléments pour les mettre dans le bon ordre chronologique.' 
          : 'Mueve los elementos para colocarlos en el orden cronológico correcto.';
      case 'image_question':
        return language === 'ht' 
          ? 'Gade ilistrasyon an epi reponn kesyon an kòrèkteman.' 
          : language === 'fr' 
          ? 'Regardez l\'illustration et répondez correctement à la question.' 
          : 'Mira la ilustración y responde correctamente a la pregunta.';
      case 'trick_question':
        return language === 'ht' 
          ? 'Fè atansyon! Kesyon sa a gen yon ti detay ki ka twonpe w.' 
          : language === 'fr' 
          ? 'Faites attention ! Cette question a un piège subtil.' 
          : '¡Ten cuidado! Esta pregunta tiene una trampa sutil.';
      default:
        return '';
    }
  };

  if (showTypeAnnouncement && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center px-6 text-center py-12 relative">
        {/* Retrocede al Lobby si es la primera pregunta, o muestra modal de salida */}
        <button 
          onClick={() => {
            if (currentIdx === 0) {
              router.push('/reto-sagrado');
            } else {
              setShowExitConfirm(true);
            }
          }} 
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm active:scale-95"
        >
          <X className="w-5 h-5 text-[#1b1b1e]" />
        </button>

        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] border border-[#0A84FF]/10 shadow-2xl flex flex-col items-center gap-6 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0A84FF] flex items-center justify-center shadow-inner animate-pulse">
            <Sparkles size={32} />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#64748B] uppercase">
              {localT.nextRound}
            </span>
            <h2 className="text-[28px] font-serif font-black text-[#0f172a] leading-tight">
              {getTypeTitle(currentQuestion.type)}
            </h2>
            <p className="text-[#64748B] text-[13px] font-medium leading-relaxed max-w-[280px] mx-auto">
              {getTypeDesc(currentQuestion.type)}
            </p>
          </div>

          <button
            onClick={() => setShowTypeAnnouncement(false)}
            className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform mt-4"
          >
            <span>{localT.imReady}</span>
            <ChevronRight size={20} />
          </button>
        </div>

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
                    router.push('/reto-sagrado');
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

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans relative pt-safe">
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.06]">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0A84FF] blur-[150px] rounded-full scale-150"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/85 backdrop-blur-xl border-b border-[#0A84FF]/5">
        <div className="flex flex-col px-6 py-4 max-w-screen-md mx-auto gap-3">
          <div className="flex justify-between items-center w-full">
            <button 
              onClick={() => setShowExitConfirm(true)} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/50 transition-colors"
            >
              <X className="w-6 h-6 text-[#1b1b1e]" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="bg-[#0A84FF]/10 text-[#0A84FF] text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border border-[#0A84FF]/25 shadow-sm uppercase">
                {isMultiplayer ? (language === 'ht' ? 'Batay an tan reyèl' : language === 'fr' ? 'Bataille en temps réel' : 'Batalla en tiempo real') : 'Reto Sagrado'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100 shadow-sm">
                <span className="text-[13px] font-black text-red-600 flex items-center gap-1.5">
                  ❤️ {hearts}
                </span>
              </div>
            </div>
          </div>

          {/* Live Leaderboard Strip if multiplayer */}
          {isMultiplayer && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar animate-in slide-in-from-top duration-300">
              {/* Local Player */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[#0A84FF] text-white border-[#0A84FF] shadow-sm shrink-0">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/35">
                  <img src={user?.photoURL || `https://api.dicebear.com/9.x/notionists/svg?seed=${user?.uid}`} alt="Tú" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold truncate max-w-[65px]">{language === 'ht' ? 'Ou' : language === 'fr' ? 'Vous' : 'Tú'}</span>
                <span className="text-[11px] font-black">{score}</span>
              </div>

              {/* Opponents */}
              {Object.entries(opponentsProgress).map(([opId, op]) => (
                <div key={opId} className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white text-[#64748B] border-[#1b1b1e]/5 shadow-sm shrink-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                    <img src={op.avatarUrl} alt={op.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold truncate max-w-[65px]">{op.name.split(' ')[0]}</span>
                  <span className="text-[11px] font-black text-[#0f172a]">{op.score}</span>
                  {op.isFinished && (
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter ml-1">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Gameplay Container */}
      <main className={`flex-grow ${isMultiplayer ? 'pt-36' : 'pt-24'} pb-12 px-6 flex flex-col max-w-[480px] mx-auto w-full`}>
        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#64748B] uppercase">
              {localT.questionProgress(currentIdx + 1, questions.length)}
            </span>
            <span className="text-[12px] font-bold text-[#0A84FF]">
              {Math.round(((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#e3e2e6] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0A84FF] to-[#310065] transition-all duration-300"
              style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text Box */}
        <div className="bg-white rounded-[2.5rem] px-8 py-9 shadow-sm mb-6 relative border border-[#1b1b1e]/5 overflow-hidden flex flex-col items-center gap-6">
          {currentQuestion?.imageType && renderImageIllustration(currentQuestion.imageType)}
          <p className="text-[22px] font-serif font-bold text-[#0f172a] leading-tight text-center relative z-10">
            {currentQuestion ? currentQuestion.questionText : 'Chaje kesyon...'}
          </p>
        </div>

        {/* Question Type Options Layout */}
        <div className="space-y-3 mb-10">
          {/* order_events specific layout */}
          {currentQuestion?.type === 'order_events' ? (
            <div className="space-y-2">
              {orderedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-full p-4.5 rounded-2xl flex items-center justify-between border bg-white shadow-sm transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'border-green-300 bg-green-50/20'
                        : 'border-red-300 bg-red-50/20'
                      : 'border-[#1b1b1e]/5 hover:border-[#0A84FF]/30'
                  }`}
                >
                  <span className="text-[14px] font-bold text-[#0f172a]">{item}</span>
                  {!isAnswered && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOrderChange(idx, 'up')}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-lg bg-[#faf9fc] hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleOrderChange(idx, 'down')}
                        disabled={idx === orderedItems.length - 1}
                        className="w-8 h-8 rounded-lg bg-[#faf9fc] hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Standard options choice layout */
            currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let btnClass = "w-full text-left p-5 rounded-[1.5rem] transition-all flex items-center border shadow-sm ";
              let labelClass = "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-4 font-bold text-[16px] ";
              
              if (!isAnswered) {
                if (isSelected) {
                  btnClass += "bg-[#0A84FF] text-white border-transparent ring-4 ring-[#0A84FF]/25 scale-[0.99]";
                  labelClass += "bg-white/20 text-white";
                } else {
                  btnClass += "bg-white hover:bg-slate-50 border-[#1b1b1e]/5 active:scale-[0.98]";
                  labelClass += "bg-[#faf9fc] text-[#64748B] border border-[#1b1b1e]/5";
                }
              } else if (isCorrectOption) {
                btnClass += "bg-green-500 text-white border-green-400 shadow-green-200 ring-4 ring-green-500/20";
                labelClass += "bg-white/20 text-white";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-red-500 text-white border-red-400 shadow-red-200 ring-4 ring-red-500/20";
                labelClass += "bg-white/20 text-white";
              } else {
                btnClass += "bg-white border-[#1b1b1e]/5 opacity-60";
                labelClass += "bg-[#faf9fc] text-[#64748B]";
              }

              return (
                <button 
                  key={option}
                  disabled={isAnswered}
                  onClick={() => handleCheckAnswer(option)}
                  className={btnClass}
                >
                  <div className={labelClass}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-[16px] font-bold flex-grow">
                    {option}
                  </span>
                  {isAnswered && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-white shrink-0 ml-2" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-white shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>

        {/* Explanation Card when answered */}
        {isAnswered && (
          <div className="bg-blue-50/35 border border-blue-100/50 rounded-3xl p-5 mb-8 text-center animate-in fade-in duration-300">
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              {currentQuestion.explanation}
            </p>
            <p className="text-[11px] font-bold text-[#0A84FF] mt-1.5 uppercase tracking-wider">
              📖 {currentQuestion.bibleReference}
            </p>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        {currentQuestion?.type === 'order_events' ? (
          // order_events: user must arrange items first, then confirm manually
          !isAnswered ? (
            <button 
              onClick={() => handleCheckAnswer()}
              className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <span>{localT.checkOrder}</span>
              <Check size={20} />
            </button>
          ) : (
            <AutoAdvanceBar text={localT.nextQuestion} />
          )
        ) : (
          // All other types: auto-check on option click, only show progress after answering
          isAnswered && <AutoAdvanceBar text={localT.nextQuestion} />
        )}
      </main>

      {/* Exit Confirmation Modal Overlay */}
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
                  router.push('/reto-sagrado');
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
