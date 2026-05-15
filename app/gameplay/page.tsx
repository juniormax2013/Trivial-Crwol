'use client';

import { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import Link from 'next/link';
import { 
  X,
  CheckCircle2,
  Filter,
  Timer,
  Zap,
  BookOpen,
  Crown
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { consumePower } from '@/lib/store/repository';
import PowerUpsBar from '@/components/game/PowerUpsBar';
import { toast } from 'sonner';

export default function Gameplay() {
  const { user } = useAuthContext();
  const [isProcessingPower, setIsProcessingPower] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [hasSecondChance, setHasSecondChance] = useState(false);
  const [incorrectOptions, setIncorrectOptions] = useState<string[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);

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
      setIsTimeFrozen(true);
      toast.success("Tan an glase! Ou gen tout tan ou bezwen.");
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
      toast.success("Bòn repons!");
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isTimeFrozen) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, isTimeFrozen]);

  const dashoffset = 276 - (276 * (timeLeft / 15));

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans selection:bg-[#eddcff] relative">
      
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-[0.15]">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#310065] blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#cba72f] blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/50 transition-colors active:scale-95 duration-200">
              <X className="w-[22px] h-[22px] text-[#310065]" strokeWidth={2.5} />
            </Link>
            <div className="h-10 w-10 rounded-full bg-[#eddcff] overflow-hidden ring-[2px] ring-[#eddcff]">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdItz-79xBYFramvEbKi4HE6BziprHWqDp0ImmK6f52KJmW97MSxlXo17nQg-e_fyJDGfQT9Nz6EgBabe_s5t7ZAs_PEhbQsKUOWvUekhpQ5RxGDJHfUyL_MrBcQ2Ox8AfJEo_hAKTKM7jXAYyg1js6roibisfAG-fvDa9BSW_zvMyPXf55Vy-wyj3NTVrDCVkkgDH8-X3jymW2j4H3ug4mxV7_6mGIctLbhNFyasRipNvjx0zWUuXxo75rr2H-eOP5-DFg5FUpz0"
                alt="Player Avatar"
                width={40} height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-[19px] font-black text-[#310065] tracking-tighter uppercase font-body flex items-center">
            BIBLE CROWN
          </div>
          <div className="flex items-center bg-[#ffe088]/30 px-3 py-1.5 rounded-full border border-[#cba72f]/20">
            <span className="text-[13px] font-extrabold text-[#1b1b1e] flex items-center gap-1.5">
              1,250
              <Crown className="w-4 h-4 text-[#cba72f] fill-[#ffe088]" strokeWidth={1} />
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[88px] pb-12 px-6 flex flex-col max-w-[480px] mx-auto w-full relative z-10">
        
        {/* Progress Section */}
        <div className="mb-8 space-y-3">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[11px] font-bold tracking-[0.15em] text-[#755978] uppercase">Question 4 of 10</span>
            <span className="text-[13px] font-extrabold text-[#735c00]">40% Complete</span>
          </div>
          <div className="h-2 w-full bg-[#e3e2e6] rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#e9c349] to-[#cba72f] w-[40%] rounded-full shadow-[0_0_12px_rgba(203,167,47,0.4)]"></div>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="relative w-24 h-24 mx-auto mb-10 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle className="text-[#e9e7eb]" cx="48" cy="48" fill="transparent" r="44" strokeWidth="6" stroke="currentColor"></circle>
            <circle className="text-[#cba72f] drop-shadow-[0_0_8px_rgba(203,167,47,0.3)] transition-all duration-1000 ease-linear" cx="48" cy="48" fill="transparent" r="44" strokeWidth="6" stroke="currentColor" strokeDasharray="276" strokeDashoffset={dashoffset} strokeLinecap="round"></circle>
          </svg>
          <div className="flex flex-col items-center justify-center pt-1">
            <span className="text-[32px] font-serif font-black text-[#1b1b1e] leading-none mb-0.5">{timeLeft}</span>
            <span className="text-[8px] font-black text-[#7c7483] uppercase tracking-[0.1em]">Seconds</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[2.5rem] px-8 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-8 relative overflow-hidden border border-[#1b1b1e]/5">
          {/* Subtle Watermark */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] select-none pointer-events-none text-[#1b1b1e]">
            <BookOpen className="w-48 h-48" strokeWidth={1} />
          </div>
          <p className="text-[26px] md:text-[28px] font-serif font-bold text-[#1b1b1e] leading-tight text-center relative z-10">
            ¿A quién entregó Dios las tablas de la ley?
          </p>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3.5 mb-10">
          
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
                className={`w-full text-left p-[18px] rounded-[1.25rem] transition-all duration-200 group flex items-center border shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                  isCorrectAndSelected 
                    ? 'bg-[#310065] text-white ring-4 ring-[#4a148c]/30 scale-[1.02] shadow-[0_8px_20px_rgba(49,0,101,0.25)] border-transparent' 
                    : isIncorrectGuess
                    ? 'bg-red-50 text-red-500 border-red-200 opacity-70'
                    : isDisabled
                    ? 'bg-[#f5f3f7] text-[#7c7483] border-transparent opacity-50 cursor-not-allowed'
                    : 'bg-[#f5f3f7] hover:bg-[#e9e7eb] active:scale-[0.98] border-transparent text-[#1b1b1e]'
                }`}
              >
                <div className={`w-11 h-11 shrink-0 rounded-[0.85rem] flex items-center justify-center mr-4 transition-colors ${
                  isCorrectAndSelected 
                    ? 'bg-white/10 shadow-inner' 
                    : isIncorrectGuess
                    ? 'bg-red-100/50'
                    : isDisabled
                    ? 'bg-[#e3e2e6]/50'
                    : 'bg-[#e3e2e6] group-hover:bg-[#d7baff]/30'
                }`}>
                  <span className={`font-bold text-[17px] ${
                    isCorrectAndSelected 
                      ? 'text-white' 
                      : isIncorrectGuess
                      ? 'text-red-500'
                      : isDisabled
                      ? 'text-[#7c7483]/50'
                      : 'text-[#7c7483] group-hover:text-[#4a148c]'
                  }`}>
                    {option.id}
                  </span>
                </div>
                <span className={`text-[17px] flex-grow ${isCorrectAndSelected ? 'font-bold' : 'font-semibold'}`}>
                  {isDisabled && isRemoved ? '...' : option.text}
                </span>
                {isCorrectAndSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-6 h-6 text-white fill-white/20 shrink-0" strokeWidth={2} />
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

        {/* Wildcards (Comodines) */}
        <div className="mt-auto px-4 pb-6">
          <PowerUpsBar 
            onPowerUsed={handlePowerUsed}
            isProcessing={isProcessingPower}
            setIsProcessing={setIsProcessingPower}
            activePowerUps={activePowerUps}
          />
        </div>

      </main>

    </div>
  );
}
