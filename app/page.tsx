'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { subscribeToDuelsForUser, getDuelsForUser } from '@/lib/duel/repository';
import { TournamentRepository } from '@/lib/tournament/repository';
import { Tournament } from '@/lib/tournament/models';
import { 
  Swords, 
  Flame,
  Play,
  Trophy,
  BookOpen,
  Bell,
  User,
  Calendar,
  Bookmark,
  Share2,
  X,
  ChevronRight,
  Info,
  ShoppingBag,
  Crown,
  Brain
} from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useNotifications } from '@/hooks/useNotifications';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriendsList } from '@/lib/social/repository';
import { DuelModel } from '@/lib/duel/models';
import { AppUserModel } from '@/lib/user/models';
import { toast } from 'sonner';
import { DAILY_VERSES } from '@/lib/daily-verse/data';
import { useLanguage } from '@/lib/i18n/context';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';



function ActivityCard({ duel, currentUserId }: { duel: DuelModel, currentUserId: string }) {
  const t = useT();
  const { language } = useLanguage();
  const isWinner = duel.winnerIds.includes(currentUserId);
  const isLoser = duel.loserIds.includes(currentUserId);
  const isTie = duel.isTie;
  
  const opponentId = duel.participantIds.find(id => id !== currentUserId);
  const opponent = duel.participants[opponentId || '']?.name || t.common.opponent;

  let resultLabel = '';
  let resultColor = '';
  let cardBg = 'bg-surface-container-lowest hover:bg-surface-container-low';

  if (duel.status === 'completed') {
    if (isWinner) {
      resultLabel = `${t.duel.victory} ${t.duel.vs} ${opponent}`;
      resultColor = 'text-amber-600';
      cardBg = 'bg-gradient-to-r from-amber-500/[0.03] to-transparent hover:from-amber-500/[0.06] border-amber-200/30';
    } else if (isLoser) {
      resultLabel = `${t.duel.defeat} ${t.duel.vs} ${opponent}`;
      resultColor = 'text-red-600';
    } else if (isTie) {
      resultLabel = `${t.social.tie} ${t.duel.vs} ${opponent}`;
      resultColor = 'text-blue-600';
    }
  } else {
    resultLabel = t.duel.pending;
    resultColor = 'text-gray-500';
  }

  const locale = language === 'ht' ? 'ht-HT' : language === 'es' ? 'es-ES' : 'fr-FR';

  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative flex items-center justify-between p-4 rounded-2xl shadow-sm border border-black/[0.02] transition-all duration-300 ${cardBg}`}
    >
      {isWinner && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-[#e9c349] p-1 rounded-xl shadow-md rotate-[-12deg] border-2 border-white flex items-center justify-center z-10">
          <Crown size={10} className="fill-[#310065] text-[#310065]" />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-inner text-sm ${isWinner ? 'bg-amber-100 text-[#735c00]' : 'bg-surface-container-low text-primary'}`}>
          {opponent.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={`text-xs font-black tracking-tight ${resultColor}`}>{resultLabel}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            {new Date(duel.createdAt).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </motion.div>
  );
}

