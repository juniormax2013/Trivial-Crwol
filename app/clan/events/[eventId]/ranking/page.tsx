'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  getClanEventById, 
  getClanEventRanking, 
  getClanMembersEventRanking,
  ClanEventModel,
  ClanEventScoreModel,
  ClanEventMemberScoreModel 
} from '@/lib/clan/eventsRepository';
import BackButton from '@/components/BackButton';
import { Trophy, Crown, Medal, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClanEventRankingPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [event, setEvent] = useState<ClanEventModel | null>(null);
  const [ranking, setRanking] = useState<ClanEventScoreModel[]>([]);
  const [membersRanking, setMembersRanking] = useState<ClanEventMemberScoreModel[]>([]);
  const [loading, setLoading] = useState(true);

  const lang = user?.settings?.language || 'es';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const evt = await getClanEventById(eventId);
        if (!evt) {
          toast.error('Evento no encontrado.');
          router.push('/clans');
          return;
        }

        const [ranks, mRanks] = await Promise.all([
          getClanEventRanking(eventId),
          user.clanId ? getClanMembersEventRanking(eventId, user.clanId) : Promise.resolve([])
        ]);

        setEvent(evt);
        setRanking(ranks);
        setMembersRanking(mRanks);
      } catch (e) {
        console.error(e);
        toast.error('Error al cargar la clasificación.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, eventId, router]);

  if (authLoading || loading || !event) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
        <p className="text-sm text-[#64748B] font-medium">Cargando clasificación...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen pb-16 font-sans selection:bg-[#eddcff]">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <BackButton href={`/clan/events/${eventId}`} />
        <h1 className="font-bold text-base text-[#0F172A]">Clasificación Real</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Main Container */}
      <main className="pt-20 px-4 max-w-xl mx-auto space-y-6">

        {/* Section: Ranking de Clanes */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">
            Ranking Global de Clanes
          </h2>

          <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm divide-y divide-slate-100 overflow-hidden">
            {ranking.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#64748B]">No hay puntuaciones registradas aún.</p>
            ) : (
              ranking.map((rank, idx) => {
                const isMyClan = rank.clanId === user?.clanId;
                const isTop3 = idx < 3;
                const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;

                return (
                  <div 
                    key={rank.clanId}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isMyClan ? 'bg-[#0A84FF]/5 border-l-4 border-l-[#0A84FF]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-black text-[#64748B]">
                        {medalEmoji || `#${idx + 1}`}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                          {rank.clanName}
                          {isMyClan && (
                            <span className="bg-[#0A84FF]/10 text-[#0A84FF] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              Mi Clan
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">
                          {rank.matchesPlayed} partidas jugadas
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-serif font-black text-base text-[#0F172A]">
                        {rank.totalPoints.toLocaleString()}
                      </span>
                      <span className="text-[8px] font-black text-[#64748B] block tracking-widest uppercase">
                        puntos
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Section: Top Miembros de mi Clan */}
        {user?.clanId && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">
              Top Miembros de mi Clan
            </h2>

            <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm divide-y divide-slate-100 overflow-hidden">
              {membersRanking.length === 0 ? (
                <p className="p-8 text-center text-xs text-[#64748B]">Aún no has jugado partidas del evento.</p>
              ) : (
                membersRanking.map((member, idx) => {
                  const isMe = member.userId === user.uid;

                  return (
                    <div 
                      key={member.userId}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        isMe ? 'bg-slate-50 border-l-4 border-l-slate-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-black text-[#64748B]">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-[#0F172A]">
                            {member.displayName} {isMe && '(Tú)'}
                          </p>
                          <p className="text-[10px] text-[#64748B] mt-0.5">
                            {member.matchesPlayed} partidas · {member.correctAnswers} correctas
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-serif font-black text-sm text-[#0A84FF]">
                          {member.points.toLocaleString()}
                        </span>
                        <span className="text-[8px] font-black text-[#64748B] block tracking-widest uppercase">
                          pts
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

      </main>

    </div>
  );
}
