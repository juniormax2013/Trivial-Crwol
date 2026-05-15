import React from 'react';
import Link from 'next/link';
import { Users, Clock, Trophy } from 'lucide-react';
import { Tournament } from '../../lib/tournament/models';
import { StatusBadge } from './StatusBadge';
import { RewardChip } from './RewardChip';

interface TournamentCardProps {
  tournament: Tournament;
}

export const TournamentCard = ({ tournament }: TournamentCardProps) => {
  return (
    <div className="relative group rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-6 relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <StatusBadge status={tournament.status} />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-xs text-white/70">
            <Users className="w-3.5 h-3.5" />
            <span>{tournament.currentParticipants} / {tournament.maxParticipants}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 flex-grow">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-colors">
            {tournament.title}
          </h3>
          <p className="text-white/60 text-sm line-clamp-2">
            {tournament.subtitle}
          </p>
        </div>

        {/* Rewards */}
        <div className="mb-6">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Recompensas</p>
          <RewardChip reward={tournament.rewardConfig} />
        </div>

        {/* Action / Timing */}
        <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Clock className="w-4 h-4" />
            {tournament.status === 'registration_open' 
              ? `Inscripciones Abiertas`
              : tournament.status === 'active' 
              ? `En progreso`
              : `Finalizado`
            }
          </div>
          <Link href={`/arena/tournaments/${tournament.id}`}>
            <button className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10 hover:border-white/30 active:scale-95 flex items-center gap-2">
              Ver Detalles
              <Trophy className="w-4 h-4 text-indigo-400" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
