'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  getActiveClanEvent, 
  getClanEventById, 
  getClanEventScore, 
  getUserClanEventStats, 
  getClanEventTopRanking, 
  getMyClanEventRank, 
  distributeClanEventRewards,
  ClanEventModel,
  ClanEventScoreModel,
  UserClanEventStatsModel
} from '@/lib/clan/eventsRepository';
import { getClanById } from '@/lib/clan/repository';
import BackButton from '@/components/BackButton';
import { 
  Crown, 
  Clock, 
  Activity, 
  Trophy, 
  Shield, 
  ArrowLeft, 
  Coins, 
  ChevronRight, 
  Gamepad2,
  AlertTriangle,
  Loader2,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    battleOfClans: "Batalla de Clanes",
    timeLeft: "Tiempo restante",
    days: "días",
    day: "día",
    yourClan: "Tu Clan",
    totalPoints: "Puntos totales",
    position: "Posición",
    reachNextPosition: "Para alcanzar el puesto superior",
    projectedReward: "Premio Proyectado",
    chooseDifficulty: "Selecciona Dificultad",
    easy: "Fácil",
    normal: "Normal",
    hard: "Difíl",
    questions: "preguntas",
    multiplier: "Multiplicador",
    pointsPerCorrect: "pts por acierto",
    playEvent: "Jugar evento",
    clansLeaderboard: "Ranking de Clanes",
    seeFullRanking: "Ver ranking completo",
    prizesByPosition: "Premios por posición",
    participation: "Participación",
    seeRewards: "Ver recompensas",
    myContribution: "Mi Contribución Individual",
    pointsEarned: "Puntos Aportados",
    matchesPlayed: "Partidas Jugadas",
    backToClan: "Volver al clan",
    loadingEvent: "Cargando evento...",
    clanRequired: "Debes pertenecer a un clan para participar.",
    eventNotFound: "Evento no encontrado.",
    errorLoading: "Error al cargar información del evento.",
    selectDifficultyToast: "Selecciona una dificultad antes de iniciar la partida.",
    legendaryChest: "Cofre Legendario",
    epicChest: "Cofre Épico",
    rareChest: "Cofre Raro",
    smallChest: "Cofre Pequeño"
  },
  fr: {
    battleOfClans: "Bataille de Clans",
    timeLeft: "Temps restant",
    days: "jours",
    day: "jour",
    yourClan: "Votre Clan",
    totalPoints: "Points totaux",
    position: "Position",
    reachNextPosition: "Pour atteindre la position supérieure",
    projectedReward: "Récompense Projetée",
    chooseDifficulty: "Sélectionnez la Difficulté",
    easy: "Facile",
    normal: "Normal",
    hard: "Difficile",
    questions: "questions",
    multiplier: "Multiplicateurs",
    pointsPerCorrect: "pts par bonne réponse",
    playEvent: "Jouer l'événement",
    clansLeaderboard: "Classement des Clans",
    seeFullRanking: "Voir le classement complet",
    prizesByPosition: "Prix par Position",
    participation: "Participation",
    seeRewards: "Voir les récompenses",
    myContribution: "Ma Contribution Individuelle",
    pointsEarned: "Points Contribués",
    matchesPlayed: "Parties Jouées",
    backToClan: "Retour au clan",
    loadingEvent: "Chargement de l'événement...",
    clanRequired: "Vous devez appartenir à un clan pour participer.",
    eventNotFound: "Événement non trouvé.",
    errorLoading: "Erreur lors du chargement des informations de l'événement.",
    selectDifficultyToast: "Sélectionnez une difficulté avant de commencer la partie.",
    legendaryChest: "Coffre Légendaire",
    epicChest: "Coffre Épique",
    rareChest: "Coffre Rare",
    smallChest: "Petit Coffre"
  },
  ht: {
    battleOfClans: "Batay Klan yo",
    timeLeft: "Tan ki rete",
    days: "jou",
    day: "jou",
    yourClan: "Klan ou",
    totalPoints: "Pwen total yo",
    position: "Pozisyon",
    reachNextPosition: "Pou rive nan pozisyon anwo a",
    projectedReward: "Kado Pwojete",
    chooseDifficulty: "Chwazi Difikilte",
    easy: "Fasil",
    normal: "Nòmal",
    hard: "Difisil",
    questions: "kesyon",
    multiplier: "Miltiplikatè",
    pointsPerCorrect: "pwen pou chak repons",
    playEvent: "Jwe evènman",
    clansLeaderboard: "Klasman Klan yo",
    seeFullRanking: "Gade tout klasman an",
    prizesByPosition: "Kado pa Pozisyon",
    participation: "Patisipasyon",
    seeRewards: "Gade kado yo",
    myContribution: "Kontribisyon Mwen",
    pointsEarned: "Pwen Mwen Bay yo",
    matchesPlayed: "Jwèt Jwe",
    backToClan: "Retounen nan klan",
    loadingEvent: "Chaje evènman...",
    clanRequired: "Ou dwe nan yon klan pou w patisipe.",
    eventNotFound: "Evènman pa jwenn.",
    errorLoading: "Erreur pandan chajman enfòmasyon evènman an.",
    selectDifficultyToast: "Chwazi yon difikilte anvan ou kòmanse jwèt la.",
    legendaryChest: "Kòf Lejandè",
    epicChest: "Kòf Epik",
    rareChest: "Kòf Ra",
    smallChest: "Ti Kòf"
  },
  en: {
    battleOfClans: "Clan Battle",
    timeLeft: "Time remaining",
    days: "days",
    day: "day",
    yourClan: "Your Clan",
    totalPoints: "Total points",
    position: "Position",
    reachNextPosition: "To reach next position",
    projectedReward: "Projected Reward",
    chooseDifficulty: "Choose Difficulty",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    questions: "questions",
    multiplier: "Multiplier",
    pointsPerCorrect: "pts per correct answer",
    playEvent: "Play Event",
    clansLeaderboard: "Clans Leaderboard",
    seeFullRanking: "See Full Ranking",
    prizesByPosition: "Prizes by Position",
    participation: "Participation",
    seeRewards: "See Rewards",
    myContribution: "My Contribution",
    pointsEarned: "Points Earned",
    matchesPlayed: "Matches Played",
    backToClan: "Back to Clan",
    loadingEvent: "Loading event...",
    clanRequired: "You must belong to a clan to participate.",
    eventNotFound: "Event not found.",
    errorLoading: "Error loading event information.",
    selectDifficultyToast: "Select a difficulty before starting the match.",
    legendaryChest: "Legendary Chest",
    epicChest: "Epic Chest",
    rareChest: "Rare Chest",
    smallChest: "Small Chest"
  }
};

