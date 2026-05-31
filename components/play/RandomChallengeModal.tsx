'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Swords } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/lib/i18n/context';

interface RandomChallengeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    title: '¡Reto Aleatorio!',
    description: 'Has sido elegido para un desafío de alto riesgo.',
    winText: 'Si aciertas: RECOMPENSAS x3',
    failText: 'Si fallas: PIERDES LA MITAD',
    accept: 'Aceptar Reto',
    reject: 'Rechazar (Miedoso)'
  },
  ht: {
    title: 'Defi Aleatwa!',
    description: 'Ou te chwazi pou yon defi ki gen anpil risk.',
    winText: 'Si w jwenn li: REKONPANS x3',
    failText: 'Si w rate: OU PÈDI MWATYE',
    accept: 'Aksepte Defi',
    reject: 'Refize (Lach)'
  },
  fr: {
    title: 'Défi Aléatoire !',
    description: 'Vous avez été choisi pour un défi à haut risque.',
    winText: 'Si vous réussissez : RÉCOMPENSES x3',
    failText: 'Si vous échouez : VOUS PERDEZ LA MOITIÉ',
    accept: 'Accepter le Défi',
    reject: 'Refuser (Peur)'
  }
};

export function RandomChallengeModal({ isOpen, onAccept, onReject }: RandomChallengeModalProps) {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS.es;

  useEffect(() => {
    if (isOpen) {
      // Optional: Play a sound effect or trigger haptic feedback here
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1b1b1e]/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative bg-gradient-to-br from-[#310065] to-[#4a148c] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-[#7345b6]/30 overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#e9c349] opacity-20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-red-500 opacity-20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e9c349] to-[#cba72f] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(233,195,73,0.5)]"
              >
                <Swords className="w-10 h-10 text-[#310065]" fill="currentColor" />
              </motion.div>
              
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                {t.title}
              </h2>
              
              <p className="text-[#d7baff] font-medium mb-6 text-sm">
                {t.description}
              </p>
              
              <div className="w-full bg-[#1b1b1e]/40 rounded-2xl p-4 mb-8">
                <div className="flex items-center gap-3 text-emerald-400 mb-3 font-bold">
                  <Zap className="w-5 h-5 fill-emerald-400" />
                  <span>{t.winText}</span>
                </div>
                <div className="flex items-center gap-3 text-red-400 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{t.failText}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={onAccept}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#e9c349] to-[#cba72f] text-[#310065] font-black text-lg uppercase tracking-wide shadow-lg active:scale-95 transition-transform"
                >
                  {t.accept}
                </button>
                <button
                  onClick={onReject}
                  className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wide transition-colors"
                >
                  {t.reject}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function fireChallengeSuccessConfetti() {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#e9c349', '#310065', '#ffffff']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#e9c349', '#310065', '#ffffff']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
