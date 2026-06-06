'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Zap, Shield, Sparkles } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { consumePower } from '@/lib/store/repository';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n/context';

interface PowerUpsBarProps {
  onPowerUsed: (powerId: string) => void;
  onSkip?: () => void;
  onReport?: () => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  disabled?: boolean;
  activePowerUps?: string[];
  heartsCount?: number;
}

const POWER_UPS = [
  { 
    id: 'removeTwo', 
    nameKey: 'removeTwo',
    icon: '/assets/store/powers/remove-two.png'
  },
  { 
    id: 'hint', 
    nameKey: 'hint',
    icon: '/assets/store/powers/hint-bible.png',
    dbId: 'hintBible'
  },
  { 
    id: 'freeze', 
    nameKey: 'freeze',
    icon: '/assets/store/powers/freeze-time.png'
  },
  { 
    id: 'secondChance', 
    nameKey: 'secondChance',
    icon: '/assets/store/powers/second-chance.png'
  }
];

export default function PowerUpsBar({ 
  onPowerUsed, 
  onSkip,
  onReport,
  isProcessing, 
  setIsProcessing,
  disabled = false,
  activePowerUps = [],
  heartsCount
}: PowerUpsBarProps) {
  const { user } = useAuthContext();
  const t = useT();
  const [missingPowerModal, setMissingPowerModal] = useState<{show: boolean, name: string}>({show: false, name: ''});
  const [showPowers, setShowPowers] = useState(false);

  const handlePowerClick = async (powerId: string, powerName: string, dbId?: string) => {
    if (!user || isProcessing || disabled) return;

    const legacyIdMap: Record<string, string> = {
      'freeze': 'freezeTime'
    };
    const mappedId = legacyIdMap[powerId] || powerId;

    if (activePowerUps.includes(mappedId)) {
      toast.info(`Ou deja itilize ${powerName} nan kesyon sa!`);
      return;
    }

    const inventory = user.inventory || {};
    
    let idToConsume = mappedId;
    if (dbId && (inventory[dbId] || 0) > 0) {
      idToConsume = dbId;
    } else if (inventory[mappedId] !== undefined && (inventory[mappedId] || 0) > 0) {
      idToConsume = mappedId;
    } else if (dbId) {
      idToConsume = dbId;
    }

    const qty = inventory[idToConsume] || 0;

    if (qty > 0) {
      onPowerUsed(mappedId);
      consumePower(user.uid, idToConsume)
        .then(() => {
          toast.success(`Pouvwa ${powerName} itilize!`);
        })
        .catch((e: any) => {
          toast.error(e.message || "Erè nan itilize pouvwa a");
        });
    } else {
      setMissingPowerModal({ show: true, name: powerName });
    }
  };

  const inventory = user?.inventory || {};

  return (
    <div className="w-full mt-auto relative">
      {/* Shield Icon Button to Trigger Powerups Panel */}
      <div className="flex justify-start">
        <button
          onClick={() => setShowPowers(!showPowers)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 ${
            showPowers 
              ? 'bg-[#310065] border-[#310065] text-white' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Shield className={`w-4 h-4 ${showPowers ? 'text-white' : 'text-[#310065]'}`} fill={showPowers ? 'currentColor' : 'none'} />
          <span>{t.store.tabPowers}</span>
        </button>
      </div>
      
      {/* Expandable Panel - Compacted and aligned to the left side to avoid characters on the right */}
      {showPowers && (
        <div className="absolute bottom-12 left-0 w-[260px] bg-white/95 backdrop-blur-md border border-[#310065]/10 rounded-[1.5rem] p-3 shadow-xl z-[50] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black text-[#7c7483] tracking-wider uppercase">{t.store.tabPowers}</span>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-store'))}
              className="text-[8px] font-black text-[#310065] hover:text-[#4a148c] transition-colors uppercase tracking-widest"
            >
              {t.dashboard.store} {'>'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {POWER_UPS.map((power) => {
              const legacyIdMap: Record<string, string> = {
                'freeze': 'freezeTime'
              };
              const mappedId = legacyIdMap[power.id] || power.id;
              const count = (power.dbId ? (inventory[power.dbId] || 0) : 0) + (inventory[mappedId] || 0);
              const isActive = activePowerUps.includes(mappedId);
              const isDisabled = isProcessing || disabled || isActive;
              
              // Get translation name from t.powers key
              const powerName = (t.powers as any)[power.nameKey] || power.id;
              
              return (
                <motion.button
                  key={power.id}
                  whileTap={!isDisabled ? { y: 2, scale: 0.98 } : {}}
                  onClick={() => handlePowerClick(power.id, powerName, power.dbId)}
                  disabled={isDisabled}
                  className={`group relative flex flex-col items-center pt-3 pb-1.5 rounded-[1.25rem] border transition-all ${
                    isActive 
                      ? 'border-[#310065] bg-[#310065]/5 shadow-[0_2px_0_0_#310065]' 
                      : isDisabled 
                      ? 'opacity-50 grayscale border-gray-100 bg-gray-50' 
                      : 'border-[#f0f0f5] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02),0_2px_0_0_#efedf1] hover:shadow-[0_1px_0_0_#efedf1] hover:translate-y-[1px]'
                  }`}
                >
                  {/* Smaller Icon Container */}
                  <div className="relative w-8 h-8 mb-1.5 transform group-hover:scale-105 transition-transform duration-300">
                    <Image 
                      src={power.icon} 
                      alt={powerName} 
                      fill 
                      className="object-contain drop-shadow-xs"
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-[8px] font-black text-[#1b1b1e] uppercase tracking-tight text-center leading-none mb-1.5 px-0.5 h-5 flex items-center justify-center">
                    {powerName.split(' ')[0]}
                  </span>
                  
                  {/* Count Badge */}
                  <div className={`mt-auto px-2 py-0.5 rounded-lg text-[9px] font-black text-white ${
                    count > 0 ? 'bg-[#310065]' : 'bg-gray-400'
                  }`}>
                    x{count}
                  </div>

                  {/* Active Overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#310065]/5 backdrop-blur-[1px] rounded-[1.25rem] flex items-center justify-center">
                      <div className="bg-[#310065] rounded-full p-0.5 shadow-lg border border-white animate-pulse">
                        <Zap className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {missingPowerModal.show && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => setMissingPowerModal({show: false, name: ''})}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-black/50 hover:bg-black/10 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="w-20 h-20 bg-[#310065]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-[#310065] fill-[#310065]/20" />
            </div>
            
            <h2 className="text-2xl font-black text-[#1b1b1e] mb-3">Ou pa gen pouvwa sa a</h2>
            <p className="text-[#7c7483] font-medium mb-8">
              Ou pa gen inite <strong className="text-[#310065]">{missingPowerModal.name}</strong> nan envantè w la.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setMissingPowerModal({show: false, name: ''});
                  window.dispatchEvent(new Event('open-store'));
                }}
                className="w-full bg-[#310065] text-white font-bold py-4 rounded-2xl hover:bg-[#4a148c] transition-colors"
              >
                Ale nan Boutik la
              </button>
              <button 
                onClick={() => setMissingPowerModal({show: false, name: ''})}
                className="w-full bg-[#efedf1] text-[#7c7483] font-bold py-4 rounded-2xl hover:bg-[#e3e2e6] transition-colors"
              >
                Tounen nan jwèt la
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