export default function ClanEventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [event, setEvent] = useState<ClanEventModel | null>(null);
  const [clanInfo, setClanInfo] = useState<any>(null);
  const [clanScore, setClanScore] = useState<ClanEventScoreModel | null>(null);
  const [myStats, setMyStats] = useState<UserClanEventStatsModel | null>(null);
  const [topRanking, setTopRanking] = useState<ClanEventScoreModel[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard' | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  const lang = user?.settings?.language || 'es';
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  // Localized title & description
  const eventTitle = 
    lang === 'fr' ? (event?.titleFR || event?.title) :
    lang === 'ht' ? (event?.titleHT || event?.title) :
    (event?.titleES || event?.title);

  const eventDescription = 
    lang === 'fr' ? (event?.descriptionFR || event?.description) :
    lang === 'ht' ? (event?.descriptionHT || event?.description) :
    (event?.descriptionES || event?.description);

  useEffect(() => {
    if (!event || !event.slideshowImages || event.slideshowImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % event.slideshowImages!.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (!event) return;
    const calculateTimeLeft = () => {
      const difference = new Date(event.endAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeftStr(lang === 'es' ? 'Finalizado' : lang === 'fr' ? 'Terminé' : lang === 'ht' ? 'Fini' : 'Finished');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeftStr(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [event, lang]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.clanId) {
      toast.error(t.clanRequired);
      router.push('/clans');
      return;
    }

    const loadData = async () => {
      try {
        let evt = await getClanEventById(eventId);
        if (evt) {
          // If the event end date has passed but it's not marked as ended in DB, process rewards
          if (new Date(evt.endAt).getTime() < Date.now() && evt.status !== 'ended') {
            await distributeClanEventRewards(eventId);
            evt = await getClanEventById(eventId);
          }

          const [clan, score, stats, ranks, rankInfo] = await Promise.all([
            getClanById(user.clanId!),
            getClanEventScore(eventId, user.clanId!),
            getUserClanEventStats(eventId, user.uid),
            getClanEventTopRanking(eventId, 10),
            getMyClanEventRank(eventId, user.clanId!)
          ]);

          setEvent(evt);
          setClanInfo(clan);
          setClanScore(score);
          setMyStats(stats);
          setTopRanking(ranks);
          setMyRank(rankInfo);
        } else {
          toast.error(t.eventNotFound);
          router.push('/clans');
        }
      } catch (e) {
        console.error(e);
        toast.error(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, eventId, router, t]);

  if (authLoading || loading || !event) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
        <p className="text-sm text-[#64748B] font-medium">{t.loadingEvent}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen pb-16 font-sans selection:bg-[#eddcff]">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <BackButton href="/clans" />
        <h1 className="font-bold text-base text-[#0F172A]">{eventTitle}</h1>
        <div className="w-10 h-10" />
      </header>
 
      {/* Main Container */}
      <main className="pt-20 px-4 max-w-xl mx-auto space-y-6">

        {/* Hero Card / Slideshow */}
        {event.slideshowImages && event.slideshowImages.length > 0 ? (
          <section className="rounded-[24px] overflow-hidden shadow-lg relative aspect-video border border-black/[0.03] bg-[#0F172A] flex flex-col justify-end">
            <div className="absolute inset-0">
              {event.slideshowImages.map((imageUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ))}
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20" />
            </div>

            <div className="relative z-30 p-6 space-y-2 text-white">
              <span className="bg-[#0A84FF] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                {t.battleOfClans}
              </span>
              <h2 className="text-xl font-black leading-tight drop-shadow-md">{eventTitle}</h2>
              <p className="text-xs text-white/90 leading-relaxed line-clamp-2">{eventDescription}</p>
              <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-white/90">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#ffe088]" />
                  <span>
                    {t.timeLeft}: {timeLeftStr}
                  </span>
                </div>
                {/* Dots indicator */}
                <div className="flex gap-1 z-30">
                  {event.slideshowImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'bg-[#0A84FF] w-3' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section 
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0A84FF 100%)' }}
            className="rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <span className="bg-[#0A84FF]/20 text-[#0A84FF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#0A84FF]/30">
                {t.battleOfClans}
              </span>
              <h2 className="text-2xl font-black leading-tight drop-shadow-md">{eventTitle}</h2>
              <p className="text-sm text-white/80 leading-relaxed">{eventDescription}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-white/95">
                <Clock className="w-4 h-4 text-[#ffe088]" />
                <span>
                  {t.timeLeft}: {timeLeftStr}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Winner Announcement Banner */}
        {event.status === 'ended' && topRanking.length > 0 && (
          <section className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[24px] p-6 text-white shadow-lg flex flex-col items-center text-center space-y-3 border border-yellow-400">
            <Trophy className="w-12 h-12 text-white animate-bounce" />
            <h3 className="text-lg font-black uppercase tracking-wider">
              {lang === 'es' ? '¡Ganador del Evento! 🏆' : lang === 'fr' ? 'Vainqueur de l\'événement ! 🏆' : 'Klan ki genyen! 🏆'}
            </h3>
            <p className="text-2xl font-black">{topRanking[0].clanName}</p>
            <p className="text-sm font-bold opacity-90">
              {lang === 'es' ? 'Total Puntos Acumulados' : lang === 'fr' ? 'Total des points' : 'Pwen total yo'}: {topRanking[0].totalPoints?.toLocaleString()} pts
            </p>
          </section>
        )}

        {/* Mi Clan y Su Posición */}
        {myRank && (
          <section className="bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              {t.yourClan}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-black text-[#0F172A]">
                  {clanInfo?.name || 'Mi Clan'}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {t.totalPoints}: <span className="font-bold text-[#0F172A]">{clanScore?.totalPoints || 0}</span>
                </p>
              </div>
              <div className="bg-[#ffe088]/30 px-4 py-2 rounded-2xl border border-[#cba72f]/20 text-center">
                <span className="text-[10px] font-black text-[#735c00] uppercase tracking-wider block">
                  {t.position}
                </span>
                <span className="text-xl font-black text-[#735c00]">
                  #{myRank.position}
                </span>
              </div>
            </div>

            {myRank.pointsToNext > 0 && event.status !== 'ended' && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[#64748B]">
                  {t.reachNextPosition}:
                </span>
                <span className="font-bold text-[#0A84FF]">
                  +{myRank.pointsToNext} pts
                </span>
              </div>
            )}

            {myRank.projectedReward && (
              <div className="bg-[#0A84FF]/5 p-4 rounded-2xl border border-[#0A84FF]/10 space-y-1">
                <span className="text-[10px] font-black text-[#0A84FF] uppercase tracking-wider block">
                  {event.status === 'ended' ? (lang === 'es' ? 'Premio Obtenido' : lang === 'fr' ? 'Récompense Obtenue' : 'Kado Resevwa') : t.projectedReward}
                </span>
                <p className="text-xs font-bold text-[#0F172A]">
                  {myRank.projectedReward.tierLabel} — {myRank.projectedReward.coins} 🪙 + {myRank.projectedReward.crowns} 👑 + {myRank.projectedReward.clanXp} XP
                </p>
              </div>
            )}
          </section>
        )}

        {/* Dificultades Selector */}
        {event.status !== 'ended' && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              {t.chooseDifficulty}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              
              {/* FÁCIL */}
              <button
                onClick={() => setSelectedDifficulty('easy')}
                className={`w-full text-left p-4 rounded-3xl border transition-all ${
                  selectedDifficulty === 'easy'
                    ? 'bg-[#34C759]/10 border-[#34C759] ring-2 ring-[#34C759]/20'
                    : 'bg-white border-black/[0.03] hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">
                      {t.easy}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">20 {t.questions} · {t.multiplier} x1.0</p>
                  </div>
                  <span className="text-xs font-bold text-[#34C759]">
                    +10 {t.pointsPerCorrect}
                  </span>
                </div>
              </button>

              {/* NORMAL */}
              <button
                onClick={() => setSelectedDifficulty('normal')}
                className={`w-full text-left p-4 rounded-3xl border transition-all ${
                  selectedDifficulty === 'normal'
                    ? 'bg-[#0A84FF]/10 border-[#0A84FF] ring-2 ring-[#0A84FF]/20'
                    : 'bg-white border-black/[0.03] hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">
                      {t.normal}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">30 {t.questions} · {t.multiplier} x1.5</p>
                  </div>
                  <span className="text-xs font-bold text-[#0A84FF]">
                    +15 {t.pointsPerCorrect}
                  </span>
                </div>
              </button>

              {/* DIFÍCIL */}
              <button
                onClick={() => setSelectedDifficulty('hard')}
                className={`w-full text-left p-4 rounded-3xl border transition-all ${
                  selectedDifficulty === 'hard'
                    ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-500/20'
                    : 'bg-white border-black/[0.03] hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">
                      {t.hard}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">40 {t.questions} · {t.multiplier} x2.0</p>
                  </div>
                  <span className="text-xs font-bold text-purple-600">
                    +20 {t.pointsPerCorrect}
                  </span>
                </div>
              </button>

            </div>
          </section>
        )}

        {/* Start Game Button */}
        {event.status !== 'ended' && (
          <button
            onClick={() => {
              if (!selectedDifficulty) {
                toast.error(t.selectDifficultyToast);
              } else {
                router.push(`/clan/events/${eventId}/play?difficulty=${selectedDifficulty}`);
              }
            }}
            disabled={!selectedDifficulty}
            className="w-full py-4 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-bold text-[14px] uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" />
            {t.playEvent}
          </button>
        )}

        {/* Ranking de Clanes (Top 10 Resumido) */}
        <section className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            {t.clansLeaderboard}
          </h3>
          <div className="divide-y divide-slate-100">
            {topRanking.map((rank, idx) => {
              const isMyClan = rank.clanId === user?.clanId;
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;

              return (
                <div key={rank.clanId} className={`flex items-center justify-between py-3.5 ${isMyClan ? 'bg-[#0A84FF]/5 px-2 rounded-xl border border-[#0A84FF]/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-black text-[#64748B]">
                      {medalEmoji || `#${idx + 1}`}
                    </span>
                    <p className="font-bold text-sm text-[#0F172A]">{rank.clanName}</p>
                  </div>
                  <span className="font-serif font-black text-sm text-[#0F172A]">
                    {rank.totalPoints?.toLocaleString()} pts
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => router.push(`/clan/events/[eventId]/ranking`)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-[12px] uppercase rounded-xl transition-all"
          >
            {t.seeFullRanking}
          </button>
        </section>

        {/* Premios por posición */}
        <section className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            {t.prizesByPosition}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between text-xs py-1.5 border-b border-slate-50">
              <span className="font-bold text-[#735c00]">🏆 Top 1</span>
              <span className="text-[#64748B] text-right">3,000 🪙 + 500 👑 + 1,000 XP + {t.legendaryChest}</span>
            </div>
            <div className="flex items-start justify-between text-xs py-1.5 border-b border-slate-50">
              <span className="font-bold text-[#64748B]">Top 2-5</span>
              <span className="text-[#64748B] text-right">2,000 🪙 + 300 👑 + 700 XP + {t.epicChest}</span>
            </div>
            <div className="flex items-start justify-between text-xs py-1.5 border-b border-slate-50">
              <span className="font-bold text-amber-700">Top 6-20</span>
              <span className="text-[#64748B] text-right">1,000 🪙 + 150 👑 + 400 XP + {t.rareChest}</span>
            </div>
            <div className="flex items-start justify-between text-xs py-1.5">
              <span className="font-bold text-slate-500">{t.participation}</span>
              <span className="text-[#64748B] text-right">300 🪙 + 50 👑 + 100 XP + {t.smallChest}</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/clan/events/[eventId]/rewards`)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-[12px] uppercase rounded-xl transition-all"
          >
            {t.seeRewards}
          </button>
        </section>

        {/* Mi Contribución Individual */}
        <section className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            {t.myContribution}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {t.pointsEarned}
              </p>
              <p className="text-2xl font-black text-[#0A84FF] mt-1">
                {myStats?.points || 0} pts
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {t.matchesPlayed}
              </p>
              <p className="text-2xl font-black text-[#0F172A] mt-1">
                {myStats?.matchesPlayed || 0}
              </p>
            </div>
          </div>
        </section>

        {/* Volver button */}
        <button
          onClick={() => router.push('/clans')}
          className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-[#0F172A] font-bold text-[13px] uppercase rounded-xl transition-all"
        >
          {t.backToClan}
        </button>

      </main>

    </div>
  );
}
