import React from 'react';
import { Crown, Star, Coins } from 'lucide-react';
import { TournamentReward } from '../../lib/tournament/models';

export const RewardChip = ({ reward }: { reward: TournamentReward }) => {
  if (!reward) return null;

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {reward.crowns && reward.crowns > 0 && (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium border border-yellow-500/20 shadow-inner">
          <Crown className="w-4 h-4 text-yellow-500 my-glow-sm" />
          {reward.crowns} Coronas
        </span>
      )}
      {reward.xp && reward.xp > 0 && (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20 shadow-inner">
          <Star className="w-4 h-4 text-blue-500 my-glow-sm" />
          {reward.xp} XP
        </span>
      )}
      {reward.coins && reward.coins > 0 && (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-medium border border-amber-500/20 shadow-inner">
          <Coins className="w-4 h-4 text-amber-500 my-glow-sm" />
          {reward.coins} Monedas
        </span>
      )}
    </div>
  );
};
