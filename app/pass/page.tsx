'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, 
  Crown, 
  Check, 
  Lock, 
  Sparkles, 
  Target, 
  Clock,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/context';

// We import models and hooks from the service
import { 
  BattlePassSeasonModel, 
  BattlePassTierModel, 
  BattlePassMissionModel,
  UserBattlePassProgressModel,
  UserBattlePassClaimModel
} from '@/lib/battle-pass/models';
import { 
  getActiveSeason, 
  getSeasonMissions, 
  getSeasonTiers, 
  getUserProgress, 
  getUserClaims
} from '@/lib/battle-pass/repository';
import { claimTierReward } from '@/lib/battle-pass/service';
import PremiumUpsellModal from '@/components/battle-pass/PremiumUpsellModal';

export default function BattlePassPage() {
  const { user } = useAuthContext();
  const t = useT();
  
  const [season, setSeason] = useState<BattlePassSeasonModel | null>(null);
  const [tiers, setTiers] = useState<BattlePassTierModel[]>([]);
  const [missions, setMissions] = useState<BattlePassMissionModel[]>([]);
  const [progress, setProgress] = useState<UserBattlePassProgressModel | null>(null);
  const [claims, setClaims] = useState<UserBattlePassClaimModel[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rewards' | 'missions'>('rewards');
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPassData();
  }, [user]);

  const loadPassData = async () => {
    try {
      const active = await getActiveSeason();
      if (!active) {
        setLoading(false);
        return;
      }
      setSeason(active);

      const [seasonTiers, seasonMissions, userProg, userClaims] = await Promise.all([
        getSeasonTiers(active.id),
        getSeasonMissions(active.id),
        getUserProgress(user!.uid, active.id),
        getUserClaims(user!.uid, active.id)
      ]);

      setTiers(seasonTiers);
      setMissions(seasonMissions);
      setProgress(userProg);
      setClaims(userClaims);
    } catch (error) {
      console.error("Error loading Battle Pass:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (tierNumber: number, track: 'free' | 'premium') => {
    if (!user || !season) return;
    try {
      await claimTierReward(user.uid, season.id, tierNumber, track);
      // Refresh claims
      const updatedClaims = await getUserClaims(user.uid, season.id);
      setClaims(updatedClaims);
      // Optional: Show celebration modal here
      alert("¡Recompensa obtenida con éxito!");
    } catch (error: any) {
      if (error.message === 'Premium Pass required.') {
        setShowUpsell(true);
      } else {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#310065] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!season || !progress) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center">
        <Link href="/" className="mb-6 p-3 rounded-full bg-white shadow-sm border border-[#310065]/10">
          <ChevronLeft className="w-6 h-6 text-[#310065]" />
        </Link>
        <h2 className="text-xl font-bold text-[#310065] mb-2">{t.pass.comingSoon}</h2>
        <p className="text-[#7c7483]">{t.pass.seasonEnded}</p>
      </div>
    );
  }

  // Calculate generic progress
  const nextTier = tiers.find(t => t.tierNumber === progress.currentTier + 1);
  const currentTierData = tiers.find(t => t.tierNumber === progress.currentTier);
  const xpBase = currentTierData ? currentTierData.requiredSeasonXp : 0;
  const xpTarget = nextTier ? nextTier.requiredSeasonXp : xpBase;
  const xpProgress = progress.seasonXp - xpBase;
  const xpNeeded = xpTarget - xpBase;
  const progressPercent = xpNeeded > 0 ? Math.min((xpProgress / xpNeeded) * 100, 100) : 100;

  return (
    <div className="min-h-screen bg-[#faf9fc] text-[#1b1b1e] font-sans pb-32">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#faf9fc]/80 backdrop-blur-xl border-b border-[#310065]/5">
        <div className="flex justify-between items-center px-4 py-3 max-w-md mx-auto">
          <Link href="/" className="p-2 rounded-full hover:bg-[#1b1b1e]/5 transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#310065]" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-[14px] font-bold text-[#310065] uppercase tracking-wider">{t.pass.title}</h1>
          </div>
          <div className="p-2">
            {!progress.premiumOwned ? (
              <button 
                onClick={() => setShowUpsell(true)}
                className="bg-gradient-to-r from-[#e9c349] to-[#ffe088] px-3 py-1 rounded-full text-[10px] font-black text-[#735c00] uppercase shadow-sm"
              >
                {t.pass.premiumPass}
              </button>
            ) : (
              <div className="bg-[#310065] px-3 py-1 rounded-full text-[10px] font-black text-[#ffe088] uppercase shadow-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {t.pass.premium}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* HERO SECTION */}
        <div className="p-4 relative">
          <div className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#310065] to-[#4a148c] shadow-[0_16px_32px_-12px_rgba(49,0,101,0.4)] p-6 text-white border border-white/10">
            {/* Sparkle background pattern */}
            <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <path d="M100 0L105 95L200 100L105 105L100 200L95 105L0 100L95 95L100 0Z" fill="#ffe088"/>
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#ffe088]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#ffe088]">30 {t.pass.daysLeft}</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-serif font-black mb-1 leading-tight">{season.title}</h2>
              <p className="text-sm text-white/80 font-medium mb-6">{season.subtitle}</p>

              {/* Progress UI */}
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-0.5">{t.pass.currentTier}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black font-serif text-[#ffe088] leading-none">{progress.currentTier}</span>
                      <span className="text-sm font-bold text-white/50">/ {season.totalTiers}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#ffe088] mb-0.5">{xpProgress} / {xpNeeded} XP</p>
                    <p className="text-[10px] font-medium text-white/50">{t.pass.forTier} {progress.currentTier + 1}</p>
                  </div>
                </div>
                
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#cba72f] to-[#ffe088] rounded-full shadow-[0_0_12px_rgba(255,224,136,0.6)] transition-all duration-1000 relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biblical/Spiritual Flavor Block */}
        <div className="px-4 pb-4">
          <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#1b1b1e]/5">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-[#f5f3f7] rounded-xl text-[#310065]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#7c7483] mb-0.5">{t.pass.seasonInspiration}</p>
                <h3 className="text-[14px] font-bold text-[#1b1b1e]">{season.bibleReference}</h3>
              </div>
            </div>
            <p className="text-[13px] text-[#4a4452] font-medium leading-relaxed mt-2 p-3 bg-[#faf9fc] rounded-xl italic border-l-4 border-[#310065]/20">
              "{season.spiritualMeaning}"
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="px-4 mb-4 sticky top-[60px] z-30 pt-2 pb-2 bg-[#faf9fc]">
          <div className="flex p-1 bg-[#e9e7eb] rounded-2xl shadow-inner">
            <button 
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
                activeTab === 'rewards' 
                  ? 'bg-white text-[#310065] shadow-sm' 
                  : 'text-[#7c7483] hover:text-[#310065]'
              }`}
            >
              <Award className="w-4 h-4" />
              {t.pass.rewards}
            </button>
            <button 
              onClick={() => setActiveTab('missions')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
                activeTab === 'missions' 
                  ? 'bg-white text-[#310065] shadow-sm' 
                  : 'text-[#7c7483] hover:text-[#310065]'
              }`}
            >
              <Target className="w-4 h-4" />
              {t.pass.missions}
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="px-4">
          {activeTab === 'rewards' && (
            <div className="space-y-4 relative">
              {/* Vertical connector line */}
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-[#e9e7eb] via-[#e9e7eb] to-transparent z-0 rounded-full"></div>
              
              {tiers.map(tier => {
                const isUnlocked = progress.currentTier >= tier.tierNumber;
                
                const freeClaimed = claims.some(c => c.tierNumber === tier.tierNumber && c.track === 'free');
                const premiumClaimed = claims.some(c => c.tierNumber === tier.tierNumber && c.track === 'premium');

                return (
                  <div key={tier.tierNumber} className="relative z-10 flex gap-4">
                    {/* Tier Number Bubble */}
                    <div className={`w-16 h-16 shrink-0 rounded-full flex flex-col items-center justify-center z-10 transition-all font-serif font-black shadow-sm ring-4 ring-[#faf9fc] ${
                      isUnlocked 
                        ? 'bg-[#310065] text-white shadow-[#310065]/20' 
                        : 'bg-white text-[#cdc3d4] border-2 border-[#e9e7eb]'
                    }`}>
                      <span className="text-xl leading-none">{tier.tierNumber}</span>
                    </div>

                    {/* Rewards Row */}
                    <div className="flex-1 space-y-2 pt-1">
                      {/* Free Reward */}
                      {tier.freeReward ? (
                        <RewardItem 
                          tier={tier.tierNumber}
                          reward={tier.freeReward} 
                          isTrack="free"
                          isUnlocked={isUnlocked}
                          isClaimed={freeClaimed}
                          onClaim={() => handleClaim(tier.tierNumber, 'free')}
                        />
                      ) : (
                        <div className="h-10 bg-black/5 rounded-2xl flex items-center px-4">
                          <span className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest">{t.pass.noReward}</span>
                        </div>
                      )}

                      {/* Premium Reward */}
                      {tier.premiumReward && (
                        <RewardItem 
                          tier={tier.tierNumber}
                          reward={tier.premiumReward}
                          isTrack="premium"
                          isUnlocked={isUnlocked}
                          isClaimed={premiumClaimed}
                          premiumOwned={progress.premiumOwned}
                          onClaim={() => handleClaim(tier.tierNumber, 'premium')}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="font-bold text-[#1b1b1e] text-[15px]">{t.pass.activeMissions}</h3>
                <span className="text-[#310065] bg-[#310065]/10 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-widest">{missions.length} {t.pass.available}</span>
              </div>
              
              {missions.map(mission => (
                <div key={mission.id} className="bg-white p-5 rounded-[1.25rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#1b1b1e]/5 relative overflow-hidden group">
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          mission.missionType === 'daily' ? 'bg-[#e9e7eb] text-[#4a4452]' :
                          mission.missionType === 'weekly' ? 'bg-[#e0f2fe] text-[#0369a1]' :
                          'bg-[#fce7f3] text-[#be185d]'
                        }`}>
                          {mission.missionType === 'daily' ? t.pass.daily : mission.missionType === 'weekly' ? t.pass.weekly : t.pass.season}
                        </span>
                        <span className="text-[11px] font-bold text-[#cba72f] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> +{mission.rewardSeasonXp} XP
                        </span>
                      </div>
                      <h4 className="font-bold text-[#1b1b1e] text-[15px]">{mission.title}</h4>
                      <p className="text-[12px] text-[#7c7483] font-medium leading-snug mt-1">{mission.description}</p>
                    </div>
                  </div>
                  
                  {/* Progress bar mock */}
                  <div className="mt-4 bg-[#f5f3f7] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#310065] rounded-full w-1/3"></div>
                  </div>
                  <div className="text-right mt-1.5">
                    <span className="text-[11px] font-bold text-[#7c7483]">0 / {mission.targetValue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Premium Upsell Modal */}
      {showUpsell && (
        <PremiumUpsellModal onClose={() => setShowUpsell(false)} />
      )}
    </div>
  );
}

// Subcomponent for Reward item row
function RewardItem({ 
  tier,
  reward, 
  isTrack, 
  isUnlocked, 
  isClaimed, 
  premiumOwned,
  onClaim 
}: { 
  tier: number,
  reward: any, 
  isTrack: 'free'|'premium', 
  isUnlocked: boolean, 
  isClaimed: boolean,
  premiumOwned?: boolean,
  onClaim: () => void 
}) {
  const t = useT();
  const isPremium = isTrack === 'premium';
  const lockedOpacity = !isUnlocked ? 'opacity-60 saturate-50' : '';
  const claimedStyle = isClaimed ? 'bg-[#f5f3f7] opacity-80' : isPremium ? 'bg-gradient-to-r from-[#310065] to-[#4a148c] text-white shadow-md' : 'bg-white shadow-sm border border-[#1b1b1e]/5';
  
  return (
    <div className={`p-3 rounded-2xl flex items-center justify-between transition-all ${lockedOpacity} ${claimedStyle}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isPremium ? 'bg-gradient-to-br from-[#cba72f] to-[#ffe088] shadow-inner' : 'bg-[#e9e7eb]'
        }`}>
          {/* Icon mock mapping */}
          {reward.type === 'crowns' && <Crown className={`w-5 h-5 ${isPremium ? 'text-[#735c00]' : 'text-[#310065]'}`} />}
          {reward.type === 'coins' && <div className={`w-5 h-5 rounded-full ${isPremium ? 'bg-[#735c00]' : 'bg-[#cba72f]'}`}></div>}
          {reward.type === 'profile_frame' && <div className="w-5 h-5 border-2 border-[#735c00] rounded-sm"></div>}
        </div>
        <div>
          <p className={`text-[13px] font-bold ${isPremium && !isClaimed ? 'text-white' : 'text-[#1b1b1e]'}`}>{reward.label}</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isPremium && !isClaimed ? 'text-[#ffe088]' : 'text-[#7c7483]'}`}>
            {isPremium ? t.pass.premium : t.pass.free}
          </p>
        </div>
      </div>
      
      <div className="shrink-0 ml-4">
        {isClaimed ? (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1b1b1e]/5">
            <Check className="w-4 h-4 text-[#310065]" />
          </div>
        ) : !isUnlocked ? (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <Lock className="w-4 h-4 text-[#7c7483]" />
          </div>
        ) : (isPremium && !premiumOwned) ? (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10" onClick={(e) => { e.stopPropagation(); onClaim(); }}>
             <Lock className="w-4 h-4 text-[#ffe088]" />
          </div>
        ) : (
          <button 
            onClick={onClaim}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-transform active:scale-95 ${
              isPremium ? 'bg-[#ffe088] text-[#735c00] shadow-[0_0_12px_rgba(255,224,136,0.3)] hover:bg-[#ffedb3]' : 'bg-[#310065] text-white hover:bg-[#4a148c]'
            }`}
          >
            {t.pass.claim}
          </button>
        )}
      </div>
    </div>
  );
}
