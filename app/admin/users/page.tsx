'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  Shield, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Loader2,
  Calendar,
  Crown,
  Trash2,
  X,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { listAllUsers, searchUsers, deleteUser, getLevelFromXp } from '@/lib/user/repository';
import { AppUserModel } from '@/lib/user/models';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Selection state
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Bulk delete modal
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkConfirmText, setBulkConfirmText] = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);

  /** LOAD USERS */
  useEffect(() => {
    async function loadData() {
      try {
        const data = await listAllUsers(50);
        setUsers(data);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  /** HANDLE SEARCH */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const results = await searchUsers(searchTerm.trim());
      setUsers(results);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  /** FILTER LOGIC */
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  /** SELECTION HELPERS */
  const toggleSelect = (uid: string) => {
    setSelectedUids(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUids.size === filteredUsers.length) {
      setSelectedUids(new Set());
    } else {
      setSelectedUids(new Set(filteredUsers.map(u => u.uid)));
    }
  };

  const allSelected = filteredUsers.length > 0 && selectedUids.size === filteredUsers.length;
  const someSelected = selectedUids.size > 0;

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedUids(new Set());
  };

  /** BULK DELETE */
  const handleBulkDelete = async () => {
    if (bulkConfirmText !== 'ELIMINAR' || selectedUids.size === 0) return;
    setBulkDeleting(true);
    setDeleteProgress(0);
    const uids = Array.from(selectedUids);
    let done = 0;
    for (const uid of uids) {
      try {
        await deleteUser(uid, hardDelete);
      } catch (err) {
        console.error(`Error deleting ${uid}:`, err);
      }
      done++;
      setDeleteProgress(Math.round((done / uids.length) * 100));
    }
    // Remove deleted users from state
    setUsers(prev => prev.filter(u => !selectedUids.has(u.uid)));
    setSelectedUids(new Set());
    setSelectionMode(false);
    setShowBulkDeleteModal(false);
    setBulkDeleting(false);
    setBulkConfirmText('');
    setHardDelete(false);
  };

  return (
    <AdminGuard>
      <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen font-sans">

        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#310065]/5 px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 -ml-2 rounded-full hover:bg-[#310065]/5 transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#310065]" />
            </Link>
            <h1 className="font-serif font-black text-xl text-[#310065]">Cámaras Reales</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#310065]/5 rounded-full border border-[#310065]/10 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#310065]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#310065]">Admin Mode</span>
          </div>
        </header>

        <main className="pt-24 px-6 max-w-5xl mx-auto space-y-8 pb-32">

          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#310065] text-white p-5 rounded-[2rem] shadow-[0_8px_20px_rgba(49,0,101,0.2)] flex flex-col justify-between h-32">
              <Users className="w-6 h-6 opacity-60" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Scribes</p>
                <p className="text-3xl font-serif font-black">{users.length}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-[#310065]/5 shadow-sm flex flex-col justify-between h-32">
              <Crown className="w-6 h-6 text-[#cba72f]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7c7483]">Activos Semanal</p>
                <p className="text-3xl font-serif font-black text-[#1b1b1e]">12</p>
              </div>
            </div>
          </section>

          {/* Search & Filters */}
          <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#cdc3d4]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por Scribe o Nombre"
                className="w-full pl-12 pr-4 py-4 bg-white border border-[#310065]/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:border-[#310065] transition-all font-medium text-[#1b1b1e]"
              />
            </form>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-[#310065]" />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-4 bg-white border border-[#310065]/10 rounded-2xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#310065]/20 transition-all font-bold text-[#310065] text-[13px] uppercase tracking-widest"
                >
                  <option value="all">Todos los Roles</option>
                  <option value="user">Scribes</option>
                  <option value="super_admin">Guardianes</option>
                  <option value="moderator">Sabios</option>
                </select>
              </div>

              {/* Toggle selection mode */}
              {!selectionMode ? (
                <button
                  onClick={() => setSelectionMode(true)}
                  className="flex items-center gap-2 px-5 py-4 bg-white border border-[#310065]/10 rounded-2xl shadow-sm font-black text-[12px] uppercase tracking-widest text-[#310065] hover:bg-[#310065]/5 transition-colors whitespace-nowrap"
                >
                  <CheckSquare className="w-4 h-4" />
                  Seleccionar
                </button>
              ) : (
                <button
                  onClick={exitSelection}
                  className="flex items-center gap-2 px-5 py-4 bg-[#310065]/10 border border-[#310065]/20 rounded-2xl font-black text-[12px] uppercase tracking-widest text-[#310065] hover:bg-[#310065]/20 transition-colors whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>
          </section>

          {/* Bulk Action Bar — appears when items are selected */}
          {selectionMode && someSelected && (
            <div className="flex items-center justify-between bg-[#ba1a1a] text-white px-6 py-4 rounded-2xl shadow-[0_8px_24px_rgba(186,26,26,0.3)] animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-black text-[15px]">
                  {selectedUids.size}
                </div>
                <span className="font-black text-[13px] uppercase tracking-widest">
                  {selectedUids.size === 1 ? 'Scribe seleccionado' : 'Scribes seleccionados'}
                </span>
              </div>
              <button
                onClick={() => { setShowBulkDeleteModal(true); setBulkConfirmText(''); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#ba1a1a] rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#ffdad6] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar seleccionados
              </button>
            </div>
          )}

          {/* User List Table */}
          <section className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgba(49,0,101,0.02)] border border-[#310065]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f3f7] border-b border-[#310065]/10">
                  <tr>
                    {/* Select-all checkbox column */}
                    {selectionMode && (
                      <th className="pl-6 py-5 w-10">
                        <button onClick={toggleSelectAll} className="text-[#310065]">
                          {allSelected
                            ? <CheckSquare className="w-5 h-5" />
                            : <Square className="w-5 h-5 opacity-40" />
                          }
                        </button>
                      </th>
                    )}
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Identidad</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Rango & Nivel</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Estado</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Última Sesión</th>
                    <th className="px-6 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#310065]/5">
                  {loading ? (
                    <tr>
                      <td colSpan={selectionMode ? 6 : 5} className="px-6 py-20 text-center">
                        <Loader2 className="w-10 h-10 text-[#310065] animate-spin mx-auto mb-4" />
                        <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">Consultando Edictos...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={selectionMode ? 6 : 5} className="px-6 py-20 text-center">
                        <User className="w-12 h-12 text-[#cdc3d4] mx-auto mb-4 opacity-50" />
                        <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">No se hallaron Scribes</p>
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => {
                    const isSelected = selectedUids.has(u.uid);
                    return (
                      <tr
                        key={u.uid}
                        onClick={selectionMode ? () => toggleSelect(u.uid) : undefined}
                        className={`transition-colors group ${selectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-[#ffdad6]/30' : 'hover:bg-[#f5f3f7]'}`}
                      >
                        {/* Row checkbox */}
                        {selectionMode && (
                          <td className="pl-6 py-5">
                            <span className="text-[#ba1a1a]">
                              {isSelected
                                ? <CheckSquare className="w-5 h-5" />
                                : <Square className="w-5 h-5 opacity-30" />
                              }
                            </span>
                          </td>
                        )}

                        {/* Identity */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 bg-[#f5f3f7] rounded-full flex items-center justify-center border-2 overflow-hidden flex-shrink-0 transition-all duration-300 ${isSelected ? 'border-[#ba1a1a]/40 scale-105' : 'border-white shadow-sm group-hover:border-[#310065]/20 group-hover:scale-110'}`}>
                              {u.photoURL ? (
                                <Image src={u.photoURL} alt={u.fullName} width={44} height={44} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-[#310065]/30" />
                              )}
                            </div>
                            <div>
                              <p className="font-serif font-black text-[#1b1b1e] text-[16px] leading-tight mb-0.5">{u.fullName}</p>
                              <p className="text-[11px] font-bold text-[#7c7483] uppercase tracking-wider">@{u.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${u.role === 'super_admin' ? 'bg-[#310065]/10 text-[#310065]' : 'bg-[#f5f3f7] text-[#4a4452]'}`}>
                              {u.role === 'super_admin' ? <Shield className="w-4 h-4" strokeWidth={2.5} /> : <User className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-[13px] font-black text-[#1b1b1e]">Nivel {getLevelFromXp(u.xp)}</p>
                              <p className="text-[11px] font-bold text-[#7c7483] uppercase tracking-widest">{(u.role || 'user').replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${u.status === 'active' ? 'bg-emerald-50 border-emerald-100' : u.status === 'suspended' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                            <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : u.status === 'suspended' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-[#065f46]' : u.status === 'suspended' ? 'text-amber-700' : 'text-red-700'}`}>{u.status}</span>
                          </div>
                        </td>

                        {/* Last login */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2.5 text-[#7c7483]">
                            <Calendar className="w-4 h-4" />
                            <p className="text-[13px] font-medium">{new Date(u.lastLoginAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-right">
                          {!selectionMode && (
                            <Link
                              href={`/admin/users/${u.uid}`}
                              className="inline-flex items-center gap-2 text-[#310065] font-black text-[11px] uppercase tracking-widest px-4 py-2 bg-[#310065]/5 rounded-xl hover:bg-[#310065] hover:text-white transition-all transform active:scale-95 group-hover:shadow-[0_4px_12px_rgba(49,0,101,0.15)] shadow-sm"
                            >
                              Detalle
                              <ChevronRight className="w-4 h-4" strokeWidth={3} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>

      {/* ── BULK DELETE MODAL ── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">

            {/* Icon + close */}
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 bg-[#ffdad6] rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-[#ba1a1a]" />
              </div>
              <button onClick={() => setShowBulkDeleteModal(false)} className="p-2 rounded-full hover:bg-[#f5f3f7] transition-colors">
                <X className="w-5 h-5 text-[#4a4452]" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h3 className="font-serif text-2xl font-black text-[#1b1b1e] mb-2">
                ¿Eliminar {selectedUids.size} {selectedUids.size === 1 ? 'Scribe' : 'Scribes'}?
              </h3>
              <p className="text-[14px] text-[#4a4452] leading-relaxed">
                Esta acción afectará a <span className="font-black text-[#ba1a1a]">{selectedUids.size}</span> cuenta{selectedUids.size !== 1 ? 's' : ''}. Revisa bien antes de continuar.
              </p>
            </div>

            {/* Users preview */}
            <div className="bg-[#fff0f0] rounded-2xl p-4 max-h-36 overflow-y-auto space-y-2">
              {filteredUsers.filter(u => selectedUids.has(u.uid)).map(u => (
                <div key={u.uid} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#ba1a1a]/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {u.photoURL
                      ? <Image src={u.photoURL} alt={u.fullName} width={28} height={28} className="w-full h-full object-cover" />
                      : <User className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    }
                  </div>
                  <span className="text-[13px] font-bold text-[#1b1b1e] truncate">{u.fullName}</span>
                  <span className="text-[11px] text-[#7c7483] truncate">@{u.username}</span>
                </div>
              ))}
            </div>

            {/* Hard delete toggle */}
            <div className="bg-[#f5f3f7] rounded-2xl p-4 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hardDelete}
                  onChange={(e) => setHardDelete(e.target.checked)}
                  className="w-4 h-4 accent-[#ba1a1a]"
                />
                <span className="text-[13px] font-bold text-[#1b1b1e]">Borrado permanente (Firestore)</span>
              </label>
              <p className="text-[11px] text-[#7c7483] pl-7">Sin marcar: cambia status a &quot;deleted&quot; (recomendado)</p>
            </div>

            {/* Confirm input */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1b1b1e]">
                Escribe <span className="text-[#ba1a1a] font-black">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text"
                value={bulkConfirmText}
                onChange={(e) => setBulkConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                disabled={bulkDeleting}
                className="w-full p-4 bg-[#fff0f0] border-2 border-[#ba1a1a]/20 rounded-2xl focus:outline-none focus:border-[#ba1a1a] font-black text-[#ba1a1a] tracking-widest placeholder:font-normal placeholder:text-[#ba1a1a]/30 placeholder:tracking-normal disabled:opacity-50"
              />
            </div>

            {/* Progress bar (visible while deleting) */}
            {bulkDeleting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px] font-bold text-[#4a4452]">
                  <span>Eliminando...</span>
                  <span>{deleteProgress}%</span>
                </div>
                <div className="h-2 bg-[#f5f3f7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ba1a1a] rounded-full transition-all duration-300"
                    style={{ width: `${deleteProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="flex-1 py-4 bg-[#f5f3f7] text-[#1b1b1e] rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-[#e3e2e6] transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkConfirmText !== 'ELIMINAR' || bulkDeleting}
                className="flex-1 py-4 bg-[#ba1a1a] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-[#93000a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {bulkDeleting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                {bulkDeleting ? `${deleteProgress}%` : `Eliminar ${selectedUids.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminGuard>
  );
}
