'use client';

import Link from 'next/link';
import { Home, Swords, Crown, Users, UserCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

interface BottomNavProps {
  activeTab: 'home' | 'play' | 'ranking' | 'social' | 'profile';
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const t = useT();

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white border-t border-[#310065]/5 shadow-[0_-10px_40px_-15px_rgba(49,0,101,0.08)] pb-safe">
      <div className="flex justify-around items-center w-full h-[76px] px-2">
        
        <Link href="/" className={`flex flex-col items-center justify-center transition-all w-16 active:scale-95 ${activeTab === 'home' ? 'text-[#310065] scale-105' : 'text-[#7c7483] hover:text-[#310065]'}`}>
          <Home className="w-6 h-6 mb-1" />
          <span className={`text-[9px] tracking-wide uppercase ${activeTab === 'home' ? 'font-bold' : 'font-semibold'}`}>{t.nav.home}</span>
        </Link>
        
        <Link href="/arena" className={`flex flex-col items-center justify-center transition-all w-16 active:scale-95 ${activeTab === 'play' ? 'text-[#310065] scale-105' : 'text-[#7c7483] hover:text-[#310065]'}`}>
          <Swords className="w-6 h-6 mb-1" />
          <span className={`text-[9px] tracking-wide uppercase ${activeTab === 'play' ? 'font-bold' : 'font-semibold'}`}>{t.nav.play}</span>
        </Link>
        
        <Link href="/ranking" className={`flex flex-col items-center justify-center transition-all w-16 active:scale-95 ${activeTab === 'ranking' ? 'text-[#310065] scale-105' : 'text-[#7c7483] hover:text-[#310065]'}`}>
          <Crown className={`w-6 h-6 mb-1 ${activeTab === 'ranking' ? 'fill-[#310065] stroke-[#310065]' : ''}`} />
          <span className={`text-[9px] tracking-wide uppercase ${activeTab === 'ranking' ? 'font-bold' : 'font-semibold'}`}>{t.nav.ranking}</span>
        </Link>
        
        <Link href="/social" className={`flex flex-col items-center justify-center transition-all w-16 active:scale-95 ${activeTab === 'social' ? 'text-[#310065] scale-105' : 'text-[#7c7483] hover:text-[#310065]'}`}>
          <Users className={`w-6 h-6 mb-1 ${activeTab === 'social' ? 'fill-[#310065] stroke-[#310065]' : ''}`} />
          <span className={`text-[9px] tracking-wide uppercase ${activeTab === 'social' ? 'font-bold' : 'font-semibold'}`}>{t.nav.social}</span>
        </Link>
        
        <Link href="/profile" className={`flex flex-col items-center justify-center transition-all w-16 active:scale-95 ${activeTab === 'profile' ? 'text-[#310065] scale-105' : 'text-[#7c7483] hover:text-[#310065]'}`}>
          <UserCircle className={`w-6 h-6 mb-1 ${activeTab === 'profile' ? 'fill-[#310065] stroke-[#310065]' : ''}`} />
          <span className={`text-[9px] tracking-wide uppercase ${activeTab === 'profile' ? 'font-bold' : 'font-semibold'}`}>{t.nav.profile}</span>
        </Link>
        
      </div>
    </nav>
  );
}
