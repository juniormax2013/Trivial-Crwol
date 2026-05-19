'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserAvatarProps {
  photoURL?: string | null;
  activeFrame?: string | null;
  username?: string;
  size?: number; // default: 48
  className?: string;
  animate?: boolean;
}

export default function UserAvatar({
  photoURL,
  activeFrame,
  username,
  size = 48,
  className = '',
  animate = true
}: UserAvatarProps) {
  const isGoldFrame = activeFrame === 'gold';
  const isFireFrame = activeFrame === 'fire';
  const isCrownFrame = activeFrame === 'crown';
  const isDefaultFrame = !isGoldFrame && !isFireFrame && !isCrownFrame;
  const hasFrame = true;
  
  // Outer size styling
  const sizeStyles = {
    width: `${size}px`,
    height: `${size}px`,
  };

  // If a frame is active, the profile image needs to be inset perfectly within the cutout (approx 76% of total size)
  const imageSizeStyles = hasFrame
    ? {
        width: '76%',
        height: '76%',
      }
    : {
        width: '100%',
        height: '100%',
      };

  const avatarClass = hasFrame ? 'rounded-[22%]' : 'rounded-full';

  // Render the core profile image or the placeholder
  const renderAvatarContent = () => {
    if (photoURL) {
      return (
        <Image
          src={photoURL}
          alt={username || "User avatar"}
          width={size}
          height={size}
          className={`object-cover w-full h-full transition-all duration-300 ${avatarClass}`}
          priority={size > 64}
        />
      );
    }

    // Elegant fallback showing the first letter or standard icon
    const fallbackLetter = username ? username.charAt(0).toUpperCase() : '';

    return (
      <div 
        className={`w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#ede7f6] to-[#f3e5f5] text-[#310065] font-black transition-all duration-300 ${
          hasFrame ? 'rounded-[22%] text-lg' : 'rounded-full text-base'
        }`}
        style={{ fontSize: hasFrame ? `${size * 0.35}px` : `${size * 0.4}px` }}
      >
        {fallbackLetter ? (
          fallbackLetter
        ) : (
          <User style={{ width: '50%', height: '50%' }} className="text-[#310065]/40" />
        )}
      </div>
    );
  };

  // Outer container motion wrapper
  const containerContent = (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={sizeStyles}
    >
      {/* Avatar Image container (inset if frame is active) */}
      <div 
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={imageSizeStyles}
      >
        {renderAvatarContent()}
      </div>

      {/* Basic Default Frame ("Kadr Defo") SVG Overlay */}
      {isDefaultFrame && (
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

      {/* Premium Gold Frame Overlay */}
      {isGoldFrame && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
          <Image
            src="/assets/store/frames/gold.png"
            alt="Gold frame"
            width={size}
            height={size}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(203,167,47,0.45)]"
            priority
          />
          {/* Elegant shine effect */}
          <div className="absolute inset-0 rounded-[14%] overflow-hidden opacity-90 pointer-events-none">
            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-[shine_3s_infinite_ease-in-out]" />
          </div>
        </div>
      )}

      {/* Premium Fire Frame Overlay */}
      {isFireFrame && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none animate-fire-pulse">
          <Image
            src="/assets/store/frames/fire.png"
            alt="Fire frame"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      )}

      {/* Premium Crown Frame Overlay */}
      {isCrownFrame && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none animate-crown-glow">
          <Image
            src="/assets/store/frames/crown.png"
            alt="Crown frame"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            priority
          />
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

