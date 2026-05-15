'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Crown, 
  Users, 
  Copy, 
  Share2, 
  LogOut,
  Zap,
  Star,
  ShieldCheck,
  Trophy,
  Loader2,
  UserPlus,
  Info
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { useT } from '@/lib/i18n/context';
import { toast } from 'sonner';
import { 
  subscribeToArenaRoom, 
  joinArenaSession, 
  leaveArenaSession,
  startArenaGame
} from '@/lib/arena/repository';
import { ArenaSession, ArenaPlayer } from '@/lib/arena/models';
import Image from 'next/image';

export default function ArenaLobbyPage() {
  const params = useParams();
  const roomId = params.id as string;
  const { user } = useAuthContext();
  const t = useT();
  const router = useRouter();

  const [room, setRoom] = useState<ArenaSession & { players: ArenaPlayer[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !roomId) return;

    // Join the room if not already in it
    const init = async () => {
      try {
        await joinArenaSession(roomId, { 
          uid: user.uid, 
          displayName: user.fullName || user.username || 'Anonymous', 
          photoURL: user.photoURL || '' 
        });
      } catch (err: any) {
        console.error('Error joining room:', err);
        setError(err.message || 'Error joining room');
        setLoading(false);
      }
    };

    init();

    // Subscribe to updates
    console.log('Lobby: Subscribing to arena', roomId);
    const unsubscribe = subscribeToArenaRoom(roomId, (updatedRoom) => {
      console.log('Lobby: Received room update', updatedRoom?.status);
      if (!updatedRoom) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      setRoom(updatedRoom);
      setLoading(false);

      // Check if status changed to starting or playing
      if (updatedRoom.status === 'starting' || updatedRoom.status === 'playing') {
        console.log('Lobby: Status is starting/playing, redirecting to play page...');
        router.push(`/arena/crown-arena/${roomId}/play`);
      }
    });

    return () => unsubscribe();
  }, [user, roomId, router]);

  const handleLeave = async () => {
    if (!user) return;
    try {
      await leaveArenaSession(roomId, user.uid);
      router.push('/arena/crown-arena');
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  };

  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    console.log('[LOBBY] handleStart triggered', { 
      userId: user?.uid, 
      hostId: room?.hostId, 
      match: room?.hostId === user?.uid,
      roomId,
      playersCount: room?.players.length
    });

    if (!user) {
      console.error('[LOBBY] Start failed: No user found in context');
      toast.error('Error de sesión');
      return;
    }

    if (!room) {
      console.error('[LOBBY] Start failed: Room state is null');
      return;
    }

    if (room.hostId !== user.uid) {
      console.warn('[LOBBY] Start ignored: user is not the host.', { 
        userUid: user.uid, 
        roomHostId: room.hostId 
      });
      toast.error('Solo el anfitrión puede iniciar la partida');
      return;
    }

    if (starting) return;
    
    setStarting(true);
    const toastId = toast.loading(t.crownArena.starting + '...');
    
    try {
      console.log('[LOBBY] Calling startArenaGame...');
      await startArenaGame(roomId);
      console.log('[LOBBY] startArenaGame call finished');
      toast.success(t.crownArena.startMatchSuccess || '¡Que comience la batalla!', { id: toastId });
    } catch (err: any) {
      console.error('[LOBBY] handleStart error:', err);
      toast.error(t.crownArena.startMatchError || 'Error al iniciar la partida', { id: toastId });
      setStarting(false); // Reset only on error, success should redirect
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(t.crownArena.linkCopied);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#310065] animate-spin" />
        <p className="font-serif text-[18px] font-bold text-[#310065]">{t.crownArena.searchingPlayers}</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="font-serif text-[24px] font-black text-[#310065] mb-2">{t.crownArena.roomNotFound}</h2>
        <p className="text-[#7c7483] font-medium mb-8 max-w-xs">{error}</p>
        <button 
          onClick={() => router.push('/arena/crown-arena')}
          className="px-8 py-3 bg-[#310065] text-white rounded-2xl font-bold shadow-lg shadow-[#310065]/20 active:scale-95 transition-all"
        >
          {t.common.back}
        </button>
      </div>
    );
  }

  const isHost = room.hostId === user?.uid;
  const canStart = room.players.length >= 2;

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-10 bg-white border-b border-[#1b1b1e]/5 pt-safe">
        <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLeave}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#1b1b1e]/5 flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors active:scale-95"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-[18px] font-black text-[#310065] leading-tight">
                {room.hostId === user?.uid ? t.crownArena.controlRoom : t.crownArena.warRoom}
              </h1>
              <p className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest">
                ID: {roomId.slice(0, 8)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#1b1b1e]/5 shadow-sm text-[13px] font-bold text-[#310065] hover:bg-[#eddcff] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {t.common.share}
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-xl mx-auto space-y-8">

        {/* Status Card */}
        <section className="bg-white rounded-[2rem] p-6 border border-[#1b1b1e]/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#eddcff] rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#310065]" />
              </div>
              <div>
                <h3 className="text-[17px] font-black text-[#310065]">{t.crownArena.waitingPlayers}</h3>
                <p className="text-[12px] text-[#7c7483] font-bold uppercase tracking-wider">
                  {room.players.length} / {room.maxPlayers} {t.crownArena.players}
                </p>
              </div>
            </div>
            
            <div className="flex -space-x-3">
              {room.players.map((p: ArenaPlayer, i: number) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-[#e9c349]/20 shadow-sm" style={{ zIndex: 10 - i }}>
                  <Image 
                    src={p.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${p.name}`} 
                    alt={`Avatar de ${p.name}`}
                    width={40} height={40} 
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ))}
              {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white border-dashed bg-gray-50 flex items-center justify-center text-gray-300" style={{ zIndex: 0 }}>
                  <UserPlus className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#310065] to-[#4a148c] transition-all duration-700 ease-out rounded-full"
              style={{ width: `${(room.players.length / room.maxPlayers) * 100}%` }}
            />
          </div>
        </section>

        {/* Players List */}
        <section className="space-y-4">
          <h3 className="font-serif text-[18px] font-bold text-[#310065] ml-2">{t.crownArena.warriorList}</h3>
          <div className="space-y-3">
            {room.players.map((player: ArenaPlayer) => (
              <div 
                key={player.id}
                className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 relative overflow-hidden group hover:border-[#310065]/20 transition-all shadow-sm"
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#eddcff]">
                    <Image 
                      src={player.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${player.name}`} 
                      alt={`Foto de ${player.name}`}
                      width={56} height={56} 
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {player.id === room.hostId && (
                    <div className="absolute -top-1 -right-1 bg-[#e9c349] text-white p-1 rounded-full shadow-sm border border-white">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-black text-[16px] text-[#1b1b1e]">{player.name}</p>
                  <p className="text-[12px] text-[#7c7483] font-bold uppercase tracking-wider">
                    {player.id === room.hostId ? t.crownArena.host : t.crownArena.warrior}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                    {t.crownArena.ready}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Bar for host */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#faf9fc] via-[#faf9fc] to-transparent z-20 pb-safe">
          <div className="max-w-xl mx-auto">
            {isHost ? (
              <div className="space-y-4">
                {!canStart && (
                  <div className="bg-[#eddcff] p-4 rounded-2xl flex items-center gap-3 border border-[#310065]/10 animate-pulse">
                    <Info className="w-5 h-5 text-[#310065]" />
                    <p className="text-[12px] font-bold text-[#310065]">
                      {t.crownArena.minPlayersWarning}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleStart}
                  disabled={!canStart || starting}
                  className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-[#310065] to-[#4a148c] text-white font-black text-[18px] shadow-[0_12px_24px_rgba(49,0,101,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-3 group"
                >
                  {starting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  )}
                  {starting ? t.crownArena.starting + '...' : t.crownArena.startNow}
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-[2rem] border border-[#1b1b1e]/5 shadow-lg flex flex-col items-center gap-4 text-center">
                <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
                <div>
                  <h4 className="font-black text-[#310065]">{t.crownArena.waitingPlayers}...</h4>
                  <p className="text-[12px] text-[#7c7483] font-medium leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: t.crownArena.waitingHostStart }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
