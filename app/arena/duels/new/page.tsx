'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crown,
  Swords,
  BookOpen,
  ScrollText,
  Zap,
} from 'lucide-react';
import { MOCK_OPPONENTS, DUEL_CATEGORIES } from '@/lib/duel/seed';
import { createDuel } from '@/lib/duel/repository';
import { DuelOpponent } from '@/lib/duel/models';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage, useT } from '@/lib/i18n/context';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_OPTIONS: { key: Difficulty; label: string; desc: string; questions: number; time: number; color: string }[] = [
  { key: 'easy',   label: 'Fácil',   desc: 'Solo preguntas fáciles',   questions: 9,  time: 25, color: 'emerald' },
  { key: 'medium', label: 'Medio',   desc: 'Fáciles + intermedias',     questions: 12, time: 20, color: 'amber'   },
  { key: 'hard',   label: 'Difícil', desc: 'Todas las dificultades',    questions: 15, time: 15, color: 'red'     },
];

// Recompensas por dificultad (deben coincidir con repository.ts)
const DIFFICULTY_REWARDS: Record<Difficulty, { xp: number; coins: number; crowns: number }> = {
  easy:   { xp: 100, coins: 60,  crowns: 80  },
  medium: { xp: 200, coins: 100, crowns: 150 },
  hard:   { xp: 350, coins: 175, crowns: 250 },
};

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  evangelios: BookOpen,
  proverbios: ScrollText,
  hechos: Zap,
};

