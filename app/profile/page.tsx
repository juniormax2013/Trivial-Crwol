'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Menu, 
  Settings, 
  Medal, 
  Diamond, 
  BookOpen, 
  Shield, 
  Swords, 
  Quote, 
  Shapes, 
  Globe, 
  UserCircle,
  LogOut,
  Loader2,
  Home,
  Crown,
  Users,
  Lock,
  Link2,
  Copy,
  Share2,
  Gift,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/auth/AuthProvider';
import UserAvatar from '@/components/UserAvatar';
import { useT } from '@/lib/i18n/context';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';
import { getActiveSeason, getUserProgress } from '@/lib/battle-pass/repository';
import { BattlePassSeasonModel, UserBattlePassProgressModel } from '@/lib/battle-pass/models';
import { getCategories } from '@/lib/category/repository';
import { CategoryModel } from '@/lib/category/models';
import { getOrCreateReferralCode, getLevelFromXp } from '@/lib/user/repository';
import { REFERRAL_REWARDS } from '@/lib/user/referralModels';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { user, loading, signOut } = useAuthContext();
  const router = useRouter();
  const t = useT();

  const [season, setSeason] = useState<BattlePassSeasonModel | null>(null);
  const [progress, setProgress] = useState<UserBattlePassProgressModel | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(user?.referralCode ?? null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleGetReferralCode = async () => {
    if (!user) return;
    setIsGeneratingCode(true);
    try {
      const code = await getOrCreateReferralCode(user.uid);
      setReferralCode(code);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const referralLink = typeof window !== 'undefined' && referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : null;

  const langLabels = {
    es: { title: 'Programa de Referidos', btn: 'Crear link de referido', copy: 'Copiar link', share: 'Compartir', registered: 'Registrados', qualified: 'Calificados', progress: 'Progreso hacia recompensas', rewardTitle: 'Recompensas por nivel', linkCopied: '¡Link copiado!', firstGame: 'El referido califica al completar su primera partida.' },
    en: { title: 'Referral Program', btn: 'Create referral link', copy: 'Copy link', share: 'Share', registered: 'Registered', qualified: 'Qualified', progress: 'Progress toward rewards', rewardTitle: 'Level Rewards', linkCopied: 'Link copied!', firstGame: 'Referral qualifies upon completing their first game.' },
    fr: { title: 'Programme de Parrainage', btn: 'Créer un lien de parrainage', copy: 'Copier le lien', share: 'Partager', registered: 'Inscrits', qualified: 'Qualifiés', progress: 'Progression vers les récompenses', rewardTitle: 'Récompenses par niveau', linkCopied: 'Lien copié!', firstGame: 'Le filleul est qualifié après sa première partie.' },
    ht: { title: 'Pwogram Referans', btn: 'Kreye lyen referans', copy: 'Kopye lyen', share: 'Pataje', registered: 'Anregistre', qualified: 'Kalifyé', progress: 'Pwogrè vè rekonpans', rewardTitle: 'Rekonpans pa nivo', linkCopied: 'Lyen kopye!', firstGame: 'Moun referan an kalifyé apre premye pati li.' },
  };
  const lang = (user?.settings?.language ?? 'es') as keyof typeof langLabels;
  const rl = langLabels[lang] ?? langLabels.es;

  const clanTranslations = {
    es: {
      myClan: "Mi Clan",
      browseClans: "Explorar Clanes",
      createClanActive: "Crear mi Clan",
      createClanLocked: "Crear Clan (Nivel 7 requerido)",
    },
    en: {
      myClan: "My Clan",
      browseClans: "Explore Clans",
      createClanActive: "Create my Clan",
      createClanLocked: "Create Clan (Level 7 required)",
    },
    fr: {
      myClan: "Mon Clan",
      browseClans: "Explorer les Clans",
      createClanActive: "Créer mon Clan",
      createClanLocked: "Créer Clan (Niveau 7 requis)",
    },
    ht: {
      myClan: "Klan Mwen",
      browseClans: "Eksplore Klan yo",
      createClanActive: "Kreye Klan Mwen",
      createClanLocked: "Kreye Klan (Nivo 7 obligatwa)",
    }
  };
  const ct = clanTranslations[lang] ?? clanTranslations.es;

  const qualifiedCount = user?.referralStats?.qualifiedCount ?? 0;
  const registeredCount = user?.referralStats?.registeredCount ?? 0;
  const claimedLevels = user?.referralStats?.claimedLevels ?? [];
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // Fetch season & progress independently — permission errors won't block the rest
      try {
        const activeSeason = await getActiveSeason();
        if (activeSeason) {
          setSeason(activeSeason);
          try {
            const userProgress = await getUserProgress(user.uid, activeSeason.id);
            setProgress(userProgress);
          } catch (progressErr) {
            console.warn('Could not load battle pass progress:', progressErr);
          }
        }
      } catch (seasonErr) {
        console.warn('Could not load battle pass season (check Firestore rules for battle_pass_seasons):', seasonErr);
      }

      // Fetch categories independently
      try {
        const cats = await getCategories(true);
        if (user.favoriteCategoryId) {
          const cat = cats.find(c => c.id === user.favoriteCategoryId);
          if (cat) setCategoryName(cat.name);
        }
      } catch (catErr) {
        console.warn('Could not load categories:', catErr);
      }

      setIsDataLoading(false);
    }

    if (!loading && user) {
      fetchData();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-8 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <div className="flex items-center gap-4">
          <BackButton href="/" />
        </div>
        <h1 className="font-serif font-bold text-lg text-[#310065]">{t.profile.title}</h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            data-testid="admin-lock"
            className="p-2 rounded-full hover:bg-[#310065]/5 transition-colors group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: [-10, 10, -10, 10, 0] }}
              whileTap={{ scale: 0.9 }}
              transition={{ 
                rotate: { duration: 0.5 },
                scale: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <Lock className="text-[#310065] w-5 h-5 cursor-pointer" strokeWidth={2.5} />
            </motion.div>
          </Link>
          <Link href="/settings">
            <Settings className="text-[#310065] w-6 h-6 cursor-pointer" />
          </Link>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="relative">
            <UserAvatar
              photoURL={user.photoURL}
              activeFrame={user.activeFrame}
              username={user.fullName || user.username}
              size={128}
            />
            <div className="absolute -bottom-2 -right-2 bg-[#735c00] text-white p-2.5 rounded-full shadow-lg flex items-center justify-center z-20">
              <Medal className="w-[18px] h-[18px]" fill="currentColor" />
            </div>
          </div>
          
          <div>
            <h2 className="font-serif text-3xl font-black text-[#310065] tracking-tight">
              {user.firstName ? `${user.firstName} ${user.lastName}` : (user.fullName || user.username)}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <span className="bg-[#4a148c]/10 text-[#310065] font-bold px-3 py-0.5 rounded-full text-[11px] uppercase tracking-wider">{t.profile.level} {getLevelFromXp(user.xp)}</span>
              <span className="text-[#4a4452] text-[14px] font-medium">{(user.xp || 0) >= 1000 ? `${((user.xp || 0) / 1000).toFixed(1)}k` : (user.xp || 0)} XP</span>
            </div>
          </div>
          
          <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-[1.25rem] px-6 py-3 inline-flex items-center gap-3">
            <Diamond className="text-[#cba72f] w-[20px] h-[20px]" fill="currentColor" />
            <span className="font-serif font-bold text-[22px] text-[#1b1b1e]">{(user.crowns || 0).toLocaleString()}</span>
            <span className="text-[#4a4452] text-[15px] font-medium">{t.profile.crowns}</span>
          </div>
        </section>

        {/* Quick Stats Row (Bento Style) */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-[#f5f3f7] p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
            <span className="text-[#310065] font-serif text-[26px] font-black leading-none">{Math.round(user.accuracyRate || 0)}%</span>
            <span className="text-[10px] uppercase font-bold text-[#4a4452] tracking-widest mt-2">{t.profile.accuracy}</span>
          </div>
          <div className="bg-[#4a148c] text-[#b889ff] p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-[0_8px_20px_rgba(74,20,140,0.15)]">
            <span className="font-serif text-[26px] font-black text-white leading-none">{user.streakDays || 0}</span>
            <span className="text-[10px] uppercase font-bold opacity-90 tracking-widest mt-2 text-[#d7baff]">{t.profile.streak}</span>
          </div>
          <div className="bg-[#f5f3f7] p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
            <span className="text-[#310065] font-serif text-[26px] font-black leading-none">{user.totalWins}</span>
            <span className="text-[10px] uppercase font-bold text-[#4a4452] tracking-widest mt-2">{t.profile.wins}</span>
          </div>
        </section>

        {/* Achievements Section (Dynamic logic) */}
        <section className="space-y-4">
          <h3 className="font-serif text-[22px] font-bold text-[#310065] px-2">{t.profile.achievements}</h3>
          <div className="grid grid-cols-3 gap-3">
            
            <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-[#735c00]/10 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="text-[#735c00] w-6 h-6" fill="currentColor" />
              </div>
              <span className="text-[11px] font-bold leading-snug mb-3 uppercase tracking-tighter">{t.profile.proverbsLore}</span>
              <div className="w-full h-1.5 bg-[#e3e2e6] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#cba72f] rounded-full shadow-sm transition-all duration-1000" 
                  style={{ width: `${Math.min(user.accuracyRate, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-[#310065]/10 rounded-full flex items-center justify-center mb-3">
                <Shield className="text-[#310065] w-6 h-6" fill="currentColor" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold leading-snug mb-3 uppercase tracking-tighter">{t.profile.psalmsWarrior}</span>
              <div className="w-full h-1.5 bg-[#e3e2e6] rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-[#310065] rounded-full shadow-[0_0_8px_rgba(49,0,101,0.4)] transition-all duration-1000" 
                  style={{ width: `${Math.min((user.totalWins / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#1b1b1e]/5 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-[#705573]/10 rounded-full flex items-center justify-center mb-3">
                <Swords className="text-[#705573] w-6 h-6" fill="currentColor" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold leading-snug mb-3 uppercase tracking-tighter">{t.profile.duelMaster}</span>
              <div className="w-full h-1.5 bg-[#e3e2e6] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#705573] rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min((user.streakDays / 7) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

          </div>
        </section>

        {/* CAMINO DEL DISCÍPULO SUMMARY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-serif text-[22px] font-bold text-[#310065]">{t.profile.disciplePath}</h3>
            <span className="bg-[#e9c349] text-[#735c00] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{t.profile.activeSeason}</span>
          </div>
          <Link href="/pass" className="block bg-[#1b1b1e] rounded-[2rem] p-6 text-white overflow-hidden relative group active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a148c] rounded-full -mr-16 -mt-16 blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-[#cba72f] to-[#ffe088] rounded-2xl flex items-center justify-center shadow-lg">
                 <div className="w-[88%] h-[88%] bg-[#310065] rounded-xl flex items-center justify-center">
                   <Crown className="w-7 h-7 text-[#ffe088]" fill="currentColor" />
                 </div>
              </div>
              <div>
                <p className="text-[#ffe088] font-black text-[10px] uppercase tracking-widest mb-1 italic">
                  {progress?.premiumOwned ? t.profile.premiumRoute : t.profile.viewProgress}
                </p>
                <h4 className="font-serif text-xl font-bold leading-tight">
                  {season ? `${season.title} — ${t.profile.level} ${progress?.currentTier || 1}` : t.profile.solomonWisdom}
                </h4>
                <p className="text-white/60 text-xs mt-1.5 font-medium">
                  {progress ? `${progress.seasonXp} XP ${t.profile.activeSeason}` : t.profile.viewProgress}
                </p>
              </div>
            </div>
            <div className="mt-6 h-px bg-white/10 w-full mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-[#310065] border-2 border-[#1b1b1e] flex items-center justify-center">
                   <Medal className="w-3.5 h-3.5 text-[#ffe088]" fill="currentColor" />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#1b1b1e] flex items-center justify-center">
                   <Crown className="w-3.5 h-3.5 text-white" fill="currentColor" />
                 </div>
                <div className="w-8 h-8 rounded-full bg-[#1b1b1e] border-2 border-dashed border-white/20 flex items-center justify-center text-[10px] font-bold text-white/30 italic">
                  +20
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#ffe088] group-hover:text-white transition-colors">{t.profile.openPass}</span>
            </div>
          </Link>
        </section>

        {/* Personal Details Card */}
        <section className="bg-[#f5f3f7] rounded-[2rem] p-6 sm:p-7 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-[#310065]/5 p-3 rounded-2xl flex-shrink-0 mt-1">
              <Quote className="text-[#310065] w-[22px] h-[22px] fill-current" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-[#4a4452] tracking-[0.2em] mb-1.5">{t.profile.stats}</p>
              <p className="font-serif font-bold text-[#1b1b1e] text-[17px] italic leading-relaxed">&quot;{user.favoriteVerse}&quot;</p>
              <p className="text-[#310065] font-bold text-xs mt-3">— {t.profile.deepInspiration}</p>
            </div>
          </div>
          
          <div className="h-px bg-[#cdc3d4]/30 w-full"></div>
          
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <Shapes className="text-[#310065] w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-[#4a4452] tracking-wider mb-0.5">{t.profile.category}</p>
                <p className="text-[14px] font-bold text-[#1b1b1e] capitalize">{categoryName || user.favoriteCategoryId || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <Globe className="text-[#310065] w-5 h-5 bg-transparent" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-[#4a4452] tracking-wider mb-0.5">{t.profile.language}</p>
                <p className="text-[14px] font-bold text-[#1b1b1e] uppercase">{user.settings.language}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Referral Card */}
        <section className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#310065]/5 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="bg-[#310065]/10 p-3 rounded-2xl">
              <Gift className="text-[#310065] w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#4a4452] tracking-[0.2em]">Bible Crown</p>
              <h2 className="text-[17px] font-bold text-[#1b1b1e]">{rl.title}</h2>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f5f3f7] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#310065]">{registeredCount}</p>
              <p className="text-[11px] font-bold text-[#4a4452] mt-0.5">{rl.registered}</p>
            </div>
            <div className="bg-[#f5f3f7] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">{qualifiedCount}</p>
              <p className="text-[11px] font-bold text-[#4a4452] mt-0.5">{rl.qualified}</p>
            </div>
          </div>

          {/* Progress bar toward next level */}
          {(() => {
            const nextReward = REFERRAL_REWARDS.find(r => !claimedLevels.includes(r.level));
            if (!nextReward) return null;
            const pct = Math.min(100, Math.round((qualifiedCount / nextReward.requiredQualified) * 100));
            return (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[#4a4452]">
                  <span>{rl.progress} — Niv. {nextReward.level}</span>
                  <span className="text-[#310065]">{qualifiedCount}/{nextReward.requiredQualified}</span>
                </div>
                <div className="h-2 bg-[#f5f3f7] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#310065] to-[#7c43bd] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Referral Link / Generate Button */}
          {referralCode ? (
            <div className="bg-[#f5f3f7] rounded-2xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-[#4a4452] uppercase tracking-wide">Tu código</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[13px] font-black text-[#310065] bg-white px-3 py-2 rounded-xl border border-[#310065]/10 truncate">{referralCode}</code>
                <button
                  id="copy-referral-code"
                  onClick={async () => {
                    if (referralLink) {
                      await navigator.clipboard.writeText(referralLink);
                      toast.success(rl.linkCopied);
                    }
                  }}
                  className="bg-[#310065] text-white p-2.5 rounded-xl hover:bg-[#4a148c] transition-colors flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    id="share-referral-link"
                    onClick={() => {
                      if (referralLink) {
                        navigator.share({ title: 'Bible Crown', text: 'Únete usando mi link de referido', url: referralLink });
                      }
                    }}
                    className="bg-[#7c43bd] text-white p-2.5 rounded-xl hover:bg-[#310065] transition-colors flex-shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#4a4452] font-medium">{rl.firstGame}</p>
            </div>
          ) : (
            <button
              id="generate-referral-link"
              onClick={handleGetReferralCode}
              disabled={isGeneratingCode}
              className="w-full py-4 bg-[#310065] text-white font-black text-[14px] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#4a148c] transition-colors disabled:opacity-50 shadow-[0_4px_16px_rgba(49,0,101,0.25)]"
            >
              {isGeneratingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {rl.btn}
            </button>
          )}

          {/* Rewards List */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#4a4452] uppercase tracking-widest">{rl.rewardTitle}</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {REFERRAL_REWARDS.map(r => {
                const claimed = claimedLevels.includes(r.level);
                const unlocked = qualifiedCount >= r.requiredQualified;
                return (
                  <div key={r.level} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${claimed ? 'bg-emerald-50 border border-emerald-200' : unlocked ? 'bg-[#f5f3f7] border border-[#310065]/10' : 'bg-[#f5f3f7]/50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black flex-shrink-0 ${
                      claimed ? 'bg-emerald-500 text-white' : unlocked ? 'bg-[#310065] text-white' : 'bg-[#cdc3d4] text-white'
                    }`}>
                      {claimed ? <CheckCircle2 className="w-4 h-4" /> : r.level}
                    </div>
                    <p className={`text-[12px] font-semibold flex-1 leading-snug ${claimed ? 'text-emerald-700' : 'text-[#4a4452]'}`}>
                      {r.rewardDescription[lang] ?? r.rewardDescription.es}
                    </p>
                    {!claimed && !unlocked && <Lock className="w-3.5 h-3.5 text-[#cdc3d4] flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Clan / Group Section */}
        <section className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-black/[0.03] space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#0A84FF]/10 p-3 rounded-2xl">
              <Users className="text-[#0A84FF] w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-[0.2em]">PhotoArte Studio</p>
              <h2 className="text-[17px] font-bold text-[#0F172A]">
                {lang === 'es' ? 'Clanes y Grupos' : lang === 'fr' ? 'Clans et Groupes' : lang === 'ht' ? 'Klan ak Gwoup' : 'Clans & Groups'}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {user.clanId ? (
              <Link href={`/clans?id=${user.clanId}`} className="w-full py-4 bg-[#0A84FF] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-[#0A84FF]/90 transition-colors active:scale-[0.99] shadow-sm gap-2">
                <Users className="w-4 h-4" />
                {ct.myClan}
              </Link>
            ) : (
              <>
                <Link href="/clans" className="w-full py-4 bg-white border border-[#0A84FF]/20 text-[#0A84FF] font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-[#0A84FF]/5 transition-colors active:scale-[0.99] shadow-sm gap-2">
                  <Users className="w-4 h-4" />
                  {ct.browseClans}
                </Link>

                {getLevelFromXp(user.xp) >= 7 || user.email === 'juniormax2013@gmail.com' ? (
                  <Link href="/clans/create" className="w-full py-4 bg-[#0A84FF] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-[#0A84FF]/90 transition-colors active:scale-[0.99] shadow-sm gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {ct.createClanActive}
                  </Link>
                ) : (
                  <div className="w-full py-4 bg-gray-100 border border-gray-200 text-gray-400 font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed select-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                    {ct.createClanLocked}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col gap-3 pb-8">
          <Link href="/profile/edit" className="w-full py-4 bg-white border border-[#310065]/10 text-[#310065] font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-[#310065]/5 transition-colors active:scale-[0.99] shadow-sm">
            {t.profile.editProfile}
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full py-4 text-[#ba1a1a] font-black text-[14px] uppercase tracking-widest bg-[#ba1a1a]/5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#ba1a1a]/10 transition-colors active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4" />
            {t.auth.signOut}
          </button>
        </section>
      </main>

      <BottomNav activeTab="profile" showTriggerButton={false} />
    </div>
  );
}
