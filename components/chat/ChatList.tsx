'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/lib/i18n/context';
import { subscribeToUserChats, getTimestampMs } from '@/lib/chat/chatService';
import { ChatRoom } from '@/lib/chat/chatTypes';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import UserAvatar from '@/components/UserAvatar';
import { MessageSquare, ShieldAlert, Swords, Globe } from 'lucide-react';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string | null;
}

export default function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'global'>('all');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserChats(user.uid, (chats) => {
      // Filter out match rooms so they are only accessible in-game
      const filteredChats = chats.filter(c => c.type !== 'match');
      
      const hasGlobal = filteredChats.some(c => c.id === 'global_main');
      let updatedChats = [...filteredChats];
      if (!hasGlobal) {
        updatedChats.unshift({
          id: 'global_main',
          type: 'global',
          participants: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: 'Chat de la comunidad',
          lastMessageSenderId: '',
          lastMessageAt: new Date(),
        });
      }
      setRooms(updatedChats);
    });
    return () => unsub();
  }, [user?.uid]);

  const filteredRooms = rooms.filter((room) => {
    if (activeTab === 'all') return true;
    return room.type === activeTab;
  });

  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case 'all':
        return language === 'es' ? 'Todos' : language === 'fr' ? 'Tous' : 'Tout';
      case 'private':
        return language === 'es' ? 'Privados' : language === 'fr' ? 'Privés' : 'Prive';
      case 'global':
        return language === 'es' ? 'Global' : language === 'fr' ? 'Global' : 'Global';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-black/5">
        <h1 className="text-xl font-black text-[#0F172A] tracking-tight mb-4">
          {language === 'es' ? 'Mensajería' : language === 'fr' ? 'Messagerie' : 'Mesaj'}
        </h1>
        {/* iOS style Segmented Control */}
        <div className="flex gap-1 bg-gray-50 p-1 rounded-2xl border border-black/[0.03]">
          {(['all', 'private', 'global'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#0A84FF] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </header>

      {/* Chat list items */}
      <div className="flex-1 overflow-y-auto divide-y divide-black/[0.03]">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'es' ? 'Sin chats' : language === 'fr' ? 'Aucun chat' : 'Pa gen chat'}
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <ChatRoomItem 
              key={room.id}
              room={room}
              currentUserId={user?.uid || ''}
              isSelected={selectedChatId === room.id}
              onClick={() => onSelectChat(room.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ChatRoomItemProps {
  room: ChatRoom;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}

function ChatRoomItem({ room, currentUserId, isSelected, onClick }: ChatRoomItemProps) {
  const { language } = useLanguage();
  const [resolvedName, setResolvedName] = useState(room.displayName || '');
  const [resolvedAvatar, setResolvedAvatar] = useState(room.photoURL || '');
  const [loading, setLoading] = useState(room.type === 'private');

  useEffect(() => {
    if (room.type !== 'private') return;
    const otherUserId = room.participants.find(id => id !== currentUserId);
    if (!otherUserId) return;

    // Fetch user details
    const fetchUser = async () => {
      try {
        const docRef = doc(db, 'users', otherUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setResolvedName(data.firstName || data.fullName || data.username || 'Peregrino');
          setResolvedAvatar(data.photoURL || '');
        }
      } catch (e) {
        console.error('Error fetching chat user profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [room, currentUserId]);

  const getTitle = () => {
    if (room.type === 'global') {
      return language === 'es' ? 'Chat Global 👑' : language === 'fr' ? 'Chat Global 👑' : 'Chat Global 👑';
    }
    if (room.type === 'match') {
      return language === 'es' ? 'Chat de Partida ⚔️' : language === 'fr' ? 'Chat de Match ⚔️' : 'Chat Jwèt ⚔️';
    }
    return loading ? '...' : resolvedName;
  };

  const getIcon = () => {
    if (room.type === 'global') return <Globe className="w-5 h-5 text-purple-500" />;
    if (room.type === 'match') return <Swords className="w-5 h-5 text-amber-500" />;
    return null;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
        isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="shrink-0 relative">
        {room.type === 'private' ? (
          <UserAvatar 
            photoURL={resolvedAvatar}
            username={resolvedName}
            size={40}
          />
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-black/5 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <p className={`text-[13.5px] font-black truncate ${isSelected ? 'text-[#0A84FF]' : 'text-[#0F172A]'}`}>
            {getTitle()}
          </p>
          {room.lastMessageAt && (
            <span className="text-[10px] text-gray-400 font-medium ml-2 shrink-0">
              {new Date(getTimestampMs(room.lastMessageAt)).toLocaleDateString(
                undefined, 
                { month: 'short', day: 'numeric' }
              )}
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-400 font-medium truncate">
          {room.lastMessage || (language === 'es' ? 'Sin mensajes aún' : language === 'fr' ? 'Pas encore de messages' : 'Pa gen mesaj ankò')}
        </p>
      </div>
    </button>
  );
}
