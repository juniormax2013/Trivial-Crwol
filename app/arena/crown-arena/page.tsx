'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Crown, 
  Users, 
  Globe, 
  Check, 
  ChevronRight, 
  Info,
  Zap,
  BookOpen,
  ScrollText,
  Flame,
  Star,
  Dices
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT, useLanguage } from '@/lib/i18n/context';
import { DUEL_CATEGORIES } from '@/lib/duel/seed';
import { createArenaSession, sendArenaInvitations } from '@/lib/arena/repository';
import { getFriendsList } from '@/lib/social/repository';
import { AppUserModel } from '@/lib/user/models';
import Image from 'next/image';
import { toast } from 'sonner';

const MODE_OPTIONS = [
  { id: 'friends', icon: Users, color: 'bg-blue-500' },
  { id: 'random', icon: Globe, color: 'bg-purple-500' },
];

const PLAYER_OPTIONS = [2, 4, 6, 8];

export default function CrownArenaSetup() {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const t = useT();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(['random']);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'friends' | 'random'>('random');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Friends & Invitations Logic
  const [friends, setFriends] = useState<AppUserModel[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [autoInvite, setAutoInvite] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    setLoadingFriends(true);
    try {
      const list = await getFriendsList(user.uid);
      setFriends(list);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleFriend = (uid: string) => {
    setSelectedFriends(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateRoom = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    setErrorDetails(null);
    try {
      const roomId = await createArenaSession(
        user.uid,
        user.fullName || user.username || 'Anonymous',
        user.photoURL,
        selectedMode,
        maxPlayers,
        language,
        selectedCategories
      );

      // Send Invitations if necessary
      if (selectedMode === 'friends') {
        const uidsToInvite = autoInvite ? friends.map(f => f.uid) : selectedFriends;
        if (uidsToInvite.length > 0) {
          try {
            await sendArenaInvitations(
              roomId,
              { 
                uid: user.uid, 
                name: user.fullName || user.username || 'Anonymous', 
                avatar: user.photoURL || null 
              },
              uidsToInvite
            );
            toast.success(`Invitaciones enviadas a ${uidsToInvite.length} guerreros`);
          } catch (invError) {
            console.error('Error sending invitations:', invError);
            // Non-blocking error, we still redirect
          }
        }
      }

      router.push(`/arena/crown-arena/${roomId}/lobby`);
    } catch (error: any) {
      console.error('Error creating room:', error);
      setErrorDetails(error.message || 'Error desconocido al crear la sala');
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-[#1b1b1e]/5 pt-safe">
        <div className="flex items-center gap-4 px-6 py-4 max-w-screen-xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#1b1b1e]/5 flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={2} />
              {t.crownArena.title}
            </h1>
            <p className="text-[11px] font-bold text-[#7c7483] uppercase tracking-wider">
              {t.crownArena.subtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-lg mx-auto space-y-8">
        
        {/* Banner Informativo */}
        <section className="bg-gradient-to-br from-[#280056] to-[#4a148c] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#ffe088] text-[#735c00] px-2 py-0.5 rounded-md text-[10px] font-black uppercase">LIVE</div>
              <span className="text-[12px] font-bold text-white/80">{t.crownArena.difficultyProgressive}</span>
            </div>
            <h2 className="text-[22px] font-black leading-tight mb-3">
              {t.crownArena.disclaimer}
            </h2>
            <div className="flex items-center gap-4 text-[12px] font-medium text-white/70">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#ffe088] fill-[#ffe088]" />
                <span>+500 XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#ffe088] fill-[#ffe088]" />
                <span>Grandes Premios</span>
              </div>
            </div>
          </div>
          <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </section>

        {/* Categoría */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[18px] font-bold text-[#310065]">{t.crownArena.category}</h3>
            {selectedCategories.includes('random') && !showCategoryGrid && (
              <button 
                onClick={() => setShowCategoryGrid(true)}
                className="text-[12px] font-bold text-[#4a148c] py-1 px-3 rounded-full bg-[#eddcff] hover:bg-[#d1c4e9] transition-colors"
              >
                {t.crownArena.modifyCategories}
              </button>
            )}
          </div>

          {!showCategoryGrid ? (
            <button
              onClick={() => {
                if (selectedCategories.includes('random')) {
                  setShowCategoryGrid(true);
                } else {
                  setSelectedCategories(['random']);
                }
              }}
              className={`w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all active:scale-95 ${
                selectedCategories.includes('random')
                  ? 'border-[#4a148c] bg-[#eddcff]/40 shadow-[0_8px_24px_rgba(74,20,140,0.1)]'
                  : 'border-[#1b1b1e]/5 bg-white'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Dices className="w-8 h-8" />
              </div>
              <div className="text-left">
                <span className="block font-black text-[17px] text-[#310065] uppercase tracking-wide">
                  {t.crownArena.random}
                </span>
                <span className="text-[12px] text-[#7c7483] font-bold">
                  {selectedCategories.includes('random') 
                    ? 'Sistema elige categorías al azar' 
                    : t.crownArena.selectedCount.replace('{n}', selectedCategories.length.toString())}
                </span>
              </div>
              {selectedCategories.includes('random') && (
                <div className="ml-auto w-6 h-6 rounded-full bg-[#310065] flex items-center justify-center border-2 border-white">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* Opción Aleatoria dentro de la grilla también para poder volver */}
              <button
                onClick={() => {
                  setSelectedCategories(['random']);
                  setShowCategoryGrid(false);
                }}
                className={`flex flex-col items-center gap-2 py-5 rounded-[1.5rem] border transition-all active:scale-95 relative ${
                  selectedCategories.includes('random')
                    ? 'border-[#4a148c] bg-[#eddcff]/40 shadow-[0_4px_16px_rgba(74,20,140,0.1)]'
                    : 'border-[#1b1b1e]/5 bg-white hover:border-[#4a148c]/20'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mb-1">
                  <Dices className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider ${selectedCategories.includes('random') ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                  {t.crownArena.random}
                </span>
              </button>

              {DUEL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const handleToggle = () => {
                  if (selectedCategories.includes('random')) {
                    setSelectedCategories([cat.id]);
                  } else {
                    if (isSelected) {
                      const next = selectedCategories.filter(id => id !== cat.id);
                      setSelectedCategories(next.length === 0 ? ['random'] : next);
                    } else {
                      setSelectedCategories([...selectedCategories, cat.id]);
                    }
                  }
                };

                return (
                  <button
                    key={cat.id}
                    onClick={handleToggle}
                    className={`flex flex-col items-center gap-2 py-5 rounded-[1.5rem] border transition-all active:scale-95 relative ${
                      isSelected
                        ? 'border-[#4a148c] bg-[#eddcff]/40 shadow-[0_4px_16px_rgba(74,20,140,0.1)]'
                        : 'border-[#1b1b1e]/5 bg-white hover:border-[#4a148c]/20'
                    }`}
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                      {cat.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#310065] flex items-center justify-center border-2 border-white">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Modo de Juego */}
        <section className="space-y-4">
          <h3 className="font-serif text-[18px] font-bold text-[#310065]">{t.crownArena.mode}</h3>
          <div className="grid grid-cols-2 gap-3">
            {MODE_OPTIONS.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id as any)}
                  className={`flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all text-left active:scale-95 ${
                    isSelected
                      ? 'border-[#4a148c] bg-[#eddcff]/40 shadow-[0_4px_16px_rgba(74,20,140,0.1)]'
                      : 'border-[#1b1b1e]/5 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${mode.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-[15px] text-[#310065]">
                      {t.crownArena[mode.id as keyof typeof t.crownArena]}
                    </span>
                    <span className="text-[11px] text-[#7c7483] font-medium leading-none">
                      {mode.id === 'friends' ? 'Privado' : 'Público'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selección de Amigos (Solo si es modo amigos) */}
        {selectedMode === 'friends' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-serif text-[18px] font-bold text-[#310065]">
                {t.crownArena.inviteFriends}
              </h3>
              <button 
                onClick={() => setAutoInvite(!autoInvite)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  autoInvite 
                    ? 'bg-[#310065] border-[#310065] text-white' 
                    : 'bg-white border-[#1b1b1e]/10 text-[#7c7483]'
                }`}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${autoInvite ? 'bg-white border-white' : 'border-[#1b1b1e]/20'}`}>
                  {autoInvite && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {autoInvite ? t.crownArena.autoInvite : t.crownArena.autoInviteDesc}
                </span>
              </button>
            </div>

            {!autoInvite ? (
              <div className="bg-white rounded-[2rem] border border-[#1b1b1e]/5 p-2 overflow-hidden">
                {loadingFriends ? (
                  <div className="p-8 flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#310065] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Users className="w-10 h-10 text-[#7c7483]/20 mx-auto" />
                    <p className="text-[13px] text-[#7c7483] font-medium">{t.social.noFriends}</p>
                  </div>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto px-2 py-2 space-y-2 custom-scrollbar">
                    {friends.map((friend) => {
                      const isSelected = selectedFriends.includes(friend.uid);
                      return (
                        <button
                          key={friend.uid}
                          onClick={() => toggleFriend(friend.uid)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            isSelected 
                              ? 'bg-[#eddcff]/40 border-[#4a148c]/20' 
                              : 'bg-transparent border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                            <Image 
                              src={friend.photoURL || `https://api.dicebear.com/9.x/notionists/svg?seed=${friend.username}`}
                              alt={friend.username}
                              width={40} height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-[14px] text-[#310065] truncate">{friend.fullName || friend.username}</p>
                            <p className="text-[10px] text-[#7c7483] font-bold uppercase tracking-widest leading-none">@{friend.username}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-[#310065] border-[#310065]' : 'border-[#1b1b1e]/10 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#310065]/10 rounded-[2rem] p-6 text-center border border-dashed border-[#310065]/30">
                <Users className="w-12 h-12 text-[#310065]/40 mx-auto mb-3" />
                <p className="text-[15px] text-[#310065] font-black uppercase tracking-tight">{t.crownArena.autoInvite}</p>
                <p className="text-[12px] text-[#7c7483] font-bold max-w-[200px] mx-auto mt-1">
                  {t.crownArena.autoInviteDesc} ({friends.length} {t.social.friends})
                </p>
              </div>
            )}
            
            {selectedFriends.length > 0 && !autoInvite && (
              <p className="text-center text-[11px] font-black text-[#4a148c] uppercase tracking-widest animate-pulse">
                {t.crownArena.invitationsSent.replace('{n}', selectedFriends.length.toString())}
              </p>
            )}
          </section>
        )}

        {/* Jugadores */}
        <section className="space-y-4">
          <h3 className="font-serif text-[18px] font-bold text-[#310065]">{t.crownArena.maxPlayers}</h3>
          <div className="flex justify-between gap-2">
            {PLAYER_OPTIONS.map((num) => {
              const isSelected = maxPlayers === num;
              return (
                <button
                  key={num}
                  onClick={() => setMaxPlayers(num)}
                  className={`flex-1 py-4 rounded-2xl border font-black text-[17px] transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#310065] text-white border-[#310065] shadow-lg shadow-[#310065]/20'
                      : 'bg-white text-[#7c7483] border-[#1b1b1e]/5'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </section>

        {/* Action Button */}
        <div className="space-y-4">
          {errorDetails && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-2xl text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
              <p className="font-bold mb-1 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Error de Firebase:
              </p>
              <code className="text-[11px] block break-all opacity-80">{errorDetails}</code>
            </div>
          )}

          <button
            onClick={handleCreateRoom}
            disabled={isSubmitting}
            className="w-full py-5 rounded-[1.75rem] bg-gradient-to-r from-[#e9c349] to-[#cba72f] text-[#310065] font-black text-[18px] shadow-[0_12px_24px_rgba(233,195,73,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Star className="w-5 h-5 fill-[#310065]" />
                {selectedMode === 'friends' ? t.crownArena.createRoom : t.crownArena.startNow}
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-[#7c7483] font-medium px-4 leading-relaxed">
          Al iniciar, confirmas que tienes al menos 10 de Energía para participar. 
          Los premios se distribuyen al finalizar la partida entre los mejores 3.
        </p>

      </main>
    </div>
  );
}
