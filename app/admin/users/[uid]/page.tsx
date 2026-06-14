'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Shield, 
  ShieldAlert, 
  Coins, 
  Trophy, 
  Ban, 
  CheckCircle2, 
  Mail, 
  AtSign, 
  Calendar, 
  BarChart2, 
  Loader2, 
  User as UserIcon,
  Crown as CrownIcon,
  Zap,
  Target,
  Clock,
  AlertCircle,
  Swords,
  Trash2,
  X
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { getUser, updateUser, deleteUser, getLevelFromXp } from '@/lib/user/repository';
import { AppUserModel, UserRole, UserStatus } from '@/lib/user/models';

export default function AdminUserDetailPage() {
  const { uid } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AppUserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);
  
  // Custom amounts for rewards
  const [customCrowns, setCustomCrowns] = useState<string>('');
  const [customCoins, setCustomCoins] = useState<string>('');

  /**
   * LOAD USER DATA
   */
  useEffect(() => {
    async function loadData() {
      if (!uid) return;
      try {
        const data = await getUser(uid as string);
        setUser(data);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [uid]);

  /**
   * HANDLE UPDATE
   */
  const handleUpdate = async (fields: Partial<AppUserModel>) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUser(user.uid, fields);
      setUser({ ...user, ...fields });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating user:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * HANDLE TOGGLE ACCESS OVERRIDE
   */
  const handleToggleAccess = async (key: 'allies' | 'dailyChallenge' | 'bibleJourney' | 'sacredChallenge') => {
    if (!user) return;
    const currentAccess = user.customAccess || {};
    const newAccess = {
      ...currentAccess,
      [key]: !currentAccess[key]
    };
    await handleUpdate({ customAccess: newAccess });
  };

  /**
   * HANDLE DELETE
   */
  const handleDelete = async () => {
    if (!user || deleteConfirmText !== 'ELIMINAR') return;
    setDeleting(true);
    try {
      await deleteUser(user.uid, hardDelete);
      router.push('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#310065] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-[#ba1a1a]" />
        <h2 className="font-serif text-2xl font-black text-[#1b1b1e]">Scribe No Encontrado</h2>
        <Link href="/admin/users" className="px-6 py-3 bg-[#310065] text-white rounded-2xl font-bold">Volver a la Lista</Link>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen font-sans">
        
        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#310065]/5 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="p-2 -ml-2 rounded-full hover:bg-[#310065]/5 transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#310065]" />
            </Link>
            <h1 className="font-serif font-black text-xl text-[#310065]">Bitácora Real</h1>
          </div>
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full animate-in fade-in slide-in-from-top-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[12px] font-black uppercase tracking-widest">Edictos Actualizados</span>
            </div>
          )}
        </header>

        <main className="pt-24 px-6 max-w-4xl mx-auto space-y-10 pb-40">
          
          {/* Identity Header Card */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(49,0,101,0.03)] border border-[#310065]/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#310065]/5 rounded-full blur-[40px] -mr-20 -mt-20 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10 relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#f5f3f7] border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt={user.fullName} width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-[#cdc3d4]" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="font-serif text-[32px] font-black text-[#1b1b1e] tracking-tight">{user.fullName}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    <div className="flex items-center gap-2 text-[#7c7483] font-bold text-[13px]">
                      <AtSign className="w-4 h-4" />
                      <span>{user.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#7c7483] font-bold text-[13px]">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-4 py-1.5 bg-[#4a148c] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">Nivel {getLevelFromXp(user.xp)}</span>
                  <span className="px-4 py-1.5 bg-[#f5f3f7] text-[#310065] rounded-full font-black text-[10px] uppercase tracking-widest border border-[#310065]/10">{user.role.replace('_', ' ')}</span>
                  <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{user.status}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-[#f5f3f7] p-6 rounded-[2rem] space-y-2 border border-[#310065]/5">
              <div className="flex items-center justify-between">
                <CrownIcon className="w-5 h-5 text-[#cba72f]" />
                <span className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest">Crowns</span>
              </div>
              <p className="font-serif text-3xl font-black">{user.crowns.toLocaleString()}</p>
            </div>
            <div className="bg-[#f5f3f7] p-6 rounded-[2rem] space-y-2 border border-[#310065]/5">
              <div className="flex items-center justify-between">
                <Coins className="w-5 h-5 text-[#f59e0b]" />
                <span className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest">Coins</span>
              </div>
              <p className="font-serif text-3xl font-black">{(user.coins || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#f5f3f7] p-6 rounded-[2rem] space-y-2 border border-[#310065]/5">
              <div className="flex items-center justify-between">
                <Zap className="w-5 h-5 text-[#4a148c]" />
                <span className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest">XP Total</span>
              </div>
              <p className="font-serif text-3xl font-black">{user.xp.toLocaleString()}</p>
            </div>
            <div className="bg-[#f5f3f7] p-6 rounded-[2rem] space-y-2 border border-[#310065]/5">
              <div className="flex items-center justify-between">
                <Target className="w-5 h-5 text-[#310065]" />
                <span className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest">Precisión</span>
              </div>
              <p className="font-serif text-3xl font-black">{Math.round(user.accuracyRate || 0)}%</p>
            </div>
            <div className="bg-[#f5f3f7] p-6 rounded-[2rem] space-y-2 border border-[#310065]/5">
              <div className="flex items-center justify-between">
                <Clock className="w-5 h-5 text-[#735c00]" />
                <span className="text-[10px] font-black text-[#7c7483] uppercase tracking-widest">Racha</span>
              </div>
              <p className="font-serif text-3xl font-black">{user.streakDays}d</p>
            </div>
          </section>

          {/* Detailed Statistics Table */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#310065]/5">
             <h3 className="font-serif text-2xl font-black text-[#310065] mb-6 flex items-center gap-3">
               <BarChart2 className="w-6 h-6" />
               Rendimiento del Scribe
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  { label: "Partidas Jugadas", value: user.totalGames, icon: Swords },
                  { label: "Victorias Reales", value: user.totalWins, icon: Trophy },
                  { label: "Derrotas", value: user.totalLosses, icon: ShieldAlert },
                  { label: "Respuestas Correctas", value: user.totalCorrectAnswers, icon: CheckCircle2 },
                  { label: "Mejor Racha Histórica", value: `${user.bestStreak} días`, icon: Zap },
                  { label: "Fecha de Registro", value: new Date(user.createdAt).toLocaleDateString(), icon: Calendar }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[#310065]/5 last:border-0 hover:bg-[#faf9fc] px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#310065]/5 rounded-lg">
                        <stat.icon className="w-4 h-4 text-[#310065]" />
                      </div>
                      <span className="text-[14px] font-medium text-[#4a4452]">{stat.label}</span>
                    </div>
                    <span className="font-black text-[#1b1b1e] text-[15px]">{stat.value}</span>
                  </div>
                ))}
             </div>
          </section>

          {/* Admin Management Panel */}
          <section className="space-y-6">
            <h3 className="font-serif text-2xl font-black text-[#ba1a1a] flex items-center gap-3 px-2">
              <ShieldAlert className="w-7 h-7" />
              Tribunal Real
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Role & Status Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#310065]/5 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7c7483] opacity-60">Rango & Estado</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#1b1b1e]">Cambiar Rango</label>
                    <select 
                      value={user.role}
                      onChange={(e) => handleUpdate({ role: e.target.value as UserRole })}
                      className="w-full p-4 bg-[#f5f3f7] rounded-2xl border-0 focus:ring-2 focus:ring-[#310065]/20 font-bold text-[14px] text-[#310065]"
                    >
                      <option value="user">Scribe (Usuario)</option>
                      <option value="editor">Secretario (Editor)</option>
                      <option value="moderator">Sabio (Moderador)</option>
                      <option value="super_admin">Guardián (Admin)</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[15px] text-[#1b1b1e]">Acceso al Reino</p>
                      <p className="text-xs text-[#7c7483]">Suspende o reactiva la cuenta.</p>
                    </div>
                    <button 
                      onClick={() => handleUpdate({ status: user.status === 'active' ? 'suspended' : 'active' })}
                      className={`px-6 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all ${user.status === 'active' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-emerald-500 text-white'}`}
                    >
                      {user.status === 'active' ? 'Suspender' : 'Reactivar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reward Actions */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#310065]/5 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7c7483] opacity-60">Favores Reales (Economía)</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CrownIcon className="w-5 h-5 text-[#cba72f]" />
                      </div>
                      <input 
                        type="number" 
                        value={customCrowns}
                        onChange={(e) => setCustomCrowns(e.target.value)}
                        placeholder="Cantidad de Coronas"
                        className="w-full pl-12 pr-4 py-3 bg-[#f5f3f7] rounded-xl border-0 focus:ring-2 focus:ring-[#cba72f]/50 font-bold text-[#1b1b1e]"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const val = parseInt(customCrowns);
                        if (!isNaN(val) && val !== 0) {
                          handleUpdate({ crowns: Math.max(0, user.crowns + val) });
                          setCustomCrowns('');
                        }
                      }}
                      disabled={!customCrowns || isNaN(parseInt(customCrowns))}
                      className="px-6 py-3 bg-[#cba72f] text-white rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#b08d24] transition-colors disabled:opacity-50"
                    >
                      Añadir
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Coins className="w-5 h-5 text-[#f59e0b]" />
                      </div>
                      <input 
                        type="number" 
                        value={customCoins}
                        onChange={(e) => setCustomCoins(e.target.value)}
                        placeholder="Cantidad de Monedas"
                        className="w-full pl-12 pr-4 py-3 bg-[#f5f3f7] rounded-xl border-0 focus:ring-2 focus:ring-[#f59e0b]/50 font-bold text-[#1b1b1e]"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const val = parseInt(customCoins);
                        if (!isNaN(val) && val !== 0) {
                          handleUpdate({ coins: Math.max(0, (user.coins || 0) + val) });
                          setCustomCoins('');
                        }
                      }}
                      disabled={!customCoins || isNaN(parseInt(customCoins))}
                      className="px-6 py-3 bg-[#f59e0b] text-white rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#d97706] transition-colors disabled:opacity-50"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#735c00]/5 rounded-2xl flex items-center gap-3 border border-[#735c00]/10">
                   <ShieldAlert className="w-5 h-5 text-[#735c00]" />
                   <p className="text-[12px] font-medium text-[#735c00]">Puedes usar valores negativos para deducir recursos.</p>
                </div>
              </div>

              {/* Special Game Access Overrides Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#310065]/5 space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#7c7483] opacity-60">Privilegios de Acceso (Bypass)</h4>
                
                <div className="space-y-4">
                  {[
                    { key: 'allies' as const, label: 'Acceso a Aliados', desc: 'Evita requerir nivel 10' },
                    { key: 'dailyChallenge' as const, label: 'Desafío Diario', desc: 'Evita requerir nivel 1' },
                    { key: 'bibleJourney' as const, label: 'Jugar a la Biblia', desc: 'Evita requerir nivel 3' },
                    { key: 'sacredChallenge' as const, label: 'Reto Sagrado', desc: 'Evita requerir nivel 5' }
                  ].map((mode) => (
                    <div key={mode.key} className="flex items-center justify-between py-2 border-b border-[#310065]/5 last:border-0">
                      <div>
                        <p className="font-bold text-[14px] text-[#1b1b1e]">{mode.label}</p>
                        <p className="text-xs text-[#7c7483]">{mode.desc}</p>
                      </div>
                      <button
                        onClick={() => handleToggleAccess(mode.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          user.customAccess?.[mode.key] ? 'bg-[#0A84FF]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            user.customAccess?.[mode.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="space-y-4">
            <h3 className="font-serif text-2xl font-black text-[#ba1a1a] flex items-center gap-3 px-2">
              <Trash2 className="w-7 h-7" />
              Zona de Peligro
            </h3>
            <div className="bg-[#fff0f0] border border-[#ba1a1a]/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="font-black text-[#ba1a1a] text-[16px] mb-1">Eliminar cuenta de Scribe</p>
                <p className="text-[13px] text-[#ba1a1a]/70 font-medium">Esta acción borrará los datos del usuario. Usa con precaución.</p>
              </div>
              <button
                onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); }}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-[#ba1a1a] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-[#93000a] transition-colors shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Usuario
              </button>
            </div>
          </section>

        </main>

        {/* Global Action Loader Overlay */}
        {saving && (
          <div className="fixed inset-0 bg-[#310065]/10 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-[#310065] animate-spin" />
              <p className="font-serif font-black text-[#310065] uppercase tracking-widest text-xs">Sellando Edictos...</p>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 bg-[#ffdad6] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-7 h-7 text-[#ba1a1a]" />
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-full hover:bg-[#f5f3f7] transition-colors">
                  <X className="w-5 h-5 text-[#4a4452]" />
                </button>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-black text-[#1b1b1e] mb-2">¿Eliminar este Scribe?</h3>
                <p className="text-[14px] text-[#4a4452] leading-relaxed">
                  Estás a punto de eliminar la cuenta de <span className="font-black text-[#1b1b1e]">{user?.fullName}</span>. Esta acción no se puede deshacer fácilmente.
                </p>
              </div>

              <div className="bg-[#f5f3f7] rounded-2xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hardDelete}
                    onChange={(e) => setHardDelete(e.target.checked)}
                    className="w-4 h-4 accent-[#ba1a1a]"
                  />
                  <span className="text-[13px] font-bold text-[#1b1b1e]">Borrado permanente (elimina el documento de Firestore)</span>
                </label>
                <p className="text-[11px] text-[#7c7483] pl-7">Sin marcar: cambia status a &quot;deleted&quot; (recomendado)</p>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1b1b1e]">Escribe <span className="text-[#ba1a1a] font-black">ELIMINAR</span> para confirmar</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full p-4 bg-[#fff0f0] border-2 border-[#ba1a1a]/20 rounded-2xl focus:outline-none focus:border-[#ba1a1a] font-black text-[#ba1a1a] tracking-widest placeholder:font-normal placeholder:text-[#ba1a1a]/30 placeholder:tracking-normal"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-[#f5f3f7] text-[#1b1b1e] rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-[#e3e2e6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'ELIMINAR' || deleting}
                  className="flex-1 py-4 bg-[#ba1a1a] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-[#93000a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
