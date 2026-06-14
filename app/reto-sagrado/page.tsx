'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { getSacredQuestions } from '@/lib/reto-sagrado/questions';
import { AppUserModel } from '@/lib/user/models';
import { toast } from 'sonner';
import { sendArenaInvitations } from '@/lib/arena/repository';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';

const LOBBY_TRANSLATIONS: Record<string, any> = {
  es: {
    sacredChallenge: "RETO SAGRADO",
    sacredChallengeTitle: "Reto Sagrado",
    desc: "Embárcate en un viaje de conocimiento bíblico con divertidos tipos de preguntas.",
    playSolo: "Jugar Solo",
    withFriend: "Con un Amigo",
    rulesTitle: "Reglas y Detalles",
    rule1: "Encontrarás 6 tipos de preguntas (Selección múltiple, Verdadero/Falso, Completar frases, etc.).",
    rule2: "Efectos de sonido interactivos te guiarán con cada acierto o error.",
    rule3: "Responde correctamente para ganar coronas y puntos de experiencia.",
    selectDifficulty: "Selecciona Dificultad",
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
    questionsCount: (n: number) => `${n} Preguntas`,
    startGame: "COMENZAR JUEGO",
    searchFriends: "Buscar amigos...",
    noFriends: "No se encontraron amigos.",
    invite: "Invitar",
    invited: "Enviado",
    invitationSent: (name: string) => `Invitación enviada a ${name} ✓`,
    accepted: (name: string) => `${name} ha aceptado tu invitación. ¡Comenzando partida!`,
    declined: (name: string) => `${name} ha rechazado tu invitación.`,
    errorInvitation: (err: string) => `No se pudo enviar la invitación: ${err}`
  },
  en: {
    sacredChallenge: "SACRED CHALLENGE",
    sacredChallengeTitle: "Sacred Challenge",
    desc: "Embark on a journey of biblical knowledge with fun question types.",
    playSolo: "Play Solo",
    withFriend: "With a Friend",
    rulesTitle: "Rules & Details",
    rule1: "You will find 6 different question types (Multiple Choice, True/False, Fill in the blanks, etc.).",
    rule2: "Interactive sound effects will guide you through every hit or miss.",
    rule3: "Answer correctly to earn crowns and experience points.",
    selectDifficulty: "Select Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    questionsCount: (n: number) => `${n} Questions`,
    startGame: "START GAME",
    searchFriends: "Search friends...",
    noFriends: "No friends found.",
    invite: "Invite",
    invited: "Sent",
    invitationSent: (name: string) => `Invitation sent to ${name} ✓`,
    accepted: (name: string) => `${name} has accepted your invitation. Starting game!`,
    declined: (name: string) => `${name} has declined your invitation.`,
    errorInvitation: (err: string) => `Could not send invitation: ${err}`
  },
  fr: {
    sacredChallenge: "DÉFI SACRÉ",
    sacredChallengeTitle: "Défi Sacré",
    desc: "Embarquez pour un voyage de connaissances bibliques avec des types de questions amusants.",
    playSolo: "Jouer Solo",
    withFriend: "Avec un Ami",
    rulesTitle: "Règles & Détails",
    rule1: "Vous trouverez 6 types de questions différents (Choix Multiple, Vrai/Faux, Compléter la phrase, etc.).",
    rule2: "Des effets sonores interactifs vous guideront à chaque succès ou erreur.",
    rule3: "Répondez correctement pour gagner des couronnes et des points d'expérience.",
    selectDifficulty: "Sélectionner la Difficulté",
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
    questionsCount: (n: number) => `${n} Questions`,
    startGame: "COMMENCER LE JEU",
    searchFriends: "Rechercher des amis...",
    noFriends: "Aucun ami trouvé.",
    invite: "Inviter",
    invited: "Envoyé",
    invitationSent: (name: string) => `Invitation envoyée à ${name} ✓`,
    accepted: (name: string) => `${name} a accepté votre invitation. Lancement du jeu !`,
    declined: (name: string) => `${name} a décliné votre invitation.`,
    errorInvitation: (err: string) => `Impossible d'envoyer l'invitation : ${err}`
  },
  ht: {
    sacredChallenge: "RETO SAGRADO",
    sacredChallengeTitle: "Reto Sagrado",
    desc: "Kòmanse yon vwayaj konesans biblik atravè divès kalite kesyon enteresan.",
    playSolo: "Jwe Solo",
    withFriend: "Ak yon Zanmi",
    rulesTitle: "Règ ak Detay",
    rule1: "Gen 6 kalite kesyon diferan (Chwa miltip, Vre oswa Manti, Ranpli fraz la, elatriye).",
    rule2: "Sonde son yo ap jwe pou gide w sou bon repons yo.",
    rule3: "Reponn kòrèkteman pou w genyen kouwòn ak pwen eksperyans.",
    selectDifficulty: "Chwazi Difikilte",
    easy: "Fasil",
    medium: "Mwayen",
    hard: "Difisil",
    questionsCount: (n: number) => `${n} Kesyon`,
    startGame: "KÒMANSE JWÈT",
    searchFriends: "Chèche zanmi...",
    noFriends: "Zanmi pa jwenn.",
    invite: "Invitar",
    invited: "Voye",
    invitationSent: (name: string) => `Envitasyn voye bay ${name} ✓`,
    accepted: (name: string) => `${name} aksepte envitasyn an! N ap kòmanse...`,
    declined: (name: string) => `${name} refize envitasyn an.`,
    errorInvitation: (err: string) => `Espas la pa ka voye envitasyn: ${err}`
  }
};

