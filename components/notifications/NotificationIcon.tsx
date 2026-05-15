'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationIcon() {
  const { unreadCount, setDrawerOpen } = useNotifications();

  return (
    <>
      <button 
        onClick={() => setDrawerOpen(true)}
        className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
