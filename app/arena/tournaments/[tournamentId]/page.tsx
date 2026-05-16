'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Trophy, Play, CheckCircle2 } from 'lucide-react';
import { Tournament, TournamentParticipant } from '@/lib/tournament/models';
import { TournamentRepository } from '@/lib/tournament/repository';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { StatusBadge } from '@/components/tournament/StatusBadge';
import { RewardChip } from '@/components/tournament/RewardChip';
import { LeaderboardRow } from '@/components/tournament/LeaderboardRow';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Link from 'next/link';
import { app } from '@/lib/firebase';

export default function TournamentDetail() {
  const { tournamentId } = useParams() as { tournamentId: string };
  const { user } = useAuthContext();
  const router = useRouter();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentParticipant[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Escuchar el leaderboard
    const unsub = TournamentRepository.subscribeToLeaderboard(tournamentId, (data) => {
      setLeaderboard(data);
    });
    return () => unsub();
  }, [tournamentId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tInfo = await TournamentRepository.getTournamentById(tournamentId);
        setTournament(tInfo);
        
        if (user?.uid) {
          const registered = await TournamentRepository.isUserRegistered(tournamentId, user.uid);
          setIsRegistered(registered);
        }
      } catch (e) {
        console.error("Error loading tournament details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId, user?.uid]);

  const handleJoin = async () => {
    if (!user) {
      alert("Debes iniciar sesión para unirte.");
      return;
    }
    setActionLoading(true);
    try {
      const fns = getFunctions(app);
      const joinCall = httpsCallable(fns, 'joinTournament');
      await joinCall({ tournamentId });
      setIsRegistered(true);
      
      // Update local state temporarily to seem responsive
      if (tournament) {
          setTournament({ ...tournament, currentParticipants: tournament.currentParticipants + 1 });
      }
      
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error al unirse al torneo");
    } finally {
      setActionLoading(false);
    }
  };

  const myRank = user?.uid ? leaderboard.findIndex(p => p.userId === user.uid) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110022] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#110022] text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Torneo no encontrado</h2>
        <Link href="/arena/tournaments" className="text-indigo-400 hover:text-indigo-300">Volver a Torneos</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110022] text-white pb-32">
      {/* Hero Header */}
      <div className="relative pt-12 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-[#110022] to-[#110022] z-0" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/arena/tournaments" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="mb-6 inline-flex">
                <StatusBadge status={tournament.status} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg text-white">
                {tournament.title}
              </h1>
              <p className="text-xl text-white/70 font-medium max-w-2xl">
                {tournament.subtitle}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shrink-0 w-full md:w-80 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-white/80">Participantes</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">{tournament.currentParticipants}</span>
                  <span className="text-white/40 font-bold"> / {tournament.maxParticipants}</span>
                </div>
              </div>

              {tournament.status === 'registration_open' && !isRegistered && (
                <button 
                  disabled={actionLoading}
                  onClick={handleJoin}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Verificando...' : 'Unirse al Torneo'}
                </button>
              )}

              {isRegistered && tournament.status === 'registration_open' && (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Inscrito (Esperando Inicio)
                </div>
              )}

              {isRegistered && tournament.status === 'active' && (
                <Link href={`/arena/tournaments/${tournament.id}/round/${tournament.currentRound || 1}/play`}>
                  <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 group">
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    Jugar Ronda {tournament.currentRound || 1}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Col: Info */}
        <div className="md:col-span-1 space-y-10">
          <div>
            <h3 className="text-white/40 uppercase tracking-widest font-semibold text-xs mb-4">Recompensas Principales</h3>
            <RewardChip reward={tournament.rewardConfig} />
          </div>

          <div>
            <h3 className="text-white/40 uppercase tracking-widest font-semibold text-xs mb-4">Reglas del Torneo</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-indigo-400">•</span>
                Rondas con límite de tiempo estricto.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">•</span>
                El tiempo de respuesta se usa para desempates en el Ranking global.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">•</span>
                Abandono descalifica (Ronda se da por perdida).
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Leaderboard */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Clasificación Oficial
            </h2>
            {isRegistered && myRank >= 0 && (
              <span className="text-sm font-semibold px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-white/60">
                Tú: Posición #{myRank + 1}
              </span>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-2 md:p-6 shadow-2xl">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                No hay participantes con puntos registrados aún...
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((p, idx) => (
                  <LeaderboardRow 
                    key={p.userId} 
                    participant={p} 
                    index={idx} 
                    isCurrentUser={p.userId === user?.uid} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
