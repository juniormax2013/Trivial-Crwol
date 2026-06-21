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
import { getActiveArenaClanEvent, getClanEventScore, getMyClanEventRank, ClanEventModel } from '@/lib/clan/eventsRepository';
import { toast } from 'sonner';
import { subscribeGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';

export default function Arena() {
  const { user, loading } = useAuthContext();
  const t = useT();
  const { language } = useLanguage();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [lockedModeInfo, setLockedModeInfo] = useState<{ requiredLevel: number; modeName: string } | null>(null);

  const [activeEvent, setActiveEvent] = useState<ClanEventModel | null>(null);
  const [clanEventScore, setClanEventScore] = useState<any>(null);
  const [clanEventRank, setClanEventRank] = useState<any>(null);
  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeGameEngineConfig((config) => {
      setEngineConfig(config);
    });
    return () => unsubscribe();
  }, []);

  const handleGameModeClick = (e: React.MouseEvent, path: string, requiredLevel: number, bypassKey: 'dailyChallenge' | 'bibleJourney' | 'sacredChallenge' | 'crownArena' | 'duelArena', modeName: string) => {
    e.preventDefault();
    const isAdmin = user?.role === 'super_admin' || user?.email === 'juniormax2013@gmail.com';
    
    // Check if disabled by admin
    const isModeDisabled = engineConfig?.disabledGameModes?.[bypassKey] === true;
    if (isModeDisabled) {
      toast.error(t.play.modeDisabled || 'Este modo de juego está temporalmente desactivado.');
      return;
    }

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

  useEffect(() => {
    if (user?.uid) {
      getActiveArenaClanEvent().then((evt) => {
        if (evt) {
          setActiveEvent(evt);
          if (user.clanId) {
            getClanEventScore(evt.id, user.clanId).then(setClanEventScore);
            getMyClanEventRank(evt.id, user.clanId).then(setClanEventRank);
          }
        }
      });
    }
  }, [user?.uid, user?.clanId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#faf8ff] text-[#0F172A] min-h-screen pb-8 font-sans selection:bg-[#eddcff]">
      
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

        {/* Clan Event Active Banner */}
        {activeEvent && (
          <section className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-4 px-1">
              <div>
                <h3 className="font-serif text-[26px] font-bold text-[#310065] leading-tight">
                  {(t as any).clanEvents?.battleOfClans || 'Batalla de Clanes'}
                </h3>
                <p className="text-[#7c7483] font-medium text-[13px] mt-1">
                  {(t as any).clanEvents?.playToEarnPoints || 'Juega para sumar puntos a tu clan'}
                </p>
              </div>
              <div className="bg-[#0A84FF] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-[#0A84FF]/20">
                {(t as any).clanEvents?.wisdomCup || 'Copa de Sabiduría Bíblica'}
              </div>
            </div>

            <div
              onClick={() => {
                if (!user?.clanId) {
                  toast.error((t as any).clanEvents?.mustJoinClan || 'Debes pertenecer a un clan para participar');
                } else {
                  router.push(`/clan/events/${activeEvent.id}`);
                }
              }}
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #3b82f6 100%)' }}
              className="cursor-pointer block relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl group hover:scale-[1.01] transition-all active:scale-[0.99] border border-white/10"
            >
              <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
                <div className="absolute top-0 right-10 w-44 h-44 bg-[#0A84FF] rounded-full blur-[80px]" />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#ffe088] rounded-full blur-[100px]" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#0A84FF] to-blue-600 flex items-center justify-center shadow-[0_12px_24px_rgba(10,132,255,0.3)] rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <Swords className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <span className="bg-[#0A84FF]/20 text-[#0A84FF] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block border border-[#0A84FF]/30">
                      {(t as any).clanEvents?.clanNeedsHelp || 'Tu clan necesita tu ayuda'}
                    </span>
                    <h4 className="font-serif text-[28px] font-black text-white leading-tight mb-1 drop-shadow-md">
                      {activeEvent.title}
                    </h4>
                    <p className="text-white/70 text-[14px] font-medium max-w-[320px]">
                      {activeEvent.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                  {user?.clanId && clanEventScore && (
                    <div className="text-right">
                      <div className="text-[12px] text-white/60 font-bold uppercase tracking-wider">
                        {(t as any).clanEvents?.clanPoints || 'Puntos del clan'}
                      </div>
                      <div className="text-[28px] font-serif font-black text-[#ffe088] drop-shadow-sm">
                        {clanEventScore.totalPoints?.toLocaleString()} pts
                      </div>
                      {clanEventRank && (
                        <div className="text-[12px] font-bold text-white/95 bg-white/10 px-3 py-1 rounded-full border border-white/10 mt-1 inline-block">
                          🏆 Rank #{clanEventRank.position}
                        </div>
                      )}
                    </div>
                  )}
                  <button className="flex items-center gap-2 text-[#ffe088] font-black uppercase tracking-[0.2em] text-[12px] group-hover:gap-4 transition-all">
                    {(t as any).clanEvents?.enterEvent || 'Entrar al evento'} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ffe088]" />
                    <span className="text-[12px] font-bold text-[#ffe088] tracking-wide">
                      {(t as any).clanEvents?.timeLeft || 'Tiempo restante'}: {Math.max(0, Math.ceil((new Date(activeEvent.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Game Modes Section - Premium iOS Style */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-2 mt-4">
            <Sparkles className="w-6 h-6 text-[#310065]" />
            <div>
              <h3 className="font-serif text-[22px] font-black text-[#310065] leading-tight">
                {language === 'es' ? '¡Bienvenido!' : language === 'fr' ? 'Bienvenue !' : language === 'ht' ? 'Byenveni!' : 'Welcome!'}
              </h3>
              <p className="text-[#64748B] font-medium text-[13px] mt-0.5">
                {language === 'es' ? 'Elige un modo y pon a prueba tus conocimientos.' : language === 'fr' ? 'Choisissez un mode et testez vos connaissances.' : language === 'ht' ? 'Chwazi yon mòd epi teste konesans ou.' : 'Choose a mode and test your knowledge.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 px-1">
            
            {(() => {
              const isAdmin = user?.role === 'super_admin' || user?.email === 'juniormax2013@gmail.com';
              const order = engineConfig?.gameModeOrder || [
                'crownArena',
                'dailyChallenge',
                'bibleJourney',
                'sacredChallenge',
                'duelArena'
              ];
              
              const fullOrder = [...order, 'clans'];

              return fullOrder.map((key, index) => {
                const isLastOdd = index === fullOrder.length - 1 && fullOrder.length % 2 !== 0;
                // Base classes for the card - min height to fit extra options
                const cardClasses = `bg-white rounded-[24px] p-5 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(49,0,101,0.04)] hover:shadow-[0_8px_30px_rgba(49,0,101,0.08)] transition-all active:scale-[0.98] border border-white min-h-[220px] ${isLastOdd ? 'col-span-2 w-full max-w-[200px] justify-self-center' : ''}`;
                
                // Icon wrapper classes
                const iconWrapperClasses = "w-[64px] h-[64px] rounded-full flex items-center justify-center mb-3 relative shrink-0";

                if (key === 'clans') {
                  const clanTitle = language === 'es' ? 'Clanes y Grupos' : language === 'fr' ? 'Clans et Groupes' : language === 'ht' ? 'Klan ak Gwoup' : 'Clans & Groups';
                  const clanDesc = language === 'es' ? 'Únete a un clan o crea el tuyo para sumar poder y dominar la tabla.' : language === 'fr' ? 'Rejoignez un clan ou créez le vôtre pour accumuler de la puissance.' : language === 'ht' ? 'Antre nan yon klan oswa kreye pa ou pou ajoute pouvwa.' : 'Join a clan or create your own to gain power and dominate.';
                  return (
                    <Link key="clans" href="/clans" className={cardClasses}>
                      <div className={`${iconWrapperClasses} bg-blue-50`}>
                        <Users className="w-8 h-8 text-[#0A84FF] fill-[#0A84FF]/20" />
                        <Sparkles className="w-3 h-3 text-[#0A84FF]/40 absolute top-0 right-1" />
                        <Sparkles className="w-2 h-2 text-[#0A84FF]/40 absolute bottom-1 left-0" />
                      </div>
                      <h4 className="font-bold text-[14px] text-[#310065] leading-snug mb-1">
                        {clanTitle}
                      </h4>
                      <p className="text-[10px] text-[#64748B] mb-3 line-clamp-2 leading-relaxed px-1">
                        {clanDesc}
                      </p>
                      <div className="flex flex-col gap-1.5 mt-auto w-full items-center">
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          <span className="text-[#0A84FF] text-[9px] font-bold uppercase tracking-wider bg-[#0A84FF]/10 px-2 py-0.5 rounded-full border border-[#0A84FF]/20 flex items-center gap-1">
                            <Users size={10} /> {language === 'es' ? 'Sistema' : 'System'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }

                const isDisabled = engineConfig?.disabledGameModes?.[key as keyof typeof engineConfig.disabledGameModes] === true;
                if (isDisabled) return null;

                switch (key) {
                  case 'crownArena':
                    return (
                      <Link
                        key="crownArena"
                        href="/arena/crown-arena"
                        onClick={(e) => handleGameModeClick(e, '/arena/crown-arena', 0, 'crownArena', t.crownArena?.title || 'Crown Arena')}
                        className={cardClasses}
                      >
                        <div className={`${iconWrapperClasses} bg-[#fffbf0]`}>
                          <Crown className="w-8 h-8 text-[#e9c349] fill-[#ffe088]" />
                          <Sparkles className="w-3 h-3 text-[#e9c349]/40 absolute top-0 right-1" />
                          <Sparkles className="w-2 h-2 text-[#e9c349]/40 absolute bottom-1 left-0" />
                        </div>
                        <h4 className="font-bold text-[14px] text-[#310065] leading-snug mb-1">
                          {t.crownArena?.title || 'Crown Arena'}
                        </h4>
                        <p className="text-[10px] text-[#64748B] mb-3 line-clamp-2 leading-relaxed px-1">
                          {t.arena.marathonDesc}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-auto w-full items-center">
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span className="text-[#cba72f] text-[9px] font-bold uppercase tracking-wider bg-[#ffe088]/20 px-2 py-0.5 rounded-full border border-[#ffe088]/40 flex items-center gap-1">
                              <Users size={10} /> {t.arena.playersRange}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );

                  case 'dailyChallenge': {
                    const isDailyLocked = !user || (!isAdmin && (user.level ?? 0) < 1 && !user.customAccess?.dailyChallenge);
                    const isDailyBypassed = !!user?.customAccess?.dailyChallenge;
                    return (
                      <Link
                        key="dailyChallenge"
                        href="/daily-challenge"
                        onClick={(e) => handleGameModeClick(e, '/daily-challenge', 1, 'dailyChallenge', t.daily.title)}
                        className={`${cardClasses} ${isDailyLocked ? 'opacity-70 grayscale hover:shadow-[0_4px_20px_rgba(49,0,101,0.04)] cursor-pointer' : ''}`}
                      >
                        <div className={`${iconWrapperClasses} bg-[#f5f0ff]`}>
                          <Calendar className="w-8 h-8 text-[#7a49a5] fill-[#e6d5ff]" />
                          <Sparkles className="w-3 h-3 text-[#7a49a5]/40 absolute top-0 right-1" />
                        </div>
                        <h4 className="font-bold text-[14px] text-[#310065] leading-snug mb-1 line-clamp-2">
                          {t.daily.title}
                        </h4>
                        <p className="text-[10px] text-[#64748B] mb-3 line-clamp-2 leading-relaxed px-1">
                          {t.daily.subtitle}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-auto w-full items-center">
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span className="text-[#ff6b00] text-[9px] font-bold uppercase tracking-wider bg-[#ff6b00]/10 px-2 py-0.5 rounded-full border border-[#ff6b00]/20 flex items-center gap-1">
                              <Flame size={10} className="fill-[#ff6b00]" /> {t.daily.alreadyDoneDesc}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            {isDailyLocked ? (
                              <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                <Lock size={9} /> Lvl 1
                              </span>
                            ) : isDailyBypassed ? (
                              <span className="text-[#0A84FF] text-[9px] font-bold uppercase tracking-wider bg-[#0A84FF]/10 px-2 py-0.5 rounded-full border border-[#0A84FF]/20 flex items-center gap-1">
                                ★ Admin
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  case 'bibleJourney': {
                    const isBibleLocked = !user || (!isAdmin && (user.level ?? 0) < 3 && !user.customAccess?.bibleJourney);
                    const isBibleBypassed = !!user?.customAccess?.bibleJourney;
                    return (
                      <Link
                        key="bibleJourney"
                        href="/jwe-bib-la"
                        onClick={(e) => handleGameModeClick(e, '/jwe-bib-la', 3, 'bibleJourney', t.dashboard.bibleGame)}
                        className={`${cardClasses} ${isBibleLocked ? 'opacity-70 grayscale hover:shadow-[0_4px_20px_rgba(49,0,101,0.04)] cursor-pointer' : ''}`}
                      >
                        <div className={`${iconWrapperClasses} bg-[#f4eaff]`}>
                          <BookOpen className="w-8 h-8 text-[#5f2b96] fill-[#c8a2ff]" />
                          <Sparkles className="w-3 h-3 text-[#5f2b96]/40 absolute top-0 right-1" />
                        </div>
                        <h4 className="font-bold text-[14px] text-[#310065] leading-snug mb-1 line-clamp-2">
                          {t.dashboard.bibleGame}
                        </h4>
                        <p className="text-[10px] text-[#64748B] mb-3 line-clamp-2 leading-relaxed px-1">
                          {t.arena.bibleGameDesc}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-auto w-full items-center">
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span className="text-[#cba72f] text-[9px] font-bold uppercase tracking-wider bg-[#ffe088]/20 px-2 py-0.5 rounded-full border border-[#ffe088]/40 flex items-center gap-1">
                              <Zap size={10} className="fill-[#cba72f]" /> {user?.jweEnergy ?? 0}
                            </span>
                            <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                              <Heart size={10} className="fill-red-500" /> {user?.jweHearts ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            {isBibleLocked ? (
                              <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                <Lock size={9} /> Lvl 3
                              </span>
                            ) : isBibleBypassed ? (
                              <span className="text-[#0A84FF] text-[9px] font-bold uppercase tracking-wider bg-[#0A84FF]/10 px-2 py-0.5 rounded-full border border-[#0A84FF]/20 flex items-center gap-1">
                                ★ Admin
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  case 'sacredChallenge': {
                    const isSacredLocked = !user || (!isAdmin && (user.level ?? 0) < 5 && !user.customAccess?.sacredChallenge);
                    const isSacredBypassed = !!user?.customAccess?.sacredChallenge;
                    return (
                      <Link
                        key="sacredChallenge"
                        href="/reto-sagrado"
                        onClick={(e) => handleGameModeClick(e, '/reto-sagrado', 5, 'sacredChallenge', t.play.sacredChallenge)}
                        className={`${cardClasses} ${isSacredLocked ? 'opacity-70 grayscale hover:shadow-[0_4px_20px_rgba(49,0,101,0.04)] cursor-pointer' : ''}`}
                      >
                        <div className={`${iconWrapperClasses} bg-[#f0f6ff]`}>
                          <Shield className="w-8 h-8 text-[#2563eb] fill-[#93c5fd]" />
                          <Sparkles className="w-3 h-3 text-[#2563eb]/40 absolute top-0 right-1" />
                        </div>
                        <h4 className="font-bold text-[14px] text-[#310065] leading-snug mb-1 line-clamp-2">
                          {t.play.sacredChallenge}
                        </h4>
                        <p className="text-[10px] text-[#64748B] mb-3 line-clamp-2 leading-relaxed px-1">
                          {t.play.sacredChallengeDesc}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-auto w-full items-center">
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span className="text-[#0A84FF] text-[9px] font-bold uppercase tracking-wider bg-[#0A84FF]/10 px-2 py-0.5 rounded-full border border-[#0A84FF]/20 flex items-center gap-1">
                              <Sparkles size={10} /> {t.arena.playersRange}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            {isSacredLocked ? (
                              <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                <Lock size={9} /> Lvl 5
                              </span>
                            ) : isSacredBypassed ? (
                              <span className="text-[#0A84FF] text-[9px] font-bold uppercase tracking-wider bg-[#0A84FF]/10 px-2 py-0.5 rounded-full border border-[#0A84FF]/20 flex items-center gap-1">
                                ★ Admin
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  case 'duelArena':
                    return (
                      <Link
                        key="duelArena"
                        href="/arena/duels"
                        onClick={(e) => handleGameModeClick(e, '/arena/duels', 0, 'duelArena', t.duel?.title || 'Duelos')}
                        className={cardClasses}
                      >
                        <div className={`${iconWrapperClasses} bg-[#fcf5ff]`}>
                          <Swords className="w-8 h-8 text-[#6b21a8] fill-[#d8b4fe]" />
                          <Sparkles className="w-3 h-3 text-[#6b21a8]/40 absolute top-0 right-1" />
                        </div>
                        <h4 className="font-bold text-[14px] text-[#310065] leading-snug mb-1 line-clamp-2">
                          {t.duel?.title || 'Duelos'}
                        </h4>
                        <p className="text-[10px] text-[#64748B] mb-3 line-clamp-2 leading-relaxed px-1">
                          {t.arena.duelsSubtitle}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-auto w-full items-center">
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span className="text-[#6b21a8] text-[9px] font-bold uppercase tracking-wider bg-[#f5f0ff] px-2 py-0.5 rounded-full border border-[#eaddff] flex items-center gap-1">
                              <Crown size={10} className="fill-[#6b21a8]" /> {t.arena.winReward}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            {pendingCount > 0 ? (
                              <span className="text-white text-[9px] font-bold uppercase tracking-wider bg-red-500 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Zap size={9} className="fill-white" /> {pendingCount} Pendiente
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );

                  default:
                    return null;
                }
              });
            })()}

          </div>
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
