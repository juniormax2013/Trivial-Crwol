'use client';

import React from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Snowflake, 
  ShieldCheck, 
  Plus,
  Loader2
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/context';

const POWER_UPS = [
  { 
    id: '50-50', 
    dbId: 'removeTwo', 
    icon: Sparkles, 
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50'
  },
  { 
    id: 'hint', 
    dbId: 'hintBible', 
    legacyId: 'hint',
    icon: Lightbulb, 
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50'
  },
  { 
    id: 'freeze', 
    dbId: 'freezeTime', 
    icon: Snowflake, 
    color: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-50'
  },
  { 
    id: 'chance', 
    dbId: 'secondChance', 
    icon: ShieldCheck, 
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50'
  }
];

export const PowerUpsInventory = () => {
  const { user, loading } = useAuthContext();
  const t = useT();

  const handleOpenStore = () => {
    window.dispatchEvent(new Event('open-store'));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-6 border border-[#eddcff] shadow-sm flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-6 h-6 text-[#310065] animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-serif text-xl font-bold text-[#310065]">
          {t.powers.availableTitle || 'POUVWA KI DISPONIB'}
        </h3>
        <button 
          onClick={handleOpenStore}
          className="text-[11px] font-black text-[#4a148c] uppercase tracking-wider bg-[#eddcff] px-3 py-1 rounded-full active:scale-95 transition-transform"
        >
          {t.common.buy || 'ACHTE'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {POWER_UPS.map((power) => {
          const inventory = user?.inventory || {};
          // Aggregate count: main dbId + legacyId if defined
          const count = (inventory[power.dbId] || 0) + (power.legacyId ? (inventory[power.legacyId] || 0) : 0);
          const Icon = power.icon;

          return (
            <div 
              key={power.id}
              className="bg-white rounded-2xl p-3 border border-[#eddcff] shadow-sm flex items-center justify-between group hover:border-[#310065]/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${power.color} flex items-center justify-center shadow-lg shadow-black/5`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-tighter">
                    {(t.powers as any)[power.dbId === 'removeTwo' ? 'fiftyFifty' : power.dbId.replace('Time', '').replace('Bible', '')] || power.id}
                  </p>
                  <p className="text-lg font-black text-[#310065] leading-none">
                    x{count}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleOpenStore}
                className="w-7 h-7 rounded-lg bg-[#f5f3f7] flex items-center justify-center text-[#310065] hover:bg-[#310065] hover:text-white transition-colors active:scale-90"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