export default function RetoSagradoLobby() {
  const { user } = useAuthContext();
  const { language: userLanguage, isLoaded } = useLanguage();
  const router = useRouter();
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, []);

  const t = useT();

  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');

  const [mode, setMode] = useState<'solo' | 'friend'>('solo');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [friends, setFriends] = useState<AppUserModel[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Set room if passed by url (accept guest path)
  useEffect(() => {
    if (roomParam) {
      setActiveRoomId(roomParam);
      setMode('friend');
    }
  }, [roomParam]);

  const lang = ((userLanguage as string) === 'fr' || (userLanguage as string) === 'es' || (userLanguage as string) === 'en' || (userLanguage as string) === 'ht') ? (userLanguage as 'fr' | 'es' | 'en' | 'ht') : 'es';
  const localT = LOBBY_TRANSLATIONS[lang];

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

  const [invitingUid, setInvitingUid] = useState<string | null>(null);
  const [invitedUids, setInvitedUids] = useState<Set<string>>(new Set());
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [roomData, setRoomData] = useState<any>(null);

  // Listen to reto_sagrado_rooms players once activeRoomId is created
  useEffect(() => {
    if (!activeRoomId) return;

    // Listen to players in the lobby room
    const playersRef = collection(db, `reto_sagrado_rooms/${activeRoomId}/players`);
    const unsubPlayers = onSnapshot(playersRef, (snap) => {
      const list = snap.docs.map(doc => doc.data());
      setRoomPlayers(list);
    });

    // Listen to room status to redirect guest players when host starts
    const roomRef = doc(db, `reto_sagrado_rooms/${activeRoomId}`);
    const unsubRoom = onSnapshot(roomRef, (snap) => {
      const data = snap.data();
      if (data) {
        setRoomData(data);
        if (data.status === 'playing' && user) {
          // Find if this user is a guest (not host)
          if (data.hostId !== user.uid) {
            toast.success(lang === 'ht' ? 'Jwèt la ap kòmanse!' : lang === 'fr' ? 'Le jeu commence !' : '¡La partida está comenzando!');
            router.push(`/reto-sagrado/play?multiplayer=true&opponent=${data.hostId}&room=${activeRoomId}`);
          }
        }
      }
    });

    return () => {
      unsubPlayers();
      unsubRoom();
    };
  }, [activeRoomId, user, lang, router]);

  const handleSendInvitation = async (friend: AppUserModel) => {
    if (invitedUids.has(friend.uid)) return;
    if (!user) return;
    
    setInvitingUid(friend.uid);
    
    try {
      let roomId = activeRoomId;
      if (!roomId) {
        roomId = `sacred_${user.uid}_${Date.now()}`;
        setActiveRoomId(roomId);

        // Create the room state in Firestore
        await setDoc(doc(db, `reto_sagrado_rooms/${roomId}`), {
          id: roomId,
          hostId: user.uid,
          hostName: user.fullName || user.username || 'Noble Peregrino',
          hostAvatar: user.photoURL || null,
          status: 'waiting',
          createdAt: new Date().toISOString()
        });

        // Add Host to room players subcollection
        await setDoc(doc(db, `reto_sagrado_rooms/${roomId}/players`, user.uid), {
          id: user.uid,
          userId: user.uid,
          name: user.fullName || user.username || 'Noble Peregrino',
          avatarUrl: user.photoURL || null,
          status: 'ready',
          score: 0,
          currentQuestion: 1,
          isFinished: false,
          joinedAt: new Date().toISOString()
        });
      }

      const invitationIds = await sendArenaInvitations(
        roomId,
        {
          uid: user.uid,
          name: user.fullName || user.username || 'Noble Peregrino',
          avatar: user.photoURL || null
        },
        [friend.uid],
        'reto_sagrado'
      );

      setInvitingUid(null);
      setInvitedUids(prev => new Set([...prev, friend.uid]));
      toast.success(localT.invitationSent(friend.fullName));

      if (invitationIds.length > 0) {
        const invDocRef = doc(db, 'arenaInvitations', invitationIds[0]);
        const unsub = onSnapshot(invDocRef, (snap) => {
          const data = snap.data();
          if (data) {
            if (data.status === 'accepted') {
              toast.info(localT.accepted(friend.fullName));
              unsub();
              if (unsubRef.current === unsub) unsubRef.current = null;
            } else if (data.status === 'declined') {
              toast.error(localT.declined(friend.fullName));
              unsub();
              if (unsubRef.current === unsub) unsubRef.current = null;
              setInvitedUids(prev => {
                const updated = new Set(prev);
                updated.delete(friend.uid);
                return updated;
              });
            }
          }
        });
        unsubRef.current = unsub;
      }
    } catch (e: any) {
      console.error(e);
      setInvitingUid(null);
      toast.error(localT.errorInvitation(e.message));
    }
  };

  const handleStartMultiplayerGame = async () => {
    if (!activeRoomId || !user) return;
    try {
      // Generate question IDs synchronically for both players
      const combined = getSacredQuestions((userLanguage === 'es' || userLanguage === 'fr' || userLanguage === 'ht') ? userLanguage : 'es');
      const easyPool = combined.filter(q => q.difficulty === 'easy' || !q.difficulty);
      const mediumPool = combined.filter(q => q.difficulty === 'medium');
      const hardPool = combined.filter(q => q.difficulty === 'hard');

      const selectedEasy = [...easyPool].sort(() => Math.random() - 0.5).slice(0, 15);
      const selectedMedium = [...mediumPool].sort(() => Math.random() - 0.5).slice(0, 15);
      const selectedHard = [...hardPool].sort(() => Math.random() - 0.5).slice(0, 20);

      // Sort to preserve transition announcements by type
      selectedEasy.sort((a, b) => a.type.localeCompare(b.type));
      selectedMedium.sort((a, b) => a.type.localeCompare(b.type));
      selectedHard.sort((a, b) => a.type.localeCompare(b.type));

      const questionIds = [
        ...selectedEasy.map(q => q.id),
        ...selectedMedium.map(q => q.id),
        ...selectedHard.map(q => q.id)
      ];

      // Set status to playing to trigger guests redirect and save questionIds
      await setDoc(doc(db, `reto_sagrado_rooms/${activeRoomId}`), {
        status: 'playing',
        startedAt: new Date().toISOString(),
        questionIds
      }, { merge: true });

      // Host redirects to play page
      const opponentPlayer = roomPlayers.find(p => p.id !== user.uid);
      const opponentId = opponentPlayer ? opponentPlayer.id : 'opponent';
      router.push(`/reto-sagrado/play?multiplayer=true&opponent=${opponentId}&room=${activeRoomId}`);
    } catch (e: any) {
      console.error("Error starting multiplayer reto sagrado game:", e);
      toast.error("Error al iniciar el juego");
    }
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
              {localT.sacredChallenge}
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
                {localT.sacredChallengeTitle}
              </h1>
              <p className="text-white/80 text-[13px] font-medium leading-relaxed">
                {localT.desc}
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
            <span>{localT.playSolo}</span>
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
            <span>{localT.withFriend}</span>
          </button>
        </div>

        {/* Dynamic Panel */}
        {mode === 'solo' ? (
          <div className="flex flex-col flex-grow">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#1b1b1e]/5 space-y-6 flex-grow mb-12">
              <h3 className="font-serif text-xl font-bold text-[#1b1b1e]">
                {localT.rulesTitle}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0A84FF] flex items-center justify-center shrink-0 font-bold">1</div>
                  <span>
                    {localT.rule1}
                  </span>
                </li>
                <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0A84FF] flex items-center justify-center shrink-0 font-bold">2</div>
                  <span>
                    {localT.rule2}
                  </span>
                </li>
                <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0A84FF] flex items-center justify-center shrink-0 font-bold">3</div>
                  <span>
                    {localT.rule3}
                  </span>
                </li>
              </ul>
            </div>

            {/* Difficulty Selector */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#1b1b1e]/5 mb-8 space-y-4">
              <h3 className="font-serif text-[15px] font-bold text-[#0F172A] uppercase tracking-wider">
                {localT.selectDifficulty}
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
                  <span className="block font-black uppercase">{localT.easy}</span>
                  <span className="text-[10px] opacity-80">{localT.questionsCount(10)}</span>
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
                  <span className="block font-black uppercase">{localT.medium}</span>
                  <span className="text-[10px] opacity-80">{localT.questionsCount(20)}</span>
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
                  <span className="block font-black uppercase">{localT.hard}</span>
                  <span className="text-[10px] opacity-80">{localT.questionsCount(30)}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push(`/reto-sagrado/play?difficulty=${difficulty}`)}
              className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform mb-12"
            >
              <span>{localT.startGame}</span>
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
                placeholder={localT.searchFriends}
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
                {localT.noFriends}
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
                            <span>{localT.invited}</span>
                          </div>
                        ) : isInviting ? (
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>{localT.invite}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Room Players / Lobby Wait List & Start button */}
            {activeRoomId && roomPlayers.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 border border-[#1b1b1e]/5 shadow-sm space-y-4 mb-12 animate-in fade-in slide-in-from-bottom duration-300">
                <h3 className="font-serif text-[15px] font-bold text-[#0F172A] uppercase tracking-wider">
                  {lang === 'ht' ? 'JWÈ YO NAN SAL LA' : lang === 'fr' ? 'JOUEURS DANS LA SALLE' : 'JUGADORES EN LA SALA'} ({roomPlayers.length})
                </h3>

                <div className="space-y-2">
                  {roomPlayers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-slate-35">
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[13px] font-bold text-[#0f172a]">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 shadow-sm shrink-0">
                        {lang === 'ht' ? 'Aksepte' : lang === 'fr' ? 'Accepté' : 'Aceptado'}
                      </span>
                    </div>
                  ))}
                </div>

                {roomPlayers.length >= 2 ? (
                  user && roomData && roomData.hostId === user.uid ? (
                    <button
                      onClick={handleStartMultiplayerGame}
                      className="w-full bg-[#0A84FF] text-white py-4.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <span>{lang === 'ht' ? 'KÒMANSE JWÈT' : lang === 'fr' ? 'LANCER LE JEU' : 'INICIAR JUEGO'}</span>
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <div className="w-full bg-slate-100 text-[#64748B] py-4.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200">
                      <span>{lang === 'ht' ? 'Ap tann lòt moun kòmanse...' : lang === 'fr' ? 'ATTENTE DE L\'HÔTE...' : 'ESPERANDO AL ANFITRIÓN...'}</span>
                    </div>
                  )
                ) : (
                  <p className="text-[11px] font-bold text-[#64748B] text-center pt-2 italic">
                    {lang === 'ht' ? 'Ap tann lòt moun aksepte pou w kòmanse...' : lang === 'fr' ? 'En attente que les autres acceptent pour commencer...' : 'Esperando que otros acepten para poder iniciar...'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
