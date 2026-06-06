'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, Trash2, X, ChevronRight } from 'lucide-react';
import { useT, useLanguage } from '@/lib/i18n/context';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

interface SavedVerse {
  text: string;
  reference: string;
  explanation: string;
  savedAt: string;
}

export default function SavedVersesPage() {
  const t = useT();
  const { language } = useLanguage();
  const [verses, setVerses] = useState<SavedVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<SavedVerse | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_verses');
      if (saved) {
        setVerses(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved verses:', err);
    }
  }, []);

  const handleDelete = (e: React.MouseEvent, verseToDelete: SavedVerse) => {
    e.stopPropagation();
    try {
      const updated = verses.filter(
        v => !(v.text === verseToDelete.text && v.reference === verseToDelete.reference)
      );
      setVerses(updated);
      localStorage.setItem('saved_verses', JSON.stringify(updated));
      toast.success(
        language === 'es' ? 'Versículo eliminado' : language === 'fr' ? 'Verset supprimé' : 'Vèsè efase'
      );
    } catch (err) {
      console.error('Failed to delete verse:', err);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const locale = language === 'ht' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'fr-FR';
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-24 font-sans selection:bg-[#eddcff]">
      {/* TopBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-[#1b1b1e]/5 pt-safe">
        <div className="flex items-center gap-3 px-5 py-4 max-w-screen-xl mx-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white border border-[#1b1b1e]/5 shadow-sm flex items-center justify-center text-[#310065] hover:bg-[#eddcff] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7c7483]">Bible Crown</p>
            <h1 className="font-serif text-[20px] font-black text-[#310065] leading-tight">
              {t.nav.savedVerses}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-[88px] px-5 max-w-screen-xl mx-auto mt-4">
        {verses.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center pt-24 pb-8 text-center px-6">
            <div className="w-20 h-20 rounded-[1.75rem] bg-[#eddcff]/60 flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(184,137,255,0.15)]">
              <Bookmark className="w-9 h-9 text-[#310065]" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-[22px] font-bold text-[#310065] mb-2">
              {t.dashboard.noSavedVerses}
            </h3>
            <p className="text-[#7c7483] text-[14px] font-medium leading-relaxed max-w-[260px]">
              {t.dashboard.savedVersesDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verses.map((verse, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedVerse(verse)}
                className="bg-white rounded-[1.5rem] p-5 border border-[#1b1b1e]/5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-amber-400 rounded-full" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {verse.reference}
                    </p>
                  </div>
                  <p className="text-[14px] font-bold text-[#1b1b1e] leading-snug line-clamp-2 italic">
                    &quot;{verse.text}&quot;
                  </p>
                  <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">
                    {t.dashboard.savedAtLabel} {formatDate(verse.savedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, verse)}
                    className="w-9 h-9 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-colors"
                    title={t.dashboard.deleteText}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#eddcff]/50 group-hover:text-[#310065] transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <BottomNav activeTab="saved-verses" showTriggerButton={true} />

      {/* VERSE DETAIL MODAL */}
      <AnimatePresence>
        {selectedVerse && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVerse(null)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[2rem] sm:rounded-t-[3rem] p-5 sm:p-8 pb-12 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-[#310065] tracking-tight uppercase italic">
                  {t.dashboard.explanation}
                </h3>
                <button
                  onClick={() => setSelectedVerse(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-[#f2f2f7] rounded-[2.5rem] border border-black/[0.03] shadow-inner space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-amber-400 rounded-full" />
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
                      {selectedVerse.reference}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#310065] leading-relaxed italic">
                    &quot;{selectedVerse.text}&quot;
                  </p>
                </div>

                <div className="space-y-3 px-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    {t.dashboard.explanation}
                  </h4>
                  <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                    {selectedVerse.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
