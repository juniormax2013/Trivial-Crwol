'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { getFramePower, canUseFramePower } from '@/lib/game/frame-powers';
import * as motion from 'motion/react-client';
import { Zap, Crown, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface FramePowerButtonProps {
  onPowerUsed: (powerId: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export default function FramePowerButton({
  onPowerUsed,
  isProcessing = false,
  disabled = false,
}: FramePowerButtonProps) {
  const { user } = useAuthContext();
  const [hasUsed, setHasUsed] = useState(false);

  const framePower = getFramePower(user?.activeFrame);
  if (!user || !framePower) return null;

  const userLevel = user.level ?? 1;
  const isLocked = !canUseFramePower(user.activeFrame, userLevel);
  const levelsNeeded = framePower.minLevel - userLevel;

  const handleActivate = () => {
    if (isProcessing || disabled || hasUsed) return;

    if (isLocked) {
      toast.error(
        `Nivel ${framePower.minLevel} requerido. Te faltan ${levelsNeeded} niveles.`,
        { icon: '🔒' }
      );
      return;
    }

    framePower.effects.forEach((effectId) => {
      onPowerUsed(effectId);
    });

    setHasUsed(true);
    toast.success(`${framePower.name} aktive!`);
  };

  return (
    <div className="w-full flex justify-center mb-4">
      <motion.button
        whileTap={!hasUsed && !disabled && !isLocked ? { y: 2, scale: 0.95 } : {}}
        onClick={handleActivate}
        disabled={hasUsed || isProcessing || disabled}
        className={`relative flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all overflow-hidden ${
          hasUsed
            ? 'bg-[#f5f3f7] border-[#e3e2e6] opacity-50 grayscale cursor-not-allowed'
            : isLocked
            ? 'bg-[#f5f3f7] border-[#e3e2e6] cursor-pointer hover:border-[#7c7483]'
            : 'bg-gradient-to-r from-[#e9c349]/10 to-[#cba72f]/10 border-[#e9c349] hover:bg-[#e9c349]/20 hover:shadow-[0_4px_16px_rgba(233,195,73,0.3)] shadow-sm'
        }`}
      >
        {/* Shine animation only when unlocked and unused */}
        {!hasUsed && !isLocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
        )}

        {/* Icon */}
        <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-sm ${
          isLocked ? 'bg-[#e3e2e6]' : 'bg-white'
        }`}>
          {isLocked ? (
            <Lock className="w-4 h-4 text-[#7c7483]" />
          ) : framePower.id === 'crown' || framePower.id === 'crow' ? (
            <Crown className="w-4 h-4 text-[#cba72f] fill-[#ffe088]" />
          ) : (
            <Zap className="w-4 h-4 text-[#cba72f] fill-[#ffe088]" />
          )}
        </div>

        {/* Label */}
        <div className="relative z-10 flex flex-col items-start">
          <span className={`text-[12px] font-black tracking-wider uppercase leading-tight ${
            hasUsed || isLocked ? 'text-[#7c7483]' : 'text-[#cba72f]'
          }`}>
            {isLocked ? `Nivel ${framePower.minLevel} requerido` : framePower.name}
          </span>
          <span className={`text-[9px] font-bold ${
            hasUsed || isLocked ? 'text-[#7c7483]/70' : 'text-[#1b1b1e]/70'
          }`}>
            {hasUsed
              ? 'DEJA ITILIZE'
              : isLocked
              ? `TE FALTAN ${levelsNeeded} NIVELES`
              : '1 FWA POU CHAK JWÈT'}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
