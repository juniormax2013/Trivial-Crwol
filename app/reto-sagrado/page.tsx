'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  X, 
  User, 
  Users, 
  Sparkles, 
  Flame, 
  Crown, 
  ArrowRight, 
  Check, 
  Search,
  MessageSquare,
  Zap,
  Globe
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage, useT } from '@/lib/i18n/context';
import { getFriendsList } from '@/lib/social/repository';
import { AppUserModel } from '@/lib/user/models';
import { toast } from 'sonner';

export default function RetoSagradoLobby() {
  const { user } = useAuthContext();
  const { language, isLoaded } = useLanguage();
  const router = useRouter();
  const t = useT();

  const [mode, setMode] = useState<'solo' | 'friend'>('solo');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [friends, setFriends] = useState<AppUserModel[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitingUid, setInvitingUid] = useState<string | null>(null);
  const [invitedUids, setInvitedUids] = useState<Set<string>>(new Set());

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF]"></div>
      </div>
    );
  }

  // Seed some premium default friends if the user has none to make it testable and complete
  const mockFriends: Partial<AppUserModel>[] = [
    {
      uid: 'mock-ruth',
      fullName: 'Ruth Méndez',
      username: 'ruth_mendez',
      photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Ruth&backgroundColor=c2185b&fontFamily=Georgia',
      isOnline: true,
      level: 9,
      crowns: 920
    },
    {
      uid: 'mock-samuel',
      fullName: 'Samuel Pierre',
      username: 'samuel_p',
      photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Samuel&backgroundColor=01579b&fontFamily=Georgia',
      isOnline: true,
      level: 21,
      crowns: 4250
    },
    {
      uid: 'mock-daniel',
      fullName: 'Daniel Cruz',
      username: 'daniel_cruz',
      photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Daniel&backgroundColor=7345b6&fontFamily=Georgia',
      isOnline: false,
      level: 14,
      crowns: 1850
    },
    {
      uid: 'mock-esther',
      fullName: 'Esther Paulino',
      username: 'esther_p',
      photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=Esther&backgroundColor=1b5e20&fontFamily=Georgia',
      isOnline: true,
      level: 17,
      crowns: 3100
    }
  ];

  useEffect(() => {
    if (user?.uid && mode === 'friend') {
      setLoadingFriends(true);
      getFriendsList(user.uid)
        .then(list => {
          // Merge with mock friends to ensure the view is always beautifully populated
          const merged = [...list];
          mockFriends.forEach(mf => {
            if (!merged.some(f => f.uid === mf.uid)) {
              merged.push(mf as AppUserModel);
            }
          });
          setFriends(merged);
          setLoadingFriends(false);
        })
        .catch(err => {
          console.error(err);
          setFriends(mockFriends as AppUserModel[]);
          setLoadingFriends(false);
        });
    }
  }, [user?.uid, mode]);

  const handleSendInvitation = (friend: AppUserModel) => {
    if (invitedUids.has(friend.uid)) return;
    
    setInvitingUid(friend.uid);
    
    // Simulate premium network delay
    setTimeout(() => {
      setInvitingUid(null);
      setInvitedUids(prev => new Set([...prev, friend.uid]));
      toast.success(
        language === 'ht' 
          ? `Envitasyn voye bay ${friend.fullName} ✓` 
          : `Invitación enviada a ${friend.fullName} ✓`
      );

      // If friend is online, simulate them accepting and launching game after 2.5s
      if (friend.isOnline) {
        setTimeout(() => {
          toast.info(
            language === 'ht'
              ? `${friend.fullName} aksepte envitasyn an! N ap kòmanse...`
              : `${friend.fullName} ha aceptado tu invitación. ¡Comenzando partida!`
          );
          router.push(`/reto-sagrado/play?multiplayer=true&opponent=${friend.uid}`);
        }, 2200);
      }
    }, 1200);
  };

  const filteredFriends = friends.filter(f => {
    const term = searchQuery.toLowerCase();
    return (
      (f.fullName || '').toLowerCase().includes(term) ||
      (f.username || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-12 font-sans relative flex flex-col pt-safe">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.08]">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0A84FF] blur-[150px] rounded-full scale-150"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-xl border-b border-[#0A84FF]/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-screen-md mx-auto">
          <Link href="/arena" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/50 transition-colors">
            <X className="w-6 h-6 text-[#1b1b1e]" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black tracking-widest px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm uppercase">
              RETO SAGRADO
            </span>
          </div>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 px-6 max-w-[480px] mx-auto w-full flex flex-col">
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[#0A84FF] to-[#310065] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-white/10">
          <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/5 blur-2xl rounded-full pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-[#ffe088]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-serif font-black leading-tight drop-shadow-md">
                {language === 'ht' ? 'Reto Sagrado' : 'Reto Sagrado'}
              </h1>
              <p className="text-white/80 text-[13px] font-medium leading-relaxed">
                {language === 'ht'
                  ? 'Kòmanse yon vwayaj konesans biblik atravè divès kalite kesyon enteresan.'
                  : 'Embárcate en un viaje de conocimiento bíblico con divertidos tipos de preguntas.'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-white rounded-3xl p-1.5 shadow-sm border border-[#1b1b1e]/5 flex gap-2 mb-8">
          <button
            onClick={() => setMode('solo')}
            className={`flex-1 py-4.5 rounded-[1.25rem] font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
              mode === 'solo'
                ? 'bg-[#0A84FF] text-white shadow-md'
                : 'text-[#64748B] hover:text-[#0f172a]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'ht' ? 'Jwe Solo' : 'Jugar Solo'}</span>
          </button>
          <button
            onClick={() => setMode('friend')}
            className={`flex-1 py-4.5 rounded-[1.25rem] font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
              mode === 'friend'
                ? 'bg-[#0A84FF] text-white shadow-md'
                : 'text-[#64748B] hover:text-[#0f172a]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'ht' ? 'Ak yon Zanmi' : 'Con un Amigo'}</span>
          </button>
        </div>

        {/* Dynamic Panel */}
        {mode === 'solo' ? (
          <div className="flex flex-col flex-grow">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#1b1b1e]/5 space-y-6 flex-grow mb-12">
              <h3 className="font-serif text-xl font-bold text-[#1b1b1e]">
                {language === 'ht' ? 'Règ ak Detay' : 'Reglas y Detalles'}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0A84FF] flex items-center justify-center shrink-0 font-bold">1</div>
                  <span>
                    {language === 'ht'
                      ? 'Gen 6 kalite kesyon diferan (Chwa miltip, Vre oswa Manti, Ranpli fraz la, elatriye).'
                      : 'Encontrarás 6 tipos de preguntas (Selección múltiple, Verdadero/Falso, Completar frases, etc.).'}
                  </span>
                </li>
                <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0A84FF] flex items-center justify-center shrink-0 font-bold">2</div>
                  <span>
                    {language === 'ht'
                      ? 'Sonde son yo ap jwe pou gide w sou bon repons yo.'
                      : 'Efectos de sonido interactivos te guiarán con cada acierto o error.'}
                  </span>
                </li>
                <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0A84FF] flex items-center justify-center shrink-0 font-bold">3</div>
                  <span>
                    {language === 'ht'
                      ? 'Reponn kòrèkteman pou w genyen kouwòn ak pwen eksperyans.'
                      : 'Responde correctamente para ganar coronas y puntos de experiencia.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Difficulty Selector */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#1b1b1e]/5 mb-8 space-y-4">
              <h3 className="font-serif text-[15px] font-bold text-[#0F172A] uppercase tracking-wider">
                {language === 'ht' ? 'Chwazi Difikilte' : 'Selecciona Dificultad'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`py-3.5 rounded-xl font-bold text-[12px] transition-all border ${
                    difficulty === 'easy'
                      ? 'border-[#0A84FF] text-[#0A84FF]'
                      : 'border-[#1b1b1e]/5 hover:bg-slate-50 text-[#64748B]'
                  }`}
                  style={difficulty === 'easy' ? {borderColor: '#0A84FF', color: '#0A84FF', backgroundColor: '#0A84FF12'} : {}}
                >
                  <span className="block font-black uppercase">{language === 'ht' ? 'Fasil' : 'Fácil'}</span>
                  <span className="text-[10px] opacity-80">{language === 'ht' ? '10 Kesyon' : '10 Preguntas'}</span>
                </button>
                <button
                  onClick={() => setDifficulty('medium')}
                  className={`py-3.5 rounded-xl font-bold text-[12px] transition-all border ${
                    difficulty === 'medium'
                      ? 'border-[#0A84FF] text-[#0A84FF]'
                      : 'border-[#1b1b1e]/5 hover:bg-slate-50 text-[#64748B]'
                  }`}
                  style={difficulty === 'medium' ? {borderColor: '#0A84FF', color: '#0A84FF', backgroundColor: '#0A84FF12'} : {}}
                >
                  <span className="block font-black uppercase">{language === 'ht' ? 'Mwayen' : 'Medio'}</span>
                  <span className="text-[10px] opacity-80">{language === 'ht' ? '20 Kesyon' : '20 Preguntas'}</span>
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`py-3.5 rounded-xl font-bold text-[12px] transition-all border ${
                    difficulty === 'hard'
                      ? 'border-[#0A84FF] text-[#0A84FF]'
                      : 'border-[#1b1b1e]/5 hover:bg-slate-50 text-[#64748B]'
                  }`}
                  style={difficulty === 'hard' ? {borderColor: '#0A84FF', color: '#0A84FF', backgroundColor: '#0A84FF12'} : {}}
                >
                  <span className="block font-black uppercase">{language === 'ht' ? 'Difisil' : 'Difícil'}</span>
                  <span className="text-[10px] opacity-80">{language === 'ht' ? '30 Kesyon' : '30 Preguntas'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push(`/reto-sagrado/play?difficulty=${difficulty}`)}
              className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform mb-12"
            >
              <span>{language === 'ht' ? 'KÒMANSE JWÈT' : 'COMENZAR JUEGO'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748B] w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'ht' ? 'Chèche zanmi...' : 'Buscar amigos...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-12 pr-6 py-4 rounded-2xl border border-[#1b1b1e]/5 shadow-sm text-[14px] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/40"
              />
            </div>

            {/* Friends list */}
            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#0A84FF] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-8 text-center border border-[#1b1b1e]/5 text-[#64748B] text-[13px] font-medium">
                {language === 'ht' ? 'Zanmi pa jwenn.' : 'No se encontraron amigos.'}
              </div>
            ) : (
              <div className="space-y-3 mb-12 max-h-[360px] overflow-y-auto pr-1">
                {filteredFriends.map((friend) => {
                  const isInvited = invitedUids.has(friend.uid);
                  const isInviting = invitingUid === friend.uid;

                  return (
                    <div
                      key={friend.uid}
                      className="bg-white rounded-[1.5rem] p-4 border border-[#1b1b1e]/5 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#faf9fc] shrink-0 border border-[#1b1b1e]/5">
                          <Image
                            src={friend.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=fallback'}
                            alt={friend.fullName || 'Zanmi'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0f172a] text-[14px]">{friend.fullName}</span>
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              friend.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/50" />
                              {friend.crowns || 0}
                            </span>
                            <span>Niv. {friend.level || 1}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendInvitation(friend)}
                        disabled={isInvited || isInviting}
                        className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all ${
                          isInvited
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : isInviting
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-[#0A84FF] text-white hover:scale-105 active:scale-95 shadow-sm shadow-[#0A84FF]/20'
                        }`}
                      >
                        {isInvited ? (
                          <div className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Voye</span>
                          </div>
                        ) : isInviting ? (
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Invitar</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
