'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/lib/i18n/context';
import { 
  sendMessage, 
  subscribeToMessages, 
  softDeleteMessage, 
  reportMessage, 
  blockUser,
  getTimestampMs
} from '@/lib/chat/chatService';
import { ChatMessage } from '@/lib/chat/chatTypes';
import ChatInput from './ChatInput';
import UserAvatar from '@/components/UserAvatar';
import { MoreVertical, ShieldAlert, Ban, Trash2, ArrowDown, ChevronUp, X, ArrowLeft, Search, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AnimatedEmoji from './AnimatedEmoji';

interface ChatRoomProps {
  chatId: string;
  onBack?: () => void;
}

export default function ChatRoom({ chatId, onBack }: ChatRoomProps) {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Record<string, boolean>>({});
  const [limitCount, setLimitCount] = useState(30);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];
    
    // If it's a new message, not from me, and not the same as we checked last
    if (latest && latest.senderId !== user?.uid && latest.id !== lastMessageIdRef.current) {
      // Check if it's recent (within last 10 seconds) to avoid playing chime for old messages during load
      const msgTime = getTimestampMs(latest.createdAt) || Date.now();
      if (Date.now() - msgTime < 10000) {
        // Play a nice message sound
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(698.46, now); // F5
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
          }
        } catch (e) {
          console.warn("Failed to play chat sound:", e);
        }
      }
    }
    if (latest) {
      lastMessageIdRef.current = latest.id;
    }
  }, [messages, user?.uid]);

  // Subscribe to blocked users
  useEffect(() => {
    if (!user?.uid) return;
    const ref = collection(db, 'users', user.uid, 'blockedUsers');
    const unsub = onSnapshot(ref, (snap) => {
      const blocked: Record<string, boolean> = {};
      snap.docs.forEach((doc) => {
        blocked[doc.id] = true;
      });
      setBlockedUsers(blocked);
    }, (error) => {
      console.error("Error subscribing to blocked users:", error);
    });
    return () => unsub();
  }, [user?.uid]);

  // Subscribe to messages in the chatroom
  useEffect(() => {
    const unsub = subscribeToMessages(chatId, limitCount, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });
    return () => unsub();
  }, [chatId, limitCount]);

  // Mark chatroom as read
  useEffect(() => {
    if (!chatId) return;
    const lastReadString = localStorage.getItem('last_read_chats') || '{}';
    const lastReadMap = JSON.parse(lastReadString);
    lastReadMap[chatId] = Date.now();
    localStorage.setItem('last_read_chats', JSON.stringify(lastReadMap));
    window.dispatchEvent(new CustomEvent('chat-read', { detail: { chatId } }));
  }, [chatId, messages]);

  // Filter messages dynamically in the render cycle (handles blocked users & 24h expiration & search)
  const visibleMessages = useMemo(() => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return messages.filter((msg) => {
      if (!msg || !msg.senderId) return false;
      // Filter out blocked users
      if (blockedUsers[msg.senderId]) return false;
      
      const msgTime = getTimestampMs(msg.createdAt);
      // Keep pending local messages (which temporarily have no timestamp yet)
      if (msgTime && msgTime < twentyFourHoursAgo) return false;

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const textMatch = msg.text?.toLowerCase().includes(query);
        const nameMatch = msg.senderName?.toLowerCase().includes(query);
        if (!textMatch && !nameMatch) return false;
      }
      
      return true;
    });
  }, [messages, blockedUsers, searchQuery]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (text: string) => {
    if (!user) return;
    const chatUser = {
      uid: user.uid,
      displayName: user.firstName || user.fullName || user.username || 'Peregrino',
      photoURL: user.photoURL || undefined,
    };
    await sendMessage(chatId, text, chatUser);
  };

  const handleDelete = async (messageId: string) => {
    try {
      await softDeleteMessage(chatId, messageId);
      toast.success(
        language === 'es' 
          ? 'Mensaje eliminado' 
          : language === 'fr' 
          ? 'Message supprimé' 
          : 'Mesaj la efase'
      );
    } catch (e) {
      toast.error('Error');
    }
  };

  const handleReport = async (messageId: string) => {
    if (!user) return;
    const reason = prompt(
      language === 'es' 
        ? 'Razón del reporte:' 
        : language === 'fr' 
        ? 'Raison du signalement :' 
        : 'Rezon rapò a:'
    );
    if (!reason) return;
    try {
      await reportMessage(chatId, messageId, user.uid, reason);
      toast.success(
        language === 'es' 
          ? 'Reporte enviado' 
          : language === 'fr' 
          ? 'Signalement envoyé' 
          : 'Rapò a voye'
      );
    } catch (e) {
      toast.error('Error');
    }
  };

  const handleBlock = async (targetUserId: string, targetName: string) => {
    if (!user) return;
    const confirm = window.confirm(
      language === 'es'
        ? `¿Seguro que deseas bloquear a ${targetName}?`
        : language === 'fr'
        ? `Voulez-vous vraiment bloquer ${targetName} ?`
        : `Èske ou sèten ou vle bloke ${targetName}?`
    );
    if (!confirm) return;
    try {
      await blockUser(user.uid, targetUserId);
      toast.success(
        language === 'es'
          ? 'Usuario bloqueado'
          : language === 'fr'
          ? 'Utilisateur bloqué'
          : 'Itilizatè bloke'
      );
    } catch (e) {
      toast.error('Error');
    }
  };

  const formatMessageTime = (createdAt: any) => {
    const ms = getTimestampMs(createdAt);
    if (!ms) return '';
    const date = new Date(ms);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#faf9fc] dark:bg-black relative overflow-hidden transition-colors"
      style={{ borderRadius: 'inherit', transform: 'translate3d(0,0,0)', isolation: 'isolate' }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]">
        <div className="absolute top-[10%] left-[5%] text-[24px] text-[#e3d5ff] rotate-45 select-none">✦</div>
        <div className="absolute top-[30%] right-[10%] text-[32px] text-[#e3d5ff] rotate-12 select-none">✦</div>
        <div className="absolute bottom-[20%] left-[15%] text-[28px] text-[#e3d5ff] -rotate-12 select-none">✦</div>
        <div className="absolute bottom-[40%] right-[5%] text-[20px] text-[#e3d5ff] rotate-45 select-none">✦</div>
      </div>

      {/* Header */}
      <header className="px-4 py-3 bg-transparent flex items-center justify-between shrink-0 relative z-10 mt-2">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-[#310065] dark:text-white font-black text-[17px] tracking-tight leading-tight">
              {chatId === 'global_main' 
                ? (language === 'es' ? 'Chat Global' : language === 'fr' ? 'Chat Global' : 'Chat Global')
                : chatId.startsWith('clan_')
                ? (language === 'es' ? 'Chat del Clan' : language === 'fr' ? 'Chat du Clan' : 'Chat Klan an')
                : (language === 'es' ? 'Sala de Chat' : language === 'fr' ? 'Salon de Chat' : 'Chanm Chat')
              }
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-[13px] text-[#7c7483] dark:text-[#a19aa8] font-medium">
                {language === 'es' ? 'En línea' : language === 'fr' ? 'En ligne' : 'An liy'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-[#310065] dark:text-[#E3D5FF]">
          <button 
            onClick={() => setIsSearchActive(!isSearchActive)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isSearchActive ? 'bg-white dark:bg-[#1c1c1e] shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/10'}`}
          >
            <Search className="w-[24px] h-[24px]" strokeWidth={2} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-white/10 active:scale-95 transition-all">
            <MoreVertical className="w-[24px] h-[24px]" strokeWidth={2} />
          </button>
          {onBack && (
            <button 
              onClick={onBack} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              <X className="w-[26px] h-[26px]" strokeWidth={2} />
            </button>
          )}
        </div>
      </header>

      {/* Search Bar */}
      {isSearchActive && (
        <div className="px-4 py-2 bg-transparent relative z-10 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'es' ? 'Buscar mensajes o usuarios...' : language === 'fr' ? 'Rechercher...' : 'Chèche...'}
              className="w-full pl-10 pr-10 py-3 rounded-[20px] bg-white dark:bg-[#1c1c1e] border border-[#310065]/5 dark:border-white/10 text-[14.5px] text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7a3ce3]/20 shadow-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-6 relative z-10"
      >
        {messages.length >= limitCount && (
          <div className="flex justify-center mb-4">
            <button 
              onClick={() => setLimitCount(prev => prev + 30)}
              className="flex items-center gap-1 text-[12px] font-bold text-[#7a3ce3] hover:bg-white bg-white/50 border border-[#7a3ce3]/10 px-4 py-2 rounded-full transition-all shadow-sm"
            >
              <ChevronUp className="w-4 h-4" />
              {language === 'es' ? 'Cargar más' : language === 'fr' ? 'Charger plus' : 'Chaje plis'}
            </button>
          </div>
        )}
        
        {visibleMessages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          const isMenuOpen = activeMenuId === msg.id;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'} gap-1 relative group/msg`}>
                
                {/* Sender Name */}
                {!isMe && (
                  <span className="text-[12px] font-bold text-[#7c7483] dark:text-[#a19aa8] ml-2 tracking-wide uppercase">
                    {msg.senderName}
                  </span>
                )}
                
                {/* Message Bubble container */}
                <div className="relative group/bubble flex items-end gap-2">
                  {/* Avatar (Left side, only if not me) */}
                  {!isMe && (
                    <div className="shrink-0 mb-1 z-10">
                      <UserAvatar 
                        photoURL={msg.senderAvatar} 
                        username={msg.senderName} 
                        size={32}
                      />
                    </div>
                  )}

                  {/* Bubble */}
                  <div 
                    className={`
                      px-4 py-3 shadow-sm relative break-words break-all
                      ${isMe 
                        ? 'bg-gradient-to-br from-[#310065] to-[#7a3ce3] text-white rounded-[24px] rounded-br-[8px]' 
                        : 'bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-[#0F172A] dark:text-[#e2e8f0] rounded-[24px] rounded-bl-[8px]'
                      }
                    `}
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {msg.deleted ? (
                      <span className="italic opacity-70">
                        {language === 'es' 
                          ? 'Este mensaje ha sido eliminado' 
                          : language === 'fr' 
                          ? 'Ce message a été supprimé' 
                          : 'Mesaj sa a efase'}
                      </span>
                    ) : (
                      <div className={`text-[15px] font-medium leading-[1.4] whitespace-pre-wrap`}>
                        {msg.text}
                      </div>
                    )}
                    <div 
                      className={`text-[10px] font-bold tracking-wider uppercase mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-white/70' : 'text-[#7c7483]/60 dark:text-[#a19aa8]/60'
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                      {isMe && <CheckCheck className="w-[14px] h-[14px]" strokeWidth={2.5} />}
                    </div>
                  </div>

                  {/* Menu Button */}
                  <div className={`
                    absolute top-1/2 -translate-y-1/2 transition-all duration-200 
                    ${isMe ? '-left-10' : '-right-10'}
                    ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none group-hover/msg:opacity-100 group-hover/msg:scale-100 group-hover/msg:pointer-events-auto'}
                  `}>
                    <button 
                      onClick={() => setActiveMenuId(isMenuOpen ? null : msg.id)}
                      className="p-1.5 rounded-full bg-white dark:bg-[#2c2c2e] text-[#7c7483] dark:text-[#a19aa8] hover:text-[#310065] dark:hover:text-[#E3D5FF] shadow-sm border border-black/5 dark:border-white/5"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className={`
                        absolute top-0 z-50 min-w-[160px] bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-[0_8px_30px_rgba(49,0,101,0.12)] dark:shadow-black/50 border border-[#310065]/5 dark:border-white/10 overflow-hidden
                        ${isMe ? 'right-10 origin-top-right' : 'left-10 origin-top-left'}
                        animate-in zoom-in-95 duration-200
                      `}>
                        {isMe ? (
                          <button 
                            onClick={() => { handleDelete(msg.id); setActiveMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            {language === 'es' ? 'Eliminar' : language === 'fr' ? 'Supprimer' : 'Efase'}
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => { handleReport(msg.id); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#310065] dark:text-[#E3D5FF] hover:bg-[#faf9fc] dark:hover:bg-[#3a3a3c] transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              {language === 'es' ? 'Reportar' : language === 'fr' ? 'Signaler' : 'Rapò'}
                            </button>
                            <div className="h-px w-full bg-black/5 dark:bg-white/5" />
                            <button 
                              onClick={() => { handleBlock(msg.senderId, msg.senderName); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                              {language === 'es' ? 'Bloquear' : language === 'fr' ? 'Bloquer' : 'Bloke'}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSend} />
    </div>
  );
}
