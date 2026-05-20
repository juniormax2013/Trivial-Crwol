'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu,
  UserCircle2,
  Medal,
  CheckCircle2,
  Timer,
  XCircle,
  Gift,
  TrendingUp,
  Trophy,
  Crown,
  Quote,
  RotateCcw,
  Home,
  Activity,
  BarChart2,
  BookOpen,
  User,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { getDuelById, getRoundsForDuel } from '@/lib/duel/repository';
import { buildDuelResult } from '@/lib/duel/service';
import { DuelResult } from '@/lib/duel/models';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/context';

export default function MatchResult() {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useT();
  const duelId = searchParams.get('duelId');
  
  const [result, setResult] = useState<DuelResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!duelId || !user) {
      if (!duelId) setError('No se proporcionó un ID de duelo');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const duel = await getDuelById(duelId);
        if (!duel) {
          setError('Duelo no encontrado');
          return;
        }

        if (duel.status !== 'completed') {
          setError('El duelo aún no ha terminado');
          return;
        }

        const rounds = await getRoundsForDuel(duelId);
        const res = buildDuelResult(duel, rounds, user.uid, user.activeFrame);
        setResult(res);
      } catch (err: any) {
        console.error('Error loading result:', err);
        setError(err.message || 'Error al cargar los resultados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [duelId, user]);

  if (loading) {
    return (
      <div className="bg-[#faf9fc] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#4a148c]/20 border-t-[#4a148c] animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-16 h-16 text-[#2d1b69]/30 mb-4" />
        <h2 className="text-2xl font-bold text-[#2d1b69] mb-4">Ups, algo salió mal</h2>
        <p className="text-[#e53935] mb-8 text-sm">{error || 'No pudimos cargar los resultados'}</p>
        <Link href="/arena" className="h-14 px-8 rounded-2xl bg-[#310065] text-white font-bold flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          Volver a la Arena
        </Link>
      </div>
    );
  }

  const isWin = result.outcome === 'win';
  const isTie = result.outcome === 'tie';

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">
      
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 h-16">
        <Link href="/arena" className="flex items-center justify-center p-2 -ml-2 text-[#310065]">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-xl font-bold text-[#310065] tracking-tight">Resultado del Duelo</h1>
        <button className="flex items-center justify-center p-2 -mr-2 text-[#310065]">
          <UserCircle2 className="w-6 h-6" />
        </button>
      </header>

      <main className="pt-16 max-w-2xl mx-auto">
        
        {/* Hero Section: Layered Illumination */}
        <section className={`pt-12 pb-24 px-8 rounded-b-[3rem] relative overflow-hidden text-center shadow-xl transition-colors duration-700 ${
          isWin ? 'bg-gradient-to-br from-[#310065] to-[#4a148c]' : 
          isTie ? 'bg-gradient-to-br from-[#4a148c] to-[#7345b6]' :
          'bg-gradient-to-br from-[#1b1b1e] to-[#45454b]'
        }`}>
          {/* Decorative Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle at center, #ffe088 0%, transparent 70%)' }}></div>
          
          <div className="relative z-10">
            <span className={`inline-block px-4 py-1.5 rounded-full font-bold text-[11px] tracking-[0.15em] uppercase mb-4 border ${
              isWin ? 'bg-[#cba72f]/20 text-[#ffe088] border-[#ffe088]/20' : 
              isTie ? 'bg-white/10 text-white border-white/20' :
              'bg-white/10 text-white/70 border-white/10'
            }`}>
              {isWin ? '¡Victoria Celestial!' : isTie ? '¡Empate de Sabiduría!' : 'Sigue intentándolo'}
            </span>
            <h2 className="font-serif text-6xl md:text-7xl font-black text-white mb-1.5 leading-none drop-shadow-md">
              {result.finalScore.mine.toLocaleString()}
            </h2>
            <p className="text-[#d7baff] font-medium tracking-wide text-xs uppercase">TU PUNTUACIÓN TOTAL</p>
            
            <div className="mt-8 flex justify-center">
              <div className="w-32 h-32 relative flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
                  isWin ? 'bg-[#ffe088]/20' : 'bg-white/10'
                }`}></div>
                {isWin ? (
                  <Medal className="w-20 h-20 text-[#e9c349] fill-[#cba72f] relative z-10 drop-shadow-[0_0_16px_rgba(255,224,136,0.6)]" strokeWidth={1} />
                ) : (
                  <Trophy className="w-20 h-20 text-white/80 relative z-10" strokeWidth={1} />
                )}
              </div>
            </div>

            <div className="mt-6 text-white/90 font-medium flex items-center justify-center gap-3">
              <span>VS</span>
              <span className="font-bold">{result.opponentName}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-black">{result.finalScore.theirs.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Main Content Canvas */}
        <div className="px-6 -mt-12 relative z-20">
          
          {/* Performance Summary Bento */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            
            {/* Aciertos Card */}
            <div className="bg-white p-6 rounded-[1.75rem] shadow-[0_4px_20px_rgba(49,0,101,0.08)] flex flex-col items-center justify-center text-center border-b-4 border-[#310065]/10">
              <CheckCircle2 className="text-[#310065] w-7 h-7 mb-2.5 fill-[#eddcff]" strokeWidth={2} />
              <span className="text-[26px] font-serif font-black text-[#1b1b1e] leading-none mb-1">{result.correctAnswers.mine}</span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-[#7c7483] font-black">Aciertos</span>
            </div>
            
            {/* Oponente Card */}
            <div className="bg-white p-6 rounded-[1.75rem] shadow-[0_4px_20px_rgba(49,0,101,0.08)] flex flex-col items-center justify-center text-center border-b-4 border-[#310065]/10">
              <UserCircle2 className="text-[#310065] w-7 h-7 mb-2.5 fill-[#eddcff]" strokeWidth={2} />
              <span className="text-[26px] font-serif font-black text-[#1b1b1e] leading-none mb-1">{result.correctAnswers.theirs}</span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-[#7c7483] font-black">Rival</span>
            </div>
            
            {/* Resultado Card */}
            <div className={`col-span-2 md:col-span-1 p-6 rounded-[1.75rem] shadow-[0_4px_20px_rgba(49,0,101,0.08)] flex flex-col items-center justify-center text-center border-b-4 ${
              isWin ? 'bg-emerald-50 border-emerald-200' : isTie ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <Crown className={`w-7 h-7 mb-2.5 ${isWin ? 'text-emerald-600 fill-emerald-200' : isTie ? 'text-amber-600 fill-amber-200' : 'text-red-600 fill-red-200'}`} strokeWidth={2} />
              <span className="text-[18px] font-serif font-black text-[#1b1b1e] leading-none mb-1">
                {isWin ? 'GANASTE' : isTie ? 'EMPATE' : 'PERDISTE'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-[#7c7483] font-black">Resultado</span>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-[#f5f3f7] p-7 md:p-8 rounded-[2.5rem] mb-8 border border-[#310065]/5">
            <h3 className="font-serif text-[22px] font-bold text-[#310065] mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#4a148c] fill-[#eddcff]" />
              Recompensas de Gracia
            </h3>
            
            <div className="space-y-4">
              
              {/* XP Progress */}
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm flex items-center gap-5 border border-[#1b1b1e]/5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-[#4a148c] flex items-center justify-center shadow-inner">
                  <TrendingUp className="text-white w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="text-[15px] font-bold text-[#1b1b1e]">Experiencia</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[13px] font-extrabold text-[#310065] bg-[#eddcff] px-2.5 py-0.5 rounded-full">+{result.xpEarned} XP</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#efedf1] rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#7345b6] to-[#310065] rounded-full" style={{ width: isWin ? '100%' : '50%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Coronas Earned */}
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm flex items-center gap-5 border border-[#1b1b1e]/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#ffe088]/20 to-transparent pointer-events-none"></div>
                <div className="w-14 h-14 rounded-[1.25rem] bg-[#ffe088] flex items-center justify-center shadow-inner border border-[#cba72f]/20">
                  <Trophy className="text-[#735c00] w-7 h-7 fill-[#cba72f]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#1b1b1e] mb-1">Coronas Ganadas</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[22px] font-serif font-black text-[#735c00] leading-none">{result.crownsEarned}</span>
                    <Crown className="text-[#cba72f] w-5 h-5 fill-[#ffe088]" strokeWidth={2} />
                  </div>
                  {user && (user.activeFrame === 'gold' || user.activeFrame === 'crown' || user.activeFrame === 'gold_frame' || user.activeFrame === 'crow_frame') && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1">Base: {result.crownsEarned / 2} | Bonus: +{result.crownsEarned / 2}</p>
                  )}
                </div>
                {result.coinsEarned > 0 && (
                  <div className="flex flex-col items-end shrink-0 z-10">
                    <div className="bg-gradient-to-r from-[#cba72f] to-[#735c00] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_4px_12px_rgba(115,92,0,0.3)] border border-[#ffe088]/30">
                      +{result.coinsEarned} Monedas
                    </div>
                    {user && (user.activeFrame === 'gold' || user.activeFrame === 'crown' || user.activeFrame === 'gold_frame' || user.activeFrame === 'crow_frame') && (
                      <span className="text-[9px] text-amber-600 font-bold mt-1">Base: {result.coinsEarned / 2} | Bonus: +{result.coinsEarned / 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rounds Detailed Table (Optional but cool) */}
          <div className="bg-white rounded-[2rem] p-6 mb-8 shadow-sm border border-[#1b1b1e]/5">
            <h4 className="text-[12px] font-black uppercase tracking-widest text-[#7c7483] mb-4">Detalle de Rondas</h4>
            <div className="space-y-3">
              {result.roundsDetail.map((round) => (
                <div key={round.roundNumber} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#7c7483]">Ronda {round.roundNumber}</span>
                    <span className="text-[14px] font-bold text-[#310065]">{round.categoryName}</span>
                  </div>
                  <div className="flex gap-4 font-serif font-black">
                    <span className="text-[#4a148c]">{round.myScore}</span>
                    <span className="text-[#cdc3d4]">vs</span>
                    <span className="text-[#7c7483]">{round.theirScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biblical Insight Quote */}
          <div className="text-center px-4 py-10 mb-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#cdc3d4] to-transparent"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#cdc3d4] to-transparent"></div>
            
            <Quote className="text-[#d7baff] w-12 h-12 mx-auto mb-4" strokeWidth={1.5} fill="#f5f3f7" />
            <p className="font-serif italic text-xl text-[#4a4452] leading-relaxed mb-6 px-2">
              &quot;Toda la Escritura es inspirada por Dios y útil para enseñar, para reprender, para corregir y para instruir en la justicia.&quot;
            </p>
            <span className="text-[11px] font-black tracking-[0.2em] text-[#310065] uppercase">2 Timoteo 3:16</span>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-col gap-3 mb-10">
            <button 
              onClick={() => router.push('/arena')}
              className="w-full h-16 rounded-[1.25rem] bg-gradient-to-r from-[#310065] to-[#4a148c] text-white font-bold text-[17px] flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-[0_8px_20px_rgba(49,0,101,0.25)] ring-2 ring-[#7345b6]/50 ring-offset-2 ring-offset-[#faf9fc]"
            >
              <RotateCcw className="w-[22px] h-[22px]" strokeWidth={2.5} />
              Jugar otro duelo
            </button>
            <Link href="/" className="w-full h-16 rounded-[1.25rem] bg-[#e3e2e6] hover:bg-[#dbd9dd] text-[#310065] font-bold text-[17px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
              <Home className="w-[22px] h-[22px]" strokeWidth={2.5} />
              Ir al Home
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Shell */}
      <nav className="fixed bottom-0 left-0 w-full h-[76px] flex justify-around items-center px-2 pb-1 bg-white/90 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(49,0,101,0.08)] rounded-t-[2rem] z-50 border-t border-[#310065]/5">
        
        {/* Play (Active) */}
        <Link href="/arena" className="flex flex-col items-center justify-center bg-[#eddcff] text-[#310065] rounded-2xl w-16 h-[52px] mb-1 cursor-default">
          <Activity className="w-6 h-6 mb-0.5 fill-[#310065]/20" strokeWidth={2} />
          <span className="font-sans text-[10px] font-bold uppercase tracking-wide">Play</span>
        </Link>
        
        {/* Rankings */}
        <Link href="/ranking" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] transition-colors w-16 active:scale-95">
          <BarChart2 className="w-[22px] h-[22px] mb-1" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wide">Rankings</span>
        </Link>
        
        {/* Study */}
        <Link href="/study" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] transition-colors w-16 active:scale-95">
          <BookOpen className="w-[22px] h-[22px] mb-1" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wide">Study</span>
        </Link>
        
        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] transition-colors w-16 active:scale-95">
          <User className="w-[22px] h-[22px] mb-1" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wide">Profile</span>
        </Link>
        
      </nav>

    </div>
  );
}

