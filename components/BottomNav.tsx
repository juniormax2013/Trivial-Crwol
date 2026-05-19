'use client';

import Link from 'next/link';
import { Home, Swords, Crown, Users, UserCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: 'home' | 'play' | 'ranking' | 'social' | 'profile';
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const t = useT();

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home, href: '/' },
    { id: 'play', label: t.nav.play, icon: Swords, href: '/arena' },
    { id: 'ranking', label: t.nav.ranking, icon: Crown, href: '/ranking' },
    { id: 'social', label: t.nav.social, icon: Users, href: '/social' },
    { id: 'profile', label: t.nav.profile, icon: UserCircle, href: '/profile' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-[0_-10px_35px_rgba(49,0,101,0.03)] pb-safe">
      <div className="flex justify-around items-center w-full h-[76px] px-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Link 
              key={item.id} 
              href={item.href} 
              className="relative py-2 px-1 flex flex-col items-center justify-center w-16 select-none"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="flex flex-col items-center justify-center relative z-10"
              >
                {/* Active Indicator Backdrop Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute -inset-x-3 -inset-y-1.5 bg-[#310065]/5 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon 
                  className={`w-6 h-6 mb-1 transition-colors duration-300 ${
                    isActive 
                      ? 'text-[#310065] stroke-[2.2px] fill-[#310065]/10' 
                      : 'text-[#7c7483] hover:text-[#310065]'
                  }`} 
                />
                
                <span 
                  className={`text-[9px] tracking-wider uppercase transition-colors duration-300 ${
                    isActive 
                      ? 'font-bold text-[#310065]' 
                      : 'font-semibold text-[#7c7483]'
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Active Underline Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 w-5 h-1 bg-[#e9c349] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

