import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppUserModel } from '@/lib/user/models';
import { mapUserDoc, getLevelFromXp } from '@/lib/user/repository';

// -----------------------------------------------------------------------
// CLAN MEMBER ACTIVITY — DATA MODEL
// -----------------------------------------------------------------------

export interface ConnectionActivity {
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  isOnline: boolean;
  daysSinceActive: number;
  weeklyFrequency: number; // sessions in last 7 days (approximated)
}

export interface GameActivity {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number; // 0–100
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  currentStreak: number;
  bestStreak: number;
  avgResponseTime: number | null; // seconds — null if not tracked
}

export interface ClanContribution {
  pointsContributed: number;
  crownsContributed: number;
  xpContributed: number;
  internalRanking: number;      // position among clan members by XP
  weeklyRanking: number;        // position this week (static for now)
  monthlyRanking: number;       // position this month (static for now)
}

export interface EventActivity {
  eventsParticipated: number;
  eventsWon: number;
  eventsAbandoned: number;
  eventsPending: number;
  clanBattlesParticipated: number;
}

export interface ChallengeActivity {
  dailyChallengeCompleted: boolean;
  dailyChallengeStreak: number;
  weeklyChallengeCompleted: boolean;
  rewardsEarned: number;
}

export interface ChatActivity {
  messagesSent: number;
  lastMessageAt: string | null;
  deletedMessages: number;
  reportsReceived: number;
  isMuted: boolean;
  muteExpiresAt: string | null;
}

export interface DisciplineRecord {
  warnings: number;
  sanctions: number;
  temporaryMutes: number;
  kickHistory: number; // times kicked from any clan
  internalReports: number;
}

export interface InvitationActivity {
  playersInvited: number;
  invitationsAccepted: number;
  invitationsPending: number;
  membersRecruited: number;
}

export interface ClanMemberActivityModel {
  // Base user info (safe — no private fields)
  uid: string;
  username: string;
  fullName: string;
  photoURL: string | null;    // profile photo
  activeFrame: string | null; // avatar frame
  level: number;
  xp: number;
  coins: number;
  crowns: number;
  gems: number;
  clanRole: string;
  country: string;
  bio: string;

  // Sections
  connection: ConnectionActivity;
  game: GameActivity;
  contribution: ClanContribution;
  events: EventActivity;
  challenges: ChallengeActivity;
  chat: ChatActivity;
  discipline: DisciplineRecord;
  invitations: InvitationActivity;
}

// -----------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------

function daysBetween(dateStr: string | null | undefined): number {
  if (!dateStr) return 999;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function safeNum(val: unknown): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  return 0;
}

// -----------------------------------------------------------------------
// MAIN AGGREGATION FUNCTION
// -----------------------------------------------------------------------

/**
 * Fetches and aggregates all clan member activity data for a given user.
 * Only safe, non-private fields are returned.
 * Unavailable data (not yet tracked) returns 0 / null / false.
 */
