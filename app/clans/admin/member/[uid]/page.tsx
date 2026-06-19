'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { getClanById, getClanMembers } from '@/lib/clan/repository';
import { getMemberActivity, ClanMemberActivityModel } from '@/lib/clan/memberActivity';
import BackButton from '@/components/BackButton';
import UserAvatar from '@/components/UserAvatar';
import {
  Loader2,
  ShieldAlert,
  Wifi,
  WifiOff,
  Gamepad2,
  Trophy,
  Star,
  MessageCircle,
  AlertTriangle,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Target,
  Shield,
  BarChart3,
  Calendar,
  Zap,
  Crown,
  Coins,
  Globe,
  Volume2,
  VolumeX,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Flag,
  Activity,
  FileText,
} from 'lucide-react';

// ─────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────
const T = {
  es: {
    title: 'Actividad del Miembro',
    tabs: ['Resumen', 'Juego', 'Aporte', 'Eventos', 'Chat', 'Disciplina', 'Invitaciones'],
    loading: 'Cargando actividad...',
    noAccess: 'Sin acceso',
    noAccessDesc: 'Solo el fundador y administradores pueden ver esta información.',
    notFound: 'Miembro no encontrado',
    // Connection
    lastLogin: 'Último acceso',
    lastActive: 'Última actividad',
    daysInactive: 'Días sin conectarse',
    weeklyFreq: 'Frecuencia semanal',
    online: 'En línea',
    offline: 'Desconectado',
    sessions: 'sesiones',
    // Game
    totalGames: 'Partidas jugadas',
    wins: 'Victorias',
    losses: 'Derrotas',
    winRate: '% Victoria',
    correctAnswers: 'Respuestas correctas',
    wrongAnswers: 'Respuestas incorrectas',
    currentStreak: 'Racha actual',
    bestStreak: 'Mejor racha',
    avgResponse: 'Tiempo promedio',
    days: 'días',
    notAvailable: 'N/D',
    // Contribution
    pointsContributed: 'Puntos aportados',
    crownsContributed: 'Coronas aportadas',
    xpContributed: 'XP aportado',
    internalRanking: 'Ranking interno',
    weeklyPos: 'Posición semanal',
    monthlyPos: 'Posición mensual',
    of: 'de',
    // Events
    participated: 'Eventos participados',
    won: 'Eventos ganados',
    abandoned: 'Eventos abandonados',
    pending: 'Pendientes',
    clanBattles: 'Batallas de clan',
    // Challenges
    dailyCompleted: 'Reto diario',
    dailyStreak: 'Racha de retos',
    weeklyCompleted: 'Reto semanal',
    rewardsEarned: 'Recompensas ganadas',
    completed: 'Completado',
    notCompleted: 'Pendiente',
    // Chat
    messagesSent: 'Mensajes enviados',
    lastMessage: 'Último mensaje',
    deletedMessages: 'Mensajes eliminados',
    reportsReceived: 'Reportes recibidos',
    mutedStatus: 'Estado de silencio',
    muted: 'Silenciado hasta',
    notMuted: 'Sin silencio',
    never: 'Nunca',
    // Discipline
    warnings: 'Advertencias',
    sanctions: 'Sanciones',
    tempMutes: 'Silencios temporales',
    kickHistory: 'Historial de expulsiones',
    internalReports: 'Reportes internos',
    clean: 'Sin registros',
    // Invitations
    playersInvited: 'Jugadores invitados',
    accepted: 'Invitaciones aceptadas',
    invPending: 'Invitaciones pendientes',
    recruited: 'Miembros reclutados',
    // Roles
    founder: 'Líder / Fundador',
    admin: 'Administrador',
    moderator: 'Moderador',
    member: 'Miembro',
  },
  en: {
    title: 'Member Activity',
    tabs: ['Summary', 'Game', 'Contribution', 'Events', 'Chat', 'Discipline', 'Invitations'],
    loading: 'Loading activity...',
    noAccess: 'Access Denied',
    noAccessDesc: 'Only founders and administrators can view this information.',
    notFound: 'Member not found',
    lastLogin: 'Last login',
    lastActive: 'Last active',
    daysInactive: 'Days inactive',
    weeklyFreq: 'Weekly frequency',
    online: 'Online',
    offline: 'Offline',
    sessions: 'sessions',
    totalGames: 'Games played',
    wins: 'Wins',
    losses: 'Losses',
    winRate: 'Win Rate',
    correctAnswers: 'Correct answers',
    wrongAnswers: 'Wrong answers',
    currentStreak: 'Current streak',
    bestStreak: 'Best streak',
    avgResponse: 'Avg response time',
    days: 'days',
    notAvailable: 'N/A',
    pointsContributed: 'Points contributed',
    crownsContributed: 'Crowns contributed',
    xpContributed: 'XP contributed',
    internalRanking: 'Internal ranking',
    weeklyPos: 'Weekly position',
    monthlyPos: 'Monthly position',
    of: 'of',
    participated: 'Events participated',
    won: 'Events won',
    abandoned: 'Events abandoned',
    pending: 'Pending',
    clanBattles: 'Clan battles',
    dailyCompleted: 'Daily challenge',
    dailyStreak: 'Challenge streak',
    weeklyCompleted: 'Weekly challenge',
    rewardsEarned: 'Rewards earned',
    completed: 'Completed',
    notCompleted: 'Pending',
    messagesSent: 'Messages sent',
    lastMessage: 'Last message',
    deletedMessages: 'Deleted messages',
    reportsReceived: 'Reports received',
    mutedStatus: 'Mute status',
    muted: 'Muted until',
    notMuted: 'Not muted',
    never: 'Never',
    warnings: 'Warnings',
    sanctions: 'Sanctions',
    tempMutes: 'Temporary mutes',
    kickHistory: 'Kick history',
    internalReports: 'Internal reports',
    clean: 'No records',
    playersInvited: 'Players invited',
    accepted: 'Accepted invitations',
    invPending: 'Pending invitations',
    recruited: 'Members recruited',
    founder: 'Founder / Leader',
    admin: 'Administrator',
    moderator: 'Moderator',
    member: 'Member',
  },
  fr: {
    title: 'Activité du Membre',
    tabs: ['Résumé', 'Jeu', 'Contribution', 'Événements', 'Chat', 'Discipline', 'Invitations'],
    loading: 'Chargement...',
    noAccess: 'Accès refusé',
    noAccessDesc: 'Seuls les fondateurs et administrateurs peuvent voir ces informations.',
    notFound: 'Membre introuvable',
    lastLogin: 'Dernière connexion',
    lastActive: 'Dernière activité',
    daysInactive: 'Jours sans connexion',
    weeklyFreq: 'Fréquence hebdomadaire',
    online: 'En ligne',
    offline: 'Hors ligne',
    sessions: 'sessions',
    totalGames: 'Parties jouées',
    wins: 'Victoires',
    losses: 'Défaites',
    winRate: '% Victoire',
    correctAnswers: 'Réponses correctes',
    wrongAnswers: 'Réponses incorrectes',
    currentStreak: 'Série actuelle',
    bestStreak: 'Meilleure série',
    avgResponse: 'Temps moyen',
    days: 'jours',
    notAvailable: 'N/D',
    pointsContributed: 'Points apportés',
    crownsContributed: 'Couronnes apportées',
    xpContributed: 'XP apporté',
    internalRanking: 'Classement interne',
    weeklyPos: 'Position hebdomadaire',
    monthlyPos: 'Position mensuelle',
    of: 'sur',
    participated: 'Événements participés',
    won: 'Événements gagnés',
    abandoned: 'Événements abandonnés',
    pending: 'En attente',
    clanBattles: 'Batailles de clan',
    dailyCompleted: 'Défi quotidien',
    dailyStreak: 'Série de défis',
    weeklyCompleted: 'Défi hebdomadaire',
    rewardsEarned: 'Récompenses gagnées',
    completed: 'Complété',
    notCompleted: 'En attente',
    messagesSent: 'Messages envoyés',
    lastMessage: 'Dernier message',
    deletedMessages: 'Messages supprimés',
    reportsReceived: 'Signalements reçus',
    mutedStatus: 'État de silence',
    muted: 'Silencieux jusqu\'à',
    notMuted: 'Non silencieux',
    never: 'Jamais',
    warnings: 'Avertissements',
    sanctions: 'Sanctions',
    tempMutes: 'Silences temporaires',
    kickHistory: 'Historique d\'expulsions',
    internalReports: 'Signalements internes',
    clean: 'Aucun enregistrement',
    playersInvited: 'Joueurs invités',
    accepted: 'Invitations acceptées',
    invPending: 'Invitations en attente',
    recruited: 'Membres recrutés',
    founder: 'Fondateur / Leader',
    admin: 'Administrateur',
    moderator: 'Modérateur',
    member: 'Membre',
  },
};

