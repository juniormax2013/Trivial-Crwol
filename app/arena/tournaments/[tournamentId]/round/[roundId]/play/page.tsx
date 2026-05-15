'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '@/lib/firebase';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Loader2, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

type Question = {
  id: string;
  question: string;
  options: string[];
  points?: number;
};

type GameState = 'initializing' | 'starting' | 'playing' | 'processing_answer' | 'round_finished';

export default function TournamentPlay() {
  const { tournamentId, roundId } = useParams() as { tournamentId: string, roundId: string };
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>('initializing');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [startCountdown, setStartCountdown] = useState(3);
  
  // Track timestamps for scoring
  const questionStartTimeRef = useRef(0);
  
  // Timer Reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and Fetch Questions
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/arena/tournaments');
      return;
    }

    const initRound = async () => {
      try {
        const functions = getFunctions(app);
        const startTournamentRound = httpsCallable(functions, 'startTournamentRound');
        const res = await startTournamentRound({
          tournamentId,
          roundId: parseInt(roundId, 10),
        }) as any;

        const qData = res.data.questions || [];
        setQuestions(qData);

        if (qData.length === 0) {
           alert("No hay preguntas en esta ronda / Ya la jugaste.");
           router.replace(`/arena/tournaments/${tournamentId}`);
           return;
        }

        setGameState('starting');
      } catch (error: any) {
        console.error("Init Error:", error);
        alert(error.message || "No se pudo iniciar la ronda.");
        router.replace(`/arena/tournaments/${tournamentId}`);
      }
    };

    initRound();
  }, [authLoading, user, tournamentId, roundId, router]);

  // Starting Countdown
  useEffect(() => {
    if (gameState === 'starting') {
      if (startCountdown > 0) {
        const t = setTimeout(() => setStartCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
      } else {
        setGameState('playing');
        questionStartTimeRef.current = Date.now();
        setTimeLeft(15);
      }
    }
  }, [gameState, startCountdown]);

  const finishRound = useCallback(async () => {
    try {
      const functions = getFunctions(app);
      const submitRound = httpsCallable(functions, 'submitTournamentRound');
      
      await submitRound({
        tournamentId,
        roundId: parseInt(roundId, 10)
      });
      
      // Redirect to results
      router.replace(`/arena/tournaments/${tournamentId}/round/${roundId}/results`);

    } catch (e) {
      console.error(e);
      alert("Error al guardar la ronda.");
      router.replace(`/arena/tournaments/${tournamentId}`);
    }
  }, [tournamentId, roundId, router]);

  const handleAnswerSubmit = useCallback(async (selectedOptionIndex: number) => {
    if (gameState !== 'playing') return;
    
    // Detenemos tiempo
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setGameState('processing_answer');
    const now = Date.now();
    const timeSpentMs = now - questionStartTimeRef.current;
    
    try {
      const q = questions[currentQIndex];
      const functions = getFunctions(app);
      const submitAnswer = httpsCallable(functions, 'submitTournamentAnswer');
      
      await submitAnswer({
        tournamentId,
        roundId: parseInt(roundId, 10),
        questionId: q.id,
        selectedOptionIndex,
        timeSpentMs
      });
      
      // Pasar a la siguiente
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(val => val + 1);
        setGameState('playing');
        questionStartTimeRef.current = Date.now();
        setTimeLeft(15);
      } else {
        setGameState('round_finished');
        finishRound();
      }

    } catch (e: any) {
       console.error("Error submitting answer:", e);
       alert("Error de conexión. Se detendrá la partida.");
       router.replace(`/arena/tournaments/${tournamentId}`);
    }
  }, [gameState, questions, currentQIndex, tournamentId, roundId, finishRound, router]);

  // Playing Countdown
  useEffect(() => {
    if (gameState === 'playing') {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      } else {
        // Time ran out -> submit -1 or empty
        handleAnswerSubmit(-1);
      }
    }
  }, [gameState, timeLeft, handleAnswerSubmit]);



  // -------------- RENDER -------------

  if (gameState === 'initializing' || authLoading) {
    return (
      <div className="min-h-screen bg-[#110022] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
        <p className="text-white/60 font-medium">Buscando el escenario brillante...</p>
      </div>
    );
  }

  if (gameState === 'starting') {
    return (
      <div className="min-h-screen bg-[#110022] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/10 mix-blend-screen animate-pulse" />
        <h2 className="text-white/60 font-bold tracking-widest uppercase mb-4 z-10">Prepárate</h2>
        <div className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] z-10">
          {startCountdown}
        </div>
      </div>
    );
  }

  if (gameState === 'round_finished') {
    return (
      <div className="min-h-screen bg-[#110022] flex flex-col items-center justify-center">
        <ShieldCheck className="w-20 h-20 text-emerald-500 animate-bounce mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">¡Ronda Completada!</h2>
        <p className="text-white/50">Procesando y validando tus respuestas...</p>
      </div>
    );
  }

  // PLAYING / PROCESSING_ANSWER
  const q = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-[#110022] flex flex-col">
      {/* Header Bar */}
      <header className="h-[80px] bg-white/5 border-b border-white/10 flex items-center justify-between px-6 shrink-0 relative z-20">
         <div className="flex flex-col">
           <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Pregunta</span>
           <span className="text-xl font-bold text-white">{currentQIndex + 1} <span className="text-white/30 text-base">/ {questions.length}</span></span>
         </div>
         <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
           <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
           <span className={`text-xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
           </span>
         </div>
      </header>
      
      {/* ProgressBar Time */}
      <div className="h-1.5 w-full bg-white/5 relative z-20">
        <div 
          className="h-full bg-indigo-500 transition-all ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${(timeLeft / 15) * 100}%`, transitionDuration: '1000ms' }}
        />
      </div>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full relative z-10">
        
        {/* Anti-Cheat Warning */}
        <div className="absolute top-6 flex items-center gap-2 text-red-400/80 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <AlertTriangle className="w-4 h-4" /> No recargues la página
        </div>

        <div className="w-full">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-2xl mb-8">
            <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed text-center">
              {q.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt, i) => (
              <button 
                key={i}
                disabled={gameState === 'processing_answer'}
                onClick={() => handleAnswerSubmit(i)}
                className="w-full text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/50 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-lg text-white font-medium">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Processing Overlay */}
      {gameState === 'processing_answer' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
           <div className="bg-white/10 p-6 rounded-3xl border border-white/20 flex flex-col items-center">
             <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
             <p className="text-white font-bold tracking-wider uppercase">Registrando Sabiduría...</p>
           </div>
        </div>
      )}

    </div>
  );
}
