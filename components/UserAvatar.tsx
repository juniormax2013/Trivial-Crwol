'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserAvatarProps {
  photoURL?: string | null;
  activeFrame?: string | null;
  username?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

// Normaliza cualquier variante de ID al nombre del PNG
function normalizeFrameId(activeFrame?: string | null): string | null {
  if (!activeFrame) return null;
  const aliases: Record<string, string> = {
    gold_frame:  'gold',
    fire_frame:  'fire',
    crown_frame: 'crown',
    crow_frame:  'crown',
  };
  return aliases[activeFrame] ?? activeFrame;
}

// Animaciones CSS especiales por frame
const FRAME_ANIMATIONS: Record<string, string> = {
  fire:    'animate-fire-pulse',
  crown:   'animate-crown-glow',
  legend:  'animate-pulse',
  victory: '',
  angel:   '',
  sky:     '',
  nature:  '',
  glory:   'animate-pulse',
  gold:    '',
};

export default function UserAvatar({
  photoURL,
  activeFrame,
  username,
  size = 48,
  className = '',
  animate = true,
}: UserAvatarProps) {
  const frameId = normalizeFrameId(activeFrame);
  const hasFrame = true;

  const sizeStyles = { width: `${size}px`, height: `${size}px` };
  const imageSizeStyles = { width: '76%', height: '76%' };
  const avatarClass = 'rounded-[22%]';

  const renderAvatarContent = () => {
    if (photoURL) {
      return (
        <Image
          src={photoURL}
          alt={username || 'User avatar'}
          width={size}
          height={size}
          className={`object-cover w-full h-full transition-all duration-300 ${avatarClass}`}
          priority={size > 64}
        />
      );
    }
    const fallbackLetter = username ? username.charAt(0).toUpperCase() : '';
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#ede7f6] to-[#f3e5f5] text-[#310065] font-black ${avatarClass}`}
        style={{ fontSize: `${size * 0.35}px` }}
      >
        {fallbackLetter || (
          <User style={{ width: '50%', height: '50%' }} className="text-[#310065]/40" />
        )}
      </div>
    );
  };

  const containerContent = (
    <div className={`relative flex items-center justify-center ${className}`} style={sizeStyles}>
      {/* Foto/avatar */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={imageSizeStyles}
      >
        {renderAvatarContent()}
      </div>

      {/* Frame por defecto (sin frame activo) */}
      {!frameId && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="defaultFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <rect x="3" y="3" width="94" height="94" rx="22" stroke="url(#defaultFrameGrad)" strokeWidth="3.5" />
            <rect x="6" y="6" width="88" height="88" rx="19" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* Frame dinámico — funciona para cualquier ID que exista en /assets/store/frames/ */}
      {frameId && (
        <div
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 select-none ${
            FRAME_ANIMATIONS[frameId] ?? ''
          }`}
        >
          <Image
            src={`/assets/store/frames/${frameId}.png`}
            alt={`${frameId} frame`}
            width={size}
            height={size}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
            priority
          />
          {/* Brillo animado solo para gold */}
          {frameId === 'gold' && (
            <div className="absolute inset-0 rounded-[14%] overflow-hidden opacity-90 pointer-events-none">
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-[shine_3s_infinite_ease-in-out]" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (animate && hasFrame) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, rotate: 1 }}
        whileTap={{ scale: 0.96 }}
        className="cursor-pointer"
        style={sizeStyles}
      >
        {containerContent}
      </motion.div>
    );
  }

  return containerContent;
}
