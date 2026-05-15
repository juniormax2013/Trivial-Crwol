'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  Import,
  Check,
  Languages
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { getQuestions, saveQuestion, deleteQuestion, seedQuestionsFromStatic } from '@/lib/question/repository';
import { getCategories, recalculateAllCategoryCounts } from '@/lib/category/repository';
import { DuelQuestion, Difficulty } from '@/lib/duel/models';
import { CategoryModel } from '@/lib/category/models';

import { 
  ALL_DUEL_QUESTIONS
} from '@/lib/duel/seed';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<DuelQuestion> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    categoryId: 'all',
    difficulty: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cats, qData] = await Promise.all([
        getCategories(),
        getQuestions()
      ]);
      setCategories(cats);
      setQuestions(qData.questions);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesCat = filters.categoryId === 'all' || q.categoryId === filters.categoryId;
      const matchesDiff = filters.difficulty === 'all' || q.difficulty === filters.difficulty;
      const matchesSearch = !filters.searchTerm || 
        q.questionText.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        q.bibleReference.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchesCat && matchesDiff && matchesSearch;
    });
  }, [questions, filters]);

  /**
   * SEEDING LOGIC
   */
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedQuestionsFromStatic(ALL_DUEL_QUESTIONS);
      // Recalculate category counts after seeding
      await recalculateAllCategoryCounts();
      alert(`Éxito: ${result.success} preguntas importadas.`);
      await loadData();
    } catch (err) {
      console.error("Seeding error:", err);
      alert("Error al importar datos.");
    } finally {
      setIsSeeding(false);
    }
  };

  /**
   * MODAL LOGIC
   */
  const handleOpenModal = (q?: DuelQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({ ...q });
    } else {
      setEditingQuestion(null);
      setFormData({
        id: `dq-custom-${Date.now()}`,
        questionText: '',
        categoryId: categories[0]?.id || '',
        categoryName: categories[0]?.name || '',
        difficulty: 'medium',
        language: 'es',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' }
        ],
        correctOptionId: 'a',
        explanation: '',
        bibleReference: ''
      });
    }
    setIsModalOpen(true);
  };

  const [formData, setFormData] = useState<DuelQuestion>({} as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cat = categories.find(c => c.id === formData.categoryId);
      const finalData = {
        ...formData,
        categoryName: cat?.name || formData.categoryName
      };
      await saveQuestion(finalData);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta para siempre?')) return;
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
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
            <h1 className="font-serif font-black text-xl text-[#310065]">Archivo de Sabiduría</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-[12px] text-[#310065] bg-[#310065]/5 hover:bg-[#310065]/10 active:scale-95 transition-all uppercase tracking-widest"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Import className="w-4 h-4" />}
              Importar Base
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#310065] text-white px-5 py-2.5 rounded-full font-bold text-[13px] hover:shadow-[0_4px_12px_rgba(49,0,101,0.2)] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Pregunta
            </button>
          </div>
        </header>

        <main className="pt-24 px-6 max-w-7xl mx-auto pb-32 space-y-8">
          
          {/* Filters Bar */}
          <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] shadow-sm border border-[#310065]/5">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#cdc3d4]" />
              </div>
              <input 
                type="text"
                placeholder="Buscar por texto o referencia..."
                value={filters.searchTerm}
                onChange={e => setFilters({...filters, searchTerm: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-[#f5f3f7] border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:bg-white transition-all font-medium text-sm"
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select 
                value={filters.categoryId}
                onChange={e => setFilters({...filters, categoryId: e.target.value})}
                className="px-4 py-3 bg-[#f5f3f7] rounded-xl border-transparent font-bold text-[12px] uppercase tracking-widest text-[#310065] focus:outline-none"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select 
                value={filters.difficulty}
                onChange={e => setFilters({...filters, difficulty: e.target.value as any})}
                className="px-4 py-3 bg-[#f5f3f7] rounded-xl border-transparent font-bold text-[12px] uppercase tracking-widest text-[#310065] focus:outline-none"
              >
                <option value="all">Dificultad</option>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </section>

          {/* Questions List */}
          <section className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgba(49,0,101,0.02)] border border-[#310065]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f3f7] border-b border-[#310065]/10">
                  <tr>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Pregunta & Referencia</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Categoría</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#7c7483]">Dificultad</th>
                    <th className="px-6 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#310065]/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <Loader2 className="w-10 h-10 text-[#310065] animate-spin mx-auto mb-4" />
                        <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">Descifrando Pergaminos...</p>
                      </td>
                    </tr>
                  ) : filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <HelpCircle className="w-12 h-12 text-[#cdc3d4] mx-auto mb-4 opacity-50" />
                        <p className="text-[#7c7483] font-bold text-xs uppercase tracking-widest">No hay preguntas que coincidan</p>
                      </td>
                    </tr>
                  ) : filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-[#f5f3f7] transition-colors group">
                      <td className="px-6 py-5 max-w-md">
                        <p className="font-serif font-black text-[#1b1b1e] text-[15px] leading-tight mb-1 line-clamp-2">{q.questionText}</p>
                        <div className="flex items-center gap-1.5 text-[#310065] font-bold text-[11px] uppercase tracking-widest opacity-60">
                          <BookOpen className="w-3 h-3" />
                          {q.bibleReference}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className="px-3 py-1 bg-[#310065]/5 rounded-lg text-[11px] font-black text-[#310065] uppercase tracking-wider">
                          {q.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${
                          q.difficulty === 'easy' ? 'text-emerald-600' : 
                          q.difficulty === 'medium' ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            q.difficulty === 'easy' ? 'bg-emerald-500' : 
                            q.difficulty === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></div>
                          {q.difficulty}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleOpenModal(q)}
                            className="p-2.5 rounded-xl hover:bg-[#310065] hover:text-white text-[#310065] transition-all bg-[#310065]/5"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-2.5 rounded-xl hover:bg-rose-500 hover:text-white text-rose-500 transition-all bg-rose-500/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Question Editor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1b1b1e]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] shadow-[0_32px_80px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <header className="px-10 pt-10 pb-6 flex-shrink-0">
                <h2 className="text-2xl font-serif font-black text-[#310065]">{editingQuestion ? 'Refinar Pregunta' : 'Nueva Revelación'}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[#7c7483] text-sm font-medium">Define los términos del desafío teológico.</p>
                  <div className="h-4 w-[1px] bg-[#310065]/10"></div>
                  <div className="flex items-center gap-1.5 text-[#310065] font-black text-[10px] uppercase tracking-widest">
                    <AlertCircle className="w-3 h-3" />
                    ID: {formData.id}
                  </div>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-10 pb-10 space-y-6 scrollbar-hide">
                {/* Main Question */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Cuerpo de la Pregunta</label>
                  <textarea 
                    required
                    value={formData.questionText}
                    onChange={e => setFormData({...formData, questionText: e.target.value})}
                    placeholder="¿Qué pregunta deseas plantear a los escribas?"
                    className="w-full px-6 py-5 bg-[#f5f3f7] border-transparent rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:bg-white focus:border-[#310065]/10 transition-all font-bold text-[#1b1b1e] text-lg resize-none min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Dominio / Categoría</label>
                    <select 
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-5 py-4 bg-[#f5f3f7] border-transparent rounded-2xl focus:ring-2 focus:ring-[#310065]/20 font-bold text-sm text-[#310065]"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Dificultad Espiritual</label>
                    <div className="flex gap-2">
                      {['easy', 'medium', 'hard'].map(d => (
                        <button 
                          key={d}
                          type="button"
                          onClick={() => setFormData({...formData, difficulty: d as any})}
                          className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            formData.difficulty === d 
                            ? 'bg-[#310065] text-white shadow-md' 
                            : 'bg-[#f5f3f7] text-[#7c7483] hover:bg-[#310065]/5'
                          }`}
                        >
                          {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Media' : 'Difícil'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Opciones de Respuesta</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.options?.map((opt, idx) => (
                      <div key={opt.id} className={`group relative transition-all duration-300 ${formData.correctOptionId === opt.id ? 'ring-2 ring-[#310065] rounded-2xl ring-offset-2' : ''}`}>
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] uppercase transition-all ${
                          formData.correctOptionId === opt.id ? 'bg-[#310065] text-white' : 'bg-white text-[#cdc3d4]'
                        }`}>
                          {opt.id}
                        </div>
                        <input 
                          value={opt.text}
                          onChange={e => {
                            const newOpts = [...formData.options];
                            newOpts[idx] = { ...opt, text: e.target.value };
                            setFormData({...formData, options: newOpts});
                          }}
                          placeholder={`Opción ${opt.id.toUpperCase()}`}
                          className={`w-full pl-14 pr-12 py-4 bg-[#f5f3f7] border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm text-[#1b1b1e] ${
                            formData.correctOptionId === opt.id ? 'bg-white shadow-sm' : ''
                          }`}
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, correctOptionId: opt.id})}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                            formData.correctOptionId === opt.id ? 'text-[#310065] opacity-100' : 'text-[#cdc3d4] opacity-0 group-hover:opacity-100 hover:text-[#310065]'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference & Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                   <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Referencia Bíblica</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#cdc3d4]" />
                      <input 
                        value={formData.bibleReference}
                        onChange={e => setFormData({...formData, bibleReference: e.target.value})}
                        placeholder="Ej. Génesis 1:1"
                        className="w-full pl-11 pr-4 py-4 bg-[#f5f3f7] border-transparent rounded-2xl focus:ring-2 focus:ring-[#310065]/20 font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Idioma</label>
                    <div className="relative">
                      <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#cdc3d4]" />
                      <select 
                         value={formData.language}
                         onChange={e => setFormData({...formData, language: e.target.value})}
                         className="w-full pl-11 pr-4 py-4 bg-[#f5f3f7] border-transparent rounded-2xl focus:ring-2 focus:ring-[#310065]/20 font-bold text-sm"
                      >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="pt">Portugués</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#1b1b1e] uppercase tracking-widest ml-1">Explicación / Contexto</label>
                  <textarea 
                    value={formData.explanation}
                    onChange={e => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Brinda sabiduría adicional sobre la respuesta correcta..."
                    className="w-full px-6 py-4 bg-[#f5f3f7] border-transparent rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#310065]/20 font-medium text-[13px] text-[#7c7483] h-24 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 group">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-black text-[#7c7483] uppercase tracking-widest text-[11px] hover:bg-[#f5f3f7] transition-all"
                  >
                    Cerrar Archivo
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-[#310065] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(49,0,101,0.2)] hover:shadow-[0_12px_40px_rgba(49,0,101,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Sellar Pregunta
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
