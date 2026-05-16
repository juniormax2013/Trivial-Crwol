'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, CheckCircle2, XCircle } from 'lucide-react';
import { DuelModel } from '@/lib/duel/models';
import { acceptDuel, declineDuel } from '@/lib/duel/repository';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export default function IncomingDuelListener() {
  const { user } = useAuthContext();
  const router = useRouter();

  const { duelInvitations } = useNotifications();
  const [incomingDuel, setIncomingDuel] = useState<DuelModel | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null);
 
  useEffect(() => {
    // Find the first pending duel invitation that isn't ignored
    const newIncoming = duelInvitations.find(d => !ignoredIds.has(d.id));
    setIncomingDuel(newIncoming || null);
  }, [duelInvitations, ignoredIds]);

  const handleAccept = async () => {
    if (!incomingDuel || !user || actionLoading) return;
    setActionLoading('accept');
    try {
      await acceptDuel(incomingDuel.id, user.uid);
      
      // Ignore this ID locally so it doesn't pop up again while redirecting
      setIgnoredIds(new Set([...ignoredIds, incomingDuel.id]));
      setIncomingDuel(null);
      
      // Redirigimos a la vista del duelo. El creador juega primero, por lo que este usuario entra a la pantalla de "esperar" o ver el estado.
      router.push('/arena/duels/' + incomingDuel.id);
      toast.success("¡Desafío aceptado!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error al aceptar el desafío.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!incomingDuel || !user || actionLoading) return;
    setActionLoading('decline');
    try {
      await declineDuel(incomingDuel.id, user.uid);
      setIgnoredIds(new Set([...ignoredIds, incomingDuel.id]));
      setIncomingDuel(null);
      toast.info("Has rechazado el desafío.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error al rechazar el desafío.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {incomingDuel && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center mt-12"
          >
            <div className="absolute -top-10 w-20 h-20 rounded-full bg-[#eddcff] flex items-center justify-center flex-shrink-0 border-[4px] border-white shadow-md">
              <Swords className="w-8 h-8 text-[#4a148c]" />
            </div>

            <h2 className="font-serif text-[22px] font-black text-[#310065] mb-4 mt-6 leading-tight">
              ¡Te han desafiado!
            </h2>
            
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#4a148c]/10 mb-3 mx-auto">
              <Image 
                src={incomingDuel.participants[incomingDuel.createdBy]?.avatarUrl || 'https://api.dicebear.com/9.x/notionists/svg?seed=fallback'} 
                alt={incomingDuel.participants[incomingDuel.createdBy]?.name || 'Oponente'} 
                width={80} 
                height={80} 
                className="w-full h-full object-cover" 
                unoptimized 
              />
            </div>
            
            <p className="text-[17px] text-[#1b1b1e] font-bold mb-1">
              {incomingDuel.participants[incomingDuel.createdBy]?.name || 'Guerrero'}
            </p>
            <p className="text-[14px] text-[#7c7483] mb-6 px-2">
              Te ha retado a un duelo de categoría <br/><strong className="text-[#310065]">{incomingDuel.selectedCategories.join(', ') || 'Mixta'}</strong>.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleDecline}
                disabled={actionLoading !== null}
                className="flex-1 py-3.5 rounded-2xl border-2 border-[#1b1b1e]/10 text-[#7c7483] font-bold text-[14px] flex items-center justify-center gap-1.5 hover:bg-[#f5f3f7] transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> 
                {actionLoading === 'decline' ? '...' : 'Rechazar'}
              </button>
              <button
                onClick={handleAccept}
                disabled={actionLoading !== null}
                className="flex-[1.5] py-3.5 rounded-2xl bg-[#310065] text-white font-bold text-[14px] flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(49,0,101,0.25)] hover:bg-[#4a148c] active:scale-95 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading === 'accept' ? 'Conectando...' : '¡Aceptar!'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
