'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  getClanEventById, 
  getUserClanEventStats, 
  claimClanEventReward,
  ClanEventModel,
  UserClanEventStatsModel 
} from '@/lib/clan/eventsRepository';
import BackButton from '@/components/BackButton';
import { Trophy, Gift, Check, Lock, Loader2, Coins, Crown, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ClanEventRewardsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [event, setEvent] = useState<ClanEventModel | null>(null);
  const [myStats, setMyStats] = useState<UserClanEventStatsModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

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

        const stats = await getUserClanEventStats(eventId, user.uid);
        setEvent(evt);
        setMyStats(stats);
      } catch (e) {
        console.error(e);
        toast.error('Error al cargar la información de recompensas.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, eventId, router]);

  const handleClaim = async () => {
    if (!event || !myStats || claiming) return;
    setClaiming(true);

    try {
      const reward = await claimClanEventReward(eventId, user!.uid, user!.clanId!);
      toast.success(`¡Recompensa reclamada! Ganaste: +${reward.coins} monedas y +${reward.crowns} coronas.`);
      
      // Refresh stats local state
      const stats = await getUserClanEventStats(eventId, user!.uid);
      setMyStats(stats);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al reclamar la recompensa.');
    } finally {
      setClaiming(false);
    }
  };

  if (authLoading || loading || !event) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
        <p className="text-sm text-[#64748B] font-medium">Cargando recompensas...</p>
      </div>
    );
  }

  const minCont = event.rules.minContributionToReward || 300;
  const userPoints = myStats?.points || 0;
  const qualifies = userPoints >= minCont;
  const hasEnded = event.status === 'ended';
  const claimed = myStats?.rewardClaimed || false;

  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen pb-16 font-sans selection:bg-[#eddcff]">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <BackButton href={`/clan/events/${eventId}`} />
        <h1 className="font-bold text-base text-[#0F172A]">Recompensas Reales</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Main Container */}
      <main className="pt-20 px-4 max-w-xl mx-auto space-y-6">

        {/* User Status Card */}
        <section className="bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Mi Estado de Participación
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Puntos Aportados
              </span>
              <span className="text-xl font-black text-[#0A84FF] mt-1 block">
                {userPoints} pts
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Requisito mínimo
              </span>
              <span className={`text-[13px] font-bold mt-1 block ${qualifies ? 'text-emerald-600' : 'text-red-500'}`}>
                {qualifies ? '✓ Cumplido' : `Mínimo: ${minCont} pts`}
              </span>
            </div>
          </div>

          <div className="pt-2">
            {claimed ? (
              <div className="w-full py-4 bg-emerald-50 text-emerald-600 font-bold rounded-2xl flex items-center justify-center gap-2 border border-emerald-100">
                <Check className="w-5 h-5" />
                Recompensa reclamada
              </div>
            ) : hasEnded ? (
              qualifies ? (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#cba72f] hover:from-amber-600 hover:to-[#735c00] text-white font-bold text-[14px] uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {claiming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
                  Reclamar recompensa
                </button>
              ) : (
                <div className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 border border-red-100 text-xs text-center px-4">
                  <Lock className="w-4 h-4 shrink-0" />
                  Necesitas aportar un mínimo de {minCont} puntos para reclamar.
                </div>
              )
            ) : (
              <div className="w-full py-4 bg-slate-100 text-[#64748B] font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-200 text-xs text-center">
                <Clock className="w-4 h-4" />
                El evento sigue en curso. Podrás reclamar cuando finalice.
              </div>
            )}
          </div>
        </section>

        {/* Reward Tiers Info */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">
            Tabla de Premios del Evento
          </h2>

          <div className="space-y-3">
            
            {/* TOP 1 */}
            <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="font-bold text-sm text-[#0F172A]">Top 1 (Líder del Evento)</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-500" /> 3,000 monedas</span>
                  <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-600" /> 500 coronas</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-500" /> +1,000 XP Clan</span>
                  <span className="font-bold text-[#0A84FF]">🎁 Cofre Legendario</span>
                </div>
              </div>
            </div>

            {/* TOP 2-5 */}
            <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="font-bold text-sm text-[#0F172A]">Top 2 al 5</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-500" /> 2,000 monedas</span>
                  <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-600" /> 300 coronas</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-500" /> +700 XP Clan</span>
                  <span className="font-bold text-[#0A84FF]">🎁 Cofre Épico</span>
                </div>
              </div>
            </div>

            {/* TOP 6-20 */}
            <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="font-bold text-sm text-[#0F172A]">Top 6 al 20</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-500" /> 1,000 monedas</span>
                  <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-600" /> 150 coronas</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-500" /> +400 XP Clan</span>
                  <span className="font-bold text-[#0A84FF]">🎁 Cofre Raro</span>
                </div>
              </div>
            </div>

            {/* PARTICIPACION */}
            <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="font-bold text-sm text-[#0F172A]">Recompensa por Participación</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-500" /> 300 monedas</span>
                  <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-600" /> 50 coronas</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-500" /> +100 XP Clan</span>
                  <span className="font-bold text-[#0A84FF]">🎁 Cofre Pequeño</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
