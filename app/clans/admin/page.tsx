'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mapUserDoc } from '@/lib/user/repository';
import { 
  getClanById, 
  processClanRequest, 
  updateMemberRole, 
  kickMember, 
  muteMember,
  searchPlayers,
  invitePlayerToClan
} from '@/lib/clan/repository';
import { AppUserModel } from '@/lib/user/models';
import { ClanRole } from '@/lib/clan/models';
import { hasClanPermission, canManageMember } from '@/lib/clan/permissions';
import BackButton from '@/components/BackButton';
import UserAvatar from '@/components/UserAvatar';
import { 
  Loader2, 
  ShieldAlert, 
  UserPlus, 
  Users, 
  ClipboardList, 
  Search, 
  VolumeX, 
  UserMinus, 
  Check, 
  X,
  Shield,
  Clock,
  Bell,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const translations = {
  es: {
    title: 'Panel de Administración',
    tabRequests: 'Solicitudes',
    tabMembers: 'Miembros',
    tabInvite: 'Invitar',
    noRequests: 'No hay solicitudes pendientes.',
    noMembers: 'No hay miembros registrados.',
    searchPlaceholder: 'Buscar jugadores por usuario...',
    noPlayersFound: 'No se encontraron jugadores.',
    inviteBtn: 'Invitar',
    invitedSuccess: 'Invitación enviada con éxito',
    roleChanged: 'Rol actualizado',
    kickedSuccess: 'Miembro expulsado',
    mutedSuccess: 'Miembro silenciado por {m} minutos',
    accept: 'Aceptar',
    reject: 'Rechazar',
    errorTitle: 'Acceso Denegado',
    errorDesc: 'No tienes permisos suficientes para acceder al panel administrativo.',
    roleFounder: 'Líder / Fundador',
    roleAdmin: 'Administrador',
    roleModerator: 'Moderador',
    roleMember: 'Miembro',
    kickConfirm: '¿Expulsar a este miembro?',
    muteOptions: 'Silenciar miembro',
    muteDuration: 'Selecciona duración:',
    muteBtn: 'Silenciar',
    cancel: 'Cancelar',
    viewActivity: 'Ver Actividad',
    changeRole: 'Cambiar Rol',
    kickMember: 'Expulsar del Clan',
    roleSelect: 'Seleccionar rol:',
    confirmKick: '¿Confirmar expulsión?',
    confirmKickDesc: 'Esta acción eliminará al miembro del clan.',
    actions: 'Acciones',
    confirm: 'Confirmar'
  },
  en: {
    title: 'Administration Panel',
    tabRequests: 'Requests',
    tabMembers: 'Members',
    tabInvite: 'Invite',
    noRequests: 'No pending requests.',
    noMembers: 'No members registered.',
    searchPlaceholder: 'Search players by username...',
    noPlayersFound: 'No players found.',
    inviteBtn: 'Invite',
    invitedSuccess: 'Invitation sent successfully',
    roleChanged: 'Role updated',
    kickedSuccess: 'Member kicked',
    mutedSuccess: 'Member muted for {m} minutes',
    accept: 'Accept',
    reject: 'Reject',
    errorTitle: 'Access Denied',
    errorDesc: 'You do not have enough permissions to access the admin panel.',
    roleFounder: 'Founder / Leader',
    roleAdmin: 'Administrator',
    roleModerator: 'Moderator',
    roleMember: 'Member',
    kickConfirm: 'Kick this member?',
    muteOptions: 'Silence member',
    muteDuration: 'Select duration:',
    muteBtn: 'Mute',
    cancel: 'Cancel',
    viewActivity: 'View Activity',
    changeRole: 'Change Role',
    kickMember: 'Kick from Clan',
    roleSelect: 'Select role:',
    confirmKick: 'Confirm kick?',
    confirmKickDesc: 'This will remove the member from the clan.',
    actions: 'Actions',
    confirm: 'Confirm'
  },
  fr: {
    title: 'Panneau d\'Administration',
    tabRequests: 'Demandes',
    tabMembers: 'Membres',
    tabInvite: 'Inviter',
    noRequests: 'Aucune demande en attente.',
    noMembers: 'Aucun membre enregistré.',
    searchPlaceholder: 'Rechercher des joueurs...',
    noPlayersFound: 'Aucun joueur trouvé.',
    inviteBtn: 'Inviter',
    invitedSuccess: 'Invitation envoyée avec succès',
    roleChanged: 'Rôle mis à jour',
    kickedSuccess: 'Membre expulsé',
    mutedSuccess: 'Membre silencieux pour {m} minutes',
    accept: 'Accepter',
    reject: 'Refuser',
    errorTitle: 'Accès Refusé',
    errorDesc: 'Vous n\'avez pas les permissions nécessaires pour accéder à ce panneau.',
    roleFounder: 'Fondateur / Leader',
    roleAdmin: 'Administrateur',
    roleModerator: 'Modérateur',
    roleMember: 'Membre',
    kickConfirm: 'Expulser ce membre ?',
    muteOptions: 'Silencer le membre',
    muteDuration: 'Sélectionner la durée:',
    muteBtn: 'Silencer',
    cancel: 'Annuler',
    viewActivity: 'Voir l\'Activité',
    changeRole: 'Changer le Rôle',
    kickMember: 'Expulser du Clan',
    roleSelect: 'Sélectionner un rôle:',
    confirmKick: 'Confirmer l\'expulsion ?',
    confirmKickDesc: 'Cette action retirera le membre du clan.',
    actions: 'Actions',
    confirm: 'Confirmer'
  },
  ht: {
    title: 'Panèl Administrasyon',
    tabRequests: 'Demann yo',
    tabMembers: 'Manm yo',
    tabInvite: 'Envite',
    noRequests: 'Pa gen demann ki pandye.',
    noMembers: 'Pa gen manm ki anrejistre.',
    searchPlaceholder: 'Chache jwè yo pa non...',
    noPlayersFound: 'Pa jwenn jwè yo.',
    inviteBtn: 'Envite',
    invitedSuccess: 'Lenvitasyon voye avèk siksè',
    roleChanged: 'Ròl mete ajou',
    kickedSuccess: 'Manm mete deyò',
    mutedSuccess: 'Manm silansye pou {m} minit',
    accept: 'Aksepte',
    reject: 'Refize',
    errorTitle: 'Aksè Refize',
    errorDesc: 'Ou pa gen ase otorizasyon pou antre nan panèl sa a.',
    roleFounder: 'Kreyatè',
    roleAdmin: 'Administratè',
    roleModerator: 'Moderatè',
    roleMember: 'Manm',
    kickConfirm: 'Mete manm sa a deyò?',
    muteOptions: 'Silansye manm lan',
    muteDuration: 'Chwazi tan:',
    muteBtn: 'Silansye',
    cancel: 'Anile',
    viewActivity: 'Wè Aktivite',
    changeRole: 'Chanje Wòl',
    kickMember: 'Retire nan Klan',
    roleSelect: 'Chwazi wòl:',
    confirmKick: 'Konfime ekspilsyon?',
    confirmKickDesc: 'Aksyon sa a ap retire manm nan klan an.',
    actions: 'Aksyon',
    confirm: 'Konfime'
  }
};

export default function ClanAdminPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [clan, setClan] = useState<any>(null);
  const [loadingClan, setLoadingClan] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'members' | 'invite'>('requests');
  const [actionLoading, setActionLoading] = useState(false);

  // Data lists
  const [requests, setRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<AppUserModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppUserModel[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set());

  // Mute modal helper state
  const [muteTargetUid, setMuteTargetUid] = useState<string | null>(null);
  const [muteDuration, setMuteDuration] = useState(15);
  const [selectedMember, setSelectedMember] = useState<AppUserModel | null>(null);

  // Action sheet state
  const [actionSheetMember, setActionSheetMember] = useState<AppUserModel | null>(null);
  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [pendingRole, setPendingRole] = useState<ClanRole | null>(null);

  // Refs for unsubscribing listeners
  const unsubRequestsRef = useRef<(() => void) | null>(null);
  const unsubMembersRef = useRef<(() => void) | null>(null);
  const prevRequestIdsRef = useRef<Set<string>>(new Set());

  const userLang = (user?.settings?.language ?? 'es') as keyof typeof translations;
  const t = translations[userLang] ?? translations.es;

  // ── Real-time listener setup ──────────────────────────────
  const setupListeners = (clanId: string) => {
    // Unsub any previous listeners
    unsubRequestsRef.current?.();
    unsubMembersRef.current?.();

    // 1️⃣  Real-time REQUESTS listener
    const reqQuery = query(
      collection(db, 'clanRequests'),
      where('clanId', '==', clanId),
      where('status', '==', 'pending')
      // Note: no orderBy here — avoids composite index requirement
      // We sort client-side below
    );

    unsubRequestsRef.current = onSnapshot(reqQuery, (snap) => {
      const freshRequests: any[] = [];
      const freshIds = new Set<string>();

      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        freshRequests.push(data);
        freshIds.add(d.id);
      });

      // Sort client-side by createdAt descending
      freshRequests.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? a.createdAt ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? b.createdAt ?? 0;
        return bTime - aTime;
      });

      // Detect NEW requests (ids not seen before)
      const newOnes = new Set<string>();
      freshIds.forEach((id) => {
        if (!prevRequestIdsRef.current.has(id) && prevRequestIdsRef.current.size > 0) {
          newOnes.add(id);
        }
      });

      if (newOnes.size > 0) {
        setNewRequestIds(newOnes);
        // Clear highlight after 4 seconds
        setTimeout(() => setNewRequestIds(new Set()), 4000);

        const msg = userLang === 'es'
          ? `Nueva solicitud de ingreso al clan`
          : userLang === 'fr'
          ? `Nouvelle demande d\'adhésion`
          : `New clan join request`;
        toast.success(msg, { icon: '🔔', duration: 3500 });
      }

      prevRequestIdsRef.current = freshIds;
      setRequests(freshRequests);
    }, (err) => {
      console.error('Requests listener error:', err);
    });

    // 2️⃣  Real-time MEMBERS listener
    const membersQuery = query(
      collection(db, 'users'),
      where('clanId', '==', clanId)
    );

    unsubMembersRef.current = onSnapshot(membersQuery, (snap) => {
      const freshMembers: AppUserModel[] = [];
      snap.forEach((d) => {
        freshMembers.push(mapUserDoc(d.data()));
      });
      setMembers(freshMembers);
    }, (err) => {
      console.error('Members listener error:', err);
    });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.clanId) {
      setLoadingClan(true);
      getClanById(user.clanId)
        .then((clanData) => {
          if (clanData) {
            setClan(clanData);
            setupListeners(clanData.id);
          }
          setLoadingClan(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingClan(false);
        });
    } else if (user && !user.clanId) {
      setLoadingClan(false);
    }

    // Cleanup on unmount
    return () => {
      unsubRequestsRef.current?.();
      unsubMembersRef.current?.();
    };
  }, [user, authLoading]);

  // Player search trigger
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      setSearchingPlayers(true);
      searchPlayers(searchQuery.trim())
        .then((res) => {
          // Exclude players already in a clan
          setSearchResults(res.filter(p => !p.clanId));
          setSearchingPlayers(false);
        })
        .catch((err) => {
          console.error(err);
          setSearchingPlayers(false);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  if (authLoading || loadingClan) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
      </div>
    );
  }

  // Perms Check: Founder, Admin, Moderator can access (Moderator has restricted view)
  const isAuthorized = user && (['founder', 'admin', 'moderator'].includes(user.clanRole || '') || (clan && clan.creatorId === user.uid) || user.clanId);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#faf9fc] text-[#0F172A] font-sans pt-safe pb-8 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t.errorTitle}</h1>
        <p className="text-[#64748B] mb-6 max-w-md">{t.errorDesc}</p>
        <button
          onClick={() => router.push('/clans')}
          className="px-6 py-3 bg-[#0A84FF] text-white font-bold rounded-2xl shadow-sm hover:bg-[#0A84FF]/90 transition-colors"
        >
          {userLang === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>
    );
  }

  const handleProcessRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!hasClanPermission(user.clanRole, 'process_requests')) {
      toast.error('No tienes permisos para procesar solicitudes');
      return;
    }
    setActionLoading(true);
    try {
      await processClanRequest(requestId, status);
      toast.success(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada');
    } catch (e: any) {
      toast.error(e.message || 'Error processing request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (targetUid: string, role: ClanRole) => {
    if (!hasClanPermission(user.clanRole, 'manage_moderators')) {
      toast.error('No tienes permisos para gestionar roles');
      return;
    }
    setActionLoading(true);
    try {
      await updateMemberRole(targetUid, role);
      toast.success(t.roleChanged);
    } catch (e: any) {
      toast.error(e.message || 'Error updating role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKick = async (targetUid: string) => {
    if (!hasClanPermission(user.clanRole, 'kick_members')) {
      toast.error('No tienes permisos para expulsar miembros');
      return;
    }
    const targetMember = members.find(m => m.uid === targetUid);
    if (!canManageMember(user.clanRole, targetMember?.clanRole)) {
      toast.error('No tienes jerarquía suficiente para gestionar a este miembro');
      return;
    }
    setActionLoading(true);
    try {
      await kickMember(clan.id, targetUid);
      toast.success(t.kickedSuccess);
    } catch (e: any) {
      toast.error(e.message || 'Error kicking member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMuteSubmit = async () => {
    if (!muteTargetUid) return;
    if (!hasClanPermission(user.clanRole, 'mute_members')) {
      toast.error('No tienes permisos para silenciar miembros');
      return;
    }
    const targetMember = members.find(m => m.uid === muteTargetUid);
    if (!canManageMember(user.clanRole, targetMember?.clanRole)) {
      toast.error('No tienes jerarquía suficiente para gestionar a este miembro');
      return;
    }
    setActionLoading(true);
    try {
      await muteMember(clan.id, muteTargetUid, muteDuration);
      toast.success(t.mutedSuccess.replace('{m}', String(muteDuration)));
      setMuteTargetUid(null);
    } catch (e: any) {
      toast.error(e.message || 'Error muting member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvite = async (playerUid: string) => {
    if (!hasClanPermission(user.clanRole, 'invite_players')) {
      toast.error('No tienes permisos para invitar jugadores');
      return;
    }
    setActionLoading(true);
    try {
      await invitePlayerToClan(clan.id, playerUid, clan.name);
      toast.success(t.invitedSuccess);
      // Remove from search results
      setSearchResults(prev => prev.filter(p => p.uid !== playerUid));
    } catch (e: any) {
      toast.error(e.message || 'Error sending invite');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen font-sans">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <div className="flex items-center gap-4">
          <BackButton href={`/clans?id=${clan.id}`} />
        </div>
        <h1 className="font-bold text-lg text-[#0F172A]">{t.title}</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Tabs Row */}
      <div className="fixed top-16 w-full z-40 bg-white border-b border-black/[0.03] flex justify-around">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-1.5 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'requests' ? 'border-[#0A84FF] text-[#0A84FF]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          {t.tabRequests} ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-1.5 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'members' ? 'border-[#0A84FF] text-[#0A84FF]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <Users className="w-4 h-4" />
          {t.tabMembers} ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`flex items-center gap-1.5 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'invite' ? 'border-[#0A84FF] text-[#0A84FF]' : 'border-transparent text-[#64748B]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          {t.tabInvite}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="pt-36 px-4 max-w-xl mx-auto pb-12">
        
        {/* TAB 1: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 text-center border border-black/[0.03] shadow-sm">
                <ClipboardList className="w-10 h-10 text-[#64748B]/30 mx-auto mb-3" />
                <p className="text-sm text-[#64748B] font-medium">{t.noRequests}</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-[24px] p-4 border shadow-sm flex items-center justify-between gap-3 transition-all ${
                    newRequestIds.has(req.id)
                      ? 'border-[#0A84FF]/40 bg-[#0A84FF]/[0.02] ring-1 ring-[#0A84FF]/20 animate-pulse'
                      : 'border-black/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      photoURL={req.photoURL ?? null}
                      username={req.username}
                      size={44}
                      animate={false}
                    />
                    <div>
                      <h3 className="font-bold text-[15px]">{req.fullName || req.username}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">@{req.username} • Lvl {req.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleProcessRequest(req.id, 'accepted')}
                      disabled={actionLoading}
                      className="p-2.5 bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 transition-all rounded-xl"
                      title={t.accept}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleProcessRequest(req.id, 'rejected')}
                      disabled={actionLoading}
                      className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 transition-all rounded-xl"
                      title={t.reject}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 text-center border border-black/[0.03] shadow-sm">
                <Users className="w-10 h-10 text-[#64748B]/30 mx-auto mb-3" />
                <p className="text-sm text-[#64748B] font-medium">{t.noMembers}</p>
              </div>
            ) : (
              members
                .filter((mbr) => mbr.uid !== user.uid)
                .map((mbr) => {
                const canManage = user.clanRole === 'founder'
                  || (user.clanRole === 'admin' && mbr.clanRole !== 'founder' && mbr.clanRole !== 'admin');
                const showMute = ['founder', 'admin', 'moderator'].includes(user.clanRole || '')
                  && mbr.clanRole !== 'founder';

                return (
                  <div
                    key={mbr.uid}
                    className="bg-white rounded-[24px] p-4 border border-black/[0.03] shadow-sm"
                  >
                    {/* Member info row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          photoURL={mbr.photoURL}
                          activeFrame={mbr.activeFrame}
                          username={mbr.username}
                          size={44}
                          animate={false}
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-[15px] flex items-center gap-1.5 truncate">
                            {mbr.fullName || mbr.username}
                            {mbr.clanRole === 'founder' && <Shield className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                            {mbr.clanRole === 'admin' && <Shield className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />}
                            {mbr.clanRole === 'moderator' && <Shield className="w-4 h-4 text-purple-500 fill-purple-500 flex-shrink-0" />}
                          </h3>
                          <p className="text-xs text-[#64748B] mt-0.5 truncate">@{mbr.username} • Lvl {mbr.level || 1} • {mbr.xp || 0} XP</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-[#64748B] px-2.5 py-1 bg-gray-100 rounded-full flex-shrink-0 uppercase tracking-wide">
                        {mbr.clanRole === 'founder' ? t.roleFounder
                          : mbr.clanRole === 'admin' ? t.roleAdmin
                          : mbr.clanRole === 'moderator' ? t.roleModerator
                          : t.roleMember}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                      {/* View activity */}
                      <button
                        onClick={() => router.push(`/clans/admin/member/${mbr.uid}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0A84FF]/8 hover:bg-[#0A84FF]/15 text-[#0A84FF] rounded-xl text-[11px] font-bold transition-all"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        {t.viewActivity}
                      </button>

                      {/* Change role — only if authorized */}
                      {canManage && (
                        <button
                          onClick={() => {
                            setActionSheetMember(mbr);
                            setPendingRole(mbr.clanRole as ClanRole || 'member');
                            setShowRolePicker(true);
                            setShowKickConfirm(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[11px] font-bold transition-all"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {t.changeRole}
                        </button>
                      )}

                      {/* Kick — only if authorized */}
                      {canManage && (
                        <button
                          onClick={() => {
                            setActionSheetMember(mbr);
                            setShowKickConfirm(true);
                            setShowRolePicker(false);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[11px] font-bold transition-all"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Mute only (no kick) */}
                      {!canManage && showMute && (
                        <button
                          onClick={() => setMuteTargetUid(mbr.uid)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-[11px] font-bold transition-all"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: INVITATIONS */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-black/[0.05] rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] shadow-sm transition-colors"
              />
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-[#64748B]" />
            </div>

            {/* Results */}
            <div className="space-y-3">
              {searchingPlayers ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-[#0A84FF] animate-spin" />
                </div>
              ) : searchQuery.trim().length > 0 && searchResults.length === 0 ? (
                <p className="text-center text-xs text-[#64748B] py-6">{t.noPlayersFound}</p>
              ) : (
                searchResults.map((player) => (
                  <div key={player.uid} className="bg-white rounded-[24px] p-4 border border-black/[0.03] shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{player.fullName || player.username}</h4>
                      <p className="text-xs text-[#64748B]">@{player.username} • Lvl {player.level || 1}</p>
                    </div>
                    <button
                      onClick={() => handleInvite(player.uid)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF] hover:text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {t.inviteBtn}
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>

      {/* Mute Duration Modal */}
      {muteTargetUid && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Clock className="text-[#0A84FF]" />
              {t.muteOptions}
            </h3>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t.muteDuration}</p>
              <div className="grid grid-cols-3 gap-2">
                {[15, 60, 1440].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMuteDuration(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      muteDuration === m
                        ? 'border-[#0A84FF] bg-[#0A84FF]/5 text-[#0A84FF]'
                        : 'border-black/[0.05] hover:bg-gray-50'
                    }`}
                  >
                    {m === 15 ? '15 Min' : m === 60 ? '1 Hour' : '24 Hours'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMuteTargetUid(null)}
                className="flex-1 py-3 border border-black/[0.05] rounded-xl text-xs font-bold text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleMuteSubmit}
                disabled={actionLoading}
                className="flex-1 py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {t.muteBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KICK CONFIRMATION MODAL ── */}
      {actionSheetMember && showKickConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setActionSheetMember(null); setShowKickConfirm(false); }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Red danger header */}
            <div className="bg-red-50 p-6 flex flex-col items-center text-center gap-3 border-b border-red-100">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <UserMinus className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-[18px] text-[#0F172A]">{t.confirmKick}</h3>
                <p className="text-sm text-[#64748B] mt-1">{t.confirmKickDesc}</p>
              </div>
            </div>

            {/* Member info */}
            <div className="p-4 flex items-center gap-3 bg-gray-50 border-b border-gray-100">
              <UserAvatar
                photoURL={actionSheetMember.photoURL}
                activeFrame={actionSheetMember.activeFrame}
                username={actionSheetMember.username}
                size={44}
                animate={false}
              />
              <div>
                <p className="font-bold text-[15px] text-[#0F172A]">{actionSheetMember.fullName || actionSheetMember.username}</p>
                <p className="text-xs text-[#64748B]">@{actionSheetMember.username} • Lvl {actionSheetMember.level || 1}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-3">
              <button
                onClick={() => { setActionSheetMember(null); setShowKickConfirm(false); }}
                className="flex-1 py-3.5 border border-black/[0.06] rounded-2xl text-sm font-bold text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={async () => {
                  await handleKick(actionSheetMember.uid);
                  setActionSheetMember(null);
                  setShowKickConfirm(false);
                }}
                disabled={actionLoading}
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                {t.kickMember}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROLE PICKER MODAL ── */}
      {actionSheetMember && showRolePicker && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setActionSheetMember(null); setShowRolePicker(false); }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-50 flex items-center gap-3">
              <UserAvatar
                photoURL={actionSheetMember.photoURL}
                activeFrame={actionSheetMember.activeFrame}
                username={actionSheetMember.username}
                size={44}
                animate={false}
              />
              <div>
                <p className="font-black text-[15px] text-[#0F172A]">{actionSheetMember.fullName || actionSheetMember.username}</p>
                <p className="text-xs text-[#64748B]">{t.changeRole}</p>
              </div>
            </div>

            {/* Role options */}
            <div className="p-4 space-y-2">
              {[
                { value: 'member' as ClanRole, label: t.roleMember, color: 'text-[#64748B]', bg: 'bg-gray-50 hover:bg-gray-100', icon: '👤' },
                { value: 'moderator' as ClanRole, label: t.roleModerator, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100', icon: '🛡️' },
                ...(user.clanRole === 'founder' ? [{ value: 'admin' as ClanRole, label: t.roleAdmin, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100', icon: '⚡' }] : []),
              ].map((role) => (
                <button
                  key={role.value}
                  onClick={() => setPendingRole(role.value)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${role.bg} ${pendingRole === role.value ? 'ring-2 ring-[#0A84FF]' : ''}`}
                >
                  <span className={`flex items-center gap-2.5 font-bold text-sm ${role.color}`}>
                    <span>{role.icon}</span>
                    {role.label}
                  </span>
                  {pendingRole === role.value && (
                    <div className="w-5 h-5 rounded-full bg-[#0A84FF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Apply button */}
            <div className="p-4 pt-0 flex gap-3">
              <button
                onClick={() => { setActionSheetMember(null); setShowRolePicker(false); }}
                className="flex-1 py-3.5 border border-black/[0.06] rounded-2xl text-sm font-bold text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={async () => {
                  if (pendingRole && pendingRole !== actionSheetMember.clanRole) {
                    await handleRoleChange(actionSheetMember.uid, pendingRole);
                  }
                  setActionSheetMember(null);
                  setShowRolePicker(false);
                }}
                disabled={actionLoading || pendingRole === actionSheetMember.clanRole}
                className="flex-1 py-3.5 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white rounded-2xl text-sm font-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
