'use client';

import { useState } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    title: 'Activar Notificaciones en iOS',
    subtitle: 'Para recibir notificaciones push en tu iPhone/iPad, debes añadir la app a tu pantalla de inicio:',
    step1: '1. Abre este sitio en Safari y toca el botón Compartir ',
    step2: '2. Desliza hacia abajo y selecciona "Añadir a pantalla de inicio" ',
    step3: '3. Abre la app desde tu pantalla de inicio para jugar y recibir avisos.',
    close: 'Entendido'
  },
  en: {
    title: 'Enable iOS Push Notifications',
    subtitle: 'To receive push notifications on your iPhone/iPad, you must add this app to your Home Screen:',
    step1: '1. Open this site in Safari and tap the Share button ',
    step2: '2. Scroll down and select "Add to Home Screen" ',
    step3: '3. Open the app from your Home Screen to play and receive alerts.',
    close: 'Got it'
  },
  fr: {
    title: 'Activer les notifications sur iOS',
    subtitle: 'Pour recevoir des notifications push sur votre iPhone/iPad, vous devez ajouter l\'application à votre écran d\'accueil :',
    step1: '1. Ouvrez ce site dans Safari et appuyez sur le bouton Partager ',
    step2: '2. Faites défiler vers le bas et sélectionnez "Sur l\'écran d\'accueil" ',
    step3: '3. Ouvrez l\'application depuis votre écran d\'accueil pour jouer et recevoir des alertes.',
    close: 'Compris'
  },
  ht: {
    title: 'Aktive Notifikasyon sou iOS',
    subtitle: 'Pou resevwa notifikasyon push sou iPhone/iPad ou, ou dwe ajoute aplikasyon an sou ekran lakay ou:',
    step1: '1. Louvri sit sa a nan Safari epi peze bouton Pataje ',
    step2: '2. Desann anba epi chwazi "Ajoute sou ekran lakay" ',
    step3: '3. Louvri aplikasyon an nan ekran lakay ou pou w ka jwe epi resevwa mesaj yo.',
    close: 'Dakò'
  }
};

export default function PwaInstallBanner() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const t = TRANSLATIONS[language] || TRANSLATIONS.es;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#0F172A]/5 animate-fade-in flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-[#0F172A] font-extrabold text-[15px] tracking-tight flex items-center gap-1.5">
            <span className="text-[#0A84FF] font-black">🔔</span> {t.title}
          </h4>
          <p className="text-[#64748B] text-[12px] font-medium leading-relaxed mt-1">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748B] hover:text-[#0F172A]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps breakdown */}
      <div className="bg-[#f8fafc] rounded-2xl p-4 flex flex-col gap-3.5 text-[11px] text-[#0F172A] font-semibold leading-relaxed">
        <div className="flex items-center gap-2">
          <span>{t.step1}</span>
          <Share className="w-4 h-4 text-[#0A84FF] shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <span>{t.step2}</span>
          <PlusSquare className="w-4 h-4 text-[#0A84FF] shrink-0" />
        </div>
        <div>
          <span>{t.step3}</span>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="w-full py-3 bg-[#0A84FF] text-white rounded-xl font-bold text-[13px] hover:opacity-95 active:scale-[0.99] transition-all shadow-sm"
      >
        {t.close}
      </button>
    </div>
  );
}
