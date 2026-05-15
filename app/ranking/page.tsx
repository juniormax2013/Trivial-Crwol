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

  const userRank = user ? topUsers.findIndex(u => u.uid === user.uid) + 1 : 0;

  return (
    <div className="bg-white text-[#1b1b1e] min-h-screen pb-40 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-black/[0.03] pt-safe">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4a148c] overflow-hidden ring-2 ring-[#735c00]/20">
              {user?.photoURL ? (
                <Image 
                  src={user.photoURL}
                  alt="Profile Avatar"
                  width={40} height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#eddcff]">
                  <User className="w-5 h-5 text-[#310065]" />
                </div>
              )}
            </div>
            <h1 className="text-[19px] font-black text-[#310065] tracking-tighter uppercase font-serif">Bible Crown</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#f5f3f7] px-3 py-1.5 rounded-full">
            <span className="text-[#310065] font-bold text-[13px]">{user?.crowns || 0}</span>
            <Crown className="w-4 h-4 text-[#cba72f] fill-[#ffe088]" strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <main className="pt-[88px] px-6 max-w-screen-xl mx-auto">
        
        {/* Tabs */}
        <div className="flex p-1 bg-[#e9e7eb] rounded-xl mb-12 max-w-md mx-auto">
          {(['global', 'weekly', 'friends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[13px] font-bold tracking-wide rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#310065] shadow-sm'
                  : 'text-[#4a4452] hover:bg-[#efedf1]'
              }`}
            >
              {t.ranking[tab]}
            </button>
          ))}
        </div>

        {/* Podium Section (Top 3) */}
        <div className="flex justify-center items-end gap-2 md:gap-8 mb-16 mt-8">
          
          {/* Rank 2 */}
          {rank2 && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="relative mb-4">
                <Link href={`/profile/${rank2.uid}`} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#cdc3d4] p-1 bg-white shadow-xl flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                  {rank2.photoURL ? (
                    <Image 
                      src={rank2.photoURL}
                      alt="Rank 2 Player"
                      width={96} height={96}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-[#cdc3d4]" />
                  )}
                </Link>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#cdc3d4] text-[#1b1b1e] text-[9px] font-black px-2 py-[2px] rounded-full uppercase tracking-tighter shadow-sm border-2 border-white whitespace-nowrap">
                  {t.ranking.level} {rank2.level}
                </div>
              </div>
              <div className="text-center mt-1">
                <p className="font-bold text-[13px] text-[#1b1b1e] truncate w-full">{rank2.firstName || rank2.username}</p>
                <p className="font-serif text-[#7c7483] text-[17px] leading-tight">{rank2.xp}</p>
              </div>
              <div className="mt-3 w-full h-[90px] bg-gradient-to-t from-[#e3e2e6] to-[#f2f0f4] rounded-t-2xl flex items-start justify-center pt-2 shadow-inner">
                <span className="font-serif text-[32px] text-[#7c7483] opacity-60 font-black">2</span>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {rank1 && (
            <div className="flex flex-col items-center flex-1 max-w-[140px] -translate-y-4">
              <div className="relative mb-6">
                <div className="absolute -top-[34px] left-1/2 -translate-x-1/2 drop-shadow-[0_0_12px_rgba(203,167,47,0.4)] z-10">
                  <Medal className="text-[#cba72f] fill-[#ffe088] w-[46px] h-[46px]" strokeWidth={1} />
                </div>
                <Link href={`/profile/${rank1.uid}`} className="w-[104px] h-[104px] md:w-32 md:h-32 rounded-full border-4 border-[#cba72f] p-1 bg-white shadow-2xl ring-[6px] ring-[#cba72f]/10 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                  {rank1.photoURL ? (
                    <Image 
                      src={rank1.photoURL}
                      alt="Winner"
                      width={128} height={128}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-[#cba72f]" />
                  )}
                </Link>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#735c00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg border-2 border-white whitespace-nowrap">
                  {t.ranking.level} {rank1.level}
                </div>
              </div>
              <div className="text-center mt-1">
                <p className="font-extrabold text-[15px] text-[#310065] truncate w-full">{rank1.firstName || rank1.username}</p>
                <p className="font-serif text-[#735c00] text-[22px] font-black leading-tight">{rank1.xp}</p>
              </div>
              <div className="mt-3 w-full h-[120px] bg-gradient-to-t from-[#e9c349]/40 to-[#ffe088] rounded-t-2xl flex items-start justify-center pt-3 shadow-inner">
                <span className="font-serif text-[40px] text-[#735c00] font-black leading-none">1</span>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {rank3 && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="relative mb-4">
                <Link href={`/profile/${rank3.uid}`} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#cba72f]/40 p-1 bg-white shadow-xl flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                  {rank3.photoURL ? (
                    <Image 
                      src={rank3.photoURL}
                      alt="Rank 3 Player"
                      width={96} height={96}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-[#cba72f]" />
                  )}
                </Link>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#b56e29] text-white text-[9px] font-black px-2 py-[2px] rounded-full uppercase tracking-tighter shadow-sm border-2 border-white whitespace-nowrap">
                  {t.ranking.level} {rank3.level}
                </div>
              </div>
              <div className="text-center mt-1">
                <p className="font-bold text-[13px] text-[#1b1b1e] truncate w-full">{rank3.firstName || rank3.username}</p>
                <p className="font-serif text-[#b56e29]/80 text-[17px] leading-tight">{rank3.xp}</p>
              </div>
              <div className="mt-3 w-full h-[76px] bg-gradient-to-t from-[#ffe088]/40 to-[#fff8e1] rounded-t-2xl flex items-start justify-center pt-2">
                <span className="font-serif text-[32px] text-[#cba72f]/60 font-black">3</span>
              </div>
            </div>
          )}

        </div>

        {/* List View (Players 4+) */}
        <div className="space-y-3 mb-10">
          {others.map((player, idx) => (
            <Link href={`/profile/${player.uid}`} key={player.uid} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 hover:bg-[#f5f3f7] transition-all cursor-pointer group">
              <span className="w-6 font-serif font-black text-[#cdc3d4] text-[19px] group-hover:text-[#310065] transition-colors text-center">{idx + 4}</span>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e9e7eb] flex items-center justify-center">
                {player.photoURL ? (
                  <Image 
                    src={player.photoURL}
                    alt="Player" width={48} height={48} className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#7c7483]" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[15px] text-[#1b1b1e] truncate">{player.firstName || player.username}</p>
                <p className="text-[10px] text-[#4a4452] font-semibold uppercase tracking-widest mt-0.5 truncate">{t.ranking.level} {player.level}</p>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-[#310065] text-[17px] leading-tight">{player.xp}</p>
                <p className="text-[8px] font-extrabold text-[#735c00] tracking-widest uppercase mt-0.5">{t.ranking.xp}</p>
              </div>
            </Link>
          ))}
          {topUsers.length === 0 && (
             <div className="text-center py-10 opacity-60 font-bold">
               {t.ranking.noPlayers}
             </div>
          )}
        </div>
      </main>

      {/* Fixed User Status */}
      <div className="fixed bottom-[96px] left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-screen-xl px-4 py-[14px] bg-[#310065] rounded-[1.25rem] shadow-[0_12px_24px_rgba(49,0,101,0.25)] z-40 border-2 border-[#4a148c]">
        <div className="flex items-center gap-4">
          <span className="font-serif font-black text-[#ffe088] text-[22px]">#{userRank > 0 ? userRank : "—"}</span>
          <div className="w-11 h-11 rounded-full border-[3px] border-[#ffe088]/30 overflow-hidden shadow-inner flex items-center justify-center bg-white/5">
            {user?.photoURL ? (
              <Image 
                src={user.photoURL}
                alt="My Profile" width={44} height={44} className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white/40" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-[13px] mb-1.5 leading-none">
              {user?.firstName ? `${t.ranking.yourRank} · ${user.firstName}` : t.ranking.yourRank}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffe088] rounded-full shadow-[0_0_8px_rgba(255,224,136,0.5)] transition-all duration-1000" 
                  style={{ width: `${Math.min((user?.xp || 0) / 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif font-black text-[#ffe088] text-[17px]">{user?.xp || 0}</p>
          </div>
        </div>
      </div>

      <BottomNav activeTab="ranking" />

    </div>
  );
}
