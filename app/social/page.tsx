'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  QrCode, 
  Search, 
  Star, 
  ChevronRight, 
  Award, 
  Sparkles, 
  UserPlus, 
  Home, 
  UserCircle,
  Loader2,
  Swords,
  Crown,
  Check,
  X
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { QrShowModal } from '@/components/social/QrShowModal';
import { useT } from '@/lib/i18n/context';
import { AppUserModel } from '@/lib/user/models';
import BottomNav from '@/components/BottomNav';
import dynamic from 'next/dynamic';
import UserAvatar from '@/components/UserAvatar';

import { 
  getFriendsList, 
  searchGlobalUsers, 
  getPendingFriendRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest
} from '@/lib/social/repository';
import { FriendRequest } from '@/lib/social/models';
import { getDuelsForUser, acceptDuel, declineDuel } from '@/lib/duel/repository';
import { DuelModel } from '@/lib/duel/models';

const QrScannerModal = dynamic(
  () => import('@/components/social/QrScannerModal').then(mod => mod.default),
  { ssr: false }
);

type Tab = 'buscar' | 'amigos' | 'peticiones' | 'duelos';

export default function Social() {
  const { user, firebaseUser, loading } = useAuthContext();
  const t = useT();
  const [activeTab, setActiveTab] = useState<Tab>('amigos');

  const [qrShowOpen, setQrShowOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const [friends, setFriends] = useState<AppUserModel[]>([]);
  const [searchResults, setSearchResults] = useState<AppUserModel[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [duels, setDuels] = useState<DuelModel[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        if (activeTab !== 'buscar') {
          setActiveTab('buscar');
        }
        handleSearch();
      } else if (activeTab === 'buscar' && searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      if (activeTab === 'amigos') {
        const list = await getFriendsList(user.uid);
        setFriends(list);
      } else if (activeTab === 'peticiones') {
        const reqs = await getPendingFriendRequests(user.uid, 'received');
        setRequests(reqs);
      } else if (activeTab === 'duelos') {
        const d = await getDuelsForUser(user.uid);
        setDuels(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setIsLoadingData(true);
    try {
      const results = await searchGlobalUsers(searchQuery);
      setSearchResults(results.filter(u => u.uid !== user.uid));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSendRequest = async (receiver: AppUserModel) => {
    if (!user) return;
    await sendFriendRequest(user, receiver);
    alert('Petición enviada a ' + receiver.username);
  };

  const handleAcceptRequest = async (req: FriendRequest) => {
    if (!user) return;
    await acceptFriendRequest(req.id, req.senderId, req.receiverId);
    setRequests(r => r.filter(x => x.id !== req.id));
  };

  const handleRejectRequest = async (req: FriendRequest) => {
    if (!user) return;
    await rejectFriendRequest(req.id);
    setRequests(r => r.filter(x => x.id !== req.id));
  };

  const isUserOnline = (u: AppUserModel) => {
    if (!u.isOnline || !u.lastActiveAt) return false;
    const diff = Date.now() - new Date(u.lastActiveAt).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  const onlineFriendsCount = friends.filter(isUserOnline).length;

  return (
    <div className="bg-white text-[#1b1b1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-black/[0.03] flex justify-between items-center px-6 h-20 pt-safe">
        <div className="flex items-center gap-3">
          <Users className="text-[#310065] w-[26px] h-[26px]" />
          <h1 className="font-serif text-[22px] tracking-tight font-bold text-[#310065]">{t.social.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setQrScannerOpen(true)} className="active:scale-95 transition-transform hover:opacity-80">
            <QrCode className="text-[#7c7483] w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="pt-20 px-6 max-w-2xl mx-auto">
        
        {/* Search & Quick Action Tabs */}
        <section className="mb-8 space-y-5">
          <div className="relative group flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c7483] w-[18px] h-[18px]" />
              <input 
                className="w-full bg-[#f5f3f7] border-none rounded-[14px] py-[14px] pl-[2.8rem] pr-4 focus:ring-2 focus:ring-[#310065]/20 transition-all placeholder:text-[#7c7483]/60 text-[14px] font-medium outline-none" 
                placeholder={t.social.searchUsers}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0 && activeTab !== 'buscar') {
                    setActiveTab('buscar');
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={() => { setActiveTab('buscar'); handleSearch(); }}
              className="bg-[#310065] text-white px-4 rounded-[14px] font-bold text-[13px] active:scale-95"
            >
              {t.common.search}
            </button>
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setActiveTab('amigos')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm
                ${activeTab === 'amigos' ? 'bg-[#310065] text-white shadow-[#310065]/20' : 'bg-[#e9e7eb] text-[#4a4452] hover:bg-[#e3e2e6]'}`}
            >
              {t.social.friends}
            </button>
            <button 
              onClick={() => setActiveTab('peticiones')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm
                ${activeTab === 'peticiones' ? 'bg-[#310065] text-white shadow-[#310065]/20' : 'bg-[#e9e7eb] text-[#4a4452] hover:bg-[#e3e2e6]'}`}
            >
              {t.social.requests} {requests.length > 0 && `(${requests.length})`}
            </button>
            <button 
              onClick={() => setActiveTab('duelos')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm
                ${activeTab === 'duelos' ? 'bg-[#310065] text-white shadow-[#310065]/20' : 'bg-[#e9e7eb] text-[#4a4452] hover:bg-[#e3e2e6]'}`}
            >
              {t.social.duels}
            </button>
          </div>
        </section>

        {activeTab === 'amigos' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white p-5 rounded-[1.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-[#efedf1]">
                <p className="text-[9px] uppercase tracking-widest font-bold text-[#7c7483] mb-1">{t.social.rank}</p>
                <h3 className="font-serif text-[22px] text-[#735c00] font-bold">{t.ranking.level} {user?.level ?? 1}</h3>
              </div>
              <div className="bg-[#4a148c] p-5 rounded-[1.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col justify-between" onClick={() => setQrShowOpen(true)}>
                <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">{t.social.onlineFriends}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[28px] font-serif text-white font-bold leading-none">{onlineFriendsCount}</span>
                    <Star className="text-[#ffe088] w-[14px] h-[14px] fill-current" />
                  </div>
                  <QrCode className="text-white/50 w-6 h-6 outline-none" />
                </div>
              </div>
            </div>

            <section className="space-y-5">
              <h2 className="font-serif text-[20px] text-[#310065] font-bold">{t.social.yourBrothers}</h2>
              <div className="space-y-3.5">
                {isLoadingData ? <Loader2 className="animate-spin w-6 h-6 mx-auto text-[#7c7483]" /> : 
                 friends.length === 0 ? <p className="text-[#7c7483] text-sm text-center">{t.social.noFriends}</p> :
                 friends.map(f => (
                  <div key={f.uid} className="bg-white p-4 rounded-[1.25rem] flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-[#efedf1]/80">
                    <Link href={`/profile/${f.uid}`} className="relative cursor-pointer hover:opacity-80 transition-opacity block">
                      <UserAvatar 
                        photoURL={f.photoURL}
                        activeFrame={f.activeFrame}
                        username={f.fullName || f.username}
                        size={56}
                      />
                      {isUserOnline(f) && <div className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#22c55e] border-2 border-white rounded-full z-20"></div>}
                    </Link>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1b1b1e] text-[15px]">{f.fullName || f.username}</h4>
                      <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">{t.ranking.level} {f.level} • {f.country}</p>
                    </div>
                    <Link href={`/match-setup?opponentId=${f.uid}`} className="bg-[#310065] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform">
                      {t.duel.challengeFriend}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'buscar' && (
          <section className="space-y-5">
            <h2 className="font-serif text-[20px] text-[#310065] font-bold">{t.social.results}</h2>
            <div className="space-y-3.5">
              {isLoadingData ? <Loader2 className="animate-spin w-6 h-6 mx-auto text-[#7c7483]" /> : 
               searchResults.length === 0 ? <p className="text-[#7c7483] text-sm text-center">{t.social.noResults}</p> :
               searchResults.map(u => (
                <div key={u.uid} className="bg-white p-4 rounded-[1.25rem] flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-[#efedf1]/80">
                  <Link href={`/profile/${u.uid}`} className="cursor-pointer hover:opacity-80 transition-opacity block">
                    <UserAvatar 
                      photoURL={u.photoURL}
                      activeFrame={u.activeFrame}
                      username={u.fullName || u.username}
                      size={56}
                    />
                  </Link>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1b1b1e] text-[15px]">{u.fullName || u.username}</h4>
                  </div>
                  <button onClick={() => handleSendRequest(u)} className="bg-[#310065]/10 text-[#310065] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95">
                    {t.social.add}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'peticiones' && (
          <section className="space-y-5">
            <h2 className="font-serif text-[20px] text-[#310065] font-bold">{t.social.receivedRequests}</h2>
            <div className="space-y-3.5">
              {isLoadingData ? <Loader2 className="animate-spin w-6 h-6 mx-auto text-[#7c7483]" /> : 
               requests.length === 0 ? <p className="text-[#7c7483] text-sm text-center">{t.social.noResults}</p> :
               requests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-[1.25rem] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-[#efedf1]/80">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${req.senderId}`} className="cursor-pointer hover:opacity-80 transition-opacity block">
                      <UserAvatar 
                        photoURL={req.senderAvatar}
                        username={req.senderName}
                        size={48}
                      />
                    </Link>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1b1b1e] text-[15px]">{req.senderName}</h4>
                      <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">{t.social.wantsToBeFriend}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleAcceptRequest(req)} className="bg-[#310065] text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95">{t.social.accept}</button>
                    <button onClick={() => handleRejectRequest(req)} className="bg-[#f5f3f7] text-[#7c7483] py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 border border-[#e3e2e6]">{t.social.reject}</button>
                  </div>
                </div>
               ))}
            </div>
          </section>
        )}

        {activeTab === 'duelos' && (
          <section className="space-y-5">
            <h2 className="font-serif text-[20px] text-[#310065] font-bold">{t.social.historyAndChallenges}</h2>
            <div className="space-y-3.5">
              {isLoadingData ? <Loader2 className="animate-spin w-6 h-6 mx-auto text-[#7c7483]" /> : 
               duels.length === 0 ? <p className="text-[#7c7483] text-sm text-center">{t.social.noDuels}</p> :
               duels.map(d => {
                 const isMine = d.createdBy === user?.uid;
                 const opponentId = d.participantIds.find(id => id !== user?.uid) || '';
                 const opponent = d.participants[opponentId];
                 const opponentName = opponent?.name || 'Oponente';
                 const opponentAvatar = opponent?.avatarUrl || '';
                 const iWon = d.winnerIds.includes(user?.uid || '');
                 const isLoser = d.loserIds.includes(user?.uid || '');
                 
                 return (
                  <div key={d.id} className="bg-white p-4 flex gap-4 items-center rounded-[1.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-[#efedf1]/80">
                    <Link href={`/profile/${opponentId}`} className="cursor-pointer hover:opacity-80 transition-opacity block">
                      <UserAvatar 
                        photoURL={opponentAvatar}
                        username={opponentName}
                        size={48}
                      />
                    </Link>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1b1b1e] text-[14px]">{t.social.duelVs} {opponentName}</h4>
                      <p className="text-[11px] text-[#7c7483] font-bold mt-0.5 uppercase tracking-wider">{t.social.status}: {d.status}</p>
                    </div>
                    {d.status === 'completed' && (
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${iWon ? 'bg-green-100 text-green-700' : isLoser ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {iWon ? t.social.victory : isLoser ? t.social.defeat : t.social.tie}
                      </div>
                    )}
                    {(d.status === 'pending' || d.status === 'active') && (
                      <Link href={`/arena/duels/${d.id}`} className="bg-[#310065] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95">{t.social.view}</Link>
                    )}
                  </div>
                 );
               })}
            </div>
          </section>
        )}

      </main>

      {/* View Modals */}
      <QrShowModal uid={user?.uid!} isOpen={qrShowOpen} onClose={() => setQrShowOpen(false)} />
      <QrScannerModal 
        isOpen={qrScannerOpen} 
        onClose={() => setQrScannerOpen(false)} 
        onUserFound={(u) => {
          setQrScannerOpen(false);
          setActiveTab('buscar');
          setSearchResults([u]);
        }} 
      />

      <BottomNav activeTab="social" />

    </div>
  );
}
