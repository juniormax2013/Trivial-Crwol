'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const options = [
    {
      id: 'light',
      label: language === 'es' ? 'Día' : language === 'fr' ? 'Jour' : 'Jounen',
      icon: <Sun className="w-4 h-4" />
    },
    {
      id: 'dark',
      label: language === 'es' ? 'Noche' : language === 'fr' ? 'Nuit' : 'Nwit',
      icon: <Moon className="w-4 h-4" />
    },
    {
      id: 'system',
      label: language === 'es' ? 'Auto' : language === 'fr' ? 'Auto' : 'Oto',
      icon: <Monitor className="w-4 h-4" />
    }
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-[#2c2c2e] rounded-[16px] p-1 w-full relative max-w-[240px]">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTheme(opt.id)}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[12px] text-[13px] font-medium transition-all
            ${theme === opt.id 
              ? 'bg-white dark:bg-[#3a3a3c] text-[#310065] dark:text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
          `}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
