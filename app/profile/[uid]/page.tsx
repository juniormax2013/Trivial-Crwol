'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Medal, 
  Diamond, 
  BookOpen, 
  Shield, 
  Swords, 
  Quote, 
  Shapes, 
  Globe, 
  UserCircle,
  Loader2,
  UserPlus,
  Users,
  Check,
  Clock
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import UserAvatar from '@/components/UserAvatar';
import { AppUserModel } from '@/lib/user/models';
import { getUser, getLevelFromXp } from '@/lib/user/repository';
import { 
  checkFriendshipStatus, 
  getFriendsList, 
  sendFriendRequest,
  acceptFriendRequest
} from '@/lib/social/repository';

type FriendshipStatus = 'none' | 'friends' | 'pending_sent' | 'pending_received';

export default function PublicProfile({ params }: { params: Promise<{ uid: string }> }) {
  const unwrappedParams = use(params);
  const targetUid = unwrappedParams.uid;
  const router = useRouter();
  
  const { user: currentUser } = useAuthContext();
  
  const [profile, setProfile] = useState<AppUserModel | null>(null);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [requestId, setRequestId] = useState<string | undefined>(undefined);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!targetUid) return;

    if (currentUser?.uid === targetUid) {
      router.replace('/profile');
      return;
    }

    const loadData = async () => {
      try {
        let profileData = null;
        let statusData: { status: FriendshipStatus; requestId?: string } = { status: 'none', requestId: undefined };

        try {
          profileData = await getUser(targetUid);
        } catch (e) {
          console.error("Error loading user doc:", e);
        }

        if (currentUser?.uid) {
          try {
            statusData = await checkFriendshipStatus(currentUser.uid, targetUid);
          } catch (e) {
            console.error("Error checking friendship:", e);
          }
        }

        
        let friendsList: AppUserModel[] = [];
        try {
          // Attempt to get friends list
          friendsList = await getFriendsList(targetUid);
        } catch (e) {
          console.warn("Could not load friends list:", e);
        }
        
        if (profileData) setProfile(profileData);
        setFriendsCount(friendsList.length);
        if (statusData) {
          setFriendshipStatus(statusData.status as FriendshipStatus);
          setRequestId(statusData.requestId);
        }
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [targetUid, currentUser, router]);

  const handleSendRequest = async () => {
    if (!currentUser || !profile) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(currentUser, profile);
      setFriendshipStatus('pending_sent');
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!currentUser || !profile || !requestId) return;
    setActionLoading(true);
    try {
      await acceptFriendRequest(requestId, profile.uid, currentUser.uid);
      setFriendshipStatus('friends');
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendChallenge = () => {
    // Navigate to challenge creation screen
    router.push(`/arena/duels/new?opponent=${targetUid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <UserCircle className="w-16 h-16 text-[#4a4452]/20" />
        <h2 className="font-serif text-xl font-bold text-[#310065]">Jugador no encontrado</h2>
        <button onClick={() => router.back()} className="text-[#310065] font-bold text-sm bg-white px-6 py-2 rounded-full shadow-sm">
          Atrás
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center px-4 h-16 bg-[#faf9fc]/70 backdrop-blur-xl">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#310065]/5">
          <ArrowLeft className="text-[#310065] w-5 h-5 cursor-pointer" />
        </button>
        <h1 className="flex-1 text-center font-serif font-bold text-lg text-[#310065] mr-10">Perfil de {profile.fullName || profile.username}</h1>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="relative">
            <UserAvatar
              photoURL={profile.photoURL}
              activeFrame={profile.activeFrame}
              username={profile.fullName || profile.username}
              size={128}
            />
            {profile.isOnline && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm z-20" />
            )}
            <div className="absolute -bottom-2 -right-2 bg-[#735c00] text-white p-2.5 rounded-full shadow-lg flex items-center justify-center z-20">
              <Medal className="w-[18px] h-[18px]" fill="currentColor" />
            </div>
          </div>
          
          <div>
            <h2 className="font-serif text-3xl font-black text-[#310065] tracking-tight">
              {profile.fullName || profile.username}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <span className="bg-[#4a148c]/10 text-[#310065] font-bold px-3 py-0.5 rounded-full text-[11px] uppercase tracking-wider">Nivel {getLevelFromXp(profile.xp)}</span>
              <span className="text-[#4a4452] text-[14px] font-medium">{profile.xp >= 1000 ? `${(profile.xp / 1000).toFixed(1)}k` : profile.xp} XP</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-[1.25rem] px-6 py-3 inline-flex flex-col items-center gap-1 justify-center">
              <div className="flex items-center gap-2">
                <Diamond className="text-[#cba72f] w-[18px] h-[18px]" fill="currentColor" />
                <span className="font-serif font-bold text-[20px] text-[#1b1b1e]">{profile.crowns.toLocaleString()}</span>
              </div>
              <span className="text-[#4a4452] text-[11px] uppercase tracking-widest font-bold">Coronas</span>
            </div>
            
            <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-[1.25rem] px-6 py-3 inline-flex flex-col items-center gap-1 justify-center">
              <div className="flex items-center gap-2">
                <Users className="text-[#310065] w-[18px] h-[18px]" />
                <span className="font-serif font-bold text-[20px] text-[#1b1b1e]">{friendsCount}</span>
              </div>
              <span className="text-[#4a4452] text-[11px] uppercase tracking-widest font-bold">Amigos</span>
            </div>
          </div>
        </section>

        {/* Action Button */}
        {currentUser && (
          <section className="px-2">
            {friendshipStatus === 'none' && (
              <button 
                onClick={handleSendRequest}
                disabled={actionLoading}
                className="w-full py-4 bg-[#310065] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#310065]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Añadir Amigo
              </button>
            )}

            {friendshipStatus === 'pending_sent' && (
              <div className="w-full py-4 bg-[#310065]/5 border border-[#310065]/10 text-[#310065] font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3">
                <Clock className="w-5 h-5" />
                Petición Pendiente
              </div>
            )}

            {friendshipStatus === 'pending_received' && (
              <button 
                onClick={handleAcceptRequest}
                disabled={actionLoading}
                className="w-full py-4 bg-[#cba72f] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#cba72f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Aceptar Petición
              </button>
            )}

            {friendshipStatus === 'friends' && (
              <button 
                onClick={handleSendChallenge}
                className="w-full py-4 bg-[#ba1a1a] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#ba1a1a]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Swords className="w-5 h-5" fill="currentColor" />
                Retar a Duelo
              </button>
            )}
          </section>
        )}

        {/* Quick Stats Row (Bento Style) */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-[#f5f3f7] p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
            <span className="text-[#310065] font-serif text-[26px] font-black leading-none">{Math.round(profile.accuracyRate || 0)}%</span>
            <span className="text-[10px] uppercase font-bold text-[#4a4452] tracking-widest mt-2">Precisión</span>
          </div>
          <div className="bg-[#4a148c] text-[#b889ff] p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-[0_8px_20px_rgba(74,20,140,0.15)]">
            <span className="font-serif text-[26px] font-black text-white leading-none">{profile.streakDays || 0}</span>
            <span className="text-[10px] uppercase font-bold opacity-90 tracking-widest mt-2 text-[#d7baff]">Días Racha</span>
          </div>
          <div className="bg-[#f5f3f7] p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
            <span className="text-[#310065] font-serif text-[26px] font-black leading-none">{profile.totalWins || 0}</span>
            <span className="text-[10px] uppercase font-bold text-[#4a4452] tracking-widest mt-2">Victorias</span>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="space-y-4">
          <h3 className="font-serif text-[22px] font-bold text-[#310065] px-2">Logros Sagrados</h3>
          <div className="grid grid-cols-3 gap-3">
            
            <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-[#735c00]/10 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="text-[#735c00] w-6 h-6" fill="currentColor" />
              </div>
              <span className="text-[11px] font-bold leading-snug mb-3 uppercase tracking-tighter">Saber de Proverbios</span>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-[#310065]/10 rounded-full flex items-center justify-center mb-3">
                <Shield className="text-[#310065] w-6 h-6" fill="currentColor" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold leading-snug mb-3 uppercase tracking-tighter">Guerrero de Salmos</span>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-[#705573]/10 rounded-full flex items-center justify-center mb-3">
                <Swords className="text-[#705573] w-6 h-6" fill="currentColor" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold leading-snug mb-3 uppercase tracking-tighter">Duelo Maestro</span>
            </div>

          </div>
        </section>

        {/* Personal Details Card */}
        <section className="bg-[#f5f3f7] rounded-[2rem] p-6 sm:p-7 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-[#310065]/5 p-3 rounded-2xl flex-shrink-0 mt-1">
              <Quote className="text-[#310065] w-[22px] h-[22px] fill-current" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-[#4a4452] tracking-[0.2em] mb-1.5">Versículo Favorito</p>
              <p className="font-serif font-bold text-[#1b1b1e] text-[17px] italic leading-relaxed">"{profile.favoriteVerse || 'Lámpara es a mis pies tu palabra.'}"</p>
            </div>
          </div>
          
          <div className="h-px bg-[#cdc3d4]/30 w-full"></div>
          
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <Shapes className="text-[#310065] w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-[#4a4452] tracking-wider mb-0.5">Categoría</p>
                <p className="text-[14px] font-bold text-[#1b1b1e] capitalize">{profile.favoriteCategoryId || 'General'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <Globe className="text-[#310065] w-5 h-5 bg-transparent" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-[#4a4452] tracking-wider mb-0.5">País</p>
                <p className="text-[14px] font-bold text-[#1b1b1e] uppercase">{profile.country || 'Desconocido'}</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
