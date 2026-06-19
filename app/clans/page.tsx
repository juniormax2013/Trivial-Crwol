'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ClanModel, SPIRIT_FRUITS, ClanRole } from '@/lib/clan/models';
import { getClans, getClanById, joinClan, leaveClan, getClanMembers, submitClanRequest, hasPendingClanRequest, updateMemberRole } from '@/lib/clan/repository';
import { canManageMember } from '@/lib/clan/permissions';
import { AppUserModel } from '@/lib/user/models';
import BackButton from '@/components/BackButton';
import UserAvatar from '@/components/UserAvatar';
import ChatRoom from '@/components/chat/ChatRoom';
import { 
  Users, 
  Search, 
  Plus, 
  Crown, 
  Sword, 
  Activity, 
  ArrowLeft,
  Loader2,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Shield,
  Lock,
  MessageSquare,
  Clock,
  X,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';

const translations = {
  es: {
    explorerTitle: 'Explorador de Clanes',
    detailTitle: 'Detalle del Clan',
    searchPlaceholder: 'Buscar clanes...',
    noClans: 'No se encontraron clanes.',
    members: 'Miembros',
    points: 'Puntos',
    xp: 'Experiencia',
    power: 'Poder del Clan',
    powerDesc: 'Suma de los niveles de los miembros',
    joinBtn: 'Unirse al Clan',
    leaveBtn: 'Salir del Clan',
    joinedSuccess: '¡Te has unido al clan con éxito!',
    leftSuccess: 'Has salido del clan.',
    creator: 'Creador',
    memberList: 'Lista de Miembros',
    level: 'Nivel',
    createFirst: '¿Quieres crear tu propio clan?',
    createBtn: 'Crear Clan',
    stats: 'Estadísticas del Clan',
    welcomeTitle: 'Mensaje de Bienvenida',
    requestBtn: 'Enviar Solicitud',
    requestSuccess: 'Solicitud enviada con éxito',
    settingsBtn: 'Configurar',
    adminBtn: 'Administrar',
    typePrivate: 'Privado',
    typePublic: 'Público'
  },
  en: {
    explorerTitle: 'Clan Explorer',
    detailTitle: 'Clan Details',
    searchPlaceholder: 'Search clans...',
    noClans: 'No clans found.',
    members: 'Members',
    points: 'Points',
    xp: 'Experience',
    power: 'Clan Power',
    powerDesc: 'Sum of member levels',
    joinBtn: 'Join Clan',
    leaveBtn: 'Leave Clan',
    joinedSuccess: 'Successfully joined the clan!',
    leftSuccess: 'You have left the clan.',
    creator: 'Creator',
    memberList: 'Members Roster',
    level: 'Level',
    createFirst: 'Want to create your own clan?',
    createBtn: 'Create Clan',
    stats: 'Clan Stats',
    welcomeTitle: 'Welcome Message',
    requestBtn: 'Send Request',
    requestSuccess: 'Request sent successfully',
    settingsBtn: 'Settings',
    adminBtn: 'Manage',
    typePrivate: 'Private',
    typePublic: 'Public'
  },
  fr: {
    explorerTitle: 'Explorateur de Clans',
    detailTitle: 'Détails du Clan',
    searchPlaceholder: 'Rechercher des clans...',
    noClans: 'Aucun clan trouvé.',
    members: 'Membres',
    points: 'Points',
    xp: 'Expérience',
    power: 'Puissance du Clan',
    powerDesc: 'Somme des niveaux des membres',
    joinBtn: 'Rejoindre le Clan',
    leaveBtn: 'Quitter le Clan',
    joinedSuccess: 'Vous avez rejoint le clan avec succès !',
    leftSuccess: 'Vous avez quitté le clan.',
    creator: 'Créateur',
    memberList: 'Liste des Membres',
    level: 'Niveau',
    createFirst: 'Créer votre propre clan ?',
    createBtn: 'Créer Clan',
    stats: 'Statistiques du Clan',
    welcomeTitle: 'Message de Bienvenue',
    requestBtn: 'Envoyer Demande',
    requestSuccess: 'Demande envoyée avec succès',
    settingsBtn: 'Paramètres',
    adminBtn: 'Gérer',
    typePrivate: 'Privé',
    typePublic: 'Public'
  },
  ht: {
    explorerTitle: 'Eksploratè Klan',
    detailTitle: 'Detay Klan an',
    searchPlaceholder: 'Chache klan yo...',
    noClans: 'Pa gen klan ki jwenn.',
    members: 'Manm yo',
    points: 'Pwen yo',
    xp: 'Eksperyans',
    power: 'Pouvwa Klan an',
    powerDesc: 'Sòm nivo tout manm yo',
    joinBtn: 'Antre nan Klan an',
    leaveBtn: 'Kite Klan an',
    joinedSuccess: 'Ou antre nan klan an avèk siksè !',
    leftSuccess: 'Ou kite klan an.',
    creator: 'Kreyatè',
    memberList: 'Lis Manm yo',
    level: 'Nivo',
    createFirst: 'Vle kreye klan pa ou?',
    createBtn: 'Kreye Klan',
    stats: 'Estatisik Klan an',
    welcomeTitle: 'Mesaj Byenveni',
    requestBtn: 'Voye Demann',
    requestSuccess: 'Demann voye avèk siksè',
    settingsBtn: 'Konfigire',
    adminBtn: 'Administre',
    typePrivate: 'Privat',
    typePublic: 'Piblik'
  }
};

const modalTranslations = {
  es: {
    level: 'Nivel',
    xp: 'Experiencia',
    coins: 'Monedas',
    crowns: 'Coronas',
    close: 'Cerrar',
    changeRole: 'Cambiar Rol',
    cancel: 'Cancelar',
    roleLeader: 'Líder / Fundador',
    roleAdmin: 'Administrador',
    roleModerator: 'Moderador',
    roleMember: 'Miembro',
    selectNewRole: 'Seleccionar nuevo rol'
  },
  en: {
    level: 'Level',
    xp: 'Experience',
    coins: 'Coins',
    crowns: 'Crowns',
    close: 'Close',
    changeRole: 'Change Role',
    cancel: 'Cancel',
    roleLeader: 'Founder / Leader',
    roleAdmin: 'Administrator',
    roleModerator: 'Moderator',
    roleMember: 'Member',
    selectNewRole: 'Select new role'
  },
  fr: {
    level: 'Niveau',
    xp: 'Expérience',
    coins: 'Pièces',
    crowns: 'Couronnes',
    close: 'Fermer',
    changeRole: 'Changer le Rôle',
    cancel: 'Annuler',
    roleLeader: 'Fondateur',
    roleAdmin: 'Administrateur',
    roleModerator: 'Modérateur',
    roleMember: 'Membre',
    selectNewRole: 'Choisir le rôle'
  },
  ht: {
    level: 'Nivo',
    xp: 'Eksperyans',
    coins: 'Pyès monnen',
    crowns: 'Kowòn',
    close: 'Fèmen',
    changeRole: 'Chanje Ròl',
    cancel: 'Anile',
    roleLeader: 'Kreyatè',
    roleAdmin: 'Administratè',
    roleModerator: 'Moderatè',
    roleMember: 'Manm',
    selectNewRole: 'Chwazi nouvo ròl'
  }
};

export default function ClansPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const directId = searchParams.get('id');

  const [clans, setClans] = useState<ClanModel[]>([]);
  const [loadingClans, setLoadingClans] = useState(true);
  const [selectedClan, setSelectedClan] = useState<ClanModel | null>(null);
  const [selectedClanMembers, setSelectedClanMembers] = useState<AppUserModel[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [viewingMember, setViewingMember] = useState<AppUserModel | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setIsEditingRole(false);
  }, [viewingMember]);

  const lang = (user?.settings?.language ?? 'es') as keyof typeof translations;
  const t = translations[lang] ?? translations.es;

  // Load all clans
  const fetchClans = async () => {
    setLoadingClans(true);
    try {
      const allClans = await getClans();
      setClans(allClans);
      
      // If direct ID is set in query, view that clan
      if (directId) {
        const matching = allClans.find(c => c.id === directId) || await getClanById(directId);
        if (matching) {
          setSelectedClan(matching);
          loadClanMembers(matching.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClans(false);
    }
  };

  const loadClanMembers = async (clanId: string) => {
    setLoadingMembers(true);
    try {
      const mbrs = await getClanMembers(clanId);
      setSelectedClanMembers(mbrs);
      if (user) {
        const hasPending = await hasPendingClanRequest(user.uid, clanId);
        setHasPendingRequest(hasPending);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchClans();
    }
  }, [user, authLoading, directId]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
      </div>
    );
  }

  const handleJoin = async (clanId: string) => {
    setActionLoading(true);
    try {
      await submitClanRequest(clanId, user);
      toast.success(t.requestSuccess);
      setHasPendingRequest(true);
      
      // Refresh current view
      await fetchClans();
      const updatedClan = await getClanById(clanId);
      if (updatedClan) {
        setSelectedClan(updatedClan);
        loadClanMembers(clanId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error sending request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async (clanId: string) => {
    if (user.clanRole === 'founder' || user.clanRole === 'admin') {
      const errorFounderLeave = lang === 'es' ? 'El líder o fundador no puede abandonar el clan directamente.' : lang === 'fr' ? 'Le fondateur ne peut pas quitter le clan directement.' : lang === 'ht' ? 'Kreyatè a pa ka kite klan an dirèkteman.' : 'The founder cannot leave the clan directly.';
      const errorAdminLeave = lang === 'es' ? 'Los administradores no pueden abandonar el clan directamente.' : lang === 'fr' ? 'Les administrateurs ne peuvent pas quitter le clan directement.' : lang === 'ht' ? 'Administratè yo pa ka kite klan an dirèkteman.' : 'Administrators cannot leave the clan directly.';
      toast.error(user.clanRole === 'founder' ? errorFounderLeave : errorAdminLeave);
      return;
    }
    setActionLoading(true);
    try {
      await leaveClan(clanId, user.uid);
      toast.success(t.leftSuccess);
      setSelectedClan(null);
      setSelectedClanMembers([]);
      router.push('/clans');
      await fetchClans();
    } catch (error: any) {
      toast.error(error.message || 'Error leaving clan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (targetUid: string, newRole: ClanRole) => {
    setUpdatingRole(true);
    try {
      await updateMemberRole(targetUid, newRole);
      
      const successMsg = lang === 'es' ? 'Rol actualizado con éxito' : lang === 'fr' ? 'Rôle mis à jour avec succès' : lang === 'ht' ? 'Ròl mete ajou avèk siksè' : 'Role updated successfully';
      toast.success(successMsg);
      
      // Update local state for modal
      if (viewingMember && viewingMember.uid === targetUid) {
        setViewingMember({ ...viewingMember, clanRole: newRole });
      }
      
      // Update local state for member list
      setSelectedClanMembers(prev => prev.map(m => m.uid === targetUid ? { ...m, clanRole: newRole } : m));
      
      setIsEditingRole(false);
    } catch (e: any) {
      const errMsg = lang === 'es' ? 'Error al actualizar el rol' : lang === 'fr' ? 'Erreur de mise à jour' : lang === 'ht' ? 'Erreur nan mete ajou' : 'Error updating role';
      toast.error(e.message || errMsg);
    } finally {
      setUpdatingRole(false);
    }
  };

  const getRoleOptions = (targetRole: ClanRole | undefined | null) => {
    const options: { role: ClanRole; label: string }[] = [];
    if (user?.clanRole === 'founder') {
      options.push({ 
        role: 'admin', 
        label: lang === 'es' ? 'Administrador' : lang === 'fr' ? 'Administrateur' : lang === 'ht' ? 'Administratè' : 'Administrator' 
      });
    }
    options.push({ 
      role: 'moderator', 
      label: lang === 'es' ? 'Moderador' : lang === 'fr' ? 'Modérateur' : lang === 'ht' ? 'Moderatè' : 'Moderator' 
    });
    options.push({ 
      role: 'member', 
      label: lang === 'es' ? 'Miembro' : lang === 'fr' ? 'Membre' : lang === 'ht' ? 'Manm' : 'Member' 
    });
    // Filter out target's current role
    return options.filter(opt => opt.role !== targetRole);
  };

  const filteredClans = clans.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.motto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // VIEW 1: Clan Details View
  if (selectedClan) {
    const isMember = user.clanId === selectedClan.id || selectedClan.creatorId === user.uid;
    const fruitObj = SPIRIT_FRUITS.find(f => f.id === selectedClan.icon) || SPIRIT_FRUITS[0];

    return (
      <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen font-sans">
        {/* Top Header */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
          <button
            onClick={() => {
              setSelectedClan(null);
              setSelectedClanMembers([]);
              // Remove query param safely
              router.push('/clans');
            }}
            className="w-10 h-10 rounded-2xl bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-[#0F172A] transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="font-bold text-lg text-[#0F172A]">{t.detailTitle}</h1>
          <div className="w-10 h-10" />
        </header>

        {/* Details Content */}
        <main className="pt-20 px-4 max-w-xl mx-auto space-y-6 pb-12">
          
          {/* Main Hero Card */}
          <section className="bg-white rounded-[24px] p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-black/[0.03] flex flex-col items-center relative">
            
            {/* Quick Admin Actions Row — visible top-right as icons */}
            {isMember && (['founder', 'admin', 'moderator'].includes(user.clanRole || '') || selectedClan.creatorId === user.uid) && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {(['founder', 'admin'].includes(user.clanRole || '') || selectedClan.creatorId === user.uid) && (
                  <button
                    onClick={() => router.push('/clans/settings')}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-[#0F172A] rounded-xl transition-all"
                    title={t.settingsBtn}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-md flex items-center justify-center border-2 border-white bg-gray-50">
              <img src={fruitObj.imageUrl} className="w-full h-full object-cover" alt={selectedClan.name} />
            </div>
            
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{selectedClan.name}</h2>
            <p className="text-sm italic text-[#64748B] mt-1.5">&quot;{selectedClan.motto}&quot;</p>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1 bg-gray-100 text-[#64748B] px-3 py-1 rounded-full text-xs font-bold">
                {selectedClan.type === 'private' ? <Lock className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                <span>{selectedClan.type === 'private' ? t.typePrivate : t.typePublic}</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-[#0A84FF]/10 text-[#0A84FF] px-3 py-1 rounded-full text-xs font-bold">
                <User className="w-3.5 h-3.5" />
                <span>{t.creator}: {selectedClan.creatorName}</span>
              </div>
            </div>
          </section>

          {/* Welcome Message Card (Visible only to members) */}
          {isMember && selectedClan.welcomeMessage && (
            <section className="bg-[#0A84FF]/5 rounded-[24px] p-5 border border-[#0A84FF]/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2 text-[#0A84FF]">
                <MessageSquare className="w-5 h-5 fill-current" />
                <h3 className="font-bold text-sm">{t.welcomeTitle}</h3>
              </div>
              <p className="text-sm text-[#0F172A] leading-relaxed italic">&quot;{selectedClan.welcomeMessage}&quot;</p>
            </section>
          )}

          {/* ── ADMIN PANEL BANNER ── visible solo a founder/admin/moderator */}
          {isMember && ['founder', 'admin', 'moderator'].includes(user.clanRole || '') && (
            <button
              onClick={() => router.push('/clans/admin')}
              className="w-full flex items-center justify-between bg-gradient-to-r from-[#0A84FF] to-blue-600 text-white px-5 py-4 rounded-[24px] shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-[15px] leading-tight">
                    {user.settings?.language === 'fr'
                      ? 'Panneau d\'Administration'
                      : user.settings?.language === 'en'
                      ? 'Administration Panel'
                      : 'Panel de Administración'}
                  </p>
                  <p className="text-white/70 text-[11px] font-medium mt-0.5">
                    {user.clanRole === 'founder'
                      ? (user.settings?.language === 'fr' ? 'Fondateur' : user.settings?.language === 'en' ? 'Founder' : 'Líder / Fundador')
                      : user.clanRole === 'admin'
                      ? (user.settings?.language === 'fr' ? 'Administrateur' : 'Admin')
                      : (user.settings?.language === 'fr' ? 'Modérateur' : user.settings?.language === 'en' ? 'Moderator' : 'Moderador')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
            </button>
          )}

          {/* Stats Grid */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">{t.stats}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-[20px] border border-black/[0.03] shadow-sm flex flex-col items-center text-center">
                <Users className="w-5 h-5 text-[#0A84FF] mb-1.5" />
                <span className="text-xl font-bold">{selectedClan.membersCount}</span>
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider mt-1">{t.members}</span>
              </div>
              <div className="bg-white p-4 rounded-[20px] border border-black/[0.03] shadow-sm flex flex-col items-center text-center">
                <Crown className="w-5 h-5 text-[#0A84FF] mb-1.5" />
                <span className="text-xl font-bold">{selectedClan.points}</span>
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider mt-1">{t.points}</span>
              </div>
              <div className="bg-white p-4 rounded-[20px] border border-black/[0.03] shadow-sm flex flex-col items-center text-center col-span-2">
                <Activity className="w-5 h-5 text-[#0A84FF] mb-1.5" />
                <span className="text-xl font-bold">{selectedClan.power ?? 0}</span>
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider mt-1">{t.power}</span>
                <span className="text-[9px] text-[#64748B]/70 italic mt-0.5">{t.powerDesc}</span>
              </div>
            </div>
          </section>

          {/* Members Roster */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">{t.memberList}</h3>
            <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-sm divide-y divide-gray-50 overflow-hidden">
              {loadingMembers ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-[#0A84FF] animate-spin" />
                </div>
              ) : selectedClanMembers.length === 0 ? (
                <p className="p-6 text-center text-xs text-[#64748B]">No members found.</p>
              ) : (
                selectedClanMembers
                  .filter((member) => member.uid !== user?.uid)
                  .map((member) => (
                  <div 
                    key={member.uid} 
                    onClick={() => setViewingMember(member)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        photoURL={member.photoURL}
                        activeFrame={member.activeFrame}
                        username={member.username}
                        size={40}
                        animate={false}
                      />
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-1">
                          {member.fullName || member.username}
                          {member.clanRole === 'founder' && <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          {member.clanRole === 'admin' && <Shield className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                          {member.clanRole === 'moderator' && <Shield className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />}
                        </p>
                        <p className="text-[11px] text-[#64748B]">@{member.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-[#0A84FF]/10 text-[#0A84FF] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        {t.level} {member.level || 1}
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B]/40" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Actions Button */}
          <section className="pt-4">
            {isMember && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0A84FF]/30 transition-all duration-300 hover:scale-110 active:scale-90 animate-bounce"
                style={{ animationDuration: '3s' }}
                title={lang === 'es' ? 'Chat del Clan' : lang === 'fr' ? 'Chat du Clan' : lang === 'ht' ? 'Chat Klan an' : 'Clan Chat'}
              >
                <MessageSquare className="w-5 h-5 fill-current" />
              </button>
            )}
            {isMember && user.clanRole !== 'founder' && user.clanRole !== 'admin' ? (
              <button
                onClick={() => handleLeave(selectedClan.id)}
                disabled={actionLoading}
                className="w-full py-4 bg-red-50 text-red-500 hover:bg-red-100 font-bold text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {t.leaveBtn}
              </button>
            ) : !user.clanId ? (
              hasPendingRequest ? (
                <button
                  disabled
                  className="w-full py-4 bg-gray-100 text-gray-400 font-bold text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed select-none border border-gray-200"
                >
                  <Clock className="w-4 h-4 text-gray-400 animate-pulse" />
                  {lang === 'es' ? 'Solicitud Pendiente' : lang === 'fr' ? 'Demande en attente' : lang === 'ht' ? 'Demann Ap tann' : 'Request Pending'}
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(selectedClan.id)}
                  disabled={actionLoading}
                  className="w-full py-4 bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90 font-bold text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {t.requestBtn}
                </button>
              )
            ) : null}
          </section>

        </main>

        {/* Member Detail Modal */}
        {viewingMember && (() => {
          const mt = modalTranslations[lang] ?? modalTranslations.es;
          const roleLabel = 
            viewingMember.clanRole === 'founder' ? mt.roleLeader :
            viewingMember.clanRole === 'admin' ? mt.roleAdmin :
            viewingMember.clanRole === 'moderator' ? mt.roleModerator : mt.roleMember;

          const canEditRole = user && (user.clanRole === 'founder' || user.clanRole === 'admin') && canManageMember(user.clanRole, viewingMember.clanRole);

          return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={() => setViewingMember(null)}>
              <div 
                className="w-full max-w-sm bg-white rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-visible relative mt-16"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Floating Avatar placed outside the header so it remains visible while header clips its own corners */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 bg-white rounded-full p-1.5 shadow-md">
                  <UserAvatar
                    photoURL={viewingMember.photoURL}
                    activeFrame={viewingMember.activeFrame}
                    username={viewingMember.username}
                    size={80}
                    animate={false}
                    round={true}
                    hideFrame={true}
                  />
                </div>

                {/* Modal Header with blue gradient, overflow-hidden and matching top border radius */}
                <div className="bg-gradient-to-br from-[#0A84FF] to-blue-700 p-6 pt-14 pb-8 text-center relative rounded-t-3xl overflow-hidden">
                  
                  {/* Close Button */}
                  <button 
                    onClick={() => setViewingMember(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-30"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Profile Header Info */}
                  <h3 className="text-lg font-bold text-white leading-tight mt-1">{viewingMember.fullName || viewingMember.username}</h3>
                  <p className="text-white/80 text-xs mt-0.5">@{viewingMember.username}</p>
                  
                  {/* Role Badge and Edit Action inside header */}
                  <div className="flex flex-col items-center mt-3 min-h-[44px] justify-center">
                    {!isEditingRole ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/10">
                          {roleLabel}
                        </span>
                        {canEditRole && (
                          <button
                            onClick={() => setIsEditingRole(true)}
                            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-90"
                            title={mt.changeRole}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 bg-black/15 p-3 rounded-2xl border border-white/10 w-full animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-[10px] font-bold text-white/85 uppercase tracking-wider">
                          {mt.selectNewRole}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          {getRoleOptions(viewingMember.clanRole).map((opt) => (
                            <button
                              key={opt.role}
                              onClick={() => handleUpdateRole(viewingMember.uid, opt.role)}
                              disabled={updatingRole}
                              className="px-3 py-1 bg-white hover:bg-white/90 text-[#0A84FF] disabled:opacity-50 text-[11px] font-bold rounded-full shadow-sm transition-all active:scale-95"
                            >
                              {opt.label}
                            </button>
                          ))}
                          <button
                            onClick={() => setIsEditingRole(false)}
                            className="px-3 py-1 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[11px] font-bold rounded-full transition-all active:scale-95"
                          >
                            {mt.cancel}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6">
                  {/* Stats Grid - Redesigned Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-[18px] flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{mt.level}</span>
                      <span className="text-xl font-black text-[#0A84FF] mt-0.5">{viewingMember.level || 1}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-[18px] flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{mt.xp}</span>
                      <span className="text-xl font-black text-[#0F172A] mt-0.5">{(viewingMember.xp || 0).toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-[18px] flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{mt.coins}</span>
                      <span className="text-lg font-black text-amber-500 mt-0.5">{(viewingMember.coins || 0).toLocaleString()} 🪙</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-[18px] flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{mt.crowns}</span>
                      <span className="text-lg font-black text-yellow-600 mt-0.5">{(viewingMember.crowns || 0).toLocaleString()} 👑</span>
                    </div>
                  </div>

                  {/* Close button at the bottom */}
                  <div>
                    <button
                      onClick={() => setViewingMember(null)}
                      className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-[#0F172A] rounded-[18px] text-sm font-bold transition-all"
                    >
                      {mt.close}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
        {/* Clan Chat Overlay Pop-up Modal */}
        {isChatOpen && selectedClan && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsChatOpen(false)}>
            <div 
              className="w-full max-w-2xl bg-white h-[88vh] max-h-[850px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
              style={{ borderRadius: '48px', overflow: 'hidden', transform: 'translate3d(0, 0, 0)', isolation: 'isolate' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ChatRoom 
                chatId={`clan_${selectedClan.id}`} 
                onBack={() => setIsChatOpen(false)} 
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: Explorer list
  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen font-sans">
      
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <div className="flex items-center gap-4">
          <BackButton href="/" />
        </div>
        <h1 className="font-bold text-lg text-[#0F172A]">{t.explorerTitle}</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-xl mx-auto space-y-6 pb-20">
        
        {/* Search bar */}
        <section className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/[0.05] rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] shadow-sm transition-colors"
          />
        </section>

        {/* Clans list */}
        <section className="space-y-3">
          {loadingClans ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
            </div>
          ) : filteredClans.length === 0 ? (
            <div className="bg-white rounded-[24px] p-8 text-center border border-black/[0.03] shadow-sm">
              <Users className="w-10 h-10 text-[#64748B]/30 mx-auto mb-3" />
              <p className="text-sm text-[#64748B] font-medium">{t.noClans}</p>
            </div>
          ) : (
            filteredClans.map((clan) => {
              const fruitObj = SPIRIT_FRUITS.find(f => f.id === clan.icon) || SPIRIT_FRUITS[0];
              return (
                <div 
                  key={clan.id} 
                  onClick={() => {
                    setSelectedClan(clan);
                    loadClanMembers(clan.id);
                  }}
                  className="bg-white rounded-[24px] p-5 border border-black/[0.03] shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50/50 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border border-black/[0.03] bg-gray-50">
                      <img src={fruitObj.imageUrl} className="w-full h-full object-cover" alt={clan.name} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[16px] text-[#0F172A] leading-tight">{clan.name}</h3>
                      <p className="text-[12px] text-[#64748B] mt-1 line-clamp-1 italic">&quot;{clan.motto}&quot;</p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-[#64748B] flex-wrap">
                        <span className="text-[#0A84FF] font-black mr-1 bg-[#0A84FF]/5 px-2 py-0.5 rounded-md">
                          {t.creator}: {clan.creatorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {clan.membersCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" />
                          {clan.points}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sword className="w-3.5 h-3.5" />
                          {clan.power ?? 0}
                        </span>
                      </div>

                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#64748B]" />
                </div>
              );
            })
          )}
        </section>

      </main>

    </div>
  );
}
