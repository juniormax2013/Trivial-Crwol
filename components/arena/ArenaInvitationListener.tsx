'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, CheckCircle2, XCircle, Users } from 'lucide-react';
import { ArenaInvitation } from '@/lib/arena/models';
import { 
  updateArenaInvitationStatus, 
  joinArenaSession 
} from '@/lib/arena/repository';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useT, useLanguage } from '@/lib/i18n/context';

export default function ArenaInvitationListener() {
  const { user } = useAuthContext();
  const router = useRouter();
  const t = useT();
  const { language } = useLanguage();

  const { arenaInvitations } = useNotifications();
  const [invitation, setInvitation] = useState<ArenaInvitation | null>(null);
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Show the first invitation that isn't ignored
    const latest = arenaInvitations.find(inv => !ignoredIds.has(inv.id));
    setInvitation(latest || null);
  }, [arenaInvitations, ignoredIds]);

  const handleAccept = async () => {
    if (!invitation || actionLoading) return;
    setActionLoading('accept');
    try {
      if (invitation.gameMode === 'reto_sagrado') {
        // 1. Update invitation status
        await updateArenaInvitationStatus(invitation.id, 'accepted');
        
        // Register guest player inside the room players list in Firestore
        const guestPlayerRef = doc(db, `reto_sagrado_rooms/${invitation.arenaId}/players`, user!.uid);
        const defaultName = language === 'es' ? 'Noble Peregrino' : language === 'fr' ? 'Noble Pèlerin' : 'Nòb Pèleren';
        await setDoc(guestPlayerRef, {
          id: user!.uid,
          userId: user!.uid,
          name: user!.fullName || user!.username || defaultName,
          avatarUrl: user!.photoURL || null,
          status: 'ready',
          score: 0,
          currentQuestion: 1,
          isFinished: false,
          joinedAt: new Date().toISOString()
        });

        // 2. Clear local state and redirect to lobby wait list
        setInvitation(null);
        const successReto = language === 'es' 
          ? 'Te has unido al Reto Sagrado' 
          : language === 'fr' 
            ? 'Vous avez rejoint le Défi Sacré' 
            : 'Ou rantre nan Defi Sakre a';
        toast.success(successReto);
        // We will pass room parameter to reto-sagrado lobby page so it sets activeRoomId and shows wait list
        router.push(`/reto-sagrado?room=${invitation.arenaId}`);
      } else {
        // 1. Join the arena session
        const defaultName = language === 'es' ? 'Guerrero' : language === 'fr' ? 'Guerrier' : 'Gèrye';
        await joinArenaSession(invitation.arenaId, {
          uid: user!.uid,
          displayName: user!.fullName || user!.username || defaultName,
          photoURL: user!.photoURL || null
        });
        
        // 2. Update invitation status
        await updateArenaInvitationStatus(invitation.id, 'accepted');
        
        // 3. Clear local state and redirect
        setInvitation(null);
        router.push(`/arena/crown-arena/${invitation.arenaId}/lobby`);
        const successBattle = language === 'es' 
          ? 'Te has unido a la batalla' 
          : language === 'fr' 
            ? 'Vous avez rejoint la bataille' 
            : 'Ou rantre nan batay la';
        toast.success(successBattle);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = language === 'es' 
        ? 'No se pudo unir a la sala: ' 
        : language === 'fr' 
          ? 'Impossible de rejoindre la salle : ' 
          : 'Pa kapab rantre nan chanm nan : ';
      toast.error(errorMsg + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!invitation || actionLoading) return;
    setActionLoading('decline');
    try {
      await updateArenaInvitationStatus(invitation.id, 'declined');
      setIgnoredIds(prev => new Set([...prev, invitation.id]));
      setInvitation(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const gameModeTitle = invitation ? (invitation.gameMode === 'reto_sagrado' ? t.play.sacredChallenge : t.crownArena.invitationTitle) : '';
  const gameModeName = invitation ? (invitation.gameMode === 'reto_sagrado' ? t.play.sacredChallenge : 'Crown Arena') : '';
  const invitationSubtitleText = invitation ? t.crownArena.invitationSubtitle.replace('Crown Arena', gameModeName) : '';

  const realTimeDuelLabel = language === 'es' 
    ? 'Duelo en Tiempo Real' 
    : language === 'fr' 
      ? 'Duel en Temps Réel' 
      : 'Diyèl an Tan Reyèl';

  return (
    <AnimatePresence>
      {invitation && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0f0f1e]/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center overflow-hidden border border-white/20"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#eddcff] to-white -z-10" />
            
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl relative mt-2 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#eddcff]">
                <Image 
                  src={invitation.hostAvatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=fallback'} 
                  alt={invitation.hostName} 
                  width={96} 
                  height={96} 
                  className="w-full h-full object-cover" 
                  unoptimized 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#cba72f] border-4 border-white flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white fill-white" />
              </div>
            </div>

            <h2 className="font-serif text-[24px] font-black text-[#310065] mb-2 leading-tight">
              {gameModeTitle}
            </h2>
            
            <p className="text-[15px] text-[#7c7483] font-medium px-4 mb-8">
              <strong className="text-[#310065]">{invitation.hostName}</strong> {invitationSubtitleText}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleAccept}
                disabled={actionLoading !== null}
                className="w-full py-4 rounded-2xl bg-[#310065] text-white font-black text-[16px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,0,101,0.3)] hover:bg-[#4a148c] active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading === 'accept' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t.crownArena.acceptInvitation}
                  </>
                )}
              </button>
              
              <button
                onClick={handleDecline}
                disabled={actionLoading !== null}
                className="w-full py-4 rounded-2xl bg-[#f5f3f7] text-[#7c7483] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#eddcff] hover:text-[#310065] transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> 
                {actionLoading === 'decline' ? '...' : t.crownArena.declineInvitation}
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-[#7c7483] uppercase tracking-widest opacity-40">
              <Users className="w-3 h-3" />
              <span>{realTimeDuelLabel}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
