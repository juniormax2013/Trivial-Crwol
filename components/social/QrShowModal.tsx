'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { X, Copy, Check } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

interface QrShowModalProps {
  uid: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QrShowModal({ uid, isOpen, onClose }: QrShowModalProps) {
  const [copied, setCopied] = React.useState(false);
  const t = useT();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-[#7c7483] hover:bg-[#f5f3f7] p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-serif text-[22px] font-bold text-[#310065] mb-2">{t.social.qrModalTitle}</h2>
          <p className="text-[13px] text-[#7c7483] font-medium leading-relaxed">
            {t.social.qrModalDesc}
          </p>
        </div>

        <div className="bg-[#f5f3f7] p-6 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner border border-[#e3e2e6]">
          <QRCode 
            className="w-full max-w-[200px] h-auto"
            value={uid} 
            bgColor="transparent"
            fgColor="#310065"
          />
        </div>

        <button 
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f5f3f7] hover:bg-[#e3e2e6] text-[#310065] font-bold rounded-xl transition-colors active:scale-95"
        >
          {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          <span className="text-[13px] uppercase tracking-widest">{copied ? t.social.copied : t.social.copyId}</span>
        </button>
      </div>
    </div>
  );
}
