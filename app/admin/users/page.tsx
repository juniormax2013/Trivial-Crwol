'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  MoreVertical, 
  Shield, 
  User, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
  Crown
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { listAllUsers, searchUsers } from '@/lib/user/repository';
import { AppUserModel } from '@/lib/user/models';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  /**
   * LOAD USERS
   */
  useEffect(() => {
    async function loadData() {
      try {
        const data = await listAllUsers(50);
        setUsers(data);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  /**
   * HANDLE SEARCH
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const results = await searchUsers(searchTerm.trim());
      setUsers(results);
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * FILTER LOGIC (Client-side for now)
   */
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
          
          {/* Dashboard Stats (Admin Preview) */}
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
              <div className="relative group flex-1 md:flex-none">
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
            </div>
          </section>

          {/* User List Table */}
          <section className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgba(49,0,101,0.02)] border border-[#310065]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f3f7] border-b border-[#310065]/10">
                  <tr>
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
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <Loader2 className="w-10 h-10 text-[#310065] animate-spin mx-auto mb-4" />
                        <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">Consultando Edictos...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <User className="w-12 h-12 text-[#cdc3d4] mx-auto mb-4 opacity-50" />
                        <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">No se hallaron Scribes</p>
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-[#f5f3f7] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-[#f5f3f7] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden flex-shrink-0 group-hover:border-[#310065]/20 group-hover:scale-110 transition-all duration-300">
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
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${u.role === 'super_admin' ? 'bg-[#310065]/10 text-[#310065]' : 'bg-[#f5f3f7] text-[#4a4452]'}`}>
                            {u.role === 'super_admin' ? <Shield className="w-4 h-4 shadow-sm" strokeWidth={2.5} /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-[#1b1b1e]">Nivel {u.level || 1}</p>
                            <p className="text-[11px] font-bold text-[#7c7483] uppercase tracking-widest">{(u.role || 'user').replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#065f46]">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5 text-[#7c7483]">
                          <Calendar className="w-4 h-4" />
                          <p className="text-[13px] font-medium">{new Date(u.lastLoginAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/admin/users/${u.uid}`} className="inline-flex items-center gap-2 text-[#310065] font-black text-[11px] uppercase tracking-widest px-4 py-2 bg-[#310065]/5 rounded-xl hover:bg-[#310065] hover:text-white transition-all transform active:scale-95 group-hover:shadow-[0_4px_12px_rgba(49,0,101,0.15)] shadow-sm">
                          Detalle
                          <ChevronRight className="w-4 h-4" strokeWidth={3} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </AdminGuard>
  );
}
