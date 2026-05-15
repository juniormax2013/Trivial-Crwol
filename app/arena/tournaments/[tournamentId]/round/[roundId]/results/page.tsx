'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Loader2, ArrowRight, ShieldCheck, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti';

export default function TournamentResults() {
  const { tournamentId } = useParams() as { tournamentId: string };
  const { user, loading: authLoading } = useAuthContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Para el Confetti (Render Client Side only)
  const [winDim, setWinDim] = useState({ w: 0, h: 0 });
  
  useEffect(() => {
    setWinDim({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchResults = async () => {
      try {
        const ref = doc(db, 'tournaments', tournamentId, 'participants', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setStats(snap.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [tournamentId, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#110022] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#110022] text-white flex flex-col items-center justify-center">
         <p>No se encontraron resultados para esta ronda.</p>
         <Link href={`/arena/tournaments/${tournamentId}`} className="text-indigo-400 mt-4">Regresar al Torneo</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110022] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      <Confetti 
        width={winDim.w} 
        height={winDim.h} 
        recycle={false} 
        numberOfPieces={400} 
        gravity={0.15}
        colors={['#818cf8', '#a78bfa', '#e879f9', '#ffffff']}
      />

      <div className="relative z-10 w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">
        
        <div className="w-24 h-24 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
          <ShieldCheck className="w-12 h-12 text-indigo-400" />
        </div>

        <h1 className="text-3xl font-black mb-2 tracking-tight">¡Ronda Finalizada!</h1>
        <p className="text-white/60 font-medium mb-8">El Sabio Rey ha anotado tus respuestas.</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Puntaje</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-400">
              {stats.score?.toLocaleString() || 0}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Precisión</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-white">{stats.correctAnswers || 0}</span>
              <span className="text-white/40 pb-1 font-bold">/ {(stats.correctAnswers || 0) + (stats.wrongAnswers || 0)}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center col-span-2">
            <div className="flex items-center gap-2 mb-1">
               <Clock className="w-4 h-4 text-white/40" />
               <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Tiempo Promedio</span>
            </div>
            <span className="text-xl font-bold text-white">
              {stats.averageResponseTimeMs > 0 ? (stats.averageResponseTimeMs / 1000).toFixed(2) + 's' : '-'}
            </span>
          </div>
        </div>

        <Link href={`/arena/tournaments/${tournamentId}`} className="w-full">
          <button className="w-full bg-white text-[#110022] hover:bg-white/90 font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            Ver Leaderboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>

    </div>
  );
}
