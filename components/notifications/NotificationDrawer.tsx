'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Swords, 
  Crown, 
  ChevronRight, 
  Clock, 
  User,
  Filter,
  Inbox,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { ArenaInvitation } from '@/lib/arena/models';
import { DuelModel } from '@/lib/duel/models';
import { updateArenaInvitationStatus, joinArenaSession } from '@/lib/arena/repository';
import { acceptDuel, declineDuel } from '@/lib/duel/repository';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

type FilterType = 'all' | 'arena' | 'duel';

export default function NotificationDrawer() {
  const { arenaInvitations, duelInvitations, totalCount, isDrawerOpen, setDrawerOpen } = useNotifications();
  const isOpen = isDrawerOpen;
  const onClose = () => setDrawerOpen(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAcceptArena = async (invitation: ArenaInvitation) => {
    if (!user || actionLoading) return;
    setActionLoading(invitation.id);
    try {
      await joinArenaSession(invitation.arenaId, {
        uid: user.uid,
        displayName: user.fullName || user.username || 'Guerrero',
        photoURL: user.photoURL || null
      });
      await updateArenaInvitationStatus(invitation.id, 'accepted');
      router.push(`/arena/crown-arena/${invitation.arenaId}/lobby`);
      toast.success('¡Te has unido a la batalla!');
      onClose();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineArena = async (invitation: ArenaInvitation) => {
    if (actionLoading) return;
    setActionLoading(invitation.id);
    try {
      await updateArenaInvitationStatus(invitation.id, 'declined');
    } catch (e: any) {
      toast.error('Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptDuel = async (duel: DuelModel) => {
    if (!user || actionLoading) return;
    setActionLoading(duel.id);
    try {
      await acceptDuel(duel.id, user.uid);
      router.push(`/arena/duels/${duel.id}`);
      toast.success('¡Duelo aceptado!');
      onClose();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineDuel = async (duel: DuelModel) => {
    if (!user || actionLoading) return;
    setActionLoading(duel.id);
    try {
      await declineDuel(duel.id, user.uid);
    } catch (e: any) {
      toast.error('Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredArena = filter === 'duel' ? [] : arenaInvitations;
  const filteredDuel = filter === 'arena' ? [] : duelInvitations;
  const hasNotifications = filteredArena.length > 0 || filteredDuel.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#310065] to-[#4a148c] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Notificaciones</h2>
                  <p className="text-xs opacity-70 font-bold uppercase tracking-wider">
                    {totalCount} Pendientes
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100">
              <FilterButton 
                active={filter === 'all'} 
                onClick={() => setFilter('all')} 
                label="Todo" 
                count={totalCount}
              />
              <FilterButton 
                active={filter === 'arena'} 
                onClick={() => setFilter('arena')} 
                label="Arena" 
                icon={<Crown className="w-3.5 h-3.5" />}
                count={arenaInvitations.length}
              />
              <FilterButton 
                active={filter === 'duel'} 
                onClick={() => setFilter('duel')} 
                label="Duelos" 
                icon={<Swords className="w-3.5 h-3.5" />}
                count={duelInvitations.length}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!hasNotifications ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Inbox className="w-10 h-10" />
                  </div>
                  <p className="font-bold text-lg">No hay invitaciones</p>
                  <p className="text-sm">Vuelve más tarde o desafía a un amigo</p>
                </div>
              ) : (
                <>
                  {/* Arena Invitations */}
                  {filteredArena.map((inv) => (
                    <motion.div
                      layout
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <div className="w-8 h-8 rounded-lg bg-[#cba72f]/10 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-[#cba72f]" />
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#eddcff]">
                          <Image 
                            src={inv.hostAvatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=fallback'} 
                            alt={inv.hostName} 
                            width={48} 
                            height={48} 
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#310065] truncate">
                            Crown Arena
                          </h3>
                          <p className="text-sm text-gray-600">
                            <strong>{inv.hostName}</strong> te desafió
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                            <Clock className="w-3 h-3" />
                            <span>Recibida hace poco</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleAcceptArena(inv)}
                          className="flex-1 bg-[#310065] text-white py-2.5 rounded-xl text-sm font-black shadow-lg shadow-purple-900/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {actionLoading === inv.id ? '...' : 'Aceptar'}
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleDeclineArena(inv)}
                          className="px-4 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Duel Invitations */}
                  {filteredDuel.map((duel) => {
                    const host = duel.participants[duel.createdBy];
                    return (
                      <motion.div
                        layout
                        key={duel.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Swords className="w-4 h-4 text-orange-500" />
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100">
                            <Image 
                              src={host?.avatarUrl || 'https://api.dicebear.com/9.x/notionists/svg?seed=fallback'} 
                              alt={host?.name || 'Oponente'} 
                              width={48} 
                              height={48} 
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#310065] truncate uppercase tracking-tight">
                              Duelo 1v1
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              <strong>{host?.name || 'Guerrero'}</strong> te retó
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                              <Clock className="w-3 h-3" />
                              <span>{duel.difficulty.toUpperCase()} • {duel.selectedCategories.length} CATEGORÍAS</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAcceptDuel(duel)}
                            className="flex-1 bg-[#310065] text-white py-2.5 rounded-xl text-sm font-black shadow-lg shadow-purple-900/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {actionLoading === duel.id ? '...' : 'Aceptar'}
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleDeclineDuel(duel)}
                            className="px-4 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
               <p className="text-[10px] text-center text-gray-400 uppercase font-black tracking-widest">
                 Bible Crown Multiplayer
               </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterButton({ active, onClick, label, icon, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
        active 
          ? 'bg-[#310065] text-white shadow-md' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/20' : 'bg-gray-200'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
