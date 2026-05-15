'use client';

import { useState, useEffect } from 'react';
import { Download as DownloadIcon, X, Share } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import Image from 'next/image';
import { getGameEngineConfig } from '@/lib/admin/settings-repository';

export default function InstallPrompt() {
  const { isReady, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkConfig = async () => {
      try {
        const config = await getGameEngineConfig();
        if (!config.pwa?.showInstallPrompt) {
          console.log('PWA: Install prompt is disabled in admin settings');
          return;
        }

        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        setIsIos(isIosDevice);

        // Only show if not installed
        if (!isStandalone) {
          timer = setTimeout(() => {
            setIsVisible(true);
          }, 5000); // Wait 5 seconds before showing
        }
      } catch (error) {
        console.error('Error checking PWA config:', error);
      }
    };

    checkConfig();
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  // Render iOS instructions or Android/Desktop button
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-[#310065]/10 p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#310065]/5 rounded-full blur-3xl pointer-events-none" />

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1.5 text-[#7c7483] hover:text-[#310065] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative bg-[#310065] rounded-2xl overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
            <Image 
              src="/icons/icon-192.png" 
              alt="Bible Crown" 
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-1">
            <h3 className="font-serif text-lg font-black text-[#310065]">Bible Crown</h3>
            <p className="text-[13px] font-medium text-[#7c7483] leading-tight">
              {isIos 
                ? 'Instale sou ekran lakay ou pou yon pi bon eksperyans' 
                : 'Enstale aplikasyon an sou telefòn ou kounye a'
              }
            </p>
          </div>
        </div>

        <div className="mt-5">
          {isIos ? (
            <div className="bg-[#310065]/5 p-3 rounded-2xl border border-[#310065]/10 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Share className="w-5 h-5 text-[#310065]" />
              </div>
              <p className="text-[12px] font-bold text-[#310065]">
                Peze bouton <span className="underline">Pataje (Share)</span>, epi chwazi <span className="underline">Añadir a pantalla de inicio</span>.
              </p>
            </div>
          ) : (
            <button 
              onClick={installApp}
              disabled={!isReady}
              className="w-full bg-[#310065] text-white font-black py-4 rounded-2xl shadow-[0_8px_20px_rgba(49,0,101,0.2)] flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>Instale Aplikasyon an</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