export default function NewDuelPage() {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const t = useT();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const getLocalizedCatName = (cat: any) => {
    if (language === 'es') return cat.nameES || cat.name;
    if (language === 'fr') return cat.nameFR || cat.name;
    return cat.name;
  };

  const getLocalizedDifficultyLabel = (key: Difficulty) => {
    if (key === 'easy') return t.duel.easy;
    if (key === 'medium') return t.duel.medium;
    if (key === 'hard') return t.duel.hard;
    return key;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [realOpponents, setRealOpponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const { listAllUsers } = await import('@/lib/user/repository');
        const users = await listAllUsers(50);
        // Exclude current user and only show active ones
        const available = users.filter(u => u.uid !== user?.uid && u.status === 'active');
        setRealOpponents(available);
      } catch (err) {
        console.error('Failed to load opponents', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user?.uid) {
      fetchPlayers();
    }
  }, [user]);

  const [selectedOpponents, setSelectedOpponents] = useState<DuelOpponent[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['evangelios', 'proverbios', 'hechos']);
  const [isRandomCategories, setIsRandomCategories] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleOpponent = (opp: DuelOpponent) => {
    setSelectedOpponents((prev) => {
      const exists = prev.find(o => o.uid === opp.uid);
      if (exists) return prev.filter(o => o.uid !== opp.uid);
      if (prev.length >= 4) return prev; // Limit to 4 guests (5 players total)
      return [...prev, opp];
    });
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (selectedOpponents.length === 0 || isSubmitting) return;

    let finalCategories = selectedCategories;
    if (isRandomCategories) {
      const shuffled = [...DUEL_CATEGORIES].sort(() => 0.5 - Math.random());
      finalCategories = shuffled.slice(0, 3).map((c) => c.id);
    } else if (finalCategories.length === 0) {
      finalCategories = [DUEL_CATEGORIES[0].id];
    }

    setIsSubmitting(true);
    try {
      const duel = await createDuel(
        user?.uid || 'unknown-user',
        user?.fullName || 'Guerrero Anónimo',
        user?.photoURL || 'https://api.dicebear.com/9.x/notionists/svg?seed=Unknown',
        selectedOpponents,
        finalCategories,
        difficulty,
        3,
        language
      );
      router.push(`/arena/duels/${duel.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/90 backdrop-blur-xl border-b border-[#1b1b1e]/5">
        <div className="flex items-center gap-3 px-5 py-4 max-w-screen-xl mx-auto">
          <button
            onClick={() => (step === 2 ? setStep(1) : router.back())}
            className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7c7483]">
              {t.duel.step} {step} {t.duel.ofText} 2
            </p>
            <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight">
              {step === 1 ? t.duel.chooseRivals : t.duel.configureDuel}
            </h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#f5f3f7] mx-5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#310065] rounded-full transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </header>

      <main className="pt-[100px] px-5 max-w-screen-xl mx-auto">

        {/* ── STEP 1: Select Opponent ── */}
        {step === 1 && (
          <section className="mt-4">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[#7c7483] text-[14px] font-medium">
                {t.duel.selectUpTo4}
              </p>
              <span className="text-[12px] font-bold text-[#310065] px-3 py-1 bg-white border border-[#310065]/10 rounded-full shadow-sm">
                {selectedOpponents.length} / 4
              </span>
            </div>
            {loading ? (
              <div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full border-4 border-[#e9c349] border-t-transparent animate-spin"></div></div>
            ) : realOpponents.length === 0 ? (
              <div className="text-center text-[#7c7483] p-8">{t.duel.noOpponentsAvailable}</div>
            ) : (
            <div className="space-y-3">
              {realOpponents.map((opp) => {
                const isSelected = !!selectedOpponents.find(o => o.uid === opp.uid);
                // Calculate online status
                const isOnline = opp.lastLoginAt ? (new Date().getTime() - new Date(opp.lastLoginAt).getTime() < 5 * 60 * 1000) : false;
                
                return (
                  <div
                    key={opp.uid}
                    onClick={() => toggleOpponent({
                      uid: opp.uid,
                      name: opp.fullName || opp.username,
                      avatarUrl: opp.photoURL || 'https://api.dicebear.com/9.x/notionists/svg?seed=' + opp.username,
                      level: opp.level || 1,
                      crowns: opp.crowns || 0
                    })}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-[#4a148c] bg-[#eddcff]/40 shadow-[0_4px_16px_rgba(74,20,140,0.1)]'
                        : 'border-[#1b1b1e]/5 bg-white hover:border-[#4a148c]/30 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Link 
                      href={`/profile/${opp.uid}`} 
                      onClick={(e) => e.stopPropagation()} 
                      className="block w-14 h-14 rounded-full overflow-hidden border-2 border-[#4a148c]/10 hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={opp.photoURL || ('https://api.dicebear.com/9.x/notionists/svg?seed=' + opp.username)}
                        alt={opp.fullName || opp.username}
                        width={56} height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </Link>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm pointer-events-none" title="En línea ahora"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1b1b1e] text-[16px] truncate">{opp.fullName || opp.username}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-[#7c7483] font-semibold">{t.duel.levelLabel} {opp.level || 1}</span>

                        <div className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-[#cba72f] fill-[#ffe088]" strokeWidth={1} />
                          <span className="text-[11px] font-bold text-[#735c00]">
                            {mounted ? (opp.crowns || 0).toLocaleString() : (opp.crowns || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#310065] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border border-[#cdc3d4] flex items-center justify-center shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            )}

            <button
              onClick={() => selectedOpponents.length > 0 && setStep(2)}
              disabled={selectedOpponents.length === 0}
              className="w-full mt-6 py-4 rounded-[1.25rem] bg-[#310065] text-white font-bold text-[17px] shadow-[0_8px_20px_rgba(49,0,101,0.2)] hover:bg-[#4a148c] transition-all disabled:opacity-40 active:scale-[0.99]"
            >
              {t.duel.continueWithCount.replace('{n}', selectedOpponents.length.toString())}
            </button>
          </section>
        )}

        {/* ── STEP 2: Configure ── */}
        {step === 2 && selectedOpponents.length > 0 && (
          <section className="mt-4 space-y-6">

            {/* Participants recap */}
            <div className="bg-white rounded-[1.75rem] p-4 border border-[#1b1b1e]/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-[#7c7483] uppercase tracking-wider">{t.duel.invitedRivals}</p>
                <Swords className="w-4 h-4 text-[#cdc3d4]" />
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedOpponents.map(opp => (
                  <div key={opp.uid} className="flex items-center gap-2 bg-[#f5f3f7] rounded-full pr-3 pl-1 py-1 border border-[#310065]/5">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-[#310065]/10">
                      <Image src={opp.avatarUrl} alt={opp.name} width={28} height={28} className="w-full h-full object-cover" unoptimized />
                    </div>
                    <span className="text-[12px] font-bold text-[#310065]">{opp.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-[18px] font-bold text-[#310065]">{t.duel.categories}</h3>
                <label className="flex items-center gap-2 cursor-pointer bg-[#f5f3f7] px-3 py-1.5 rounded-full hover:bg-[#eddcff] transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isRandomCategories} 
                    onChange={(e) => setIsRandomCategories(e.target.checked)} 
                    className="w-4 h-4 rounded text-[#310065] border-gray-300 focus:ring-[#310065] cursor-pointer" 
                  />
                  <span className="text-[12px] font-bold text-[#310065]">{t.duel.random}</span>
                </label>
              </div>
              <p className="text-[12px] text-[#7c7483] font-medium mb-3">
                {isRandomCategories 
                  ? t.duel.randomDesc 
                  : t.duel.selectAtLeast1}
              </p>
              <div className={`grid grid-cols-3 gap-3 transition-opacity duration-300 ${isRandomCategories ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                {DUEL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-[1.25rem] border transition-all ${
                        isSelected
                          ? 'border-[#4a148c] bg-[#eddcff]/40 shadow-sm'
                          : 'border-[#1b1b1e]/5 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                        {getLocalizedCatName(cat)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#310065] mb-3">{t.duel.difficulty}</h3>
              <div className="space-y-2">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficulty === opt.key;
                  const colorMap: Record<string, string> = {
                    emerald: isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-[#1b1b1e]/5 bg-white',
                    amber: isSelected ? 'border-amber-500 bg-amber-50' : 'border-[#1b1b1e]/5 bg-white',
                    red: isSelected ? 'border-red-500 bg-red-50' : 'border-[#1b1b1e]/5 bg-white',
                  };
                  const dotMap: Record<string, string> = {
                    emerald: 'bg-emerald-500',
                    amber: 'bg-amber-500',
                    red: 'bg-red-500',
                  };
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setDifficulty(opt.key)}
                      className={`w-full flex items-center justify-between p-4 rounded-[1.25rem] border transition-all ${colorMap[opt.color]}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${dotMap[opt.color]} ${isSelected ? '' : 'opacity-30'}`} />
                        <span className="font-bold text-[15px] text-[#1b1b1e]">{getLocalizedDifficultyLabel(opt.key)}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[11px] font-bold text-[#7c7483]">{opt.questions} {t.duel.questions}</span>
                        <span className="text-[11px] text-[#7c7483]">{opt.time}s {t.duel.secondsPerQuestion}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rewards preview */}
            <div className="bg-[#ffe088]/20 rounded-[1.75rem] p-5 border border-[#cba72f]/20">
              <h4 className="font-bold text-[#735c00] text-[13px] uppercase tracking-wider mb-3">{t.duel.victoryRewards}</h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#cba72f] fill-[#ffe088]" strokeWidth={1} />
                  <span className="font-black text-[#735c00] text-[16px]">{DIFFICULTY_REWARDS[difficulty].crowns} {t.profile.crowns}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[#735c00] text-[16px]">{DIFFICULTY_REWARDS[difficulty].xp} XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[#735c00] text-[16px]">{DIFFICULTY_REWARDS[difficulty].coins} {t.store.coinsLabel}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isSubmitting || (!isRandomCategories && selectedCategories.length === 0)}
              className="w-full py-4 rounded-[1.25rem] bg-gradient-to-r from-[#310065] to-[#4a148c] text-white font-bold text-[17px] shadow-[0_8px_20px_rgba(49,0,101,0.2)] hover:opacity-90 transition-all disabled:opacity-40 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Swords className="w-5 h-5" />
              {isSubmitting ? t.duel.sendingChallenge : t.duel.sendChallenge}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
