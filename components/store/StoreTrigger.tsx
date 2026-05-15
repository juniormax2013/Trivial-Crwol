'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const assets = {
  storeBag: '/assets/store/ui/store-bag.png'
};

export default function StoreTrigger() {
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = (e: any) => {
      setIsStoreOpen(e.detail.isOpen);
    };

    window.addEventListener('store-visibility-changed', handleVisibilityChange);
    return () => window.removeEventListener('store-visibility-changed', handleVisibilityChange);
  }, []);

  const openStore = () => {
    window.dispatchEvent(new CustomEvent('open-store'));
  };

  if (isStoreOpen) return null;

  return (
    <button 
      onClick={openStore}
      aria-label="Open Store"
      className="w-[42px] h-[42px] rounded-2xl bg-white shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-black/5 group relative overflow-hidden shrink-0"
    >
      {/* Solid white base to ensure no transparency issues */}
      <div className="absolute inset-0 bg-white shadow-sm"></div>
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="w-7 h-7 relative z-10 transition-all duration-500 group-hover:scale-110">
        <Image 
          src={assets.storeBag} 
          alt="Store" 
          fill 
          className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]" 
          priority
        />
      </div>
      
      {/* Premium indicator dot with pulse */}
      <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#cba72f] rounded-full border-2 border-white shadow-[0_0_8px_rgba(203,167,47,0.4)] z-20 animate-pulse" />
      
      {/* Glassy overlay for depth */}
      <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none"></div>
    </button>
  );
}
