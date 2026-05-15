import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  getAggregateFromServer,
  sum,
  collectionGroup,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ALL_DUEL_QUESTIONS } from '@/lib/duel/seed';
// Assuming we might have more questions in other files, but ALL_DUEL_QUESTIONS is the main export in seed
// If I want to be thorough, I'd import others if they are exported.
// Let's check QuestionsHT and others.

export interface DashboardMetrics {
  totalUsers: number;
  dau: number;
  gamesToday: number;
  activeQuestions: number;
  pendingReview: number;
  openReports: number;
  activeTournaments: number;
  globalAccuracy: number;
  totalXPAwarded: number;
  totalCoinsAwarded: number;
  challengeCompletionRate: number;
}

export interface GrowthDataPoint {
  day: string;
  count: number;
  isPeak?: boolean;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Initialize with zeros
  let totalUsers = 0;
  let dau = 0;
  let gamesToday = 0;
  let activeTournaments = 0;
  let activeQuestions = ALL_DUEL_QUESTIONS.length;
  let globalAccuracy = 0;
  let totalXPAwarded = 0;
  let totalCoinsAwarded = 0;
  let challengeCompletionRate = 0;

  try {
    // 1. Total Users
    const usersColl = collection(db, 'users');
    const totalUsersSnap = await getCountFromServer(usersColl);
    totalUsers = totalUsersSnap.data().count;

    // 2. DAU (Active in last 24h)
    const dauQuery = query(usersColl, where('lastActiveAt', '>=', last24h));
    const dauSnap = await getCountFromServer(dauQuery);
    dau = dauSnap.data().count;

    // 3. Games Today
    const duelsColl = collection(db, 'duels');
    const gamesTodayQuery = query(duelsColl, where('createdAt', '>=', todayStart));
    const gamesTodaySnap = await getCountFromServer(gamesTodayQuery);
    gamesToday = gamesTodaySnap.data().count;

    // 4. Active Tournaments
    const tournamentsColl = collection(db, 'tournaments');
    const activeTournamentsQuery = query(tournamentsColl, where('status', '==', 'active'));
    const activeTournamentsSnap = await getCountFromServer(activeTournamentsQuery);
    activeTournaments = activeTournamentsSnap.data().count;

    // 6. Global Accuracy (Average from users)
    const accuracyQuery = query(usersColl, limit(500));
    const accuracySnap = await getDocs(accuracyQuery);
    let totalAcc = 0;
    accuracySnap.forEach(doc => {
      totalAcc += (doc.data().accuracyRate || 0);
    });
    globalAccuracy = accuracySnap.size > 0 ? totalAcc / accuracySnap.size : 0;

    // 7. Economy: Total XP/Coins from Daily Challenges (Global)
    try {
      const historyColGroup = collectionGroup(db, 'daily_challenge_history');
      const economyAggr = await getAggregateFromServer(historyColGroup, {
        totalXp: sum('xpEarned'),
        totalCoins: sum('coinsEarned')
      });
      totalXPAwarded = economyAggr.data().totalXp || 0;
      totalCoinsAwarded = economyAggr.data().totalCoins || 0;
    } catch (e) {
      console.warn("Aggregate query for history failed (likely missing index):", e);
    }

    // 8. Challenge Engagement %
    const completedTodayQuery = query(usersColl, where('dailyChallengeCompleted', '==', true));
    const completedTodaySnap = await getCountFromServer(completedTodayQuery);
    const completedCount = completedTodaySnap.data().count;
    challengeCompletionRate = totalUsers > 0 ? (completedCount / totalUsers) * 100 : 0;

  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
  }

  return {
    totalUsers,
    dau,
    gamesToday,
    activeQuestions,
    pendingReview: 0,
    openReports: 0,
    activeTournaments,
    globalAccuracy: Math.round(globalAccuracy * 10) / 10,
    totalXPAwarded,
    totalCoinsAwarded,
    challengeCompletionRate: Math.round(challengeCompletionRate * 10) / 10
  };
}

export async function getUserGrowthData(): Promise<GrowthDataPoint[]> {
  const days: Record<string, number> = {};
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = dayNames[d.getDay()];
    days[label] = 0;
  }

  try {
    const usersColl = collection(db, 'users');
    const q = query(usersColl, orderBy('createdAt', 'desc'), limit(1000));
    const snap = await getDocs(q);

    snap.forEach(doc => {
      const data = doc.data();
      if (data.createdAt) {
        const date = new Date(data.createdAt);
        const label = dayNames[date.getDay()];
        if (days[label] !== undefined) {
          days[label]++;
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user growth data (check if index on users.createdAt DESC exists):", error);
  }

  const result: GrowthDataPoint[] = Object.entries(days).map(([day, count]) => ({ day, count }));
  
  // Find peak
  const max = Math.max(...result.map(r => r.count));
  if (max > 0) {
    const peakIdx = result.findIndex(r => r.count === max);
    result[peakIdx].isPeak = true;
  }

  return result;
}

export async function getDailyChallengeGrowth(): Promise<GrowthDataPoint[]> {
  const days: Record<string, number> = {};
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = dayNames[d.getDay()];
    days[label] = 0;
  }

  try {
    const historyColGroup = collectionGroup(db, 'daily_challenge_history');
    const q = query(historyColGroup, orderBy('completedAt', 'desc'), limit(1000));
    const snap = await getDocs(q);

    snap.forEach(doc => {
      const data = doc.data();
      if (data.completedAt) {
        const date = new Date(data.completedAt);
        const label = dayNames[date.getDay()];
        if (days[label] !== undefined) {
          days[label]++;
        }
      }
    });
  } catch (error) {
    console.error("Error fetching daily challenge growth (check if collection group index on daily_challenge_history.completedAt DESC exists):", error);
  }

  const result: GrowthDataPoint[] = Object.entries(days).map(([day, count]) => ({ day, count }));
  
  // Find peak
  const max = Math.max(...result.map(r => r.count));
  if (max > 0) {
    const peakIdx = result.findIndex(r => r.count === max);
    result[peakIdx].isPeak = true;
  }

  return result;
}

export async function getRecentActivity() {
  try {
    const duelsColl = collection(db, 'duels');
    const q = query(duelsColl, orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        player1Name: data.player1Name || 'Unknown',
        status: data.status || 'pending',
        difficulty: data.difficulty || 'medium',
        createdAt: data.createdAt || new Date().toISOString(),
        category: data.selectedCategories?.[0] || 'mixed'
      };
    });
  } catch (error) {
    console.error("Error fetching recent activity (check if index on duels.createdAt DESC exists):", error);
    return [];
  }
}
