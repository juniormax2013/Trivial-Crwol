'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, CheckCircle2, Filter, Clock, Zap, BookOpen, Loader2 } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { consumePower } from '@/lib/store/repository';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import { toast } from 'sonner';
export default function Play() {
  const { user, loading: authLoading } = useAuthContext();
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessingPower, setIsProcessingPower] = useState(false);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [incorrectOptions, setIncorrectOptions] = useState<string[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);

  const options = [
    { id: 'A', text: 'Noé', isCorrect: false },
    { id: 'B', text: 'Moisés', isCorrect: true },
    { id: 'C', text: 'Abraham', isCorrect: false },
    { id: 'D', text: 'David', isCorrect: false },
  ];

  const handlePowerUsed = (powerId: string) => {
    setActivePowerUps(prev => [...prev, powerId]);
    
    if (powerId === 'removeTwo') {
      const incorrects = options.filter(o => !o.isCorrect).map(o => o.id);
      const shuffled = incorrects.sort(() => 0.5 - Math.random());
      setRemovedOptions(shuffled.slice(0, 2));
    } else if (powerId === 'freezeTime') {
      setTimeLeft(prev => prev + 15);
    } else if (powerId === 'secondChance') {
      setHasSecondChance(true);
    }
  };

  const handleOptionClick = (id: string, isCorrect: boolean) => {
    if (selectedOption && options.find(o => o.id === selectedOption)?.isCorrect) return; // already won
    if (removedOptions.includes(id) || incorrectOptions.includes(id)) return; // disabled option
    
    setSelectedOption(id);
    
    if (!isCorrect) {
      if (hasSecondChance) {
        setIncorrectOptions(prev => [...prev, id]);
        setHasSecondChance(false);
        toast.error("Movèz repons! Men ou gen Dezyèm Chans. Eseye ankò!");
        setSelectedOption(null); // allow selecting again
      } else {
        toast.error("Movèz repons!");
      }
    } else {
      const isGoldOrCrown = user?.activeFrame === 'gold' || user?.activeFrame === 'crown' || user?.activeFrame === 'gold_frame' || user?.activeFrame === 'crow_frame';
      toast.success(isGoldOrCrown ? "Bòn repons! (Rekonpans Doub x2 👑)" : "Bòn repons!");
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (user?.activeFrame) {
      const isFire = user.activeFrame === 'fire' || user.activeFrame === 'fire_frame';
      const isCrown = user.activeFrame === 'crown' || user.activeFrame === 'crow_frame';
      
      // Since this is a mock page with only 1 question, we'll assume index is 0 (so < 5 applies)
      if (isFire || isCrown) {
        // Ocultar 2 opciones incorrectas automáticamente
        const incorrects = options.filter(o => !o.isCorrect).map(o => o.id);
        const shuffled = incorrects.sort(() => 0.5 - Math.random());
        setRemovedOptions(shuffled.slice(0, 2));
      }

      if (isCrown) {
        // Activar la segunda oportunidad de forma pasiva solo para Crown
        setHasSecondChance(true);
        setActivePowerUps(['secondChance']);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.activeFrame]);

  const dashoffset = 264 - (264 * (timeLeft / 15));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9fc]">
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl">
        <div className="flex justify-between items-center w-full pl-20 pr-6 py-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/arena" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-purple-50/50 transition-colors active:scale-95">
              <X className="text-[#310065] w-6 h-6" />
            </Link>
            <div className="h-10 w-10 rounded-full bg-[#fde9ff] overflow-hidden relative border border-[#310065]/5 shadow-sm">
              <Image 
                src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuBdItz-79xBYFramvEbKi4HE6BziprHWqDp0ImmK6f52KJmW97MSxlXo17nQg-e_fyJDGfQT9Nz6EgBabe_s5t7ZAs_PEhbQsKUOWvUekhpQ5RxGDJHfUyL_MrBcQ2Ox8AfJEo_hAKTKM7jXAYyg1js6roibisfAG-fvDa9BSW_zvMyPXf55Vy-wyj3NTVrDCVkkgDH8-X3jymW2j4H3ug4mxV7_6mGIctLbhNFyasRipNvjx0zWUuXxo75rr2H-eOP5-DFg5FUpz0"} 
                alt="Me" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="text-lg font-black text-[#310065] tracking-tighter uppercase font-serif">Bible Crown</div>
          <div className="flex items-center bg-[#ffe088]/30 px-3 py-1.5 rounded-full border border-[#cba72f]/20">
            <span className="text-xs font-extrabold text-[#735c00]">{user?.crowns || 0} 👑</span>
          </div>
        </div>
      </header>

      <main className="flex-grow px-6 py-6 flex flex-col w-full relative z-10 max-w-lg mx-auto">
        <div className="mb-8 space-y-3">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold tracking-widest text-[#310065]/60 uppercase">Question 4 of 10</span>
            <span className="text-xs font-bold text-[#cba72f]">40% Complete</span>
          </div>
          <div className="h-2 w-full bg-[#efedf1] rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: '30%' }}
              animate={{ width: '40%' }}
              className="h-full bg-[#cba72f] shadow-[0_0_12px_rgba(203,167,47,0.4)]"
            />
          </div>
        </div>

        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle className="text-[#efedf1]" cx="48" cy="48" fill="transparent" r="42" stroke="currentColor" strokeWidth="6"></circle>
            <circle 
              className="text-[#cba72f] transition-all duration-1000 ease-linear" 
              cx="48" cy="48" fill="transparent" r="42" stroke="currentColor" 
              strokeDasharray="264" 
              strokeDashoffset={dashoffset} 
              strokeWidth="6"
              strokeLinecap="round"
            ></circle>
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold text-[#1b1b1e] leading-none">{timeLeft}</span>
            <span className="text-[8px] font-bold text-[#7c7483] uppercase tracking-tighter mt-1">Seconds</span>
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] p-6 shadow-sm mb-8 border border-[#310065]/5 relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] select-none pointer-events-none">
            <BookOpen className="w-40 h-40" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1b1b1e] leading-tight text-center relative z-10">
            ¿A quién entregó Dios las tablas de la ley?
          </p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrectAndSelected = isSelected && option.isCorrect;
            const isRemoved = removedOptions.includes(option.id);
            const isIncorrectGuess = incorrectOptions.includes(option.id);
            const isDisabled = isRemoved || isIncorrectGuess;
            
            return (
              <button 
                key={option.id}
                onClick={() => handleOptionClick(option.id, option.isCorrect)}
                disabled={isDisabled}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center border ${
                  isCorrectAndSelected 
                    ? 'bg-[#eddcff] text-[#310065] border-[#310065]/20 ring-2 ring-[#310065]/5 scale-[1.02] shadow-md' 
                    : isIncorrectGuess
                    ? 'bg-red-50 text-red-500 border-red-200 shadow-sm opacity-70'
                    : isDisabled
                    ? 'bg-gray-100/50 text-gray-400 border-transparent opacity-50 cursor-not-allowed'
                    : 'bg-white border-[#310065]/5 hover:bg-[#f5f3f7] active:scale-[0.98] text-[#1b1b1e] shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                  isCorrectAndSelected 
                    ? 'bg-[#310065]/10' 
                    : isIncorrectGuess
                    ? 'bg-red-100/50'
                    : isDisabled
                    ? 'bg-gray-200/50'
                    : 'bg-[#efedf1]'
                }`}>
                  <span className={`font-bold text-lg ${
                    isCorrectAndSelected 
                      ? 'text-[#310065]' 
                      : isIncorrectGuess
                      ? 'text-red-500'
                      : isDisabled
                      ? 'text-gray-400'
                      : 'text-[#7c7483]'
                  }`}>
                    {option.id}
                  </span>
                </div>
                <span className={`text-lg flex-grow ${isCorrectAndSelected ? 'font-extrabold' : 'font-semibold'}`}>
                  {isDisabled && isRemoved ? '...' : option.text}
                </span>
                {isCorrectAndSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-6 h-6 text-[#310065]" />
                  </motion.div>
                )}
                {isIncorrectGuess && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <X className="w-6 h-6 text-red-500" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto px-4 pb-6">
          <PowerUpsBar 
            onPowerUsed={handlePowerUsed}
            isProcessing={isProcessingPower}
            setIsProcessing={setIsProcessingPower}
            activePowerUps={activePowerUps}
          />
        </div>
      </main>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#310065]/5 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#cba72f]/5 blur-[100px] rounded-full"></div>
      </div>

    </div>
  );
}
