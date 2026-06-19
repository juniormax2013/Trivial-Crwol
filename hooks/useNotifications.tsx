'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ArenaInvitation } from '@/lib/arena/models';
import { DuelModel } from '@/lib/duel/models';
import { ChatRoom } from '@/lib/chat/chatTypes';
import { subscribeToArenaInvitations } from '@/lib/arena/repository';
import { subscribeToDuelsForUser } from '@/lib/duel/repository';
import { subscribeToUserChats, getTimestampMs } from '@/lib/chat/chatService';

interface NotificationContextType {
  arenaInvitations: ArenaInvitation[];
  duelInvitations: DuelModel[];
  unreadChatRooms: ChatRoom[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  refreshUnreadChats: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [arenaInvitations, setArenaInvitations] = useState<ArenaInvitation[]>([]);
  const [duelInvitations, setDuelInvitations] = useState<DuelModel[]>([]);
  const [unreadChatRooms, setUnreadChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastReadVersion, setLastReadVersion] = useState(0);

  const refreshUnreadChats = () => {
    setLastReadVersion(prev => prev + 1);
  };

  useEffect(() => {
    if (!user) {
      setArenaInvitations([]);
      setDuelInvitations([]);
      setUnreadChatRooms([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to Arena Invitations
    const unsubArena = subscribeToArenaInvitations(user.uid, (invitations) => {
      setArenaInvitations(invitations);
      setIsLoading(false);
    });

    // Subscribe to Duel Invitations
    const unsubDuels = subscribeToDuelsForUser(user.uid, (duels) => {
      // Filter only pending duels where user is invited
      const pendingDuels = duels.filter(
        (d) => d.status === 'pending' && d.createdBy !== user.uid
      );
      setDuelInvitations(pendingDuels);
      setIsLoading(false);
    });

    // Subscribe to User Chats
    const unsubChats = subscribeToUserChats(user.uid, user.clanId, (chats) => {
      const lastReadString = localStorage.getItem('last_read_chats') || '{}';
      const lastReadMap = JSON.parse(lastReadString);

      const unreadList = chats.filter(chat => {
        if ((chat.type === 'private' || chat.type === 'clan') && chat.lastMessage && chat.lastMessageSenderId !== user.uid) {
          const lastMessageMs = getTimestampMs(chat.lastMessageAt);
          const lastReadMs = lastReadMap[chat.id] || 0;
          return lastMessageMs > lastReadMs;
        }
        return false;
      });

      setUnreadChatRooms(unreadList);
      setIsLoading(false);
    });

    return () => {
      unsubArena();
      unsubDuels();
      unsubChats();
    };
  }, [user, lastReadVersion]);

  // Listen for local changes to unread status
  useEffect(() => {
    const handleChatRead = () => {
      refreshUnreadChats();
    };
    window.addEventListener('chat-read', handleChatRead);
    return () => window.removeEventListener('chat-read', handleChatRead);
  }, []);

  const totalCount = arenaInvitations.length + duelInvitations.length + unreadChatRooms.length;
  const unreadCount = totalCount;

  return (
    <NotificationContext.Provider
      value={{
        arenaInvitations,
        duelInvitations,
        unreadChatRooms,
        unreadCount,
        totalCount,
        isLoading,
        isDrawerOpen,
        setDrawerOpen: setIsDrawerOpen,
        refreshUnreadChats,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
