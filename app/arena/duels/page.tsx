'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Swords, Inbox, Send, Activity, Clock } from 'lucide-react';
import DuelInboxCard from '@/components/duel/DuelInboxCard';
import { DuelModel } from '@/lib/duel/models';
import { subscribeToDuelsForUser } from '@/lib/duel/repository';
import { filterDuelsByTab } from '@/lib/duel/service';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/context';

type Tab = 'received' | 'sent' | 'active' | 'history';

export default function DuelCenterPage() {
  const { user } = useAuthContext();
  const t = useT();
  const userId = user?.uid || 'unknown-user';
  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [allDuels, setAllDuels] = useState<DuelModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const TABS = [
    { key: 'received', label: t.duel.receivedTab, icon: Inbox },
    { key: 'sent',     label: t.duel.sentTab,  icon: Send },
    { key: 'active',   label: t.duel.activeTabLabel,   icon: Activity },
    { key: 'history',  label: t.duel.historyTab, icon: Clock },
  ] as const;

  useEffect(() => {
    if (userId === 'unknown-user') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToDuelsForUser(userId, (duels) => {
      setAllDuels(duels);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleDuelAction = (updatedDuel: DuelModel) => {
    setAllDuels((prev) =>
      prev.map((d) => (d.id === updatedDuel.id ? updatedDuel : d))
    );
  };

  const displayedDuels = filterDuelsByTab(allDuels, userId, activeTab);

  const getBadgeCount = (tab: Tab): number => {
    return filterDuelsByTab(allDuels, userId, tab).length;
  };

  const emptyMessages: Record<Tab, { title: string; body: string }> = {
    received: {
      title: t.duel.noReceivedDuels,
      body: t.duel.noReceivedDuelsDesc,
    },
    sent: {
      title: t.duel.noSentDuels,
      body: t.duel.noSentDuelsDesc,
    },
    active: {
      title: t.duel.noActiveDuels,
      body: t.duel.noActiveDuelsDesc,
    },
    history: {
      title: t.duel.noHistoryDuels,
      body: t.duel.noHistoryDuelsDesc,
    },
  };


  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">

      {/* TopBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-[#1b1b1e]/5 pt-safe">
        <div className="flex items-center justify-between px-5 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/arena"
              className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7c7483]">Arena</p>
              <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight">
                {t.dashboard.duels}
              </h1>
            </div>
          </div>

          <Link
            href="/arena/duels/new"
            className="flex items-center gap-1.5 bg-[#310065] text-white px-4 py-2 rounded-full font-bold text-[13px] shadow-[0_4px_12px_rgba(49,0,101,0.25)] hover:bg-[#4a148c] transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t.duel.newBtn}
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-[#1b1b1e]/5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const count = getBadgeCount(tab.key);
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-fit flex flex-col items-center py-3 px-4 transition-colors relative ${
                  isActive ? 'text-[#310065]' : 'text-[#7c7483]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[12px] font-bold whitespace-nowrap">{tab.label}</span>
                  {count > 0 && (
                    <span className="bg-[#310065] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {count}
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#310065] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="pt-[136px] px-5 max-w-screen-xl mx-auto">

        {isLoading ? (
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[1.75rem] h-48 animate-pulse border border-[#1b1b1e]/5" />
            ))}
          </div>
        ) : displayedDuels.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center pt-20 pb-8 text-center px-6">
            <div className="w-20 h-20 rounded-[1.75rem] bg-[#eddcff]/60 flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(184,137,255,0.15)]">
              <Swords className="w-9 h-9 text-[#310065]" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-[22px] font-bold text-[#310065] mb-2">
              {emptyMessages[activeTab].title}
            </h3>
            <p className="text-[#7c7483] text-[14px] font-medium leading-relaxed max-w-[260px]">
              {emptyMessages[activeTab].body}
            </p>
            {activeTab !== 'history' && (
              <Link
                href="/arena/duels/new"
                className="mt-6 bg-[#310065] text-white px-6 py-3 rounded-full font-bold text-[14px] shadow-[0_4px_12px_rgba(49,0,101,0.25)] hover:bg-[#4a148c] transition-all active:scale-95"
              >
                {t.duel.createDuelBtn}
              </Link>
            )}
          </div>

        ) : (
          <div className="space-y-4 mt-4">
            {displayedDuels.map((duel) => (
              <DuelInboxCard
                key={duel.id}
                duel={duel}
                onAction={handleDuelAction}
                showActions={activeTab === 'received'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
