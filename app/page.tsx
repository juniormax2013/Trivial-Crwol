'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  Moon,
  Sun,
  User,
  Calendar,
  Bookmark,
  Share2,
  X,
  ChevronRight,
  Info,
  ShoppingBag,
  Crown,
  Brain,
  Menu,
  MessageCircle,
  Users
} from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useNotifications } from '@/hooks/useNotifications';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriendsList } from '@/lib/social/repository';
import { DuelModel } from '@/lib/duel/models';
import { AppUserModel } from '@/lib/user/models';
import { getRecentGameHistory } from '@/lib/user/repository';
import { toast } from 'sonner';
import { DAILY_VERSES } from '@/lib/daily-verse/data';
import { useLanguage } from '@/lib/i18n/context';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import ChatRoom from '@/components/chat/ChatRoom';



const gameModeNames: Record<string, Record<string, string>> = {
  arena: {
    es: 'Crown Arena',
    en: 'Crown Arena',
    fr: 'Crown Arena',
    ht: 'Crown Arena'
  },
  reto_sagrado: {
    es: 'Reto Sagrado',
    en: 'Sacred Challenge',
    fr: 'Défi Sacré',
    ht: 'Reto Sagrado'
  },
  jwe_bib_la: {
    es: 'Jwe Bib La',
    en: 'Jwe Bib La',
    fr: 'Jwe Bib La',
    ht: 'Jwe Bib La'
  },
  daily_challenge: {
    es: 'Desafío Diario',
    en: 'Daily Challenge',
    fr: 'Défi Quotidien',
    ht: 'Defi Chak Jou'
  }
};

const outcomeLabels: Record<string, Record<string, string>> = {
  win: {
    es: 'Victoria',
    en: 'Victory',
    fr: 'Victoire',
    ht: 'Viktwa'
  },
  loss: {
    es: 'Derrota',
    en: 'Defeat',
    fr: 'Défaite',
    ht: 'Defèt'
  },
  tie: {
    es: 'Empate',
    en: 'Tie',
    fr: 'Égalité',
    ht: 'Egalite'
  }
};