type Lang = keyof typeof T;

// ─────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────

function StatRow({ label, value, icon, highlight = false }: {
  label: string; value: string | number; icon?: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5 text-[#64748B]">
        {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <span className={`text-[13px] font-bold ${highlight ? 'text-[#0A84FF]' : 'text-[#0F172A]'}`}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, children, icon }: {
  title: string; children: React.ReactNode; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          {icon && <span className="text-[#0A84FF]">{icon}</span>}
          <h3 className="text-[13px] font-black text-[#0F172A] uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="px-5 pb-1">{children}</div>
    </div>
  );
}

function BadgeStatus({ ok, labelOk, labelNo }: { ok: boolean; labelOk: string; labelNo: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
      ok ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-red-50 text-red-500'
    }`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {ok ? labelOk : labelNo}
    </span>
  );
}

function MiniStatCard({ label, value, color = '#0A84FF', emoji }: {
  label: string; value: string | number; color?: string; emoji?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3.5 flex flex-col items-center text-center gap-1">
      {emoji && <span className="text-xl">{emoji}</span>}
      <span className="text-xl font-black" style={{ color }}>{value}</span>
      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider leading-tight">{label}</span>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined, lang: Lang): string {
  if (!dateStr) return T[lang].never;
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'es-ES',
      { day: '2-digit', month: 'short', year: 'numeric' }
    );
  } catch {
    return '—';
  }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

type TabId = 'summary' | 'game' | 'contribution' | 'events' | 'chat' | 'discipline' | 'invitations';
const TABS: TabId[] = ['summary', 'game', 'contribution', 'events', 'chat', 'discipline', 'invitations'];

export default function MemberActivityPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [activity, setActivity] = useState<ClanMemberActivityModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  const lang = (user?.settings?.language ?? 'es') as Lang;
  const t = T[lang] ?? T.es;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    // Only founder and admin can access
    if (!['founder', 'admin'].includes(user.clanRole || '')) {
      setLoading(false);
      return;
    }

    if (!user.clanId) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const members = await getClanMembers(user.clanId!);
        setTotalMembers(members.length);
        const data = await getMemberActivity(uid, user.clanId!, members);
        setActivity(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, authLoading, uid]);

  // ── Loading ──
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
        <p className="text-sm text-[#64748B] font-medium">{t.loading}</p>
      </div>
    );
  }

  // ── Access guard ──
  if (!['founder', 'admin'].includes(user?.clanRole || '')) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">{t.noAccess}</h1>
        <p className="text-sm text-[#64748B] max-w-xs">{t.noAccessDesc}</p>
        <button onClick={() => router.push('/clans/admin')}
          className="mt-2 px-6 py-3 bg-[#0A84FF] text-white font-bold rounded-2xl text-sm">
          ← Back
        </button>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-3">
        <Users className="w-10 h-10 text-[#64748B]/30" />
        <p className="text-sm text-[#64748B] font-medium">{t.notFound}</p>
        <button onClick={() => router.push('/clans/admin')}
          className="px-5 py-2.5 bg-[#0A84FF] text-white font-bold rounded-xl text-sm">
          ← Back
        </button>
      </div>
    );
  }

  const roleLabel = activity.clanRole === 'founder' ? t.founder
    : activity.clanRole === 'admin' ? t.admin
    : activity.clanRole === 'moderator' ? t.moderator
    : t.member;

  // ─────────────────────────────────────────────
  // TAB CONTENT
  // ─────────────────────────────────────────────

  const renderSummary = () => (
    <div className="space-y-4">
      {/* Core stats mini grid */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStatCard label={lang === 'es' ? 'Nivel' : lang === 'fr' ? 'Niveau' : 'Level'} value={activity.level} color="#0A84FF" emoji="⭐" />
        <MiniStatCard label="XP" value={activity.xp.toLocaleString()} color="#0F172A" emoji="⚡" />
        <MiniStatCard label={lang === 'es' ? 'Monedas' : lang === 'fr' ? 'Pièces' : 'Coins'} value={activity.coins.toLocaleString()} color="#F59E0B" emoji="🪙" />
        <MiniStatCard label={lang === 'es' ? 'Coronas' : lang === 'fr' ? 'Couronnes' : 'Crowns'} value={activity.crowns.toLocaleString()} color="#D97706" emoji="👑" />
      </div>

      {/* Connection section */}
      <SectionCard title={lang === 'es' ? 'Conexión' : lang === 'fr' ? 'Connexion' : 'Connection'} icon={<Activity className="w-4 h-4" />}>
        <div className="py-2">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-[13px] font-medium text-[#64748B]">
              {lang === 'es' ? 'Estado' : 'Status'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              activity.connection.isOnline ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-gray-100 text-[#64748B]'
            }`}>
              {activity.connection.isOnline
                ? <><Wifi className="w-3 h-3" />{t.online}</>
                : <><WifiOff className="w-3 h-3" />{t.offline}</>}
            </span>
          </div>
          <StatRow label={t.lastLogin} value={formatDate(activity.connection.lastLoginAt, lang)} icon={<Clock className="w-4 h-4" />} />
          <StatRow label={t.lastActive} value={formatDate(activity.connection.lastActiveAt, lang)} icon={<Activity className="w-4 h-4" />} />
          <StatRow label={t.daysInactive} value={activity.connection.daysSinceActive === 999 ? '—' : `${activity.connection.daysSinceActive} ${t.days}`} icon={<Calendar className="w-4 h-4" />} highlight={activity.connection.daysSinceActive > 7} />
          <StatRow label={t.weeklyFreq} value={`${activity.connection.weeklyFrequency} ${t.sessions}`} icon={<TrendingUp className="w-4 h-4" />} />
        </div>
      </SectionCard>
    </div>
  );

  const renderGame = () => (
    <div className="space-y-4">
      {/* Win rate hero */}
      <div className="bg-gradient-to-br from-[#0A84FF] to-blue-700 rounded-[24px] p-6 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">{t.winRate}</p>
        <p className="text-5xl font-black">{activity.game.winRate}%</p>
        <div className="mt-3 flex justify-center gap-6 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-black text-lg text-[#34C759]">{activity.game.totalWins}</span>
            <span className="text-white/60 text-[10px] uppercase font-bold">{t.wins}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-lg">{activity.game.totalGames}</span>
            <span className="text-white/60 text-[10px] uppercase font-bold">{lang === 'es' ? 'Total' : 'Total'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-lg text-red-300">{activity.game.totalLosses}</span>
            <span className="text-white/60 text-[10px] uppercase font-bold">{t.losses}</span>
          </div>
        </div>
      </div>

      <SectionCard title={lang === 'es' ? 'Estadísticas' : 'Stats'} icon={<BarChart3 className="w-4 h-4" />}>
        <StatRow label={t.totalGames} value={activity.game.totalGames.toLocaleString()} icon={<Gamepad2 className="w-4 h-4" />} />
        <StatRow label={t.correctAnswers} value={activity.game.totalCorrectAnswers.toLocaleString()} icon={<CheckCircle2 className="w-4 h-4 text-[#34C759]" />} highlight />
        <StatRow label={t.wrongAnswers} value={activity.game.totalWrongAnswers.toLocaleString()} icon={<XCircle className="w-4 h-4 text-red-400" />} />
        <StatRow label={t.currentStreak} value={`${activity.game.currentStreak} ${t.days}`} icon={<Flame className="w-4 h-4 text-orange-500" />} highlight={activity.game.currentStreak > 0} />
        <StatRow label={t.bestStreak} value={`${activity.game.bestStreak} ${t.days}`} icon={<Star className="w-4 h-4 text-amber-500" />} />
        <StatRow label={t.avgResponse} value={activity.game.avgResponseTime !== null ? `${activity.game.avgResponseTime}s` : t.notAvailable} icon={<Target className="w-4 h-4" />} />
      </SectionCard>
    </div>
  );

  const renderContribution = () => (
    <div className="space-y-4">
      {/* Ranking hero */}
      <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#0A84FF]/10 flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-[#0A84FF]" />
        </div>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">{t.internalRanking}</p>
        <p className="text-4xl font-black text-[#0A84FF]">
          #{activity.contribution.internalRanking}
          <span className="text-base text-[#64748B] font-medium ml-1">{t.of} {totalMembers}</span>
        </p>
      </div>

      <SectionCard title={lang === 'es' ? 'Aporte al Clan' : lang === 'fr' ? 'Contribution' : 'Clan Contribution'} icon={<Zap className="w-4 h-4" />}>
        <StatRow label={t.pointsContributed} value={activity.contribution.pointsContributed.toLocaleString()} icon={<Star className="w-4 h-4" />} highlight />
        <StatRow label={t.crownsContributed} value={`${activity.contribution.crownsContributed.toLocaleString()} 👑`} icon={<Crown className="w-4 h-4 text-amber-500" />} />
        <StatRow label={t.xpContributed} value={`${activity.contribution.xpContributed.toLocaleString()} XP`} icon={<Zap className="w-4 h-4 text-[#0A84FF]" />} />
        <StatRow label={t.weeklyPos} value={activity.contribution.weeklyRanking > 0 ? `#${activity.contribution.weeklyRanking}` : '—'} icon={<TrendingUp className="w-4 h-4" />} />
        <StatRow label={t.monthlyPos} value={activity.contribution.monthlyRanking > 0 ? `#${activity.contribution.monthlyRanking}` : '—'} icon={<Award className="w-4 h-4" />} />
      </SectionCard>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MiniStatCard label={t.participated} value={activity.events.eventsParticipated} color="#0A84FF" emoji="🏆" />
        <MiniStatCard label={t.won} value={activity.events.eventsWon} color="#34C759" emoji="🥇" />
        <MiniStatCard label={t.abandoned} value={activity.events.eventsAbandoned} color="#FF3B30" emoji="🚪" />
        <MiniStatCard label={t.clanBattles} value={activity.events.clanBattlesParticipated} color="#AF52DE" emoji="⚔️" />
      </div>

      <SectionCard title={lang === 'es' ? 'Retos' : lang === 'fr' ? 'Défis' : 'Challenges'} icon={<Target className="w-4 h-4" />}>
        <div className="py-3 flex items-center justify-between border-b border-gray-50">
          <span className="text-[13px] font-medium text-[#64748B]">{t.dailyCompleted}</span>
          <BadgeStatus ok={activity.challenges.dailyChallengeCompleted} labelOk={t.completed} labelNo={t.notCompleted} />
        </div>
        <StatRow label={t.dailyStreak} value={`${activity.challenges.dailyChallengeStreak} ${t.days}`} icon={<Flame className="w-4 h-4 text-orange-500" />} />
        <div className="py-3 flex items-center justify-between border-b border-gray-50">
          <span className="text-[13px] font-medium text-[#64748B]">{t.weeklyCompleted}</span>
          <BadgeStatus ok={activity.challenges.weeklyChallengeCompleted} labelOk={t.completed} labelNo={t.notCompleted} />
        </div>
        <StatRow label={t.rewardsEarned} value={activity.challenges.rewardsEarned} icon={<Award className="w-4 h-4 text-amber-500" />} />
      </SectionCard>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-4">
      {/* Mute alert */}
      {activity.chat.isMuted && (
        <div className="bg-purple-50 border border-purple-100 rounded-[20px] p-4 flex items-center gap-3">
          <VolumeX className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-purple-700">{t.muted}</p>
            <p className="text-xs text-purple-500 mt-0.5">{formatDate(activity.chat.muteExpiresAt, lang)}</p>
          </div>
        </div>
      )}

      <SectionCard title="Chat" icon={<MessageCircle className="w-4 h-4" />}>
        <StatRow label={t.messagesSent} value={activity.chat.messagesSent.toLocaleString()} icon={<MessageCircle className="w-4 h-4" />} highlight />
        <StatRow label={t.lastMessage} value={formatDate(activity.chat.lastMessageAt, lang)} icon={<Clock className="w-4 h-4" />} />
        <StatRow label={t.deletedMessages} value={activity.chat.deletedMessages} icon={<FileText className="w-4 h-4" />} />
        <StatRow label={t.reportsReceived} value={activity.chat.reportsReceived} icon={<Flag className="w-4 h-4 text-red-400" />} highlight={activity.chat.reportsReceived > 0} />
        <div className="py-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#64748B]">{t.mutedStatus}</span>
          {activity.chat.isMuted
            ? <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full flex items-center gap-1"><VolumeX className="w-3 h-3" />{t.muted}</span>
            : <span className="text-[11px] font-bold text-[#34C759] bg-[#34C759]/10 px-2.5 py-1 rounded-full flex items-center gap-1"><Volume2 className="w-3 h-3" />{t.notMuted}</span>
          }
        </div>
      </SectionCard>
    </div>
  );

  const renderDiscipline = () => {
    const totalIssues = activity.discipline.warnings + activity.discipline.sanctions + activity.discipline.internalReports;
    return (
      <div className="space-y-4">
        {totalIssues === 0 ? (
          <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-[24px] p-6 text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-[#34C759]" />
            <p className="text-sm font-bold text-[#34C759]">{t.clean}</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-[24px] p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-bold text-red-600">
              {totalIssues} {lang === 'es' ? 'registros de disciplina' : lang === 'fr' ? 'enregistrements de discipline' : 'discipline records'}
            </p>
          </div>
        )}

        <SectionCard title={lang === 'es' ? 'Historial' : lang === 'fr' ? 'Historique' : 'History'} icon={<AlertTriangle className="w-4 h-4" />}>
          <StatRow label={t.warnings} value={activity.discipline.warnings} icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} highlight={activity.discipline.warnings > 0} />
          <StatRow label={t.sanctions} value={activity.discipline.sanctions} icon={<Shield className="w-4 h-4 text-red-500" />} highlight={activity.discipline.sanctions > 0} />
          <StatRow label={t.tempMutes} value={activity.discipline.temporaryMutes} icon={<VolumeX className="w-4 h-4 text-purple-500" />} />
          <StatRow label={t.kickHistory} value={activity.discipline.kickHistory} icon={<XCircle className="w-4 h-4 text-red-400" />} highlight={activity.discipline.kickHistory > 0} />
          <StatRow label={t.internalReports} value={activity.discipline.internalReports} icon={<Flag className="w-4 h-4 text-orange-500" />} highlight={activity.discipline.internalReports > 0} />
        </SectionCard>
      </div>
    );
  };

  const renderInvitations = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MiniStatCard label={t.playersInvited} value={activity.invitations.playersInvited} color="#0A84FF" emoji="📨" />
        <MiniStatCard label={t.accepted} value={activity.invitations.invitationsAccepted} color="#34C759" emoji="✅" />
        <MiniStatCard label={t.invPending} value={activity.invitations.invitationsPending} color="#F59E0B" emoji="⏳" />
        <MiniStatCard label={t.recruited} value={activity.invitations.membersRecruited} color="#AF52DE" emoji="👥" />
      </div>

      {activity.invitations.membersRecruited > 0 && (
        <div className="bg-[#0A84FF]/5 border border-[#0A84FF]/10 rounded-[20px] p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-[#0A84FF]" />
          <p className="text-sm font-medium text-[#0A84FF]">
            {lang === 'es'
              ? `Ha traído ${activity.invitations.membersRecruited} miembro(s) al clan.`
              : lang === 'fr'
              ? `A recruté ${activity.invitations.membersRecruited} membre(s) pour le clan.`
              : `Recruited ${activity.invitations.membersRecruited} member(s) to the clan.`}
          </p>
        </div>
      )}
    </div>
  );

  const tabContent: Record<TabId, React.ReactNode> = {
    summary: renderSummary(),
    game: renderGame(),
    contribution: renderContribution(),
    events: renderEvents(),
    chat: renderChat(),
    discipline: renderDiscipline(),
    invitations: renderInvitations(),
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen font-sans">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <BackButton href="/clans/admin?tab=members" />
        <h1 className="font-bold text-base text-[#0F172A] truncate max-w-[180px]">{activity.fullName || activity.username}</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Member hero card */}
      <div className="pt-16">
        <div className="bg-gradient-to-br from-[#0A84FF] to-blue-700 px-4 pt-6 pb-16 flex flex-col items-center text-center gap-3">
          <div className="flex justify-center mb-3">
            <UserAvatar
              photoURL={activity.photoURL}
              activeFrame={activity.activeFrame}
              username={activity.username}
              size={80}
              animate={false}
              className="ring-4 ring-white/30"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{activity.fullName || activity.username}</h2>
            <p className="text-white/60 text-xs mt-0.5">@{activity.username}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] font-black text-white/90 px-3 py-1 bg-white/20 rounded-full">{roleLabel}</span>
            {activity.country && (
              <span className="text-[11px] font-medium text-white/70 px-2.5 py-1 bg-white/10 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />{activity.country}
              </span>
            )}
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              activity.connection.isOnline ? 'bg-[#34C759] text-white' : 'bg-white/20 text-white/70'
            }`}>
              {activity.connection.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {activity.connection.isOnline ? t.online : t.offline}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs row — sticky just below header hero */}
      <div className="sticky top-16 z-40 bg-white border-b border-black/[0.03] overflow-x-auto scrollbar-none -mt-8">
        <div className="flex min-w-max">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[11px] font-black uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                activeTab === tab
                  ? 'border-[#0A84FF] text-[#0A84FF]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.tabs[i]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pt-4 max-w-xl mx-auto pb-12 space-y-4">
        {tabContent[activeTab]}
      </main>
    </div>
  );
}
