'use client';

import { useMockAuth } from '@/hooks/useMockAuth';
import { getAvailableMockUsers } from '@/lib/auth/mockAuth';
import { User, RefreshCcw, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * SIMULATION SWITCHER
 * A floating debug widget to toggle between different mock users for testing.
 * NOT FOR PRODUCTION.
 */
export default function SimulationSwitcher() {
  const { currentUid, switchUser } = useMockAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const users = getAvailableMockUsers();
  const currentUser = users.find(u => u.uid === currentUid) || users[0];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Popover menu */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-black/5 p-2 min-w-[200px] mb-2 animate-in fade-in slide-in-from-bottom-4 transition-all overflow-hidden font-sans">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#7c7483] border-b border-black/5 mb-1">
            Simular Usuario
          </p>
          <div className="space-y-1">
            {users.map((u) => (
              <button
                key={u.uid}
                onClick={() => {
                  switchUser(u.uid);
                  setIsOpen(false);
                  window.location.reload(); // Hard reload to reset all mock repo caches
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                  u.uid === currentUid 
                    ? 'bg-[#310065] text-white' 
                    : 'text-[#1b1b1e] hover:bg-[#f5f3f7]'
                }`}
              >
                {u.name}
                {u.uid === currentUid && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1b1b1e] text-white px-4 py-3 rounded-2xl shadow-xl hover:bg-[#310065] transition-all active:scale-95 group border border-white/10"
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-left pr-2">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-50 leading-none mb-0.5">Activo</p>
          <p className="text-[13px] font-bold leading-none truncate max-w-[120px]">{currentUser.name}</p>
        </div>
        <ChevronUp className={`w-4 h-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
