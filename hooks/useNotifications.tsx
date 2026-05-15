'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ArenaInvitation } from '@/lib/arena/models';
import { DuelModel } from '@/lib/duel/models';
import { subscribeToArenaInvitations } from '@/lib/arena/repository';
import { subscribeToDuelsForUser } from '@/lib/duel/repository';

interface NotificationContextType {
  arenaInvitations: ArenaInvitation[];
  duelInvitations: DuelModel[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [arenaInvitations, setArenaInvitations] = useState<ArenaInvitation[]>([]);
  const [duelInvitations, setDuelInvitations] = useState<DuelModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setArenaInvitations([]);
      setDuelInvitations([]);
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

    return () => {
      unsubArena();
      unsubDuels();
    };
  }, [user]);

  const totalCount = arenaInvitations.length + duelInvitations.length;
  // For now, unread = total pending. We could add a "lastViewed" timestamp in the future.
  const unreadCount = totalCount;

  return (
    <NotificationContext.Provider
      value={{
        arenaInvitations,
        duelInvitations,
        unreadCount,
        totalCount,
        isLoading,
        isDrawerOpen,
        setDrawerOpen: setIsDrawerOpen,
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
