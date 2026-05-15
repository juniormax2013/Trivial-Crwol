import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { Tournament, TournamentParticipant } from './models';

// Mapeos
function mapToTournament(docSnap: any): Tournament {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    title: d.title,
    subtitle: d.subtitle,
    type: d.type,
    difficulty: d.difficulty,
    status: d.status,
    rewardConfig: d.rewardConfig,
    maxParticipants: d.maxParticipants,
    currentParticipants: d.currentParticipants,
    currentRound: d.currentRound,
    registrationStartsAt: d.registrationStartsAt?.toDate(),
    registrationEndsAt: d.registrationEndsAt?.toDate(),
    startsAt: d.startsAt?.toDate(),
    endsAt: d.endsAt?.toDate(),
    createdAt: d.createdAt?.toDate(),
    updatedAt: d.updatedAt?.toDate(),
  };
}

function mapToParticipant(docSnap: any): TournamentParticipant {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    userId: d.userId,
    displayName: d.displayName,
    avatarUrl: d.avatarUrl,
    status: d.status,
    score: d.score || 0,
    correctAnswers: d.correctAnswers || 0,
    wrongAnswers: d.wrongAnswers || 0,
    averageResponseTimeMs: d.averageResponseTimeMs || 0,
    currentRank: d.currentRank || 0,
    matchesPlayed: d.matchesPlayed || 0,
    wins: d.wins,
    losses: d.losses,
    ties: d.ties,
    rewardClaimed: d.rewardClaimed
  };
}

// Repositorio
export const TournamentRepository = {
  
  async getActiveTournaments(): Promise<Tournament[]> {
    const q = query(
      collection(db, 'tournaments'),
      where('status', 'in', ['registration_open', 'active']),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapToTournament);
  },

  async getRecentCompletedTournaments(): Promise<Tournament[]> {
    const q = query(
      collection(db, 'tournaments'),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapToTournament);
  },

  async getTournamentById(id: string): Promise<Tournament | null> {
    const docRef = doc(db, 'tournaments', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapToTournament(snap);
  },

  // Leaderboard en vivo
  subscribeToLeaderboard(tournamentId: string, callback: (participants: TournamentParticipant[]) => void) {
    const q = query(
      collection(db, 'tournaments', tournamentId, 'participants'),
      orderBy('score', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(mapToParticipant));
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn('Tournament leaderboard subscription permission denied');
        callback([]);
      } else {
        console.error('Error in subscribeToLeaderboard:', error);
      }
    });
  },

  async isUserRegistered(tournamentId: string, userId: string): Promise<boolean> {
    const ref = doc(db, 'tournaments', tournamentId, 'participants', userId);
    const snap = await getDoc(ref);
    return snap.exists();
  },

  async updateTournament(id: string, data: Partial<any>): Promise<void> {
    const { updateDoc, doc } = await import('firebase/firestore');
    const ref = doc(db, 'tournaments', id);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date()
    });
  },

  async deleteTournament(id: string): Promise<void> {
    const ref = doc(db, 'tournaments', id);
    // Note: In a real app, you'd delete subcollections too.
    // For now, we'll just delete the main document.
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(ref);
  }
};
