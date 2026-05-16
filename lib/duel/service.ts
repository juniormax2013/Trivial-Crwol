// ---------------------------------------------------------------
// DUEL MODULE — SERVICE
// ---------------------------------------------------------------
// Pure business logic helpers. No Firebase or localStorage calls here.

import { DuelModel, DuelViewState, DuelResult, DuelRound } from './models';

// ─── Turn & ownership ───────────────────────────────────────────

// ─── Turn & ownership ───────────────────────────────────────────

export function isUserTurn(duel: DuelModel, uid: string): boolean {
  const p = duel.participants[uid];
  // Basic checks: must be active, user must be accepted and not completed
  if (duel.status !== 'active' || !p || p.status !== 'accepted' || p.completed) {
    return false;
  }
  
  // If currentTurnUid is set, only that user can play
  if (duel.currentTurnUid) {
    return duel.currentTurnUid === uid;
  }

  // Fallback: if currentTurnUid is missing (legacy), allow anyone accepted to play
  return true;
}

export function isCreatedByUser(duel: DuelModel, uid: string): boolean {
  return duel.createdBy === uid;
}

export function getMyParticipant(duel: DuelModel, uid: string) {
  return duel.participants[uid];
}

/** Returns all participants EXCEPT the current user */
export function getOtherParticipants(duel: DuelModel, uid: string) {
  return Object.values(duel.participants).filter(p => p.uid !== uid);
}

// ─── View State (derived) ────────────────────────────────────────

/**
 * Produces a complete derived view state for a duel from a given
 * user's perspective. This is what UI components consume.
 */
export function getDuelViewState(duel: DuelModel, uid: string): DuelViewState {
  const me = duel.participants[uid];
  const others = getOtherParticipants(duel, uid);
  const primaryOpponent = others[0] || { uid: '?', name: 'Desconocido', avatarUrl: '/avatars/default.png' };

  const myTurn = isUserTurn(duel, uid);
  const createdByMe = isCreatedByUser(duel, uid);

  let ctaType: DuelViewState['ctaType'];
  switch (duel.status) {
    case 'pending':
      ctaType = createdByMe ? 'wait' : 'accept';
      break;
    case 'active':
      if (me?.status === 'pending') {
        ctaType = 'accept';
      } else {
        ctaType = myTurn ? 'play' : 'wait';
      }
      break;
    case 'completed':
    case 'expired':
    case 'declined':
    case 'cancelled':
      ctaType = 'ended';
      break;
    default:
      ctaType = 'view';
  }

  return {
    duel,
    myId: uid,
    myName: me?.name || 'Yo',
    myAvatar: me?.avatarUrl || '',
    opponentId: primaryOpponent.uid,
    opponentName: others.length > 1 ? `${primaryOpponent.name} + ${others.length - 1}` : primaryOpponent.name,
    opponentAvatar: primaryOpponent.avatarUrl,
    myScore: me?.score || 0,
    theirScore: primaryOpponent.score || 0, // In multiplayer, this might be the leader's score
    isMyTurn: myTurn,
    isCreatedByMe: createdByMe,
    ctaType,
  };
}

// ─── Status labels ───────────────────────────────────────────────

export function getDuelStatusLabel(
  duel: DuelModel,
  uid: string
): { label: string; color: 'purple' | 'gold' | 'green' | 'red' | 'grey' } {
  switch (duel.status) {
    case 'pending':
      if (isCreatedByUser(duel, uid)) {
        return { label: 'Esperando respuestas', color: 'gold' };
      }
      if (duel.participants[uid]?.status === 'accepted') {
        return { label: 'Aceptado, esperando inicio', color: 'gold' };
      }
      return { label: 'Desafío recibido', color: 'purple' };
    case 'active':
      return isUserTurn(duel, uid)
        ? { label: '¡Tu turno!', color: 'green' }
        : { label: 'Esperando otros', color: 'grey' };
    case 'completed':
      const outcome = getOutcome(duel, uid);
      return outcome === 'win'
        ? { label: '¡Victoria!', color: 'gold' }
        : outcome === 'tie'
        ? { label: 'Empate', color: 'purple' }
        : { label: 'Finalizado', color: 'grey' };
    case 'expired':
      return { label: 'Expirado', color: 'grey' };
    case 'declined':
      return { label: 'Rechazado', color: 'red' };
    case 'cancelled':
      return { label: 'Cancelado', color: 'grey' };
    default:
      return { label: 'Desconocido', color: 'grey' };
  }
}

// ─── Outcome ────────────────────────────────────────────────────

export type DuelOutcome = 'win' | 'loss' | 'tie' | 'pending';

