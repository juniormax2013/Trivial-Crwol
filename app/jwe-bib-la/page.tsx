'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Sparkles, 
  Crown, 
  ArrowRight, 
  Heart,
  Zap,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { subscribeGameEngineConfig, type GameEngineConfig } from '@/lib/admin/settings-repository';
import GameModeHeader from '@/components/GameModeHeader';

const LOBBY_TRANSLATIONS: Record<string, any> = {
  es: {
    title: "Jwe Bib La",
    desc: "Pon a prueba tu fe y conocimientos bíblicos en este emocionante desafío de 7 preguntas.",
    rulesTitle: "Reglas del Juego",
    rule1: "Iniciar una partida consume 7 puntos de energía.",
    rule2: "Juegas con 5 corazones. Perderás un corazón por cada respuesta incorrecta.",
    rule3: "Completa las 7 preguntas para ganar coronas, monedas y experiencia.",
    rule4: "¡Cuidado con la trampa del Diablo! Usa poderes para protegerte.",
    playBtn: "JUGAR AHORA",
  },
  en: {
    title: "Jwe Bib La",
    desc: "Test your faith and biblical knowledge in this exciting 7-question challenge.",
    rulesTitle: "Game Rules",
    rule1: "Starting a game costs 7 energy points.",
    rule2: "You play with 5 hearts. You lose a heart for each incorrect answer.",
    rule3: "Complete all 7 questions to earn crowns, coins, and experience.",
    rule4: "Watch out for the Devil's trap! Use power-ups to protect yourself.",
    playBtn: "PLAY NOW",
  },
  fr: {
    title: "Jwe Bib La",
    desc: "Testez votre foi et vos connaissances bibliques dans ce défi passionnant de 7 questions.",
    rulesTitle: "Règles du Jeu",
    rule1: "Commencer une partie consomme 7 points d'énergie.",
    rule2: "Vous jouez avec 5 cœurs. Vous perdez un cœur pour chaque mauvaise réponse.",
    rule3: "Répondez aux 7 questions pour gagner des couronnes, des pièces et de l'expérience.",
    rule4: "Attention au piège du Diable ! Utilisez des pouvoirs pour vous protéger.",
    playBtn: "JOUER MAINTENANT",
  },
  ht: {
    title: "Jwe Bib La",
    desc: "Teste lafwa w ak konesans biblik ou nan gwo defi sa a ki gen 7 kesyon.",
    rulesTitle: "Règ Jwèt la",
    rule1: "Kòmanse yon jwèt mande 7 pwen enèji.",
    rule2: "Ou jwe ak 5 lavi (kè). Ou pèdi yon lavi pou chak move repons.",
    rule3: "Reponn 7 kesyon yo kòrèkteman pou w genyen kouwòn, pyès ak eksperyans.",
    rule4: "Atansyon ak pyèj Dyab la! Sèvi ak pouvwa yo pou pwoteje tèt ou.",
    playBtn: "JWE KOUNYE A",
  }
};

export default function JweBibLaLobby() {
  const { user } = useAuthContext();
  const { language: userLanguage, isLoaded } = useLanguage();
  const router = useRouter();
  const [engineConfig, setEngineConfig] = useState<GameEngineConfig | null>(null);

  const lang = ((userLanguage as string) === 'fr' || (userLanguage as string) === 'es' || (userLanguage as string) === 'en' || (userLanguage as string) === 'ht') ? (userLanguage as 'fr' | 'es' | 'en' | 'ht') : 'ht';
  const localT = LOBBY_TRANSLATIONS[lang];

  useEffect(() => {
    const unsubscribe = subscribeGameEngineConfig((config) => {
      setEngineConfig(config);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (engineConfig && user) {
      if (engineConfig.disabledGameModes?.bibleJourney) {
        const msg = 
          lang === 'es' ? 'Este modo de juego está temporalmente desactivado.' :
          lang === 'fr' ? 'Ce mode de jeu est temporairement désactivé.' :
          lang === 'ht' ? 'Mòd jwèt sa a tanporèman dezaktive.' :
          'This game mode is temporarily disabled.';
        toast.error(msg);
        router.replace('/arena');
      }
    }
  }, [engineConfig, user, router, lang]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#310065]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-12 font-sans relative flex flex-col pt-safe">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.08]">
        <div className="absolute top-0 left-0 w-full h-full bg-[#310065] blur-[150px] rounded-full scale-150"></div>
      </div>

      {/* Header */}
      <GameModeHeader 
        title={localT.title}
        subtitle="Modo Desafío 7 Preguntas"
        icon={<BookOpen className="w-5 h-5 text-[#cba72f] fill-[#ffe088]" strokeWidth={2} />}
      />

      {/* Main Content */}
      <main className="flex-grow pt-8 px-6 max-w-[480px] mx-auto w-full flex flex-col">
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[#310065] to-[#7345b6] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-white/10">
          <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/5 blur-2xl rounded-full pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <BookOpen className="w-6 h-6 text-[#ffe088]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-serif font-black leading-tight drop-shadow-md">
                {localT.title}
              </h1>
              <p className="text-white/80 text-[13px] font-medium leading-relaxed">
                {localT.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Rules Panel */}
        <div className="flex flex-col flex-grow">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#1b1b1e]/5 space-y-6 flex-grow mb-12">
            <h3 className="font-serif text-xl font-bold text-[#1b1b1e]">
              {localT.rulesTitle}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-[#310065] flex items-center justify-center shrink-0 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span>{localT.rule1}</span>
              </li>
              <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-[#310065] flex items-center justify-center shrink-0 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                </div>
                <span>{localT.rule2}</span>
              </li>
              <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-[#310065] flex items-center justify-center shrink-0 font-bold">
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/50" />
                </div>
                <span>{localT.rule3}</span>
              </li>
              <li className="flex items-start gap-3.5 text-[13px] font-medium text-[#64748B]">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-[#310065] flex items-center justify-center shrink-0 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span>{localT.rule4}</span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={() => router.push('/jwe-bib-la/play')}
            className="w-full bg-[#310065] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#310065]/25 hover:scale-105 active:scale-95 transition-transform mb-12"
          >
            <span>{localT.playBtn}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
