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
import { MoreVertical, ShieldAlert, Ban, Trash2, ArrowDown, ChevronUp, X } from 'lucide-react';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Filter messages dynamically in the render cycle (handles blocked users & 24h expiration)
  const visibleMessages = useMemo(() => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return messages.filter((msg) => {
      if (!msg || !msg.senderId) return false;
      // Filter out blocked users
      if (blockedUsers[msg.senderId]) return false;
      
      const msgTime = getTimestampMs(msg.createdAt);
      // Keep pending local messages (which temporarily have no timestamp yet)
      if (!msgTime) return true;
      
      // Filter out messages older than 24 hours (temporary daily clearing)
      return msgTime >= twentyFourHoursAgo;
    });
  }, [messages, blockedUsers]);

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
    <div className="flex flex-col h-full bg-[#F8F9FA] rounded-3xl overflow-hidden shadow-sm border border-black/5">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-black/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-[#0F172A] font-black text-[16px] tracking-tight">
              {chatId === 'global_main' 
                ? (language === 'es' ? 'Chat Global' : language === 'fr' ? 'Chat Global' : 'Chat Global')
                : (language === 'es' ? 'Sala de Chat' : language === 'fr' ? 'Salon de Chat' : 'Chanm Chat')
              }
            </h2>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-0.5">
              {chatId === 'global_main' 
                ? (language === 'es' ? 'Toda la hermandad' : language === 'fr' ? 'Toute la communauté' : 'Tout kominote a')
                : (language === 'es' ? 'Privado/Partida' : language === 'fr' ? 'Privé/Match' : 'Prive/Match')
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length >= limitCount && (
            <button 
              onClick={() => setLimitCount(prev => prev + 30)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#0A84FF] hover:opacity-80 bg-blue-50 px-3 py-1.5 rounded-full transition-all"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {language === 'es' ? 'Cargar más' : language === 'fr' ? 'Charger plus' : 'Chaje plis'}
            </button>
          )}

          {onBack && (
            <button 
              onClick={onBack} 
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all shadow-sm"
              title={language === 'es' ? 'Cerrar' : language === 'fr' ? 'Fermer' : 'Fèmen'}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {visibleMessages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          const isMenuOpen = activeMenuId === msg.id;

          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-2.5 group ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                <UserAvatar 
                  photoURL={msg.senderAvatar}
                  username={msg.senderName}
                  size={32}
                />
              </div>

              {/* Message Bubble Container */}
              <div className="max-w-[70%] space-y-1 relative group">
                {!isOwn && (
                  <p className="text-[11px] font-bold text-[#64748B] ml-1">
                    {msg.senderName}
                  </p>
                )}

                {(() => {
                  const emojiId = !msg.deleted ? msg.text.match(/^\[animated-emoji:(.+)\]$/)?.[1] : null;
                  
                  if (emojiId) {
                    return (
                      <div className="flex flex-col items-center py-1.5 px-2 relative group/emoji">
                        <AnimatedEmoji id={emojiId} size={56} />
                        <div className={`text-[8.5px] mt-1 font-bold text-[#64748B] opacity-0 group-hover/emoji:opacity-100 transition-opacity`}>
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      className={`px-4 py-2.5 rounded-3xl text-[13.5px] leading-relaxed shadow-sm relative ${
                        msg.deleted
                          ? 'bg-gray-100 text-gray-400 italic'
                          : isOwn
                          ? 'bg-[#0A84FF] text-white rounded-tr-none'
                          : 'bg-white text-[#0F172A] rounded-tl-none border border-black/5'
                      }`}
                    >
                      {msg.deleted ? (
                        <span>
                          {language === 'es' 
                            ? 'Este mensaje ha sido eliminado' 
                            : language === 'fr' 
                            ? 'Ce message a été supprimé' 
                            : 'Mesaj sa a efase'}
                        </span>
                      ) : (
                        <span>{msg.text}</span>
                      )}

                      {/* Time Badge inside/below bubble */}
                      <div className={`text-[8.5px] mt-1 text-right font-medium ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Options Menu for non-deleted messages */}
              {!msg.deleted && (
                <div className="relative align-middle self-center">
                  <button 
                    onClick={() => setActiveMenuId(isMenuOpen ? null : msg.id)}
                    className="p-1 rounded-full hover:bg-black/5 text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 bottom-full mb-1 z-20 bg-white border border-black/5 rounded-2xl shadow-xl py-1 min-w-[120px] overflow-hidden">
                        {isOwn ? (
                          <button
                            onClick={() => { handleDelete(msg.id); setActiveMenuId(null); }}
                            className="w-full px-3 py-2 text-left text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {language === 'es' ? 'Eliminar' : language === 'fr' ? 'Supprimer' : 'Efase'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => { handleReport(msg.id); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-left text-[12px] font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-1.5"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              {language === 'es' ? 'Reportar' : language === 'fr' ? 'Signaler' : 'Rapòte'}
                            </button>
                            <button
                              onClick={() => { handleBlock(msg.senderId, msg.senderName); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-left text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              {language === 'es' ? 'Bloquear' : language === 'fr' ? 'Bloquer' : 'Bloke'}
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
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
