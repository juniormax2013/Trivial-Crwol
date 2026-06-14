'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Crown, 
  Trophy, 
  Home, 
  Star, 
  Medal,
  ChevronRight,
  TrendingUp,
  Award,
  Share2,
  Sparkles
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/context';
import { subscribeToArenaRoom } from '@/lib/arena/repository';
import { ArenaSession, ArenaPlayer } from '@/lib/arena/models';
import Image from 'next/image';
import { toast } from 'sonner';

export default function CrownArenaResultPage() {
  const { user } = useAuthContext();
  const t = useT();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<ArenaSession & { players: ArenaPlayer[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFallbackRewards, setShowFallbackRewards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallbackRewards(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToArenaRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#310065]/20 border-t-[#310065] animate-spin" />
      </div>
    );
  }

  const sortedPlayers = [...room.players].sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }
    return (a.totalResponseTime || 0) - (b.totalResponseTime || 0);
  });

  const me = room.players.find(p => p.id === user?.uid);
  const myRank = me?.rank || (sortedPlayers.findIndex(p => p.id === user?.uid) + 1);
  const myScore = me?.score || 0;
  
  // Use server rewards if available, otherwise fallback to local calculation
  const serverRewards = me?.rewards;
  const localRewards = (myRank > 0 && myRank <= 3) 
    ? [
        { crowns: 250, xp: 500, coins: 100 }, // 1st
        { crowns: 100, xp: 300, coins: 50 },  // 2nd
        { crowns: 50, xp: 200, coins: 25 },   // 3rd
      ][myRank - 1] 
    : { crowns: 10, xp: 100, coins: 5 };

  const myRewards = serverRewards || localRewards;
  const areRewardsDistributed = !!serverRewards || showFallbackRewards;

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-safe font-sans overflow-x-hidden">
      
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-[#310065] to-[#4a148c] rounded-b-[4rem] shadow-xl" />

      <header className="relative z-10 p-6 pt-safe flex items-center justify-between text-white">
        <button 
          onClick={() => router.push('/arena')}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
            <h1 className="font-serif text-[24px] font-black text-[#ffe088] drop-shadow-lg flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 fill-[#ffe088]" />
              {t.crownArena.podium}
            </h1>
             <p className="text-[11px] font-black opacity-70 uppercase tracking-widest">{(room.categoryId || 'MIXED').toUpperCase()}</p>
        </div>
        <button 
          onClick={() => toast.success(t.crownArena.resultShared)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="relative z-10 px-6 pt-4 space-y-8 max-w-xl mx-auto">
        
        {/* The Podium Visualization */}
        <section className="flex items-end justify-center gap-4 pt-12 pb-4">
          
          {/* 2nd Place */}
          {sortedPlayers[1] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom duration-700 delay-100">
               <div className="relative mb-3">
                 <div className="w-16 h-16 rounded-full border-4 border-[#c0c0c0] overflow-hidden shadow-lg bg-gray-100">
                    <Image 
                      src={sortedPlayers[1].avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${sortedPlayers[1].name}`} 
                      alt={`Avatar del 2do lugar: ${sortedPlayers[1].name}`} 
                      width={64} height={64} unoptimized
                    />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#c0c0c0] rounded-full flex items-center justify-center text-white font-black text-[12px] shadow-md border-2 border-white">2</div>
               </div>
               <div className="w-20 bg-white/20 backdrop-blur-md border border-white/10 rounded-t-2xl px-2 pt-4 pb-2 text-center text-white shadow-xl h-24 flex flex-col justify-end">
                  <p className="text-[12px] font-black truncate">{sortedPlayers[1].name.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold opacity-70">{sortedPlayers[1].score || 0} pts</p>
               </div>
            </div>
          )}

          {/* 1st Place */}
          {sortedPlayers[0] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom duration-700 delay-300">
               <Crown className="w-8 h-8 text-[#ffe088] fill-[#ffe088] mb-1 animate-pulse" />
               <div className="relative mb-4">
                 <div className="w-24 h-24 rounded-full border-4 border-[#e9c349] overflow-hidden shadow-2xl bg-[#e9c349]/20">
                    <Image 
                      src={sortedPlayers[0].avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${sortedPlayers[0].name}`} 
                      alt={`Avatar del 1er lugar: ${sortedPlayers[0].name}`} 
                      width={96} height={96} unoptimized
                    />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#e9c349] rounded-full flex items-center justify-center text-[#310065] font-black text-[16px] shadow-lg border-2 border-white">1</div>
               </div>
               <div className="w-24 bg-white/40 backdrop-blur-xl border border-white/20 rounded-t-[2rem] px-2 pt-6 pb-4 text-center text-white shadow-2xl h-40 flex flex-col justify-end ring-1 ring-white/30">
                  <p className="text-[14px] font-black truncate">{sortedPlayers[0].name.split(' ')[0]}</p>
                  <p className="text-[12px] font-bold text-[#ffe088]">{sortedPlayers[0].score || 0} pts</p>
               </div>
            </div>
          )}

          {/* 3rd Place */}
          {sortedPlayers[2] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom duration-700 delay-500">
               <div className="relative mb-3">
                 <div className="w-16 h-16 rounded-full border-4 border-[#cd7f32] overflow-hidden shadow-lg bg-orange-50">
                    <Image 
                      src={sortedPlayers[2].avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${sortedPlayers[2].name}`} 
                      alt={`Avatar del 3er lugar: ${sortedPlayers[2].name}`} 
                      width={64} height={64} unoptimized
                    />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#cd7f32] rounded-full flex items-center justify-center text-white font-black text-[12px] shadow-md border-2 border-white">3</div>
               </div>
               <div className="w-20 bg-white/10 backdrop-blur-md border border-white/10 rounded-t-2xl px-2 pt-4 pb-2 text-center text-white shadow-xl h-20 flex flex-col justify-end">
                  <p className="text-[12px] font-black truncate">{sortedPlayers[2].name.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold opacity-70">{sortedPlayers[2].score || 0} pts</p>
               </div>
            </div>
          )}
        </section>

        {/* Your Results Card */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-[#1b1b1e]/5 shadow-xl relative overflow-hidden group">
          {!areRewardsDistributed && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              <div className="w-10 h-10 border-4 border-[#310065]/20 border-t-[#310065] rounded-full animate-spin mb-4" />
              <p className="font-black text-[#310065] text-sm uppercase tracking-widest animate-pulse">Calculando Recompensas...</p>
              <p className="text-[11px] font-medium text-gray-500 mt-2">Estamos verificando tu puntuación con el servidor</p>
            </div>
          )}

          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <h3 className="font-serif text-[20px] font-black text-[#310065] mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e9c349]" />
              {t.crownArena.rewards}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#eddcff]/40 rounded-3xl p-5 border border-[#310065]/5">
                <p className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest mb-1">{t.crownArena.xpEarned}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#310065]" />
                  <span className="text-[24px] font-black text-[#310065]">+{myRewards.xp}</span>
                </div>
              </div>
              <div className="bg-[#ffe088]/20 rounded-3xl p-5 border border-[#e9c349]/20">
                <p className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest mb-1">{t.crownArena.crowns}</p>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" />
                  <span className="text-[24px] font-black text-[#735c00]">+{myRewards.crowns}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dashed border-[#1b1b1e]/10">
              <div className="flex items-center gap-3">
                <Medal className={`w-8 h-8 ${myRank === 1 ? 'text-[#e9c349]' : myRank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />
                <div>
                  <p className="text-[13px] font-black text-[#310065]">{t.crownArena.yourPosition.replace('{n}', myRank.toString())}</p>
                  <p className="text-[11px] font-bold text-[#7c7483]">{t.crownArena.totalPoints.replace('{n}', myScore.toString())}</p>
                </div>
              </div>
              <button className="text-[#310065] text-[12px] font-black uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                {t.crownArena.details} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Global Leaderboard Mini */}
        <section className="space-y-4">
          <h3 className="font-serif text-[18px] font-bold text-[#310065] ml-2">{t.crownArena.leaderboard}</h3>
          <div className="bg-white rounded-[2rem] border border-[#1b1b1e]/5 divide-y divide-[#1b1b1e]/5 overflow-hidden">
            {sortedPlayers.map((player, i) => (
              <div key={player.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <span className={`w-6 text-center font-black text-[14px] ${i < 3 ? 'text-[#310065]' : 'text-gray-300'}`}>
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                   <Image 
                      src={player.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${player.name}`} 
                      alt={`Foto de perfil de ${player.name}`} 
                      width={40} height={40} unoptimized
                    />
                </div>
                <div className="flex-1">
                  <p className="font-black text-[14px] text-[#1b1b1e]">{player.name}</p>
                  <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-tighter">
                    {player.isFinished ? t.crownArena.finished : t.crownArena.inProgress}
                  </p>
                </div>
                <span className="font-black text-[15px] text-[#310065]">{player.score || 0}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <div className="pt-4 flex gap-3">
              <button
                  onClick={() => router.push('/arena/crown-arena')}
                  className="flex-1 py-5 rounded-[2rem] bg-white border-2 border-[#1b1b1e]/5 text-[#310065] font-black text-[17px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5 text-[#e9c349]" />
                  {t.crownArena.rematch}
                </button>
              <button
                onClick={() => router.push('/arena')}
                className="flex-1 py-5 rounded-[2rem] bg-gradient-to-r from-[#310065] to-[#4a148c] text-white font-black text-[17px] shadow-xl shadow-[#310065]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                {t.crownArena.finishMatch}
              </button>
        </div>

      </main>
    </div>
  );
}
