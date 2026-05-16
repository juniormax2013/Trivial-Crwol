'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Search, Loader2 } from 'lucide-react';
import { Tournament } from '@/lib/tournament/models';
import { TournamentRepository } from '@/lib/tournament/repository';
import { TournamentCard } from '@/components/tournament/TournamentCard';
import { useT } from '@/lib/i18n/context';

export default function TournamentsHub() {
  const t = useT();
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [completedTournaments, setCompletedTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const active = await TournamentRepository.getActiveTournaments();
        const completed = await TournamentRepository.getRecentCompletedTournaments();
        setActiveTournaments(active);
        setCompletedTournaments(completed);
      } catch (e) {
        console.error("Error fetching tournaments", e);
      }
      setLoading(false);
    };

    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-[#110022] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/arena" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white text-opacity-80" />
        </Link>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-400" />
          <span className="font-bold tracking-widest text-sm uppercase text-indigo-200">{t.arena.tournaments}</span>
        </div>
      </header>

      <main className="relative z-10 px-6 max-w-7xl mx-auto mt-4 pb-24">
        {/* Hero */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
            {t.arena.arenaChampions}
          </h1>
          <p className="text-white/60 font-medium max-w-xl mx-auto text-lg leading-relaxed">
            {t.arena.arenaChampionsDesc}
          </p>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 w-full md:w-auto">
            <button 
              onClick={() => setTab('active')}
              className={`flex-1 md:w-40 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'active' ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-white/50 hover:text-white'}`}
            >
              {t.arena.activeAndOpen}
            </button>
            <button 
              onClick={() => setTab('completed')}
              className={`flex-1 md:w-40 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'completed' ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-white/50 hover:text-white'}`}
            >
              {t.arena.completed}
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder={t.arena.searchTournamentPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-white/50 font-medium">{t.common.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(tab === 'active' ? activeTournaments : completedTournaments).map(t => (
              <TournamentCard key={t.id} tournament={t} />
            ))}

            {(tab === 'active' ? activeTournaments : completedTournaments).length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/20 rounded-3xl bg-white/5">
                <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 font-semibold text-lg">{tab === 'active' ? t.arena.noTournaments : t.arena.noTournamentsCompleted}</p>
                <p className="text-white/30 text-sm mt-2">{t.arena.comeBackSoon}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
