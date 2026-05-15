'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Plus, Settings, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { db, functions, auth } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { TournamentRepository } from '@/lib/tournament/repository';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [rewardType, setRewardType] = useState('shield');
  const [numRounds, setNumRounds] = useState('3');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(list);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMaxParticipants('100');
    setRewardType('shield');
    setNumRounds('3');
    setStartDate('');
    setEndDate('');
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (t: any) => {
    setTitle(t.title);
    setMaxParticipants(t.maxParticipants.toString());
    setRewardType(t.reward?.iconType || 'shield');
    setNumRounds(t.numRounds || '3'); // Note: numRounds might not be in the doc directly if not saved
    
    // Simple date extraction from dateRange "YYYY-MM-DD - YYYY-MM-DD"
    if (t.dateRange && t.dateRange.includes(' - ')) {
      const [start, end] = t.dateRange.split(' - ');
      setStartDate(start);
      setEndDate(end);
    }
    
    setEditingId(t.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Debes iniciar sesión como Admin primero");
      return;
    }
    
    setCreating(true);
    try {
      if (editingId) {
        // Update existing
        await TournamentRepository.updateTournament(editingId, {
          title,
          maxParticipants: parseInt(maxParticipants),
          dateRange: `${startDate} - ${endDate}`,
          // Update reward if type changed
          reward: getRewardData(rewardType)
        });
      } else {
        // Create new
        const createFn = httpsCallable(functions, 'createTournamentWithRounds');
        await createFn({
          title,
          maxParticipants: parseInt(maxParticipants),
          rewardType,
          numRounds: parseInt(numRounds),
          dateRange: `${startDate} - ${endDate}`
        });
      }
      setShowModal(false);
      fetchTournaments(); // Refresh list
    } catch (error: any) {
      alert("Error al guardar torneo: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const getRewardData = (type: string) => {
    switch (type) {
      case 'shield': return { name: "Escudo Sagrado", iconType: "shield", imageUrl: "https://cdn-icons-png.flaticon.com/512/825/825590.png" };
      case 'coin': return { name: "Moneda de Gracia", iconType: "coin", imageUrl: "https://cdn-icons-png.flaticon.com/512/2855/2855682.png" };
      case 'crown': return { name: "Corona de Fe", iconType: "crown", imageUrl: "https://cdn-icons-png.flaticon.com/512/1000/1000858.png" };
      default: return { name: "Special Reward", iconType: "medal", imageUrl: "" };
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este torneo? Esta acción no se puede deshacer.")) return;
    
    try {
      await TournamentRepository.deleteTournament(id);
      fetchTournaments();
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="bg-[#f5f3f7] min-h-screen font-sans selection:bg-[#eddcff]">
      {/* TopNavBar Shell (Simplified for tournaments page) */}
      <header className="bg-[#faf9fc]/80 backdrop-blur-2xl flex items-center gap-6 px-10 py-5 sticky top-0 z-40 border-b border-[#1b1b1e]/5">
        <Link href="/admin/dashboard" className="p-2 bg-white rounded-full hover:bg-[#310065]/5 transition">
          <ArrowLeft className="w-5 h-5 text-[#310065]" />
        </Link>
        <h2 className="font-serif text-[22px] font-black text-[#310065] tracking-tight">Gestión de Torneos</h2>
      </header>

      <main className="px-10 mt-10 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-[32px] font-serif font-black text-[#310065] leading-none mb-2">Arena Master</h3>
            <p className="text-[#4a4452] font-medium text-[15px]">Crea y administra los torneos globales de la aplicación.</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-[#310065] to-[#4a148c] text-white px-6 py-3 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_rgba(49,0,101,0.25)] hover:shadow-[0_6px_20px_rgba(49,0,101,0.3)] transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Lanzar Nuevo Torneo
          </button>
        </div>

        {/* Tournaments List */}
        <div className="bg-white rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#7c7483] font-bold">Cargando torneos...</div>
          ) : tournaments.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <Trophy className="w-16 h-16 text-[#e3e2e6] mb-4" strokeWidth={1} />
              <h4 className="text-[20px] font-black text-[#310065]">No hay torneos</h4>
              <p className="text-[#7c7483] mt-2">Crea el primer torneo para habilitar la Arena a los usuarios.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#7c7483] text-[10px] font-bold uppercase tracking-widest bg-[#faf9fc]/50">
                  <th className="px-8 py-4 font-bold">Título</th>
                  <th className="px-8 py-4 font-bold">Fechas</th>
                  <th className="px-8 py-4 font-bold">Inscritos</th>
                  <th className="px-8 py-4 font-bold">Estado</th>
                  <th className="px-8 py-4 font-bold">Premio</th>
                  <th className="px-8 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1b1e]/5 text-[14px]">
                {tournaments.map(t => (
                  <tr key={t.id} className="hover:bg-[#faf9fc] transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-[#1b1b1e]">{t.title}</p>
                      <p className="text-[11px] text-[#7c7483] mt-0.5">ID: {t.id}</p>
                    </td>
                    <td className="px-8 py-5 font-medium text-[#4a4452]">{t.dateRange}</td>
                    <td className="px-8 py-5 font-bold text-[#310065]">{t.currentParticipants} / {t.maxParticipants}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 font-bold rounded-lg text-[11px] uppercase tracking-wider
                        ${t.status === 'active' ? 'bg-[#ecfdf5] text-[#059669]' : 
                          t.status === 'registration_open' ? 'bg-[#e0e7ff] text-[#4338ca]' : 
                          'bg-[#f5f3f7] text-[#7c7483]'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-[#e9c349] max-w-[120px] truncate">
                      {t.reward?.name || "Sin premio"}
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(t)}
                        className="text-[#310065] hover:bg-[#310065]/5 p-2 rounded-full transition-all" 
                        title="Editar Torneo"
                      >
                        <Edit2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all" 
                        title="Eliminar Torneo"
                      >
                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      </button>
                      <button className="text-[#7c7483] hover:bg-[#310065]/5 p-2 rounded-full transition-all" title="Gestionar Rondas">
                        <Settings className="w-[18px] h-[18px]" strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1b1e]/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
            <header className="px-8 py-6 border-b border-[#1b1b1e]/5 flex justify-between items-center bg-[#faf9fc]">
              <h3 className="font-serif font-black text-[22px] text-[#310065]">
                {editingId ? 'Editar Torneo' : 'Nuevo Torneo'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#7c7483] hover:text-[#1b1b1e] font-bold text-xl">&times;</button>
            </header>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="save-tournament" className="space-y-5" onSubmit={handleSave}>
                <div>
                  <label className="block text-[13px] font-bold text-[#1b1b1e] mb-2">Título del Torneo</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Torneo de Reyes III" className="w-full bg-[#f5f3f7] border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-[#310065]/20 outline-none"/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#1b1b1e] mb-2">Fecha Inicio</label>
                    <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#f5f3f7] border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-[#310065]/20 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#1b1b1e] mb-2">Fecha Fin</label>
                    <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#f5f3f7] border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-[#310065]/20 outline-none"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#1b1b1e] mb-2">Cupo Máximo</label>
                    <input type="number" required value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} className="w-full bg-[#f5f3f7] border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-[#310065]/20 outline-none" min="10"/>
                  </div>
                {!editingId && (
                  <div>
                    <label className="block text-[13px] font-bold text-[#1b1b1e] mb-2">Número de Rondas</label>
                    <input type="number" required value={numRounds} onChange={e => setNumRounds(e.target.value)} className="w-full bg-[#f5f3f7] border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-[#310065]/20 outline-none" min="1" max="10"/>
                    <p className="text-[11px] text-[#7c7483] mt-2">Las rondas se generan automáticamente con preguntas aleatorias.</p>
                  </div>
                )}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#1b1b1e] mb-2">Recompensa Principal</label>
                  <select value={rewardType} onChange={e => setRewardType(e.target.value)} className="w-full bg-[#f5f3f7] border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-[#310065]/20 outline-none">
                    <option value="shield">🛡️ Escudo Sagrado</option>
                    <option value="coin">🪙 Moneda de Gracia</option>
                    <option value="crown">👑 Corona de Fe</option>
                  </select>
                </div>
              </form>
            </div>
            
            <footer className="px-8 py-5 border-t border-[#1b1b1e]/5 bg-[#faf9fc] flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-[#4a4452] hover:bg-[#1b1b1e]/5 transition-colors"
                disabled={creating}
              >
                Cancelar
              </button>
              <button 
                form="save-tournament"
                type="submit" 
                className="bg-[#310065] text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#4a148c] active:scale-95 transition-all flex items-center justify-center opacity-100 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear e Iniciar Registro'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
