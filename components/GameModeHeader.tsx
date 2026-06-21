'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface GameModeHeaderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  backHref?: string;
  children?: ReactNode;
}

export default function GameModeHeader({ title, subtitle, icon, backHref = '/arena', children }: GameModeHeaderProps) {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-[#1b1b1e]/5 pt-safe shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(backHref)}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#1b1b1e]/5 flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight flex items-center gap-2">
              {icon}
              {title}
            </h1>
            <p className="text-[11px] font-bold text-[#7c7483] uppercase tracking-wider">
              {subtitle}
            </p>
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
