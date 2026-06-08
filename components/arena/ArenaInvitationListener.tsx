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

export default function ArenaInvitationListener() {
  const { user } = useAuthContext();
  const router = useRouter();

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
        
        // 2. Clear local state and redirect
        setInvitation(null);
        router.push(`/reto-sagrado/play?multiplayer=true&opponent=${invitation.hostId}`);
        toast.success('Te has unido al Reto Sagrado');
      } else {
        // 1. Join the arena session
        await joinArenaSession(invitation.arenaId, {
          uid: user!.uid,
          displayName: user!.fullName || user!.username || 'Guerrero',
          photoURL: user!.photoURL || null
        });
        
        // 2. Update invitation status
        await updateArenaInvitationStatus(invitation.id, 'accepted');
        
        // 3. Clear local state and redirect
        setInvitation(null);
        router.push(`/arena/crown-arena/${invitation.arenaId}/lobby`);
        toast.success('Te has unido a la batalla');
      }
    } catch (e: any) {
      console.error(e);
      toast.error('No se pudo unir a la sala: ' + e.message);
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
              {invitation.gameMode === 'reto_sagrado' ? 'Reto Sagrado' : '¡Batalla Real!'}
            </h2>
            
            <p className="text-[15px] text-[#7c7483] font-medium px-4 mb-8">
              <strong className="text-[#310065]">{invitation.hostName}</strong> te ha invitado a unirte a su sala en <strong className="text-[#310065]">{invitation.gameMode === 'reto_sagrado' ? 'Reto Sagrado' : 'Crown Arena'}</strong>.
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
                    ¡Aceptar Desafío!
                  </>
                )}
              </button>
              
              <button
                onClick={handleDecline}
                disabled={actionLoading !== null}
                className="w-full py-4 rounded-2xl bg-[#f5f3f7] text-[#7c7483] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#eddcff] hover:text-[#310065] transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> 
                {actionLoading === 'decline' ? '...' : 'Rechazar ahora'}
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-[#7c7483] uppercase tracking-widest opacity-40">
              <Users className="w-3 h-3" />
              <span>Duelo en Tiempo Real</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