export function getOutcome(duel: DuelModel, uid: string): DuelOutcome {
  if (duel.status !== 'completed') return 'pending';
  if (duel.isTie) return 'tie';
  if (duel.winnerIds.includes(uid)) return 'win';
  return 'loss';
}

// ─── Reward calculation ──────────────────────────────────────────

export function calculateDuelRewards(
  duel: DuelModel,
  uid: string
): { xp: number; coins: number; crowns: number } {
  const outcome = getOutcome(duel, uid);
  const base = duel.rewardConfig;

  if (outcome === 'pending') return { xp: 0, coins: 0, crowns: 0 };

  switch (outcome) {
    case 'win':
      return { xp: base.xp, coins: base.coins, crowns: base.crowns };
    case 'tie':
      return { xp: Math.floor(base.xp * 0.5), coins: Math.floor(base.coins * 0.5), crowns: Math.floor(base.crowns * 0.3) };
    case 'loss':
    default:
      return { xp: Math.floor(base.xp * 0.2), coins: Math.floor(base.coins * 0.2), crowns: 0 };
  }
}

// ─── Score calculation ───────────────────────────────────────────

export function calculateAnswerPoints(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitSeconds: number
): number {
  if (!isCorrect) return 0;
  const base = 100;
  const timeLimitMs = timeLimitSeconds * 1000;
  const remaining = Math.max(0, timeLimitMs - responseTimeMs);
  const speedBonus = Math.floor((remaining / timeLimitMs) * 20);
  return base + speedBonus;
}

// ─── Build DuelResult from a completed duel ──────────────────────

export function buildDuelResult(
  duel: DuelModel,
  rounds: DuelRound[],
  uid: string
): DuelResult {
  const outcome = getOutcome(duel, uid);
  if (outcome === 'pending') {
    throw new Error('Cannot build result for an incomplete duel');
  }
  const me = duel.participants[uid];
  const others = getOtherParticipants(duel, uid);
  const primaryOpponent = others[0] || { uid: '?', name: 'Desconocido', avatarUrl: '', score: 0, correctAnswers: 0 };

  const rewards = calculateDuelRewards(duel, uid);

  return {
    duelId: duel.id,
    opponentName: others.length > 1 ? `${primaryOpponent.name} + ${others.length - 1}` : primaryOpponent.name,
    opponentAvatar: primaryOpponent.avatarUrl,
    outcome,
    finalScore: {
      mine: me?.score || 0,
      theirs: primaryOpponent.score || 0,
    },
    correctAnswers: {
      mine: me?.correctAnswers || 0,
      theirs: primaryOpponent.correctAnswers || 0,
    },
    roundsDetail: rounds.map((r) => ({
      roundNumber: r.roundNumber,
      categoryName: r.categoryName,
      myScore: r.playerScores[uid] || 0,
      theirScore: r.playerScores[primaryOpponent.uid] || 0,
    })),
    xpEarned: rewards.xp,
    crownsEarned: rewards.crowns,
    coinsEarned: rewards.coins,
    completedAt: duel.endedAt ?? new Date().toISOString(),
  };
}

// ─── Time helpers ────────────────────────────────────────────────

export function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `Hace ${diffHrs} h`;
  const diffDays = Math.floor(diffHrs / 24);
  return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
}

export function formatTimeUntil(isoString: string): string {
  const diffMs = new Date(isoString).getTime() - Date.now();
  if (diffMs <= 0) return 'Expirado';
  const diffHrs = Math.floor(diffMs / 3600_000);
  const diffMins = Math.floor((diffMs % 3600_000) / 60_000);
  if (diffHrs >= 24) {
    const days = Math.floor(diffHrs / 24);
    return `${days}d restante${days !== 1 ? 's' : ''}`;
  }
  if (diffHrs >= 1) return `${diffHrs}h ${diffMins}m restante`;
  return `${diffMins} min restante`;
}

// ─── Filter helpers ──────────────────────────────────────────────

import { DuelStatus } from './models';

export function filterDuelsByTab(
  duels: DuelModel[],
  uid: string,
  tab: 'received' | 'sent' | 'active' | 'history'
): DuelModel[] {
  switch (tab) {
    case 'received':
      return duels.filter(
        (d) => d.status === 'pending' && d.createdBy !== uid && d.participants[uid]?.status === 'pending'
      );
    case 'sent':
      return duels.filter((d) => d.status === 'pending' && d.createdBy === uid);
    case 'active':
      return duels.filter((d) => 
        d.status === 'active' || 
        (d.status === 'pending' && d.participants[uid]?.status === 'accepted')
      );
    case 'history':
      return duels.filter((d) =>
        (['completed', 'expired', 'declined', 'cancelled'] as DuelStatus[]).includes(d.status)
      );
    default:
      return [];
  }
}
