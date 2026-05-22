'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Medal,
  Home,
  Crown,
  Loader2,
  Swords,
  Users,
  UserCircle,
  User
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { AppUserModel } from '@/lib/user/models';
import { getTopUsersByXP } from '@/lib/user/repository';
import { useT } from '@/lib/i18n/context';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';
import UserAvatar from '@/components/UserAvatar';

export default function Ranking() {
  const { user, loading } = useAuthContext();
  const t = useT();
  const [topUsers, setTopUsers] = useState<AppUserModel[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'friends'>('global');

  useEffect(() => {
    getTopUsersByXP(50).then(users => {
      setTopUsers(users);
      setLoadingUsers(false);
    }).catch(err => {
      console.error(err);
      setLoadingUsers(false);
    });
  }, []);

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  const rank1 = topUsers[0];
  const rank2 = topUsers[1];
  const rank3 = topUsers[2];
  const others = topUsers.slice(3);

  const hasLegitimateFrame = (player?: AppUserModel | null) => {
    if (!player || !player.activeFrame) return false;
    return player.ownedFrames?.includes(player.activeFrame) || false;
  };

  const getPlayerFrame = (player?: AppUserModel | null) => {
    if (!player || !player.activeFrame) return null;
    const frame = player.activeFrame;
    const owned = player.ownedFrames || [];
    return owned.includes(frame) ? frame : null;
  };

  const rank1HasFrame = hasLegitimateFrame(rank1);
  const rank2HasFrame = hasLegitimateFrame(rank2);
  const rank3HasFrame = hasLegitimateFrame(rank3);
  const userHasFrame = hasLegitimateFrame(user);

  const userRank = user ? topUsers.findIndex(u => u.uid === user.uid) + 1 : 0;

  return (
    <div className="bg-gradient-to-b from-[#fdfbfd] via-[#faf8fb] to-[#fdfbfd] text-[#1b1b1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-purple-100/30 pt-safe shadow-[0_2px_20px_rgba(49,0,101,0.02)]">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-[19px] font-black text-[#310065] tracking-tighter uppercase font-serif">Bible Crown</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#f5f3f7] px-3 py-1.5 rounded-full border border-purple-100/40">
            <span className="text-[#310065] font-bold text-[13px]">{user?.crowns || 0}</span>
            <Crown className="w-4 h-4 text-[#cba72f] fill-[#ffe088]" strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-[88px] px-6 max-w-screen-xl mx-auto">
        
        {/* Tabs */}
        <div className="flex p-1.5 bg-purple-50/60 backdrop-blur-sm border border-purple-100/50 rounded-2xl mb-12 max-w-md mx-auto shadow-sm">
          {(['global', 'weekly', 'friends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[13px] font-extrabold tracking-wide rounded-[1.25rem] transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#310065] to-[#4a148c] text-white shadow-md shadow-purple-900/10'
                  : 'text-[#5c5464] hover:text-[#310065] hover:bg-white/50'
              }`}
            >
              {t.ranking[tab]}
            </button>
          ))}
        </div>

        {/* Podium Section (Top 3) */}
        <div className="flex justify-center items-end gap-2 md:gap-8 mb-16 mt-8">
          
          {/* Rank 2 (Silver) */}
          {rank2 && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="relative mb-4">
                <Link href={`/profile/${rank2.uid}`} className="block hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  <UserAvatar
                    photoURL={rank2.photoURL}
                    activeFrame={getPlayerFrame(rank2)}
                    username={rank2.fullName || rank2.username}
                    size={80}
                  />
                </Link>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[9px] font-black px-2 py-[2px] rounded-full uppercase tracking-tighter shadow-sm border-2 border-white whitespace-nowrap z-20">
                  {t.ranking.level} {rank2.level}
                </div>
              </div>
              <div className="text-center mt-1">
                <p className="font-bold text-[13px] text-[#1b1b1e] truncate w-full">{rank2.firstName || rank2.username}</p>
                <p className="font-serif text-[#7c7483] text-[17px] leading-tight font-black">{rank2.xp}</p>
              </div>
              <div className="mt-3 w-full h-[95px] bg-gradient-to-t from-slate-200 via-slate-100 to-slate-50 rounded-t-[2rem] border-t border-slate-300/30 flex items-start justify-center pt-3 shadow-[inset_0_4px_12px_rgba(255,255,255,0.8),0_10px_20px_rgba(148,163,184,0.06)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="font-serif text-[36px] text-slate-400 opacity-80 font-black tracking-tighter">2</span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {rank1 && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] -translate-y-4">
              <div className="relative mb-6">
                <div className="absolute -top-[34px] left-1/2 -translate-x-1/2 drop-shadow-[0_4px_16px_rgba(245,158,11,0.55)] z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                  <Medal className="text-[#cba72f] fill-[#ffe088] w-[46px] h-[46px]" strokeWidth={1} />
                </div>
                <Link href={`/profile/${rank1.uid}`} className="block hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  <UserAvatar
                    photoURL={rank1.photoURL}
                    activeFrame={getPlayerFrame(rank1)}
                    username={rank1.fullName || rank1.username}
                    size={112}
                  />
                </Link>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#735c00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg border-2 border-white whitespace-nowrap z-20">
                  {t.ranking.level} {rank1.level}
                </div>
              </div>
              <div className="text-center mt-1">
                <p className="font-extrabold text-[15px] text-[#310065] truncate w-full">{rank1.firstName || rank1.username}</p>
                <p className="font-serif text-[#735c00] text-[22px] font-black leading-tight">{rank1.xp}</p>
              </div>
              <div className="mt-3 w-full h-[125px] bg-gradient-to-t from-amber-200/60 via-amber-100/80 to-amber-50 rounded-t-[2rem] border-t border-amber-300/30 flex items-start justify-center pt-3 shadow-[inset_0_4px_12px_rgba(255,255,255,0.8),0_12px_24px_rgba(245,158,11,0.06)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="font-serif text-[46px] text-amber-600 opacity-90 font-black leading-none tracking-tighter">1</span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {rank3 && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="relative mb-4">
                <Link href={`/profile/${rank3.uid}`} className="block hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  <UserAvatar
                    photoURL={rank3.photoURL}
                    activeFrame={getPlayerFrame(rank3)}
                    username={rank3.fullName || rank3.username}
                    size={80}
                  />
                </Link>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#b56e29] text-white text-[9px] font-black px-2 py-[2px] rounded-full uppercase tracking-tighter shadow-sm border-2 border-white whitespace-nowrap z-20">
                  {t.ranking.level} {rank3.level}
                </div>
              </div>
              <div className="text-center mt-1">
                <p className="font-bold text-[13px] text-[#1b1b1e] truncate w-full">{rank3.firstName || rank3.username}</p>
                <p className="font-serif text-[#b56e29]/80 text-[17px] leading-tight font-black">{rank3.xp}</p>
              </div>
              <div className="mt-3 w-full h-[80px] bg-gradient-to-t from-[#fcf6ee] via-[#fffbf6] to-white rounded-t-[2rem] border-t border-[#f3e1cb]/50 flex items-start justify-center pt-2 shadow-[inset_0_4px_12px_rgba(255,255,255,0.8),0_8px_16px_rgba(215,161,92,0.04)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="font-serif text-[32px] text-[#b58c56] opacity-80 font-black tracking-tighter">3</span>
              </div>
            </div>
          )}

        </div>

        {/* List View (Players 4+) */}
        <div className="space-y-3 mb-10 max-w-2xl mx-auto">
          {others.map((player, idx) => (
            <Link 
              href={`/profile/${player.uid}`} 
              key={player.uid} 
              className="flex items-center gap-4 p-4 bg-white rounded-[2rem] shadow-[0_4px_15px_rgba(49,0,101,0.015)] border border-purple-50/50 hover:border-purple-200/50 hover:bg-gradient-to-r hover:from-white hover:to-purple-50/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(49,0,101,0.06)] transition-all duration-300 cursor-pointer group"
            >
              <span className="w-8 font-serif font-black text-slate-300 text-[18px] group-hover:text-[#310065] transition-colors text-center">{idx + 4}</span>
              <UserAvatar
                photoURL={player.photoURL}
                activeFrame={getPlayerFrame(player)}
                username={player.fullName || player.username}
                size={52}
              />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[15px] text-[#1b1b1e] truncate group-hover:text-[#310065] transition-colors">{player.firstName || player.username}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{t.ranking.level} {player.level}</p>
              </div>
              <div className="text-right">
                <p className="font-serif font-black text-[#310065] text-[18px] leading-tight">{player.xp}</p>
                <p className="text-[9px] font-extrabold text-amber-600 tracking-wider uppercase mt-0.5">{t.ranking.xp}</p>
              </div>
            </Link>
          ))}
          {topUsers.length === 0 && (
             <div className="text-center py-10 opacity-60 font-bold text-slate-400">
               {t.ranking.noPlayers}
             </div>
          )}
        </div>
      </main>

      {/* Fixed User Status */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-screen-xl px-6 py-4 bg-gradient-to-r from-[#210047] via-[#310065] to-[#4a148c] rounded-[2rem] shadow-[0_16px_36px_rgba(49,0,101,0.35)] z-40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="font-serif font-black text-[#ffe088] text-[24px] tracking-tight">#{userRank > 0 ? userRank : "—"}</span>
          <UserAvatar
            photoURL={user?.photoURL}
            activeFrame={getPlayerFrame(user)}
            username={user?.fullName || user?.username}
            size={48}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-[14px] leading-none mb-2 truncate">
              {user?.firstName ? `${t.ranking.yourRank} · ${user.firstName}` : t.ranking.yourRank}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-[#ffe088] to-[#ffca28] rounded-full shadow-[0_0_12px_rgba(255,202,40,0.6)] transition-all duration-1000" 
                  style={{ width: `${Math.min((user?.xp || 0) / 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-right pl-2">
            <p className="font-serif font-black text-[#ffe088] text-[19px] tracking-wide">{user?.xp || 0}</p>
            <span className="text-[8px] font-extrabold text-[#ffe088]/60 uppercase tracking-widest block mt-0.5">XP</span>
          </div>
        </div>
      </div>

      <BottomNav activeTab="ranking" showTriggerButton={false} />

    </div>
  );
}