export async function getMemberActivity(
  uid: string,
  clanId: string,
  allMembers: AppUserModel[]
): Promise<ClanMemberActivityModel | null> {
  try {
    // 1. Fetch fresh user document
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return null;
    const u = mapUserDoc(userSnap.data());

    const level = getLevelFromXp(u.xp || 0);
    const daysSinceActive = daysBetween(u.lastActiveAt || u.lastLoginAt);

    // 2. Connection
    const connection: ConnectionActivity = {
      lastLoginAt: u.lastLoginAt || null,
      lastActiveAt: u.lastActiveAt || null,
      isOnline: u.isOnline ?? false,
      daysSinceActive,
      weeklyFrequency: daysSinceActive <= 7 ? Math.max(1, 7 - daysSinceActive) : 0,
    };

    // 3. Game stats — directly from AppUserModel
    const totalGames = safeNum(u.totalGames);
    const totalWins = safeNum(u.totalWins);
    const totalLosses = safeNum(u.totalLosses);
    const game: GameActivity = {
      totalGames,
      totalWins,
      totalLosses,
      winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
      totalCorrectAnswers: safeNum(u.totalCorrectAnswers),
      totalWrongAnswers: safeNum(u.totalWrongAnswers),
      currentStreak: safeNum(u.streakDays),
      bestStreak: safeNum(u.bestStreak),
      avgResponseTime: null, // Not yet tracked in current model
    };

    // 4. Clan contribution — ranking derived from allMembers sorted by XP
    const sortedByXp = [...allMembers].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    const internalRanking = sortedByXp.findIndex((m) => m.uid === uid) + 1;

    const contribution: ClanContribution = {
      pointsContributed: safeNum((u as any).clanPointsContributed),
      crownsContributed: safeNum(u.crowns),
      xpContributed: safeNum(u.xp),
      internalRanking: internalRanking || allMembers.length,
      weeklyRanking: 0,   // Future: tracked in clanMemberStats
      monthlyRanking: 0,  // Future: tracked in clanMemberStats
    };

    // 5. Events — query tournaments and duels
    let eventsParticipated = 0;
    let eventsWon = 0;
    try {
      const tournamentQ = query(
        collection(db, 'tournamentParticipants'),
        where('uid', '==', uid)
      );
      const tournamentSnap = await getDocs(tournamentQ);
      eventsParticipated += tournamentSnap.size;
      tournamentSnap.forEach((d) => {
        const data = d.data();
        if (data.rank === 1 || data.position === 1 || data.won === true) eventsWon++;
      });
    } catch (_) { /* collection may not exist yet */ }

    let clanBattles = 0;
    try {
      const battleQ = query(
        collection(db, 'clanBattles'),
        where('participants', 'array-contains', uid)
      );
      const battleSnap = await getDocs(battleQ);
      clanBattles = battleSnap.size;
    } catch (_) { /* collection may not exist yet */ }

    const events: EventActivity = {
      eventsParticipated,
      eventsWon,
      eventsAbandoned: 0,
      eventsPending: 0,
      clanBattlesParticipated: clanBattles,
    };

    // 6. Challenges
    let dailyChallengeCompleted = false;
    let dailyStreak = 0;
    let weeklyChallengeCompleted = false;
    let rewardsEarned = 0;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const challengeQ = query(
        collection(db, 'dailyChallengeResults'),
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(30)
      );
      const challengeSnap = await getDocs(challengeQ);
      challengeSnap.forEach((d) => {
        const data = d.data();
        if (data.date === todayStr) dailyChallengeCompleted = true;
        if (data.completed) rewardsEarned++;
      });
      dailyStreak = safeNum((u as any).dailyChallengeStreak);
    } catch (_) { /* collection may not exist yet */ }

    const challenges: ChallengeActivity = {
      dailyChallengeCompleted,
      dailyChallengeStreak: dailyStreak,
      weeklyChallengeCompleted,
      rewardsEarned,
    };

    // 7. Chat — read from clanMemberStats if available
    let messagesSent = 0;
    let lastMessageAt: string | null = null;
    let deletedMessages = 0;
    let reportsReceived = 0;
    try {
      const statsRef = doc(db, 'clanMemberStats', `${clanId}_${uid}`);
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const s = statsSnap.data();
        messagesSent = safeNum(s.messagesSent);
        lastMessageAt = s.lastMessageAt || null;
        deletedMessages = safeNum(s.deletedMessages);
        reportsReceived = safeNum(s.reportsReceived);
      }
    } catch (_) {}

    // Mute status from clan document
    let isMuted = false;
    let muteExpiresAt: string | null = null;
    try {
      const clanSnap = await getDoc(doc(db, 'clans', clanId));
      if (clanSnap.exists()) {
        const clanData = clanSnap.data();
        const muteVal = clanData?.mutedMembers?.[uid];
        if (muteVal) {
          const muteDate = new Date(muteVal);
          if (muteDate > new Date()) {
            isMuted = true;
            muteExpiresAt = muteVal;
          }
        }
      }
    } catch (_) {}

    const chat: ChatActivity = {
      messagesSent,
      lastMessageAt,
      deletedMessages,
      reportsReceived,
      isMuted,
      muteExpiresAt,
    };

    // 8. Discipline
    let warnings = 0;
    let sanctions = 0;
    let temporaryMutes = 0;
    let kickHistory = 0;
    let internalReports = 0;
    try {
      const disciplineQ = query(
        collection(db, 'clanDiscipline'),
        where('targetUid', '==', uid)
      );
      const disciplineSnap = await getDocs(disciplineQ);
      disciplineSnap.forEach((d) => {
        const data = d.data();
        if (data.type === 'warning') warnings++;
        else if (data.type === 'sanction') sanctions++;
        else if (data.type === 'mute') temporaryMutes++;
        else if (data.type === 'kick') kickHistory++;
        else if (data.type === 'report') internalReports++;
      });
    } catch (_) {}

    const discipline: DisciplineRecord = {
      warnings,
      sanctions,
      temporaryMutes,
      kickHistory,
      internalReports,
    };

    // 9. Invitations sent by this user
    let invitesTotal = 0;
    let invitesAccepted = 0;
    let invitesPending = 0;
    try {
      const inviteQ = query(
        collection(db, 'clanInvitations'),
        where('invitedBy', '==', uid),
        where('clanId', '==', clanId)
      );
      const inviteSnap = await getDocs(inviteQ);
      inviteSnap.forEach((d) => {
        const data = d.data();
        invitesTotal++;
        if (data.status === 'accepted') invitesAccepted++;
        else if (data.status === 'pending') invitesPending++;
      });
    } catch (_) {}

    const invitations: InvitationActivity = {
      playersInvited: invitesTotal,
      invitationsAccepted: invitesAccepted,
      invitationsPending: invitesPending,
      membersRecruited: invitesAccepted,
    };

    return {
      uid,
      username: u.username,
      fullName: u.fullName,
      photoURL: u.photoURL ?? null,
      activeFrame: u.activeFrame ?? null,
      level,
      xp: safeNum(u.xp),
      coins: safeNum(u.coins),
      crowns: safeNum(u.crowns),
      gems: safeNum(u.gems),
      clanRole: u.clanRole || 'member',
      country: u.country || '',
      bio: u.bio || '',
      connection,
      game,
      contribution,
      events,
      challenges,
      chat,
      discipline,
      invitations,
    };
  } catch (error) {
    console.error('Error fetching member activity:', error);
    return null;
  }
}
