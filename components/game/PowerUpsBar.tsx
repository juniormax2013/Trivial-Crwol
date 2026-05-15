'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Zap, FastForward, Flag } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { consumePower } from '@/lib/store/repository';
import { toast } from 'sonner';

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
    name: 'Retire 2 Repons', 
    icon: '/assets/store/powers/remove-two.png'
  },
  { 
    id: 'hint', 
    name: 'Endis Biblik', 
    icon: '/assets/store/powers/hint-bible.png',
    dbId: 'hintBible'
  },
  { 
    id: 'freezeTime', 
    name: 'Glase Tan', 
    icon: '/assets/store/powers/freeze-time.png'
  },
  { 
    id: 'secondChance', 
    name: 'Dezyèm Chans', 
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
  const [missingPowerModal, setMissingPowerModal] = useState<{show: boolean, name: string}>({show: false, name: ''});

  const handlePowerClick = async (powerId: string, powerName: string, dbId?: string) => {
    if (!user || isProcessing || disabled) return;

    if (activePowerUps.includes(powerId)) {
      toast.info(`Ou deja itilize ${powerName} nan kesyon sa!`);
      return;
    }

    const inventory = user.inventory || {};
    
    // Logic to select which ID to consume: prefer dbId if it has charges, fallback to powerId
    let idToConsume = powerId;
    if (dbId && (inventory[dbId] || 0) > 0) {
      idToConsume = dbId;
    } else if (inventory[powerId] !== undefined && (inventory[powerId] || 0) > 0) {
      idToConsume = powerId;
    } else if (dbId) {
      // If dbId is defined but we have no charges in either, 
      // we'll default to dbId for the 'missing power' check/modal
      idToConsume = dbId;
    }

    const qty = inventory[idToConsume] || 0;

    if (qty > 0) {
      // Trigger the effect optimistically for immediate feedback
      onPowerUsed(powerId);
      
      // Run the database transaction in the background to avoid freezing the UI
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
    <div className="w-full mt-auto space-y-4">
      {/* Title Section */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[14px] font-black text-[#7c7483] tracking-wider uppercase">
          Pouvwa ou yo
        </h3>
        <button 
          onClick={() => window.dispatchEvent(new Event('open-store'))}
          className="text-[11px] font-black text-[#310065] hover:text-[#4a148c] transition-colors uppercase tracking-widest"
        >
          BOUTIK {'>'}
        </button>
      </div>
      
      {/* Power-ups Grid */}
      <div className="grid grid-cols-4 gap-2">
        {POWER_UPS.map((power) => {
          // Aggregate count from both possible IDs (legacy support)
          const count = (power.dbId ? (inventory[power.dbId] || 0) : 0) + (inventory[power.id] || 0);
          const isActive = activePowerUps.includes(power.id);
          const isDisabled = isProcessing || disabled || isActive;
          
          return (
            <motion.button
              key={power.id}
              whileTap={!isDisabled ? { y: 4, scale: 0.98 } : {}}
              onClick={() => handlePowerClick(power.id, power.name, power.dbId)}
              disabled={isDisabled}
              className={`group relative flex flex-col items-center pt-5 pb-2 rounded-[1.5rem] border transition-all ${
                isActive 
                  ? 'border-[#310065] bg-[#310065]/5 shadow-[0_2px_0_0_#310065]' 
                  : isDisabled 
                  ? 'opacity-50 grayscale border-gray-100 bg-gray-50' 
                  : 'border-[#f0f0f5] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.03),0_4px_0_0_#efedf1] hover:shadow-[0_2px_0_0_#efedf1] hover:translate-y-[2px]'
              }`}
            >
              {/* Icon Container */}
              <div className="relative w-12 h-12 mb-3 transform group-hover:scale-110 transition-transform duration-300">
                <Image 
                  src={power.icon} 
                  alt={power.name} 
                  fill 
                  className="object-contain drop-shadow-sm"
                />
              </div>
              
              {/* Label */}
              <span className="text-[9px] font-black text-[#1b1b1e] uppercase tracking-tight text-center leading-none mb-3 px-1 h-6 flex items-center">
                {power.name}
              </span>
              
              {/* Count Badge - Repositioned to bottom like screenshot */}
              <div className={`mt-auto px-4 py-0.5 rounded-xl text-[11px] font-black text-white ${
                count > 0 ? 'bg-[#310065]' : 'bg-gray-400'
              }`}>
                x{count}
              </div>

              {/* Active Overlay */}
              {isActive && (
                <div className="absolute inset-0 bg-[#310065]/5 backdrop-blur-[1px] rounded-[1.5rem] flex items-center justify-center">
                  <div className="bg-[#310065] rounded-full p-1 shadow-lg border-2 border-white animate-pulse">
                    <Zap className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>


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