export default function HomeDashboard() {
  const { user } = useAuthContext();
  const t = useT();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userDuels, setUserDuels] = useState<DuelModel[]>([]);
  const [friendsDuels, setFriendsDuels] = useState<DuelModel[]>([]);
  const [friends, setFriends] = useState<AppUserModel[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeSummaryTab, setActiveSummaryTab] = useState<'me' | 'friends'>('me');
  const [aiBibleEnabled, setAiBibleEnabled] = useState(true);


  // Daily Verse calculation
  const { language } = useLanguage();
  const currentVerse = useMemo(() => {
    const today = new Date();
    // Using day of the year to pick a verse
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const verses = DAILY_VERSES[language] || DAILY_VERSES.ht;
    return verses[dayOfYear % verses.length];
  }, [language]);



  // Set page title
  useEffect(() => {
    document.title = t.nav.home;
  }, [t.nav.home]);

  // Load Bible AI config (lightweight — just the enabled flag)
  useEffect(() => {
    import('@/lib/bible-ai/repository').then(({ getBibleAIConfig }) => {
      getBibleAIConfig().then(cfg => setAiBibleEnabled(cfg.aiBibleEnabled));
    });
  }, []);


  // Fetch data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tournaments = await TournamentRepository.getActiveTournaments();
        setActiveTournaments(tournaments);
        
          if (user) {
            const friendsList = await getFriendsList(user.uid);
            setFriends(friendsList);

            // Also fetch some recent duels for friends to show in activity
            // For simplicity and performance, we'll fetch duels for the first few friends
            if (friendsList.length > 0) {
              const friendIds = friendsList.slice(0, 10).map(f => f.uid);
              // In a real production app, this would be a more complex query or a dedicated social feed
              // For now, we'll use getDuelsForUser for each of the top friends and combine them
              const allFriendsDuels: DuelModel[] = [];
              const last7Days = new Date();
              last7Days.setDate(last7Days.getDate() - 7);

              for (const friendId of friendIds) {
                const duels = await getDuelsForUser(friendId);
                const recent = duels.filter(d => new Date(d.createdAt) >= last7Days);
                allFriendsDuels.push(...recent);
              }
              // Deduplicate and sort
              const uniqueDuels = Array.from(new Map(allFriendsDuels.map(d => [d.id, d])).values());
              uniqueDuels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setFriendsDuels(uniqueDuels);
            }
          }
      } catch (error: any) {
        console.error("Error fetching home data. Trace:", error.stack || error);
      }
    };
    fetchInitialData();
  }, [user]);

  // Subscribe to user duels
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToDuelsForUser(user.uid, (duels) => {
      // Last 7 days
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const filtered = duels.filter(d => new Date(d.createdAt) >= last7Days);
      setUserDuels(filtered);
    });
    return () => unsubscribe();
  }, [user]);

  const weeklyStats = useMemo(() => {
    const wins = userDuels.filter(d => d.status === 'completed' && d.winnerIds.includes(user?.uid || '')).length;
    const losses = userDuels.filter(d => d.status === 'completed' && d.loserIds.includes(user?.uid || '')).length;
    const total = userDuels.length;
    return { wins, losses, total };
  }, [userDuels, user?.uid]);

  const friendsWeeklyStats = useMemo(() => {
    // Calculate from recent duels (last 7 days)
    const wins = friendsDuels.filter(d => d.status === 'completed' && friends.some(f => d.winnerIds.includes(f.uid))).length;
    const losses = friendsDuels.filter(d => d.status === 'completed' && friends.some(f => d.loserIds.includes(f.uid))).length;
    const total = friendsDuels.length;
    return { wins, losses, total };
  }, [friends, friendsDuels]);

  const slides = useMemo(() => [
    {
      title: t.home.slides.title1,
      subtitle: t.home.slides.sub1,
      gradient: "from-[#4a148c] to-[#7b1fa2]",
      icon: "🙏"
    },
    {
      title: t.home.slides.title2,
      subtitle: t.home.slides.sub2,
      gradient: "from-[#1a237e] to-[#3f51b5]",
      icon: "👑"
    },
    {
      title: t.home.slides.title3,
      subtitle: t.home.slides.sub3,
      gradient: "from-[#004d40] to-[#00897b]",
      icon: "⛰️"
    },
    {
      title: t.home.slides.title4,
      subtitle: t.home.slides.sub4,
      gradient: "from-[#bf360c] to-[#e64a19]",
      icon: "☀️"
    }
  ], [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const greeting = useMemo(() => {
    const name = user?.firstName || user?.fullName?.split(' ')[0] || user?.username;
    const helloText = t.home.greeting;
    return name ? `${helloText}, ${name} 🙏` : `${helloText}, 🙏`;
  }, [user, t.home.greeting]);

  const currentDate = new Date().toLocaleDateString(language === 'ht' ? 'ht-HT' : language === 'es' ? 'es-ES' : 'fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="bg-surface text-[#1c1c1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff] overflow-x-hidden">
      
      {/* TOP NAVIGATION BAR - Premium iOS Style */}
      <nav className="fixed top-0 w-full z-[60] bg-white/75 backdrop-blur-xl shadow-[0_4px_30px_rgba(49,0,101,0.02)] pt-safe">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Profile & XP Section */}
          <div className="flex items-center gap-3">
            <Link href="/profile" className="relative group">
              <UserAvatar
                photoURL={user?.photoURL}
                activeFrame={user?.activeFrame}
                username={user?.username}
                size={44}
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-1 -right-1 bg-[#310065] text-white text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-md z-20"
              >
                {user?.level || 1}
              </motion.div>
            </Link>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#310065] tracking-widest leading-none">XP</span>
                <span className="text-[11px] font-bold text-gray-400 tabular-nums leading-none">{user?.xp || 0}</span>
              </div>
              <div className="h-2 w-12 sm:w-16 bg-surface-container-low rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#310065] to-[#7b1fa2] rounded-full"
                  style={{ width: `${Math.min(100, (user?.xp || 0) % 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Currency & Stats */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5 items-end">
              {/* Coins */}
              <motion.div 
                whileHover={{ y: -1 }}
                className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-xl shadow-sm cursor-pointer"
              >
                <div className="w-4 h-4 relative">
                  <Image src="/assets/store/currency/coin.png" alt="Coins" fill className="object-contain" />
                </div>
                <span className="text-[11px] font-black text-[#cba72f] tabular-nums">{user?.coins?.toLocaleString() || 0}</span>
              </motion.div>
              {/* Crowns */}
              <motion.div 
                whileHover={{ y: -1 }}
                className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-xl shadow-sm cursor-pointer"
              >
                <div className="w-4 h-4 relative">
                  <Image src="/assets/store/currency/crown.png" alt="Crowns" fill className="object-contain" />
                </div>
                <span className="text-[11px] font-black text-[#310065] tabular-nums">{user?.crowns?.toLocaleString() || 0}</span>
              </motion.div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.dispatchEvent(new CustomEvent('open-store'))}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#310065] to-[#4a148c] text-white flex items-center justify-center shadow-lg shadow-[#310065]/20 group"
            >
              <ShoppingBag size={20} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="pt-16 sm:pt-20 max-w-2xl mx-auto space-y-5 sm:space-y-6">
        
        {/* 1. TOP HERO SLIDESHOW */}
        <section className="px-3 sm:px-5">
          <div className="relative h-56 sm:h-72 md:h-80 w-full rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(49,0,101,0.3)] group bg-white">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} flex flex-col justify-end px-6 sm:px-10 pt-6 sm:pt-10 pb-20 sm:pb-28 text-white`}
              >
                {/* Visual Enhancements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-[0.07] rounded-full -mr-40 -mt-40 blur-[80px]" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-black opacity-[0.1] rounded-full -ml-40 -mb-40 blur-[80px]" />
                  <div className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 scale-150" />
                </div>

                <div className="absolute -top-10 -right-10 text-[16rem] opacity-[0.05] rotate-12 group-hover:rotate-[20deg] transition-transform duration-[5000ms] select-none pointer-events-none">
                  {slides[currentSlide].icon}
                </div>
                
                <div className="relative z-10 space-y-4">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-px w-6 bg-white/40" />
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">
                        {currentDate}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg sm:text-2xl drop-shadow-sm flex items-center gap-3 italic">
                      {greeting}
                    </h3>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-4xl md:text-5xl font-serif font-black leading-[1.1] drop-shadow-xl tracking-tight italic"
                    >
                      {slides[currentSlide].title}
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/85 text-sm font-semibold max-w-[80%] leading-relaxed border-l-2 border-white/20 pl-4"
                    >
                      {slides[currentSlide].subtitle}
                    </motion.p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            </AnimatePresence>
            
            {/* Indicators - Premium look */}
            <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 flex gap-3 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
                    i === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 2. VERSE OF THE DAY - Clean Card */}
        <section className="px-3 sm:px-5">
          <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowExplanation(true)}
            className="bg-surface-container-lowest rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-6 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden group cursor-pointer border border-amber-400/10"
          >
            {/* Pulsing gold border decoration */}
            <motion.div 
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 border border-amber-400/30 rounded-[2rem] sm:rounded-[3rem] pointer-events-none z-20"
            />
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#310065]/[0.03] rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-[3000ms]" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-400/[0.02] rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-[3000ms]" />
            
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-6 sm:mb-10">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-4 bg-[#310065]/20 rounded-full" />
                  </div>
                  <span className="text-[11px] font-black text-[#310065]/60 uppercase tracking-[0.3em]">
                    {t.dashboard.verseOfDay}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-[#310065] shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={22} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl sm:text-3xl font-black text-[#310065] leading-[1.2] italic tracking-tight font-serif drop-shadow-sm">
                  &quot;{currentVerse.text}&quot;
                </h3>
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-8 bg-amber-400 rounded-full" />
                  <p className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase">{currentVerse.reference}</p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExplanation(true);
                }}
                className="mt-6 sm:mt-10 w-full py-4 sm:py-5 px-6 sm:px-8 bg-gradient-to-r from-[#310065] to-[#4a148c] text-white rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest shadow-lg shadow-[#310065]/20 group/btn"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover/btn:rotate-12 transition-transform duration-300">
                  <Info size={18} strokeWidth={2.5} />
                </div>
                <span>{t.dashboard.understandWord}</span>
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* 4. WEEKLY SUMMARY & ACTIVITY - Unified Toggle Section */}
        <section className="px-3 sm:px-5">
          <div className="bg-surface-container-lowest rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 space-y-6 sm:space-y-8 relative overflow-hidden">
            {/* TAB SWITCHER - Premium segmented control */}
            <div className="flex p-1.5 bg-surface-container-low rounded-[1.8rem] relative">
              <motion.div 
                className="absolute top-1.5 bottom-1.5 left-1.5 bg-surface-container-lowest rounded-[1.4rem] shadow-sm z-0"
                initial={false}
                animate={{ 
                  left: activeSummaryTab === 'me' ? '6px' : '50%',
                  width: 'calc(50% - 9px)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
              <button 
                onClick={() => setActiveSummaryTab('me')}
                className={`relative z-10 flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${
                  activeSummaryTab === 'me' ? 'text-[#310065]' : 'text-gray-400'
                }`}
              >
                {t.dashboard.me}
              </button>
              <button 
                onClick={() => setActiveSummaryTab('friends')}
                className={`relative z-10 flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${
                  activeSummaryTab === 'friends' ? 'text-[#310065]' : 'text-gray-400'
                }`}
              >
                {t.dashboard.friendsTab}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeSummaryTab === 'me' ? (
                <motion.div 
                  key="me-summary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-[#310065]/40 uppercase tracking-[0.25em]">{t.dashboard.weeklySummary}</h3>
                        <div className="flex -space-x-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-surface-container-low flex items-center justify-center text-[8px] font-bold text-[#310065]/20">
                              {i}
                            </div>
                          ))}
                        </div>
                      </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-container-low p-5 rounded-[2rem] text-center space-y-1 shadow-inner">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t.dashboard.matches}</p>
                        <p className="text-2xl font-black text-[#310065] tabular-nums">{weeklyStats.total}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02] border border-emerald-500/10 p-5 rounded-[2rem] text-center space-y-1 shadow-sm">
                        <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-tighter">{t.dashboard.wins}</p>
                        <p className="text-2xl font-black text-emerald-600 tabular-nums">{weeklyStats.wins}</p>
                      </div>
                      <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/[0.02] border border-rose-500/10 p-5 rounded-[2rem] text-center space-y-1 shadow-sm">
                        <p className="text-[8px] font-black text-rose-600/70 uppercase tracking-tighter">{t.dashboard.lossesLabel}</p>
                        <p className="text-2xl font-black text-rose-600 tabular-nums">{weeklyStats.losses}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-[9px] font-black text-[#310065]/30 uppercase tracking-[0.2em] px-1">{t.dashboard.lastResult}</p>
                      {userDuels.length > 0 ? (
                        userDuels.slice(0, 3).map(duel => (
                          <ActivityCard key={duel.id} duel={duel} currentUserId={user?.uid || ''} />
                        ))
                      ) : (
                        <div className="py-12 text-center bg-surface-container-low/50 rounded-[2.5rem] border border-dashed border-gray-200">
                          <Trophy size={32} className="text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.dashboard.noDuels}</p>
                        </div>

                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="friends-summary"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.dashboard.friendActivity}</h4>
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                        <User size={14} className="text-purple-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-container-low p-5 rounded-3xl text-center space-y-1 shadow-inner">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t.dashboard.matches}</p>
                        <p className="text-2xl font-black text-purple-600">{friendsWeeklyStats.total}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02] border border-emerald-500/10 p-5 rounded-3xl text-center space-y-1 shadow-sm">
                        <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-tighter">{t.dashboard.wins}</p>
                        <p className="text-2xl font-black text-emerald-600">{friendsWeeklyStats.wins}</p>
                      </div>
                      <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/[0.02] border border-rose-500/10 p-5 rounded-3xl text-center space-y-1 shadow-sm">
                        <p className="text-[8px] font-black text-rose-600/70 uppercase tracking-tighter">{t.dashboard.lossesLabel}</p>
                        <p className="text-2xl font-black text-rose-600">{friendsWeeklyStats.losses}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-[#310065]/40 uppercase tracking-[0.2em] px-2">{t.dashboard.friendActivity}</p>
                      {friendsDuels.length > 0 ? (
                        friendsDuels.slice(0, 5).map(duel => {
                          // Find which friend is in this duel (first one we find in our friends list)
                          const friendInDuel = friends.find(f => duel.participantIds.includes(f.uid));
                          return (
                            <ActivityCard 
                              key={duel.id} 
                              duel={duel} 
                              currentUserId={friendInDuel?.uid || duel.participantIds[0]} 
                            />
                          );
                        })
                      ) : (
                        <div className="py-12 text-center bg-surface-container-low/50 rounded-[2.5rem] border border-dashed border-gray-200">
                          <User size={32} className="text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">{t.dashboard.noFriendActivity}</p>
                          <Link href="/social" className="bg-[#310065] text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#310065]/20 active:scale-95 transition-all">
                            {t.dashboard.addFriends}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 5. ACTIVE TOURNAMENTS (Only if any) */}
        {activeTournaments.length > 0 && (
          <section className="px-3 sm:px-4">
            <div className="bg-gradient-to-br from-[#310065] to-[#4a148c] rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl shadow-[#310065]/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-3 py-1 bg-amber-400/20 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-2 inline-block border border-amber-400/30">
                      {t.dashboard.liveTournament}
                    </span>
                    <h3 className="text-xl font-black text-white">{t.dashboard.activeTournaments}</h3>

                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
                    <Trophy size={24} />
                  </div>
                </div>

                <div className="space-y-3">
                  {activeTournaments.map((tournament) => (
                    <Link 
                      key={tournament.id} 
                      href={`/tournament/${tournament.id}`}
                      className="block p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/item"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-white group-hover/item:text-amber-400 transition-colors">{tournament.title}</p>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-1">
                            {tournament.currentParticipants || 0} {t.dashboard.participants}

                          </p>
                        </div>
                        <ChevronRight size={18} className="text-white/20 group-hover/item:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>

                <Link 
                  href="/arena" 
                  className="w-full py-4 bg-amber-400 text-[#310065] rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  {t?.arena?.enter || 'Antre nan Arèn'}

                </Link>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* BIBLE AI FAB — Floating above BottomNav */}
      {aiBibleEnabled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-[90px] right-4 z-[55]"
        >
          <Link href="/bible-ai">
            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.93 }}
              className="relative flex items-center gap-2 pl-3 pr-4 py-3 bg-gradient-to-br from-[#cba72f] to-[#e9c349] rounded-2xl shadow-[0_8px_24px_rgba(203,167,47,0.4)] text-[#310065]"
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-[#e9c349]/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-7 h-7 bg-[#310065]/10 rounded-xl flex items-center justify-center">
                <BookOpen size={16} strokeWidth={2.5} className="text-[#310065]" />
              </div>
              <span className="relative text-[12px] font-black tracking-tight whitespace-nowrap">
                Asistente Bíblico
              </span>
            </motion.button>
          </Link>
        </motion.div>
      )}

      <BottomNav activeTab="home" />


      {/* VERSE EXPLANATION MODAL */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExplanation(false)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[2rem] sm:rounded-t-[3rem] p-5 sm:p-8 pb-12 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-[#310065] tracking-tight uppercase italic">{t.dashboard.explanation}</h3>
                <button 
                  onClick={() => setShowExplanation(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-[#f2f2f7] rounded-[2.5rem] border border-black/[0.03] shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-1 bg-amber-400 rounded-full" />
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{currentVerse.reference}</p>
                  </div>
                  <p className="text-lg font-bold text-[#310065] leading-relaxed italic">
                    &quot;{currentVerse.explanation}&quot;
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.dashboard.relatedVerses}</h4>
                    <BookOpen size={14} className="text-gray-300" />
                  </div>

                  <div className="space-y-4">
                    {currentVerse.relatedVerses.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-[2rem] border border-black/[0.03] shadow-sm hover:border-[#310065]/10 transition-colors">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-sm shadow-amber-200/20">
                          <Bookmark size={18} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-black text-[#310065]">{item.ref}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed italic">{item.text}</p>
                        </div>
                        <ChevronRight size={14} className="mt-1 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => toast.success(t.dashboard.verseSaved)}
                    className="flex-1 py-5 px-6 bg-[#f2f2f7] text-[#310065] rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Bookmark size={18} strokeWidth={2.5} />
                    {t.dashboard.save}
                  </button>

                  <button 
                    onClick={() => toast.success(t.dashboard.verseShared)}
                    className="flex-1 py-5 px-6 bg-[#310065] text-white rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#310065]/20 active:scale-95 transition-all"
                  >
                    <Share2 size={18} strokeWidth={2.5} />
                    {t.dashboard.share}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
