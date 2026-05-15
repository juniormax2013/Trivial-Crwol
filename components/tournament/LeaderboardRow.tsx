import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { TournamentParticipant } from '../../lib/tournament/models';

interface LeaderboardRowProps {
  participant: TournamentParticipant;
  index: number;
  isCurrentUser?: boolean;
}

export const LeaderboardRow = ({ participant, index, isCurrentUser }: LeaderboardRowProps) => {
  // Configuración de podio (0, 1, 2 = 1st, 2nd, 3rd)
  let RankIcon = null;
  let rankColor = 'text-white/40';
  let bgColor = 'bg-white/5';
  
  if (index === 0) {
    RankIcon = Trophy;
    rankColor = 'text-yellow-400';
    bgColor = 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/5';
  } else if (index === 1) {
    RankIcon = Medal;
    rankColor = 'text-slate-300';
    bgColor = 'bg-gradient-to-r from-slate-400/20 to-slate-500/5';
  } else if (index === 2) {
    RankIcon = Award;
    rankColor = 'text-amber-600';
    bgColor = 'bg-gradient-to-r from-amber-700/20 to-amber-800/5';
  }

  return (
    <div className={`p-4 flex items-center gap-4 rounded-2xl border ${isCurrentUser ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/5 ' + bgColor} transition-all hover:bg-white/10`}>
      {/* Rank */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${rankColor} shrink-0`}>
        {RankIcon ? <RankIcon className="w-5 h-5 drop-shadow-md" /> : <span>{index + 1}</span>}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          {participant.avatarUrl ? (
            <img src={participant.avatarUrl} alt={participant.displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold">{participant.displayName?.charAt(0).toUpperCase() || '?'}</span>
          )}
        </div>
        <div className="flex flex-col truncate">
          <span className="text-white font-semibold truncate flex items-center gap-2">
            {participant.displayName}
            {isCurrentUser && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-wider">
                Tú
              </span>
            )}
          </span>
          <span className="text-white/40 text-xs truncate">
            {participant.matchesPlayed} partidas jugadas
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-xl font-bold text-white font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
          {participant.score.toLocaleString()}
        </span>
        <span className="text-xs text-white/40 font-mono">
          {participant.averageResponseTimeMs > 0 ? (participant.averageResponseTimeMs / 1000).toFixed(1) : '-'}s prom
        </span>
      </div>
    </div>
  );
};
