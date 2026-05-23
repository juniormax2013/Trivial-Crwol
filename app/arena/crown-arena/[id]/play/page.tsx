'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Crown, 
  Zap, 
  Trophy, 
  Timer,
  CheckCircle2,
  XCircle,
  BarChart3,
  Loader2,
  Flame,
  Star,
  Shield,
  Zap as ZapIcon
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT, useLanguage } from '@/lib/i18n/context';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import { 
  subscribeToArenaRoom, 
  updatePlayerProgress,
  completeArenaMatch
} from '@/lib/arena/repository';
import { ArenaSession, ArenaPlayer } from '@/lib/arena/models';
import { ALL_DUEL_QUESTIONS } from '@/lib/duel/seed';
import { DuelQuestion } from '@/lib/duel/models';
import { calculateAnswerPoints } from '@/lib/duel/service';
import Image from 'next/image';
import { toast } from 'sonner';
import { useDevilTrap } from '@/hooks/useDevilTrap';
import DevilTrapOverlay from '@/components/play/DevilTrapOverlay';
import DevilTrapOptionText from '@/components/play/DevilTrapOptionText';
import { getGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';

type GamePhase = 'loading' | 'preparing' | 'playing' | 'syncing' | 'finished';

export default function CrownArenaPlayPage() {
  const { user } = useAuthContext();
  const t = useT();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<ArenaSession & { players: ArenaPlayer[] } | null>(null);
  const { language: userLanguage } = useLanguage();
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // Devil Trap Hook
  const {
    isDevilActive,
    revealedOptions,
    shuffledOptions,
    devilState,
    triggerDevilTrap,
    revealOption,
    resetDevilTrap,
    devilDefeat,
    devilCelebrate,
  } = useDevilTrap();

  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);
  const [devilSpawnedCount, setDevilSpawnedCount] = useState(0);
  const [devilDefeatedCount, setDevilDefeatedCount] = useState(0);

  // Power-ups state
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [isProcessingPower, setIsProcessingPower] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFinish = useCallback(async (finalScore: number, currentRoom?: ArenaSession & { players: ArenaPlayer[] }) => {
    const roomToUse = currentRoom || room;
    if (!user || !roomToUse) return;
    
    // Check if everyone is finished
    const activePlayers = roomToUse.players.filter((p: ArenaPlayer) => p.status !== 'left');
    
    // Safety check: Don't complete if we don't even have the expected number of players synced yet
    // or if we only see ourselves but the room says there are more players.
    if (activePlayers.length < (roomToUse.currentPlayersCount || 1)) {
      console.log('[PLAY] Missing players in local state, skipping finish check...');
      return;
    }

    const allFinished = activePlayers.length > 0 && activePlayers.every((p: ArenaPlayer) => p.isFinished || p.id === user.uid);
    
    if (allFinished) {
      try {
        console.log('[PLAY] All players finished. Completing match globally...');
        await completeArenaMatch(roomId);
      } catch (error) {
        console.error('Error finalizando partida:', error);
      }
    } else {
      console.log('[PLAY] User finished, but waiting for others to complete...');
    }
  }, [user, room, roomId]);

  // 1. Initial Load & Subscription
  useEffect(() => {
    (async () => {
      const gc = await getGameEngineConfig();
      setEngineConfig(gc);
    })();
  }, []);

  useEffect(() => {
    if (!user || !roomId) return;

    const unsubscribe = subscribeToArenaRoom(roomId, (updatedRoom) => {
      if (!updatedRoom) {
        router.push('/arena/crown-arena');
        return;
      }
      setRoom(updatedRoom);

      // If finished, redirect to result
      if (updatedRoom.status === 'finished') {
        router.push(`/arena/crown-arena/${roomId}/result`);
        return;
      }

      // Check if local user is already finished
      const me = updatedRoom.players.find((p: ArenaPlayer) => p.id === user.uid);
      if (me?.isFinished && phase !== 'finished') {
        setPhase('finished');
        // Still call handleFinish to trigger global check if needed
        handleFinish(me.score || 0, updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [user, roomId, router]);

  // 2. Fetch Questions
  useEffect(() => {
    if (room && phase === 'loading') {
      console.log('[PLAY] Room loaded, status:', room.status, 'questionIds:', room.questionIds?.length);
      
      // Get questions by IDs stored in the session, using user's language if available
      const allQs = (room.questionIds || []).map(id => {
        // Find translation in user's language first
        const translated = ALL_DUEL_QUESTIONS.find(q => q.id === id && q.language === userLanguage);
        // Fallback to 'ht', then any language if not found
        const fallbackHt = ALL_DUEL_QUESTIONS.find(q => q.id === id && q.language === 'ht');
        return translated || fallbackHt || ALL_DUEL_QUESTIONS.find(q => q.id === id);
      }).filter(Boolean) as DuelQuestion[];
      
      console.log('[PLAY] Questions resolved from pool:', allQs.length, 'lang:', userLanguage);

      if (allQs.length === 0) {
        console.error('[PLAY] No questions found for IDs:', room.questionIds);
        toast.error("No se pudieron cargar las preguntas");
        setTimeout(() => router.push('/arena/crown-arena'), 2000);
        return;
      }

      setQuestions(allQs);
      setPhase('preparing');
    }
  // userLanguage added so questions reload in the correct language
  }, [room, phase, router, userLanguage]);


  const submitAnswer = useCallback((optionId: string | null) => {
    if (selectedOption !== null || !user || !room) return;
    const q = questions[currentIdx];
    if (!q) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isRight = optionId === q.correctOptionId;
    if (isRight && isDevilActive) {
      setDevilDefeatedCount(prev => prev + 1);
    }
    const responseTime = Date.now() - startTime;
    
    // Points calculation
    let points = 0;
    if (isRight) {
      points = calculateAnswerPoints(true, responseTime, 20);
      // Streak bonus: +10% for each streak over 1 (max 50%)
      const streakBonus = Math.min(streak * 0.1, 0.5);
      points = Math.round(points * (1 + streakBonus));
      
      setScore(s => s + points);
      setStreak(s => s + 1);
      setCorrectCount(c => c + 1);
    } else {
      if (hasSecondChance && !isDevilActive) {
        toast.success("Chans an dezyèm itilize! Ou sove.");
        setHasSecondChance(false);
        setActivePowerUps(prev => prev.filter(p => p !== 'secondChance'));
        setStartTime(Date.now());
        // Restart timer logic if needed, but since it's already running it's fine
        return;
      }
      setStreak(0);
    }

    // Trigger devil reaction
    if (isDevilActive) {
      if (isRight) devilDefeat();
      else devilCelebrate();
    }

    setSelectedOption(optionId || 'TIMEOUT');
    setIsCorrect(isRight);
    setLastPoints(points);

    // Update progress in Firestore
    const newScore = score + points;
    updatePlayerProgress(roomId, user.uid, newScore, currentIdx + 1, currentIdx + 1 === questions.length);

    // Auto-advance
    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx < questions.length) {
        setCurrentIdx(nextIdx);
        setSelectedOption(null);
        setIsCorrect(null);
        // Reset power-ups
        setActivePowerUps([]);
        setHiddenOptionIds([]);
        setShowHint(false);
        setHasSecondChance(false);
      } else {
        setPhase('finished');
        handleFinish(newScore);
      }
    }, 1800);
  }, [selectedOption, user, room, questions, currentIdx, startTime, streak, hasSecondChance, roomId, score, handleFinish, isDevilActive]);

  const handleTimeout = useCallback(() => {
    console.log('[ARENA] Timeout callback triggered');
    if (selectedOption) return;
    submitAnswer(null);
  }, [selectedOption, submitAnswer]);

  const handleTimeoutRef = useRef(handleTimeout);
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  const handlePowerUsed = useCallback((powerId: string) => {
    console.log('[ARENA] Power used:', powerId);
    const q = questions[currentIdx];
    if (!q) return;

    setActivePowerUps(prev => {
      if (prev.includes(powerId)) return prev;
      return [...prev, powerId];
    });

    switch (powerId) {
      case 'removeTwo': {
        const wrongOptions = q.options.filter(o => o.id !== q.correctOptionId);
        const toHide = [...wrongOptions].sort(() => 0.5 - Math.random()).slice(0, 2).map(o => o.id);
        setHiddenOptionIds(toHide);
        break;
      }
      case 'hint':
        setShowHint(true);
        break;
      case 'freezeTime':
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      case 'secondChance':
        setHasSecondChance(true);
        break;
    }
  }, [questions, currentIdx]);

  // 3. Phase Transition (preparing -> playing)
  useEffect(() => {
    if (phase === 'preparing') {
      const prepareTimer = setTimeout(() => {
        setPhase('playing');
        setStartTime(Date.now());
      }, 3000);

      return () => clearTimeout(prepareTimer);
    }
  }, [phase]);

  // 3. Reset timer on new question
  useEffect(() => {
    if (phase === 'playing' && !selectedOption) {
      setTimeLeft(20);
      setStartTime(Date.now());
      setActivePowerUps([]);
      setHiddenOptionIds([]);
      setShowHint(false);
      setHasSecondChance(false);

      const q = questions[currentIdx];
      if (q && devilSpawnedCount < 5 && devilDefeatedCount < 2) {
        const devilProb = engineConfig?.devilTrap?.spawnProbability ?? 0.15;
        const willSpawn = Math.random() < devilProb;
        if (willSpawn) {
          triggerDevilTrap(q.options, true);
          setDevilSpawnedCount(prev => prev + 1);
        } else {
          triggerDevilTrap(q.options, false);
        }
      } else {
        resetDevilTrap();
      }
    }
  }, [phase, currentIdx, selectedOption, questions, triggerDevilTrap, engineConfig, devilSpawnedCount, devilDefeatedCount, resetDevilTrap]);

  // 4. Timer Logic
  useEffect(() => {
    // 1. Stop timer if not playing or option already selected
    if (phase !== 'playing' || selectedOption) {
      if (timerRef.current) {
        console.log('[TIMER] Stopping - phase:', phase, 'selectedOption:', !!selectedOption);
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 2. Stop timer if freezeTime power is active
    if (activePowerUps.includes('freezeTime')) {
      if (timerRef.current) {
        console.log('[TIMER] Frozen by power-up');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
      
    // 3. Start interval if not already running
    if (!timerRef.current) {
      console.log('[TIMER] Starting interval - timeLeft:', timeLeft);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log('[TIMER] Timeout reached');
            handleTimeoutRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // 4. Cleanup on dependency change
    return () => { 
      if (timerRef.current) {
        console.log('[TIMER] Cleanup - clearing interval');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, currentIdx, selectedOption, activePowerUps]);



  // 4. Render State Logic
  if (phase === 'loading' || !room) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#310065] animate-spin" />
        <p className="font-black text-[#310065] uppercase tracking-widest">{t.common.loading}</p>
      </div>
    );
  }

  if (phase === 'preparing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#310065] to-[#4a148c] flex flex-col items-center justify-center text-white text-center p-12">
        <Crown className="w-24 h-24 text-[#ffe088] fill-[#ffe088] mb-8 animate-bounce" />
        <h1 className="font-serif text-[32px] font-black mb-4">{t.crownArena.beReady}</h1>
        <p className="text-white/70 font-bold uppercase tracking-[0.2em]">{t.crownArena.starting}</p>
        <div className="mt-12 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#ffe088] animate-grow" />
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  // Safety check: If we don't have a question or the game is ending/finished
  if (!currentQ || phase === 'syncing' || phase === 'finished' || room.status === 'finished') {
    
    // Waiting for others screen
    if (phase === 'finished' && room.status !== 'finished') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#310065] to-[#4a148c] flex flex-col items-center justify-center text-white p-8">
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-10 w-full max-w-md border border-white/20 text-center space-y-8">
            <div className="relative inline-block">
               <Trophy className="w-20 h-20 text-[#ffe088] fill-[#ffe088] animate-bounce" />
               <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#310065]">
                 <CheckCircle2 className="w-4 h-4 text-white" />
               </div>
            </div>
            
            <div>
              <h1 className="font-serif text-[28px] font-black mb-2">{t.crownArena.wellDone}</h1>
              <p className="text-white/70 font-medium">{t.crownArena.waitingOthers}</p>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {room.players.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                    <Image 
                      src={p.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${p.name}`} 
                      alt={p.name} 
                      width={40} height={40} 
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[14px] truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[12px] font-black text-[#ffe088]">
                        {p.isFinished ? '¡LISTO!' : `${p.currentQuestion || 0}/${questions.length}`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${p.isFinished ? 'bg-emerald-400' : 'bg-[#ffe088]'}`}
                        style={{ width: `${((p.currentQuestion || 0) / (questions.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 text-white/40 pt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[12px] font-black uppercase tracking-widest">{t.common.syncing}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#310065] animate-spin" />
        <p className="font-black text-[#310065] uppercase tracking-widest">
          {room.status === 'finished' || phase === 'syncing' 
            ? 'Finalizando...' 
            : t.common.loading}
        </p>
        {!currentQ && phase === 'playing' && room.status !== 'finished' && (
          <p className="text-xs text-red-400 font-bold">Error: Pregunta no encontrada</p>
        )}
      </div>
    );
  }


  // Sorted leaderboard (Top 3)
  const leaderboard = [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans overflow-hidden">
      
      {/* HUD Header */}
      <header className="px-6 pt-safe pb-4 bg-white shadow-sm space-y-4 z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#1b1b1e]/5 flex items-center justify-center text-[#310065]">
               <Crown className="w-5 h-5 fill-[#ffe088] text-[#cba72f]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#7c7483] uppercase tracking-wider">{t.crownArena.title}</p>
              <h2 className="text-[15px] font-black text-[#310065]">
                {t.crownArena.competitors.replace('{n}', room.players.length.toString())}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-[#ffe088]/20 rounded-full border border-[#ffe088]/30">
            <Star className="w-4 h-4 text-[#cba72f] fill-[#cba72f]" />
            <span className="font-black text-[#735c00] text-[15px]">{score}</span>
          </div>
        </div>

        {/* Live Leaderboard Strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[...room.players].sort((a, b) => (b.score || 0) - (a.score || 0)).map((p, i) => (
            <div 
              key={p.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0 transition-all ${
                p.id === user?.uid ? 'bg-[#310065] text-white border-[#310065] shadow-md' : 'bg-white text-[#7c7483] border-[#1b1b1e]/5'
              }`}
            >
              <span className={`text-[9px] font-black ${p.id === user?.uid ? 'text-[#ffe088]' : 'text-gray-400'}`}>#{i+1}</span>
              <div className="w-5 h-5 rounded-full overflow-hidden">
                <Image 
                  src={p.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${p.name}`} 
                  alt={`Avatar de ${p.name}`} 
                  width={20} height={20} 
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-bold truncate max-w-[60px]">{p.name.split(' ')[0]}</span>
              <span className="text-[11px] font-black">{p.score || 0}</span>
            </div>
          ))}
        </div>

        {/* Timer & Question Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[12px] font-black text-[#310065]">
              {t.crownArena.questionOf
                .replace('{n}', (currentIdx + 1).toString())
                .replace('{total}', questions.length.toString())}
            </span>
            <div className={`flex items-center gap-1.5 font-black ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-[#310065]'}`}>
              <Timer className="w-4 h-4" />
              <span className="text-[16px]">{timeLeft}s</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#e9c349] to-[#cba72f] transition-all duration-300"
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col p-6 gap-6 relative">
        
        {/* Question Card */}
        <div className={`flex-1 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border-2 ${
          isCorrect === true ? 'bg-emerald-50 border-emerald-500/30' : 
          isCorrect === false ? 'bg-red-50 border-red-500/30' : 
          'bg-white border-[#1b1b1e]/5 shadow-xl'
        }`}>
          {isCorrect !== null && (
            <div className={`mb-4 animate-in fade-in zoom-in duration-300`}>
              {isCorrect ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <p className="text-emerald-600 font-black text-[20px] tracking-tight">+ {lastPoints} pts</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-red-500/20">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <p className="text-red-600 font-black text-[20px] tracking-tight">{t.crownArena.ohNo}</p>
                </div>
              )}
            </div>
          )}

          <h3 className="font-serif text-[22px] md:text-[28px] font-black text-[#310065] leading-tight">
            {currentQ?.questionText}
          </h3>

          {streak > 1 && (
            <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#ff6b00]/10 px-3 py-1 rounded-full border border-[#ff6b00]/20 animate-bounce">
              <Flame className="w-4 h-4 text-[#ff6b00] fill-[#ff6b00]" />
              <span className="text-[#ff6b00] font-black text-[12px]">X{streak}</span>
            </div>
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3">
          {currentQ?.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrectOption = opt.id === currentQ?.correctOptionId;
            
            if (hiddenOptionIds.includes(opt.id)) return null;

            let btnState = 'bg-white border-[#1b1b1e]/10 text-[#1b1b1e]';
            if (selectedOption !== null) {
              if (isCorrectOption) btnState = 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20';
              else if (isSelected) btnState = 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20';
              else btnState = 'bg-white border-[#1b1b1e]/5 text-gray-300 opacity-50';
            }

            const isHinted = showHint && isCorrectOption && selectedOption === null;

            return (
              <button
                key={opt.id}
                onClick={() => submitAnswer(opt.id)}
                disabled={selectedOption !== null}
                className={`w-full p-5 rounded-[1.75rem] border-2 font-black text-[16px] text-left transition-all relative overflow-hidden group active:scale-[0.98] ${btnState} ${isHinted ? 'ring-2 ring-[#cba72f] shadow-[0_0_15px_rgba(203,167,47,0.3)]' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${
                    isSelected || (selectedOption && isCorrectOption) ? 'bg-white/20' : 
                    isHinted ? 'bg-[#ffe088] text-[#735c00]' :
                    'bg-[#eddcff]/40 text-[#310065]'
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
                  />
                </div>
              </button>
            );
          })}
        </div>

        {selectedOption === null && phase === 'playing' && (
          <div className="px-1 mt-auto">
            <PowerUpsBar 
              onPowerUsed={handlePowerUsed}
              onReport={() => {
                toast.success("Mèsi! Nou resevwa rapò w la.");
              }}
              isProcessing={isProcessingPower}
              setIsProcessing={setIsProcessingPower}
              disabled={selectedOption !== null || isDevilActive}
              activePowerUps={activePowerUps}
            />
          </div>
        )}
      </main>

      {/* Progress Footer */}
      <footer className="px-6 py-4 bg-white border-t border-[#1b1b1e]/5 pb-safe">
        <div className="flex items-center justify-between gap-4">
           {room.players.slice(0, 4).map((p) => (
             <div key={p.id} className="flex-1 space-y-1">
               <div className="flex justify-between text-[9px] font-black uppercase text-[#7c7483] tracking-tighter">
                 <span className="truncate max-w-[40px]">{p.name}</span>
                 <span>{(p.currentQuestion || 0)} / {questions.length}</span>
               </div>
               <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                 <div 
                  className={`h-full transition-all duration-500 ${p.id === user?.uid ? 'bg-[#310065]' : 'bg-gray-300'}`}
                  style={{ width: `${((p.currentQuestion || 0) / (questions.length || 1)) * 100}%` }}
                 />
               </div>
             </div>
           ))}
        </div>
      </footer>
      <DevilTrapOverlay isActive={isDevilActive} devilState={devilState} />
    </div>
  );
}