function ActivityCard({ 
  duel, 
  currentUserId,
  activity 
}: { 
  duel?: DuelModel; 
  currentUserId?: string;
  activity?: any;
}) {
  const t = useT();
  const { language } = useLanguage();
  const lang = (language === 'es' || language === 'fr' || language === 'ht' || language === 'en') ? language : 'es';

  let resolvedActivity: any = null;
  if (activity) {
    resolvedActivity = activity;
  } else if (duel && currentUserId) {
    const isWinner = duel.winnerIds.includes(currentUserId);
    const isLoser = duel.loserIds.includes(currentUserId);
    const isTie = duel.isTie;
    const opponentId = duel.participantIds.find(id => id !== currentUserId);
    const opponentName = duel.participants[opponentId || '']?.name || t.common.opponent;
    resolvedActivity = {
      id: duel.id,
      type: 'arena',
      outcome: isWinner ? 'win' : isLoser ? 'loss' : 'tie',
      createdAt: duel.createdAt,
      score: duel.participants[currentUserId]?.score ?? 0,
      opponentName,
      original: duel
    };
  }

  if (!resolvedActivity) return null;
  
  const isWin = resolvedActivity.outcome === 'win';
  const isLoss = resolvedActivity.outcome === 'loss';
  const isTie = resolvedActivity.outcome === 'tie';

  const modeName = gameModeNames[resolvedActivity.type]?.[lang] || resolvedActivity.type;
  const outcomeLabel = outcomeLabels[resolvedActivity.outcome]?.[lang] || resolvedActivity.outcome;

  let resultLabel = '';
  let resultColor = '';
  let cardBg = 'bg-surface-container-lowest hover:bg-surface-container-low';

  if (resolvedActivity.type === 'arena') {
    const opponent = resolvedActivity.opponentName || t.common.opponent;
    if (isWin) {
      resultLabel = `${t.duel.victory} ${t.duel.vs} ${opponent}`;
      resultColor = 'text-amber-600';
      cardBg = 'bg-gradient-to-r from-amber-500/[0.03] to-transparent hover:from-amber-500/[0.06] border-amber-200/30';
    } else if (isLoss) {
      resultLabel = `${t.duel.defeat} ${t.duel.vs} ${opponent}`;
      resultColor = 'text-red-600';
    } else {
      resultLabel = `${t.social.tie} ${t.duel.vs} ${opponent}`;
      resultColor = 'text-blue-600';
    }
  } else {
    if (resolvedActivity.opponentName) {
      const opponent = resolvedActivity.opponentName;
      if (isWin) {
        resultLabel = `${modeName}: ${t.duel.victory} vs ${opponent}`;
        resultColor = 'text-amber-600';
        cardBg = 'bg-gradient-to-r from-amber-500/[0.03] to-transparent hover:from-amber-500/[0.06] border-amber-200/30';
      } else if (isLoss) {
        resultLabel = `${modeName}: ${t.duel.defeat} vs ${opponent}`;
        resultColor = 'text-red-600';
      } else {
        resultLabel = `${modeName}: ${t.social.tie} vs ${opponent}`;
        resultColor = 'text-blue-600';
      }
    } else {
      resultLabel = `${modeName}: ${outcomeLabel} (${resolvedActivity.score} pts)`;
      if (isWin) {
        resultColor = 'text-amber-600';
        cardBg = 'bg-gradient-to-r from-amber-500/[0.03] to-transparent hover:from-amber-500/[0.06] border-amber-200/30';
      } else {
        resultColor = 'text-red-600';
      }
    }
  }

  const locale = language === 'ht' ? 'ht-HT' : language === 'es' ? 'es-ES' : 'fr-FR';

  const renderModeIcon = () => {
    switch (resolvedActivity.type) {
      case 'arena':
        return <Crown size={16} className="text-[#310065]" />;
      case 'reto_sagrado':
        return <Swords size={16} className="text-[#0A84FF]" />;
      case 'jwe_bib_la':
        return <BookOpen size={16} className="text-purple-600" />;
      case 'daily_challenge':
        return <Calendar size={16} className="text-emerald-600" />;
      default:
        return <Trophy size={16} className="text-slate-600" />;
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative flex items-center justify-between p-4 rounded-2xl shadow-sm border border-black/[0.02] transition-all duration-300 ${cardBg}`}
    >
      {isWin && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-[#e9c349] p-1 rounded-xl shadow-md rotate-[-12deg] border-2 border-white flex items-center justify-center z-10">
          <Crown size={10} className="fill-[#310065] text-[#310065]" />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-inner ${
          resolvedActivity.type === 'arena' ? 'bg-amber-100 text-[#735c00]' :
          resolvedActivity.type === 'reto_sagrado' ? 'bg-blue-100 text-blue-600' :
          resolvedActivity.type === 'jwe_bib_la' ? 'bg-purple-100 text-purple-600' :
          'bg-emerald-100 text-emerald-600'
        }`}>
          {renderModeIcon()}
        </div>
        <div>
          <p className={`text-xs font-black tracking-tight ${resultColor}`}>{resultLabel}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            {new Date(resolvedActivity.createdAt).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
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
  const router = useRouter();
  const { user } = useAuthContext();
  const t = useT();
  const { unreadCount, unreadChatRooms, setDrawerOpen } = useNotifications();
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userDuels, setUserDuels] = useState<DuelModel[]>([]);
  const [friendsDuels, setFriendsDuels] = useState<DuelModel[]>([]);
  const [friends, setFriends] = useState<AppUserModel[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeSummaryTab, setActiveSummaryTab] = useState<'me' | 'friends'>('me');
  const isDarkMode = false;
  const [aiBibleEnabled, setAiBibleEnabled] = useState(true);
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [otherGames, setOtherGames] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Drag and drop gesture state for Chat & AI opening
  const [showTargets, setShowTargets] = useState(false);
  const [activeTarget, setActiveTarget] = useState<'chat' | 'ai' | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAiTooltip(false);
      setShowTargets(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 450);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    // If they were not dragging or targets weren't shown, treat as normal click to chat
    if (!showTargets) {
      if (user?.clanId) {
        setIsChatOpen(true);
      } else {
        router.push('/chat');
      }
    }
  };

  const handleDrag = (event: any, info: any) => {
    const dragX = info.offset.x;
    const dragY = info.offset.y;

    if (dragY < -30 && Math.abs(dragY) > Math.abs(dragX)) {
      setActiveTarget('chat');
      setShowTargets(true);
    } else if (dragX < -30 && Math.abs(dragX) > Math.abs(dragY)) {
      setActiveTarget('ai');
      setShowTargets(true);
    } else {
      setActiveTarget(null);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (showTargets) {
      if (activeTarget === 'chat') {
        router.push('/chat?id=global_main');
      } else if (activeTarget === 'ai') {
        router.push('/bible-ai');
      }
    }
    setShowTargets(false);
    setActiveTarget(null);
  };

  // Load other games history
  useEffect(() => {
    if (!user) return;
    getRecentGameHistory(user.uid).then(history => {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const filtered = history.filter((g: any) => new Date(g.createdAt) >= last7Days);
      setOtherGames(filtered);
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.remove('dark');
  }, []);

  // Control visible timer for AI assistant tooltip FAB
  useEffect(() => {
    if (!aiBibleEnabled) return;
    
    const showTimer = setTimeout(() => {
      setShowAiTooltip(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setShowAiTooltip(false);
    }, 8500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [aiBibleEnabled]);



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
    const arenaWins = userDuels.filter(d => d.status === 'completed' && d.winnerIds.includes(user?.uid || '')).length;
    const arenaLosses = userDuels.filter(d => d.status === 'completed' && d.loserIds.includes(user?.uid || '')).length;
    const arenaTotal = userDuels.length;

    const otherWins = otherGames.filter(g => g.outcome === 'win').length;
    const otherLosses = otherGames.filter(g => g.outcome === 'loss').length;
    const otherTotal = otherGames.length;

    return {
      wins: arenaWins + otherWins,
      losses: arenaLosses + otherLosses,
      total: arenaTotal + otherTotal
    };
  }, [userDuels, otherGames, user?.uid]);

  const recentActivities = useMemo(() => {
    const list: any[] = [];
    userDuels.forEach(d => {
      const opponentId = d.participantIds.find(id => id !== user?.uid);
      const opponentName = d.participants[opponentId || '']?.name || '';
      list.push({
        id: d.id,
        type: 'arena',
        outcome: d.winnerIds.includes(user?.uid || '') ? 'win' : d.loserIds.includes(user?.uid || '') ? 'loss' : 'tie',
        createdAt: d.createdAt,
        score: d.participants[user?.uid || '']?.score ?? 0,
        opponentName,
        original: d
      });
    });
    otherGames.forEach(g => {
      list.push({
        id: g.id,
        type: g.gameMode,
        outcome: g.outcome,
        createdAt: g.createdAt,
        score: g.score,
        opponentName: g.opponentName,
        original: g
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [userDuels, otherGames, user?.uid]);

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

  const handleShare = async () => {
    const textToShare = `"${currentVerse.text}" — ${currentVerse.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({
          text: textToShare,
        });
        toast.success(t.dashboard.verseShared);
      } catch (err) {
        console.warn('Share cancelled or failed:', err);
      }
    } else {
      const encodedText = encodeURIComponent(textToShare);
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
      toast.success(t.dashboard.verseShared);
    }
  };

  const handleSave = () => {

    try {
      const saved = localStorage.getItem('saved_verses');
      const list = saved ? JSON.parse(saved) : [];
      
      const exists = list.some((item: any) => item.text === currentVerse.text && item.reference === currentVerse.reference);
      if (exists) {
        toast.info(language === 'es' ? 'Este versículo ya está guardado.' : language === 'fr' ? 'Ce verset est déjà enregistré.' : 'Vèsè sa a deja sove.');
        return;
      }
      
      list.push({
        text: currentVerse.text,
        reference: currentVerse.reference,
        explanation: currentVerse.explanation,
        savedAt: new Date().toISOString(),
      });
      
      localStorage.setItem('saved_verses', JSON.stringify(list));
      toast.success(t.dashboard.verseSaved);
    } catch (err) {
      console.error('Failed to save verse:', err);
      toast.error('Error al guardar el versículo');
    }
  };

  return (


    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(203,167,47,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(49,0,101,0.12),_transparent_28%),var(--background)] text-[var(--foreground)] min-h-screen pb-8 font-sans selection:bg-[#eddcff] overflow-x-hidden">
      
      {/* TOP NAVIGATION BAR - Premium iOS Style */}
      <nav className="fixed top-0 w-full z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_30px_-14px_rgba(15,23,42,0.18)] border border-slate-200/60 dark:border-slate-800/60 pt-safe">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Botón de menú lateral */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-sidenav'))}
            aria-label="Abrir menú de navegación"
            className="w-11 h-11 rounded-2xl
                       bg-[#310065]/[0.06] hover:bg-[#310065]/[0.10]
                       flex items-center justify-center
                       text-[#310065] transition-colors duration-200"
          >
            <Menu size={22} strokeWidth={2.5} />
          </motion.button>

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

            {/* Campana de Notificaciones - iOS Style */}
            <motion.button
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Ver notificaciones y mensajes"
              className="w-12 h-12 rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-slate-800/50 ml-2
                         bg-[#310065]/[0.06] hover:bg-[#310065]/[0.10]
                         flex items-center justify-center
                         text-[#310065] transition-colors duration-200"
            >
              <Bell size={22} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </nav>


      <main className="pt-16 sm:pt-20 max-w-2xl mx-auto space-y-5 sm:space-y-6">
        
        {/* 1. TOP HERO SLIDESHOW */}
        <section className="px-3 sm:px-5">
          <div className="relative h-56 sm:h-72 md:h-80 w-full rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-30px_rgba(49,0,101,0.18)] group bg-[rgba(255,255,255,0.92)] dark:bg-slate-950/95 border border-white/10 dark:border-slate-800/70">
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
            className="bg-[rgba(255,255,255,0.87)] dark:bg-slate-950/90 rounded-[2rem] sm:rounded-[3rem] shadow-[0_24px_80px_-42px_rgba(15,23,42,0.12)] p-6 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden group cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
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
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExplanation(true);
                }}
                className="mt-6 py-2.5 px-5 bg-gradient-to-r from-[#310065] to-[#4a148c] text-white rounded-full flex items-center justify-center gap-2 font-bold text-[13px] shadow-[0_4px_12px_rgba(49,0,101,0.2)] hover:opacity-95 transition-all self-center sm:self-start w-fit group"
              >
                <Info size={16} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>{t.dashboard.understandWord}</span>
              </motion.button>

            </div>
          </motion.div>
        </section>

        {/* 4. WEEKLY SUMMARY & ACTIVITY - Unified Toggle Section */}
        <section className="px-3 sm:px-5">
          <div className="bg-[rgba(255,255,255,0.86)] dark:bg-slate-950/90 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.12)] border border-slate-200/60 dark:border-slate-700/50 space-y-6 sm:space-y-8 relative overflow-hidden">
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
                      {recentActivities.length > 0 ? (
                        recentActivities.slice(0, 5).map(activity => (
                          <ActivityCard key={activity.id} activity={activity} />
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

        {/* CLANS AND GRUPS SECTION */}
        <section className="px-3 sm:px-5">
          {(() => {
            const clanTitle = language === 'es' ? 'Clanes y Grupos' : language === 'fr' ? 'Clans et Groupes' : language === 'ht' ? 'Klan ak Gwoup' : 'Clans & Groups';
            const clanDesc = language === 'es' ? 'Únete a un clan o crea el tuyo para sumar poder y dominar junto a otros fotógrafos y sabios.' : language === 'fr' ? 'Rejoignez un clan ou créez le vôtre pour accumuler de la puissance et dominer ensemble.' : language === 'ht' ? 'Antre nan yon klan oswa kreye pa ou pou ajoute pouvwa ak domine ansanm.' : 'Join a clan or create your own to gain power and dominate together.';
            const exploreText = language === 'es' ? 'Explorar Clanes' : language === 'fr' ? 'Explorer les Clans' : language === 'ht' ? 'Eksplore Klan yo' : 'Explore Clans';
            const statusText = language === 'es' ? 'Disponible' : language === 'fr' ? 'Disponible' : language === 'ht' ? 'Disponib' : 'Available';
            
            return (
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-950/90 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.12)] border border-slate-200/60 dark:border-slate-800/50 relative overflow-hidden group"
              >
                <div className="absolute right-0 top-0 w-32 h-32 bg-[#0A84FF]/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-[#0A84FF]/10 transition-colors pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#0066cc] flex items-center justify-center shadow-lg shadow-[#0A84FF]/20 flex-shrink-0">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-[#0F172A] dark:text-white tracking-tight">{clanTitle}</h3>
                        <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">
                          {statusText}
                        </span>
                      </div>
                      <p className="text-[#64748B] dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
                        {clanDesc}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    href="/clans"
                    className="py-3 px-6 bg-[#0A84FF] text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-md shadow-[#0A84FF]/10 hover:bg-[#0A84FF]/95 hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto text-center"
                  >
                    <span>{exploreText}</span>
                    <ChevronRight size={14} strokeWidth={3} />
                  </Link>
                </div>
              </motion.div>
            );
          })()}
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
          className="fixed bottom-6 right-4 z-[55] flex items-center gap-3"
        >
          {/* Tooltip con el mensaje personalizado */}
          <AnimatePresence>
            {showAiTooltip && !showTargets && (
              <motion.div
                initial={{ opacity: 0, x: 15, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 15, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-white text-[#0f172a] text-[11px] font-bold px-4 py-2.5 rounded-2xl
                           shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#1b1b1e]/5 max-w-[210px] leading-snug"
              >
                {t.dashboard.assistantTooltip}
                {/* Pico del tooltip apuntando al FAB */}
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-[#1b1b1e]/5 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Target Zones: Chat (Arriba) y AI (Izquierda) */}
          <AnimatePresence>
            {showTargets && (
              <>
                {/* Chat con amigos (ARRIBA) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: activeTarget === 'chat' ? 1.25 : 1, 
                    y: -68,
                    x: 0
                  }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  className={`absolute right-0 w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all z-40 ${
                    activeTarget === 'chat' 
                      ? 'bg-[#0A84FF] shadow-[#0A84FF]/40 ring-4 ring-[#0A84FF]/20' 
                      : 'bg-[#310065] shadow-[#310065]/20'
                  }`}
                >
                  <MessageCircle size={18} />
                </motion.div>

                {/* AI Assistant (IZQUIERDA) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: activeTarget === 'ai' ? 1.25 : 1, 
                    x: -68,
                    y: 0
                  }}
                  exit={{ opacity: 0, scale: 0.5, x: 20 }}
                  className={`absolute right-0 w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all z-40 ${
                    activeTarget === 'ai' 
                      ? 'bg-[#0A84FF] shadow-[#0A84FF]/40 ring-4 ring-[#0A84FF]/20' 
                      : 'bg-[#310065] shadow-[#310065]/20'
                  }`}
                >
                  <Brain size={18} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <motion.button
            drag
            dragConstraints={{ top: -120, bottom: 50, left: -120, right: 50 }}
            dragElastic={0.4}
            dragSnapToOrigin={true}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            whileHover={{ scale: 1.08 }}
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#cba72f] to-[#e9c349] 
                       shadow-[0_8px_24px_rgba(203,167,47,0.4)] text-[#310065] flex items-center justify-center shrink-0 z-50 cursor-grab active:cursor-grabbing"
            aria-label="Asistente de Chat / IA"
          >
            {/* Pulse ring */}
            {!showTargets && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[#e9c349]/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <MessageCircle size={20} strokeWidth={2.5} className="relative z-10 text-[#310065]" />
            {unreadChatRooms.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md z-[60] leading-none animate-bounce">
                {unreadChatRooms.length}
              </span>
            )}
          </motion.button>
        </motion.div>
      )}

      <BottomNav activeTab="home" showTriggerButton={true} isAssistantTooltipVisible={showAiTooltip} />



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
                    onClick={handleSave}
                    className="flex-1 py-5 px-6 bg-[#f2f2f7] text-[#310065] rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Bookmark size={18} strokeWidth={2.5} />
                    {t.dashboard.save}
                  </button>


                   <button 
                    onClick={handleShare}
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
      {/* Clan Chat Pop-up Modal on Home */}
      {isChatOpen && user?.clanId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsChatOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-white h-[88vh] max-h-[850px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            style={{ borderRadius: '48px', overflow: 'hidden', transform: 'translate3d(0, 0, 0)', isolation: 'isolate' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatRoom 
              chatId={`clan_${user.clanId}`} 
              onBack={() => setIsChatOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
