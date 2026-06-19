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
  Info,
  MessageCircle
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import ChatRoom from '@/components/chat/ChatRoom';
import { db } from '@/lib/firebase';
import { useT } from '@/lib/i18n/context';
import { toast } from 'sonner';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getTimestampMs } from '@/lib/chat/chatService';
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const DEMO_UID = user?.uid || 'unknown-user';

  useEffect(() => {
    if (!roomId || !user) return;
    const chatId = `match_${roomId}`;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(20));

    const unsubscribe = onSnapshot(q, {
      next: (snapshot: any) => {
        const lastReadString = localStorage.getItem('last_read_chats') || '{}';
        const lastReadMap = JSON.parse(lastReadString);
        const lastReadTime = lastReadMap[chatId] || 0;

        let count = 0;
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.senderId !== user.uid && !data.deleted) {
            const msgTime = getTimestampMs(data.createdAt) || Date.now();
            if (msgTime > lastReadTime) {
              count++;
            }
          }
        });
        setUnreadMessages(count);
      },
      error: (err) => {
        if (err.code === 'permission-denied') {
          console.warn('Chat no inicializado aún o sin permisos de lectura para esta sala de chat.');
        } else {
          console.error('Error en snapshot de chat:', err);
        }
      }
    });

    const handleChatRead = (e: any) => {
      if (e.detail?.chatId === chatId) {
        setUnreadMessages(0);
      }
    };
    window.addEventListener('chat-read', handleChatRead);

    return () => {
      unsubscribe();
      window.removeEventListener('chat-read', handleChatRead);
    };
  }, [roomId, user]);

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
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#0A84FF] animate-spin" />
        <p className="font-sans text-[18px] font-bold text-[#0F172A]">{t.crownArena.searchingPlayers}</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-sans text-[22px] font-bold text-[#0F172A] mb-2">{t.crownArena.roomNotFound}</h2>
        <p className="text-[#64748B] font-medium mb-8 max-w-xs">{error}</p>
        <button 
          onClick={() => router.push('/arena/crown-arena')}
          className="px-8 py-3.5 bg-[#0A84FF] hover:bg-[#0070E0] text-white rounded-[24px] font-bold shadow-md active:scale-95 transition-all"
        >
          {t.common.back}
        </button>
      </div>
    );
  }

  const isHost = room.hostId === user?.uid;
  const canStart = room.players.length >= 2;

  return (
    <div className="bg-[#F8F9FA] text-[#0F172A] min-h-screen pb-44 font-sans selection:bg-[#0A84FF]/10">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-10 bg-white border-b border-black/[0.04] pt-safe">
        <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLeave}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors active:scale-95"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-sans text-[18px] font-bold text-[#0F172A] leading-tight">
                {room.hostId === user?.uid ? t.crownArena.controlRoom : t.crownArena.warRoom}
              </h1>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                ID: {roomId.slice(0, 8)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={async () => {
                  const { createMatchChat } = await import('@/lib/chat/chatService');
                  const playerIds = room.players.map(p => p.id);
                  try {
                    await createMatchChat(roomId, playerIds);
                    setIsChatOpen(true);
                  } catch (e) {
                    toast.error('Error al abrir el chat');
                  }
                }}
                className="w-10 h-10 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-[#0A84FF] hover:bg-blue-50 transition-colors active:scale-95 shrink-0"
                title="Chat de sala"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              {unreadMessages > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none animate-bounce">
                  {unreadMessages}
                </span>
              )}
            </div>

            <button 
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-black/5 shadow-sm text-[13px] font-bold text-[#0A84FF] hover:bg-blue-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {t.common.share}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-xl mx-auto space-y-8">

        {/* Status Card */}
        <section className="bg-white rounded-[24px] p-6 border border-black/[0.04] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0A84FF]" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#0F172A]">{t.crownArena.waitingPlayers}</h3>
                <p className="text-[12px] text-[#64748B] font-bold uppercase tracking-wider">
                  {room.players.length} / {room.maxPlayers} {t.crownArena.players}
                </p>
              </div>
            </div>
            
            <div className="flex -space-x-3">
              {room.players.map((p: ArenaPlayer, i: number) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-blue-100 shadow-sm" style={{ zIndex: 10 - i }}>
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
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white border-dashed bg-slate-50 flex items-center justify-center text-slate-300" style={{ zIndex: 0 }}>
                  <UserPlus className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0A84FF] transition-all duration-700 ease-out rounded-full"
              style={{ width: `${(room.players.length / room.maxPlayers) * 100}%` }}
            />
          </div>
        </section>


        {/* Players List */}
        <section className="space-y-4">
          <h3 className="font-sans text-[18px] font-bold text-[#0F172A] ml-2">{t.crownArena.warriorList}</h3>
          <div className="space-y-3">
            {room.players.map((player: ArenaPlayer) => (
              <div 
                key={player.id}
                className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-black/[0.04] relative overflow-hidden group hover:border-[#0A84FF]/20 transition-all shadow-sm"
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-50">
                    <Image 
                      src={player.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${player.name}`} 
                      alt={`Foto de ${player.name}`}
                      width={56} height={56} 
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {player.id === room.hostId && (
                    <div className="absolute -top-1 -right-1 bg-[#0A84FF] text-white p-1 rounded-full shadow-sm border border-white">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-bold text-[16px] text-[#0F172A]">{player.name}</p>
                  <p className="text-[12px] text-[#64748B] font-bold uppercase tracking-wider">
                    {player.id === room.hostId ? t.crownArena.host : t.crownArena.warrior}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-sm border border-green-100">
                    {t.crownArena.ready}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Bar for host */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent z-20 pb-safe">
          <div className="max-w-xl mx-auto">
            {isHost ? (
              <div className="space-y-4">
                {!canStart && (
                  <div className="bg-amber-50 p-4 rounded-[24px] flex items-center gap-3 border border-amber-200/50 animate-pulse text-amber-800">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-[12px] font-bold">
                      {t.crownArena.minPlayersWarning}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleStart}
                  disabled={!canStart || starting}
                  className="w-full py-5 rounded-[24px] bg-[#0A84FF] hover:bg-[#0070E0] active:scale-95 text-white font-bold text-[18px] shadow-lg shadow-blue-500/10 transition-all disabled:opacity-40 flex items-center justify-center gap-3 group"
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
              <div className="bg-white p-6 rounded-[24px] border border-black/[0.04] shadow-lg flex flex-col items-center gap-4 text-center">
                <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
                <div>
                  <h4 className="font-bold text-[#0F172A]">{t.crownArena.waitingPlayers}...</h4>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: t.crownArena.waitingHostStart }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
      {/* Lobby Chat Pop-up Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsChatOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-white h-[80vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ borderRadius: '24px', overflow: 'hidden', transform: 'translate3d(0, 0, 0)', isolation: 'isolate' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatRoom 
              chatId={`match_${roomId}`} 
              onBack={() => setIsChatOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
