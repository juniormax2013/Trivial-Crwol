'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Loader2,
  BookOpen,
  Scroll,
  Cross,
  Crown,
  Flame,
  Heart,
  Sword,
  Shield,
  Anchor,
  Music,
  Mountain,
  Star,
  Droplets,
  ChevronRight
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { getCategories, saveCategory, deleteCategory, seedCategoriesFromStatic, recalculateAllCategoryCounts } from '@/lib/category/repository';
import { CategoryModel, BIBLICAL_ICONS } from '@/lib/category/models';
import { DUEL_CATEGORIES } from '@/lib/duel/seed';

const ICON_MAP: Record<string, any> = {
  'book-open': BookOpen,
  'scroll': Scroll,
  'cross': Cross,
  'crown': Crown,
  'flame': Flame,
  'heart': Heart,
  'sword': Sword,
  'shield': Shield,
  'anchor': Anchor,
  'music': Music,
  'mountain': Mountain,
  'star': Star,
  'droplets': Droplets
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryModel> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: 'book-open',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (cat?: CategoryModel) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon || 'book-open',
        isActive: cat.isActive,
        order: cat.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        id: '',
        name: '',
        description: '',
        icon: 'book-open',
        isActive: true,
        order: categories.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Slugify name if new
      const id = formData.id || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await saveCategory({
        ...formData,
        id,
        slug: id,
        questionCount: editingCategory?.questionCount || 0
      } as any);
      
      await loadCategories();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Error al guardar la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Esto no eliminará las preguntas, pero quedarán huérfanas.')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleSeedCategories = async () => {
    setIsSeeding(true);
    try {
      await seedCategoriesFromStatic(DUEL_CATEGORIES);
      alert("Categorías base importadas correctamente.");
      await loadCategories();
    } catch (err) {
      console.error("Error seeding categories:", err);
      alert("Error al importar categorías.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRefreshCounts = async () => {
    setIsSyncing(true);
    try {
      const { updated } = await recalculateAllCategoryCounts();
      alert(`Conteos actualizados en ${updated} categorías.`);
      await loadCategories();
    } catch (err) {
      console.error("Error syncing counts:", err);
      alert("Error al sincronizar conteos.");
    } finally {
      setIsSyncing(false);
    }
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
            <h1 className="font-serif font-black text-xl text-[#310065]">Categorías del Reino</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefreshCounts}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-[12px] text-[#310065] bg-[#310065]/5 hover:bg-[#310065]/10 active:scale-95 transition-all uppercase tracking-widest"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Refrescar Conteos
            </button>
            <button 
              onClick={handleSeedCategories}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-[12px] text-[#310065] bg-[#310065]/5 hover:bg-[#310065]/10 active:scale-95 transition-all uppercase tracking-widest"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Sincronizar Base
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#310065] text-white px-5 py-2.5 rounded-full font-bold text-[13px] hover:shadow-[0_4px_12px_rgba(49,0,101,0.2)] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>
        </header>

        <main className="pt-24 px-6 max-w-6xl mx-auto pb-32">
          
          {/* Categories Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-[#310065] animate-spin mb-4" />
              <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">Consultando Edictos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const IconComp = ICON_MAP[cat.icon] || BookOpen;
                return (
                  <div key={cat.id} className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgba(49,0,101,0.02)] border border-[#310065]/5 flex flex-col group hover:shadow-[0_12px_40px_rgba(49,0,101,0.06)] transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-[#310065]/5 rounded-2xl flex items-center justify-center text-[#310065] group-hover:scale-110 transition-transform duration-300 shadow-sm border border-[#310065]/10">
                        <IconComp className="w-7 h-7" strokeWidth={2} />
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 rounded-xl hover:bg-[#310065]/5 text-[#7c7483] hover:text-[#310065] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-[#7c7483] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-serif font-black text-xl text-[#1b1b1e]">{cat.name}</h3>
                        {!cat.isActive && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase rounded-full">Inactiva</span>
                        )}
                      </div>
                      <p className="text-[#7c7483] text-[13px] leading-relaxed line-clamp-2 mb-4 font-medium">
                        {cat.description || 'Sin descripción facilitada para este dominio.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#310065]/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-[#f5f3f7] rounded-full text-[11px] font-black text-[#310065] uppercase tracking-wider">
                          {cat.questionCount || 0} Preguntas
                        </div>
                      </div>
                      <div className="text-[11px] font-bold text-[#7c7483] uppercase tracking-widest">
                        Orden: {cat.order}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Modal Editor */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1b1b1e]/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-[0_32px_80px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
              <header className="px-10 pt-10 pb-6">
                <h2 className="text-2xl font-serif font-black text-[#310065]">{editingCategory ? 'Editar Dominio' : 'Nuevo Dominio'}</h2>
                <p className="text-[#7c7483] text-sm font-medium mt-1">Configura las propiedades de esta categoría bíblica.</p>
              </header>

              <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Nombre</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Salmos y Profecías"
                    className="w-full px-5 py-4 bg-[#f5f3f7] border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:bg-white focus:border-[#310065]/10 transition-all font-bold text-[#1b1b1e]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Descripción</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe el contenido de esta categoría..."
                    className="w-full px-5 py-4 bg-[#f5f3f7] border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:bg-white focus:border-[#310065]/10 transition-all font-medium text-[#1b1b1e] h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Icono Sagrado</label>
                    <select 
                      value={formData.icon}
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-5 py-4 bg-[#f5f3f7] border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:bg-white focus:border-[#310065]/10 transition-all font-bold text-[#310065]"
                    >
                      {BIBLICAL_ICONS.map(icon => (
                        <option key={icon.id} value={icon.id}>{icon.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Orden Vital</label>
                    <input 
                      type="number"
                      value={formData.order}
                      onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-[#f5f3f7] border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:bg-white focus:border-[#310065]/10 transition-all font-bold text-[#1b1b1e]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-[#cdc3d4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#310065]/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#310065]"></div>
                  </label>
                  <span className="text-[13px] font-bold text-[#1b1b1e]">Categoría Activa</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-[#7c7483] uppercase tracking-widest text-[11px] hover:bg-[#f5f3f7] transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-[#310065] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(49,0,101,0.2)] hover:shadow-[0_12px_28px_rgba(49,0,101,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Guardar Edictos
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
