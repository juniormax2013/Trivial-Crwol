'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getUser } from '@/lib/user/repository';
import { AppUserModel } from '@/lib/user/models';

import { useT } from '@/lib/i18n/context';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserFound: (user: AppUserModel) => void;
}

export default function QrScannerModal({ isOpen, onClose, onUserFound }: QrScannerModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    if (!isOpen) return;

    // We must wait a tick for the DOM to render the container
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = async (decodedText: string) => {
      // Assuming the QR code contains the UID
      try {
        scanner.pause();
        setLoading(true);
        setErrorDesc(null);

        // Avoid self-scan by checking later, but just fetch first
        const scannedUser = await getUser(decodedText.trim());
        
        if (scannedUser) {
          scanner.clear();
          onUserFound(scannedUser);
        } else {
          setErrorDesc(t.social.noUserFound);
          setTimeout(() => scanner.resume(), 2000);
        }
      } catch (err) {
        console.error(err);
        setErrorDesc(t.social.errorSearching);
        setTimeout(() => scanner.resume(), 2000);
      } finally {
        setLoading(false);
      }
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(e => console.error("Scanner cleanup error", e));
    };
  }, [isOpen, onUserFound, t.social.noUserFound, t.social.errorSearching]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm relative">
        
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-white/70 p-2 rounded-full transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="font-serif text-[22px] font-bold text-white mb-6 text-center">{t.social.scanTitle}</h2>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] overflow-hidden shadow-2xl">
          <div id="qr-reader" className="w-full rounded-[1.5rem] overflow-hidden"></div>
        </div>

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
            <p className="text-white/80 text-[13px] font-medium tracking-wide">{t.social.searchingPilgrim}</p>
          </div>
        )}

        {errorDesc && (
         <div className="mt-6 bg-red-500/20 text-red-200 px-4 py-3 rounded-xl border border-red-500/30 text-center text-[13px] font-bold">
           {errorDesc}
         </div> 
        )}
        
      </div>
    </div>
  );
}
