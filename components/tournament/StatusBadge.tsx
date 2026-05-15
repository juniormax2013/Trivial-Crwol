import React from 'react';
import { TournamentStatus } from '../../lib/tournament/models';

export const StatusBadge = ({ status }: { status: TournamentStatus }) => {
  if (status === 'active') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
        EN VIVO
      </span>
    );
  }

  if (status === 'registration_open') {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
        ABIERTO
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
      FINALIZADO
    </span>
  );
};
