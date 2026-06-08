'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu,
  Medal,
  Coins,
  Clock,
  ArrowRight,
  BookOpen,
  Landmark,
  Church,
  Music,
  Shield,
  Star,
  Home,
  Swords,
  Crown,
  BookText,
  Zap,
  MapPin,
  Sparkles,
  Flame,
  Search,
  Filter,
  Layout,
  Users,
  ChevronRight,
  UserCircle,
  Loader2,
  Heart,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDuelsForUser, subscribeToDuelsForUser } from '@/lib/duel/repository';
import { filterDuelsByTab } from '@/lib/duel/service';
import { TournamentRepository } from '@/lib/tournament/repository';
import { Tournament } from '@/lib/tournament/models';
import { useT, useLanguage } from '@/lib/i18n/context';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';

export default function Arena() {
  const { user, loading } = useAuthContext();
  const t = useT();
  const { language } = useLanguage();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [lockedModeInfo, setLockedModeInfo] = useState<{ requiredLevel: number; modeName: string } | null>(null);

  const handleGameModeClick = (e: React.MouseEvent, path: string, requiredLevel: number, bypassKey: 'dailyChallenge' | 'bibleJourney' | 'sacredChallenge', modeName: string) => {
    e.preventDefault();
    const isAdmin = user?.role === 'super_admin' || user?.email === 'juniormax2013@gmail.com';
    const isModeLocked = !user || (!isAdmin && (user.level ?? 0) < requiredLevel && !user.customAccess?.[bypassKey]);
    if (isModeLocked) {
      setLockedModeInfo({ requiredLevel, modeName });
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToDuelsForUser(user.uid, (duels) => {
        const received = filterDuelsByTab(duels, user.uid, 'received');
        const pending = received.filter(d => d.status === 'pending');
        setPendingCount(pending.length);
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  useEffect(() => {
    TournamentRepository.getActiveTournaments()
      .then(t => {
        setActiveTournaments(t.slice(0, 2));
        setTournamentsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setTournamentsLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1b1b1e] min-h-screen pb-8 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm flex items-center justify-between px-6 py-4 pt-safe">
        <div className="flex items-center gap-4">
          <BackButton href="/" />
          <h1 className="font-serif text-xl font-black text-[#310065] leading-none">Bible <br/> Crown</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#ffe088]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#cba72f]/20 shadow-sm">
            <Crown className="w-4 h-4 text-[#735c00] fill-[#cba72f]" strokeWidth={1} />
            <span className="font-bold text-[#735c00] text-[13px]">{user?.crowns || 0}</span>
          </div>
          <div className="bg-[#ffe088]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#cba72f]/20 shadow-sm">
            <Zap className="w-4 h-4 text-[#735c00] fill-[#cba72f]" strokeWidth={1} />
            <span className="font-bold text-[#735c00] text-[13px]">{user?.jweEnergy ?? 0}</span>
          </div>
          <button className="text-[#310065] p-2 rounded-full active:scale-95 transition-transform bg-white shadow-sm border border-[#310065]/5">
            <Medal className="w-[22px] h-[22px]" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-screen-xl mx-auto space-y-12">
        
        {/* Hero Section: Featured Tournament */}
        {!tournamentsLoading && activeTournaments.length > 0 && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-[#280056] p-8 text-white min-h-[340px] flex flex-col justify-end shadow-2xl group border border-[#4a148c]">
            <div className="absolute inset-0 z-0">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ9mEeItnG4f1hJ1ZDyFUqoI1JYgTakNMEzXxzyoVIskyzV31XvqDgugpc9PwlHPz8rJOwC-WspTtwMUx0y2M2BA8eqYmo5XthaiDZxCQJYV4Fxip-nxP4WrZNCWs_9dlGU7P8jwbiIaoJ6le0HEvlDyV62ieK1X8tJ3G1-XscvYj6YUSdJiUIrzZSZzqkk8QhWH214vUTDe4S1arZWx4AP3NF-BGh8qToFO4xFfRlPHHaENnfLRweNFCnAMfkkJ9OZyykzBufLYQ"
                alt="Golden Crown on velvet cushion"
                fill
                className="object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b003a] via-[#280056]/80 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <span className="bg-[#735c00] text-[#ffe088] px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-[0_4px_12px_rgba(115,92,0,0.5)] border border-[#cba72f]/40 mb-5 inline-block">
                {t.arena.featured}
              </span>
              <h2 className="font-serif text-[38px] font-black leading-tight mb-4 drop-shadow-md">{t.arena.pentecostTournament}</h2>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Coins className="text-[#ffe088] w-[18px] h-[18px] fill-[#cba72f]" strokeWidth={1} />
                  <span className="font-bold text-[15px] text-[#ffe088]">5,000 {t.arena.coronas}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-[#d7baff] w-[18px] h-[18px]" strokeWidth={2} />
                  <span className="font-semibold text-[13px] text-white/90">{t.arena.endsIn} 04h 22m</span>
                </div>
              </div>
              <Link href="/arena/tournaments">
                <button className="w-full sm:w-auto bg-gradient-to-r from-[#e9c349] to-[#cba72f] text-[#310065] px-8 py-4 rounded-[1.25rem] font-bold text-[17px] shadow-[0_8px_20px_rgba(233,195,73,0.3)] hover:scale-[1.02] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#ffe088]/50">
                  {t.arena.joinArena}
                </button>
              </Link>
            </div>
          </section>
        )}

        {/* Crown Arena — NEW FEATURE */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h3 className="font-serif text-[26px] font-bold text-[#310065] leading-tight">{t.crownArena.title}</h3>
              <p className="text-[#7c7483] font-medium text-[13px] mt-1">{t.crownArena.subtitle}</p>
            </div>
            <div className="bg-[#ffe088] text-[#735c00] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-[#cba72f]/30">{t.arena.live}</div>
          </div>

          <Link
            href="/arena/crown-arena"
            className="block relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4a148c] via-[#310065] to-[#1b003a] p-8 text-white shadow-2xl group hover:scale-[1.01] transition-all active:scale-[0.99] border border-white/10"
          >
            {/* Animated particles background (CSS only) */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 left-10 w-32 h-32 bg-white rounded-full blur-[80px] animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffe088] rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#ffe088] to-[#cba72f] flex items-center justify-center shadow-[0_12px_24px_rgba(233,195,73,0.4)] rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <Crown className="w-10 h-10 text-[#310065] fill-[#310065]" />
                </div>
                <div>
                  <h4 className="font-serif text-[28px] font-black text-white leading-tight mb-1 drop-shadow-md">
                    Crown Arena
                  </h4>
                  <p className="text-white/70 text-[14px] font-medium max-w-[240px]">
                    {t.arena.marathonDesc}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-5 py-2.5 rounded-2xl border border-white/10">
                  <Users className="w-5 h-5 text-[#ffe088]" />
                  <span className="text-[14px] font-black">{t.arena.playersRange}</span>
                </div>
                <button className="flex items-center gap-2 text-[#e9c349] font-black uppercase tracking-[0.2em] text-[12px] group-hover:gap-4 transition-all">
                  {t.arena.enterNow} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ffe088] fill-[#ffe088]" />
                  <span className="text-[12px] font-bold text-[#ffe088] tracking-wide">+500 XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ff6b00] fill-[#ff6b00]" />
                  <span className="text-[12px] font-bold text-white tracking-wide">{t.arena.streakBonus}</span>
                </div>
              </div>
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#310065] bg-gray-200 overflow-hidden">
                    <Image src={`https://api.dicebear.com/9.x/notionists/svg?seed=user${i}`} alt="user" width={32} height={32} unoptimized />
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </section>

        {/* Game Modes Section */}
        <section>
          <div className="flex justify-between items-end mb-6 px-1">
            <div>
              <h3 className="font-serif text-[26px] font-bold text-[#310065] leading-tight">{t.play.title}</h3>
              <p className="text-[#7c7483] font-medium text-[13px] mt-1">{t.play.subtitle}</p>
            </div>
          </div>          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Daily Challenge (Defi Jounen an) */}
            {(() => {
              const isAdmin = user?.role === 'super_admin' || user?.email === 'juniormax2013@gmail.com';
              const isDailyLocked = !user || (!isAdmin && (user.level ?? 0) < 1 && !user.customAccess?.dailyChallenge);
              const isDailyBypassed = !!user?.customAccess?.dailyChallenge;
              return (
                <Link
                  href="/daily-challenge"
                  onClick={(e) => handleGameModeClick(e, '/daily-challenge', 1, 'dailyChallenge', t.daily.title)}
                  className={`block relative overflow-hidden rounded-[2rem] p-6 border transition-all h-full ${
                    isDailyLocked
                      ? 'bg-gray-50 border-gray-200 opacity-60 grayscale cursor-pointer'
                      : 'bg-white border-[#ffe088]/40 shadow-[0_8px_32px_rgba(233,195,73,0.08)] group hover:shadow-[0_12px_40px_rgba(233,195,73,0.15)] active:scale-[0.99]'
                  }`}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-[#ffe088]/20 blur-[30px] rounded-full -mr-12 -mt-12 group-hover:bg-[#ffe088]/30 transition-colors"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffe088] to-[#cba72f] flex items-center justify-center shadow-lg shadow-[#cba72f]/20 -rotate-3 group-hover:rotate-0 transition-transform">
                        <Calendar className="w-7 h-7 text-[#735c00]" />
                      </div>
                      <div>
                        <h4 className="font-black text-[18px] text-[#310065] mb-0.5">{t.daily.title}</h4>
                        <div className="flex items-center gap-1.5">
                          {isDailyLocked ? (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100 inline-flex items-center gap-1">
                              <Lock size={9} /> Lvl 1
                            </span>
                          ) : isDailyBypassed ? (
                            <span className="bg-[#0A84FF]/10 text-[#0A84FF] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#0A84FF]/20 inline-flex items-center gap-1">
                              ★ Admin
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200 inline-block">
                              {t.arena.available}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[#7c7483] text-[13px] font-medium mb-4 flex-grow">
                      {t.daily.subtitle}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Flame size={14} className="text-[#ff6b00] fill-[#ff6b00]" />
                        <span className="text-[11px] font-bold text-[#7c7483]">{t.daily.alreadyDoneDesc}</span>
                      </div>
                      <div className="bg-[#faf9fc] p-2 rounded-lg group-hover:bg-[#cba72f] group-hover:text-white transition-all text-[#cba72f]">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
 
            {/* Jwe Bib la */}
            {(() => {
              const isAdmin = user?.role === 'super_admin' || user?.email === 'juniormax2013@gmail.com';
              const isBibleLocked = !user || (!isAdmin && (user.level ?? 0) < 3 && !user.customAccess?.bibleJourney);
              const isBibleBypassed = !!user?.customAccess?.bibleJourney;
              return (
                <Link
                  href="/jwe-bib-la/play"
                  onClick={(e) => handleGameModeClick(e, '/jwe-bib-la/play', 3, 'bibleJourney', t.dashboard.bibleGame)}
                  className={`block relative overflow-hidden rounded-[2rem] p-6 border transition-all h-full ${
                    isBibleLocked
                      ? 'bg-gray-50 border-gray-200 opacity-60 grayscale cursor-pointer'
                      : 'bg-white border-[#eddcff] shadow-[0_8px_32px_rgba(49,0,101,0.05)] group hover:shadow-[0_12px_40px_rgba(49,0,101,0.1)] transition-all active:scale-[0.99]'
                  }`}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-[#eddcff]/30 blur-[30px] rounded-full -mr-12 -mt-12 group-hover:bg-[#eddcff]/50 transition-colors"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#310065] flex items-center justify-center shadow-lg shadow-[#310065]/20 rotate-3 group-hover:rotate-0 transition-transform">
                        <Flame className="w-7 h-7 text-[#ffe088] fill-[#ffe088]" />
                      </div>
                      <div>
                        <h4 className="font-black text-[18px] text-[#310065] mb-0.5">{t.dashboard.bibleGame}</h4>
                        <div className="flex items-center gap-2">
                          <Zap size={12} className="text-[#cba72f] fill-[#ffe088]" />
                          <span className="text-[11px] font-bold text-[#7c7483]">{user?.jweEnergy ?? 0} {t.dashboard.energy}</span>
                          {isBibleLocked ? (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100 inline-flex items-center gap-1 ml-1">
                              <Lock size={9} /> Lvl 3
                            </span>
                          ) : isBibleBypassed ? (
                            <span className="bg-[#0A84FF]/10 text-[#0A84FF] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#0A84FF]/20 inline-flex items-center gap-1 ml-1">
                              ★ Admin
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <p className="text-[#7c7483] text-[13px] font-medium mb-4 flex-grow">
                      {t.arena.bibleGameDesc}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-red-500">
                        <Heart size={14} className="fill-red-500" />
                        <span className="text-[11px] font-bold">{t.arena.heartsLabel}: {user?.jweHearts ?? 0}</span>
                      </div>
                      <div className="bg-[#f5f3f7] p-2 rounded-lg group-hover:bg-[#310065] group-hover:text-white transition-all text-[#310065]">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Reto Sagrado (Sacred Challenge) */}
            {(() => {
              const isAdmin = user?.role === 'super_admin' || user?.email === 'juniormax2013@gmail.com';
              const isSacredLocked = !user || (!isAdmin && (user.level ?? 0) < 5 && !user.customAccess?.sacredChallenge);
              const isSacredBypassed = !!user?.customAccess?.sacredChallenge;
              return (
                <Link
                  href="/reto-sagrado"
                  onClick={(e) => handleGameModeClick(e, '/reto-sagrado', 5, 'sacredChallenge', t.play.sacredChallenge)}
                  className={`block relative overflow-hidden rounded-[2rem] p-6 border transition-all h-full ${
                    isSacredLocked
                      ? 'bg-gray-50 border-gray-200 opacity-60 grayscale cursor-pointer'
                      : 'bg-white border-[#d2e3fc] shadow-[0_8px_32px_rgba(10,132,255,0.05)] group hover:shadow-[0_12px_40px_rgba(10,132,255,0.1)] active:scale-[0.99]'
                  }`}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-[#0A84FF]/10 blur-[30px] rounded-full -mr-12 -mt-12 group-hover:bg-[#0A84FF]/20 transition-colors"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#0066cc] flex items-center justify-center shadow-lg shadow-[#0A84FF]/20 -rotate-3 group-hover:rotate-0 transition-transform">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-[18px] text-[#0F172A] mb-0.5">{t.play.sacredChallenge}</h4>
                        <div className="flex items-center gap-1.5">
                          {isSacredLocked ? (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100 inline-flex items-center gap-1">
                              <Lock size={9} /> Lvl 5
                            </span>
                          ) : isSacredBypassed ? (
                            <span className="bg-[#0A84FF]/10 text-[#0A84FF] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#0A84FF]/20 inline-flex items-center gap-1">
                              ★ Admin
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200 inline-block">
                              {t.arena.available}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[#64748B] text-[13px] font-medium mb-4 flex-grow">
                      {t.play.sacredChallengeDesc}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#0A84FF]" />
                        <span className="text-[11px] font-bold text-[#64748B]">{t.arena.playersRange}</span>
                      </div>
                      <div className="bg-[#f0f6ff] p-2 rounded-lg group-hover:bg-[#0A84FF] group-hover:text-white transition-all text-[#0A84FF]">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
 
          </div>
        </section>


        {/* Duelos Section &mdash; Entry */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h3 className="font-serif text-[26px] font-bold text-[#310065] leading-tight">{t.duel.title}</h3>
              <p className="text-[#7c7483] font-medium text-[13px] mt-1">{t.arena.duelsSubtitle}</p>
            </div>
            <Link href="/arena/duels" className="text-[#4a148c] font-bold text-[13px] flex items-center gap-1 group">
              {t.common.seeAll} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <Link
            href="/arena/duels"
            className="block relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1b003a] to-[#310065] p-6 border border-[#4a148c]/40 shadow-[0_8px_32px_rgba(49,0,101,0.18)] group hover:shadow-[0_12px_40px_rgba(49,0,101,0.28)] transition-all active:scale-[0.99]"
          >
            {/* BG decoration */}
            <div className="absolute inset-0 opacity-10">
              <Swords className="absolute -right-6 -top-6 w-40 h-40 text-white rotate-12" strokeWidth={0.8} />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                {pendingCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-[#ffe088]/20 border border-[#cba72f]/30 px-3 py-1 rounded-full mb-4">
                    <Zap className="w-3 h-3 text-[#ffe088] fill-[#ffe088]" />
                    <span className="text-[9px] font-black text-[#ffe088] uppercase tracking-[0.15em]">
                      {pendingCount} {pendingCount === 1 ? t.arena.pendingOne : t.arena.pendingMultiple}
                    </span>
                  </div>
                )}

                <h4 className="font-serif text-[24px] font-black text-white leading-tight mb-2">
                  {pendingCount > 0 ? t.arena.duelInbox : t.arena.duelArena}
                </h4>
                <p className="text-white/60 text-[13px] font-medium mb-5">
                  {pendingCount > 0 
                    ? `${t.arena.pendingDuels.replace('{n}', String(pendingCount))}`
                    : t.arena.findOpponents}
                </p>

                {/* Mini player chips */}
                {pendingCount > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-[#ffe088]/20 rounded-full px-3 py-1.5 border border-[#cba72f]/30">
                      <Swords className="w-3.5 h-3.5 text-[#ffe088]" />
                      <span className="text-[11px] font-bold text-white">{t.arena.yourTurn}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Arrow CTA */}
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center ml-4 mt-1 group-hover:bg-[#e9c349] group-hover:border-[#cba72f] transition-all shrink-0">
                <ChevronRight className="w-5 h-5 text-white group-hover:text-[#310065] transition-colors" />
              </div>
            </div>

            {/* Bottom reward strip */}
            <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#ffe088] fill-[#ffe088]/60" strokeWidth={1} />
                <span className="text-[12px] font-bold text-[#ffe088]">{t.arena.winReward}</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Torneos Activos */}
        {!tournamentsLoading && activeTournaments.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-6 px-1">
              <div>
                <h3 className="font-serif text-[26px] font-bold text-[#310065] leading-tight">{t.arena.tournaments}</h3>
                <p className="text-[#7c7483] font-medium text-[13px] mt-1">{t.arena.tournamentsSubtitle}</p>
              </div>
              <Link href="/arena/tournaments" className="text-[#4a148c] font-bold text-[13px] flex items-center gap-1 group">
                {t.common.seeAll} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTournaments.map((tournament, idx) => (
                <div key={tournament.id} className="bg-white rounded-[2rem] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 flex flex-col justify-between group hover:shadow-[0_8px_32px_rgba(49,0,101,0.06)] transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-5">
                    <div className="bg-[#f5f3f7] p-3.5 rounded-[1.25rem] group-hover:bg-[#eddcff] transition-colors">
                      {idx % 2 === 0 ? <BookOpen className="text-[#310065] w-7 h-7" strokeWidth={1.5} /> : <Landmark className="text-[#310065] w-7 h-7" strokeWidth={1.5} />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-[#cdc3d4] uppercase tracking-[0.15em] mb-1">{t.arena.participants}</span>
                      <span className="font-extrabold text-[#1b1b1e] text-[15px]">{tournament.currentParticipants || 0} <span className="text-[#7c7483] font-semibold text-[13px]">/ {tournament.maxParticipants}</span></span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-serif text-[20px] font-bold mb-1.5 text-[#1b1b1e]">{tournament.title}</h4>
                    <p className="text-[#7c7483] text-[13px] mb-5">{tournament.subtitle || t.arena.tournamentsSubtitle}</p>
                    <div className="w-full bg-[#f5f3f7] h-2.5 rounded-full mb-6 overflow-hidden shadow-inner">
                      <div className="bg-[#e9c349] h-full rounded-full shadow-[0_0_8px_rgba(233,195,73,0.5)]" style={{ width: `${Math.min(100, ((tournament.currentParticipants || 0) / tournament.maxParticipants) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={1} />
                      <span className="font-bold text-[#310065] text-[15px] max-w-[120px] truncate">{((tournament as any).reward?.name) || t.arena.featured}</span>
                    </div>
                    <Link href={`/arena/tournaments/${tournament.id}`}>
                      <button className="bg-[#faf9fc] text-[#4a148c] px-5 py-2.5 rounded-[1rem] font-bold text-[13px] group-hover:bg-[#310065] group-hover:text-white transition-colors border border-[#1b1b1e]/5">
                        {t.arena.enter}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}



        {/* Historial de Coronas */}
        {false && ( // TODO: Hook up with real crown history from database once implemented
        <section className="pb-8">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-[24px] font-bold text-[#310065] leading-tight w-[160px]">Historial de Coronas</h3>
              <div className="bg-[#f5f3f7] text-[#4a4452] px-4 py-2 rounded-2xl text-[11px] font-bold text-center">Últimos 30 días</div>
            </div>
            
            <div className="space-y-0">
              
              {/* History Item 1 */}
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] shrink-0 rounded-[1.25rem] bg-[#ffe088]/30 flex items-center justify-center text-[#735c00] border border-[#cba72f]/20">
                    <Crown className="w-7 h-7 fill-[#cba72f] text-[#cba72f]" strokeWidth={1} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1b1b1e] text-[15px] mb-0.5 leading-tight">3er Lugar: Mini-Torneo de Parábolas</p>
                    <p className="text-[11px] text-[#cdc3d4] font-semibold">Hace 2 días</p>
                  </div>
                </div>
                <div className="text-right pl-2">
                  <p className="font-serif font-black text-[#735c00] text-[20px]">+150</p>
                  <p className="text-[8px] font-black text-[#cdc3d4] uppercase tracking-widest mt-0.5">Coronas</p>
                </div>
              </div>
              <div className="h-[1px] bg-[#f5f3f7] w-full"></div>
              
              {/* History Item 2 */}
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] shrink-0 rounded-[1.25rem] bg-[#eddcff]/60 flex items-center justify-center text-[#310065] border border-[#310065]/5">
                    <Star className="w-7 h-7 fill-[#310065] text-[#310065]" strokeWidth={1} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1b1b1e] text-[15px] mb-0.5 leading-tight">1er Lugar: Quiz Relámpago</p>
                    <p className="text-[11px] text-[#cdc3d4] font-semibold">Hace 5 días</p>
                  </div>
                </div>
                <div className="text-right pl-2">
                  <p className="font-serif font-black text-[#735c00] text-[20px]">+500</p>
                  <p className="text-[8px] font-black text-[#cdc3d4] uppercase tracking-widest mt-0.5">Coronas</p>
                </div>
              </div>
              <div className="h-[1px] bg-[#f5f3f7] w-full"></div>
              
              {/* History Item 3 */}
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] shrink-0 rounded-[1.25rem] bg-[#f5f3f7] flex items-center justify-center text-[#7c7483]">
                    <Medal className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1b1b1e] text-[15px] mb-0.5 leading-tight">Participación: Batalla de Profetas</p>
                    <p className="text-[11px] text-[#cdc3d4] font-semibold">Hace 1 semana</p>
                  </div>
                </div>
                <div className="text-right pl-2">
                  <p className="font-serif font-black text-[#cdc3d4] text-[20px]">+25</p>
                  <p className="text-[8px] font-black text-[#cdc3d4] uppercase tracking-widest mt-0.5">Coronas</p>
                </div>
              </div>
              
            </div>
            
            <button className="w-full mt-6 py-4 border-[1.5px] border-dashed border-[#cdc3d4] rounded-[1.25rem] text-[#7c7483] font-bold text-[15px] hover:border-[#310065]/30 hover:text-[#310065] hover:bg-[#faf9fc] transition-all">
              Descargar Certificado de Sabiduría
            </button>
          </div>
        </section>
        )}

      </main>

      <BottomNav activeTab="play" showTriggerButton={false} />

      {lockedModeInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center text-center animate-scale-up">
            {/* Lock Icon */}
            <div className="w-14 h-14 rounded-full bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF] mb-4">
              <Lock size={24} strokeWidth={2.5} />
            </div>

            {/* Title */}
            <h3 className="text-[#0F172A] font-extrabold text-lg tracking-tight mb-2">
              {t.locks.levelRequiredTitle.replace('{level}', String(lockedModeInfo.requiredLevel))}
            </h3>

            {/* Description */}
            <p className="text-[#64748B] text-xs leading-relaxed mb-5">
              {t.locks.levelRequiredDesc.replace('{level}', String(lockedModeInfo.requiredLevel))}
            </p>

            {/* Close Button */}
            <button
              onClick={() => setLockedModeInfo(null)}
              className="w-full py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-bold rounded-xl transition-colors text-[14px]"
            >
              {t.locks.backBtn}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
