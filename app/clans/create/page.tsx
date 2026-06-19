'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { SPIRIT_FRUITS } from '@/lib/clan/models';
import { createClan } from '@/lib/clan/repository';
import { getLevelFromXp } from '@/lib/user/repository';
import BackButton from '@/components/BackButton';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
  es: {
    title: 'Crear Clan',
    nameLabel: 'Nombre del Clan',
    namePlaceholder: 'Ej. Guerreros de la Fe',
    mottoLabel: 'Lema del Clan',
    mottoPlaceholder: 'Ej. Firmes en la palabra',
    iconLabel: 'Escoge un Fruto del Espíritu',
    submit: 'Crear mi Clan',
    loading: 'Creando clan...',
    errorTitle: 'Error',
    errorLevel: 'Debes tener nivel 7 o superior para crear un clan.',
    errorAlreadyInClan: 'Ya perteneces a un clan.',
    success: '¡Clan creado con éxito!',
    nameRequired: 'El nombre del clan es obligatorio',
    mottoRequired: 'El lema del clan es obligatorio'
  },
  en: {
    title: 'Create Clan',
    nameLabel: 'Clan Name',
    namePlaceholder: 'e.g., Faith Warriors',
    mottoLabel: 'Clan Motto',
    mottoPlaceholder: 'e.g., Standing firm in the word',
    iconLabel: 'Choose a Fruit of the Spirit',
    submit: 'Create my Clan',
    loading: 'Creating clan...',
    errorTitle: 'Error',
    errorLevel: 'You must be level 7 or higher to create a clan.',
    errorAlreadyInClan: 'You already belong to a clan.',
    success: 'Clan created successfully!',
    nameRequired: 'Clan name is required',
    mottoRequired: 'Clan motto is required'
  },
  fr: {
    title: 'Créer un Clan',
    nameLabel: 'Nom du Clan',
    namePlaceholder: 'Ex. Guerriers de la Foi',
    mottoLabel: 'Devise du Clan',
    mottoPlaceholder: 'Ex. Ferme dans la parole',
    iconLabel: 'Choisissez un Fruit de l\'Esprit',
    submit: 'Créer mon Clan',
    loading: 'Création du clan...',
    errorTitle: 'Erreur',
    errorLevel: 'Vous devez être au moins niveau 7 pour créer un clan.',
    errorAlreadyInClan: 'Vous appartenez déjà à un clan.',
    success: 'Clan créé avec succès!',
    nameRequired: 'Le nom du clan est obligatoire',
    mottoRequired: 'La devise du clan est obligatoire'
  },
  ht: {
    title: 'Kreye yon Klan',
    nameLabel: 'Non Klan an',
    namePlaceholder: 'Kou. Sòlda lafwa',
    mottoLabel: 'Deviz Klan an',
    mottoPlaceholder: 'Kou. Kanpe fèm nan pawòl la',
    iconLabel: 'Chwazi yon Fwi Lespri a',
    submit: 'Kreye Klan Mwen',
    loading: 'Ap kreye klan...',
    errorTitle: 'Erè',
    errorLevel: 'Ou dwe nivo 7 oswa plis pou kreye yon klan.',
    errorAlreadyInClan: 'Ou deja nan yon klan.',
    success: 'Klan an kreye avèk siksè!',
    nameRequired: 'Non klan an obligatwa',
    mottoRequired: 'Deviz klan an obligatwa'
  }
};

export default function CreateClanPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [selectedFruit, setSelectedFruit] = useState(SPIRIT_FRUITS[0].id);
  const [submitting, setSubmitting] = useState(false);

  const lang = (user?.settings?.language ?? 'es') as keyof typeof translations;
  const t = translations[lang] ?? translations.es;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
      </div>
    );
  }

  const userLevel = getLevelFromXp(user.xp);

  // Level 7 restriction check
  if (userLevel < 7 && user.email !== 'juniormax2013@gmail.com') {
    return (
      <div className="min-h-screen bg-[#faf9fc] text-[#0F172A] font-sans pt-safe pb-8 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t.errorTitle}</h1>
        <p className="text-[#64748B] mb-6 max-w-md">{t.errorLevel}</p>
        <button
          onClick={() => router.push('/profile')}
          className="px-6 py-3 bg-[#0A84FF] text-white font-bold rounded-2xl shadow-sm hover:bg-[#0A84FF]/90 transition-colors"
        >
          {lang === 'es' ? 'Volver al Perfil' : lang === 'fr' ? 'Retour au Profil' : lang === 'ht' ? 'Tounen nan Profile' : 'Back to Profile'}
        </button>
      </div>
    );
  }

  // Already in a clan check
  if (user.clanId) {
    return (
      <div className="min-h-screen bg-[#faf9fc] text-[#0F172A] font-sans pt-safe pb-8 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t.errorTitle}</h1>
        <p className="text-[#64748B] mb-6 max-w-md">{t.errorAlreadyInClan}</p>
        <button
          onClick={() => router.push('/profile')}
          className="px-6 py-3 bg-[#0A84FF] text-white font-bold rounded-2xl shadow-sm hover:bg-[#0A84FF]/90 transition-colors"
        >
          {lang === 'es' ? 'Volver al Perfil' : lang === 'fr' ? 'Retour au Profil' : lang === 'ht' ? 'Tounen nan Profile' : 'Back to Profile'}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t.nameRequired);
      return;
    }
    if (!motto.trim()) {
      toast.error(t.mottoRequired);
      return;
    }

    setSubmitting(true);
    try {
      await createClan(name, motto, selectedFruit, user.uid);
      toast.success(t.success);
      router.push('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Error creating clan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen font-sans">
      
      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <div className="flex items-center gap-4">
          <BackButton href="/profile" />
        </div>
        <h1 className="font-bold text-lg text-[#0F172A]">{t.title}</h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-xl mx-auto space-y-6 pb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card Layout */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-black/[0.03] space-y-4">
            
            {/* Input Name */}
            <div className="space-y-1.5">
              <label htmlFor="clan-name" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.nameLabel}
              </label>
              <input
                id="clan-name"
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
              />
            </div>

            {/* Input Motto */}
            <div className="space-y-1.5">
              <label htmlFor="clan-motto" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.mottoLabel}
              </label>
              <input
                id="clan-motto"
                type="text"
                placeholder={t.mottoPlaceholder}
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                maxLength={60}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
              />
            </div>

          </div>

          {/* Fruit selection card */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-black/[0.03] space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              {t.iconLabel}
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {SPIRIT_FRUITS.map((fruit) => {
                const isSelected = selectedFruit === fruit.id;
                return (
                  <button
                    key={fruit.id}
                    type="button"
                    onClick={() => setSelectedFruit(fruit.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-[2rem] border transition-all ${
                      isSelected
                        ? 'border-[#0A84FF] bg-[#0A84FF]/5 shadow-sm'
                        : 'border-black/[0.05] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden mb-2 shadow-sm flex items-center justify-center bg-gray-50 border border-black/[0.03]">
                      <img src={fruit.imageUrl} className="w-full h-full object-cover" alt={fruit.name[lang]} />
                    </div>
                    <span className={`text-[12px] font-bold text-center line-clamp-1 ${isSelected ? 'text-[#0A84FF]' : 'text-[#0F172A]'}`}>
                      {fruit.name[lang] ?? fruit.name.es}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Fruit description */}
            {(() => {
              const fruitObj = SPIRIT_FRUITS.find(f => f.id === selectedFruit);
              if (!fruitObj) return null;
              return (
                <div className="p-4 bg-gray-50 rounded-2xl border border-black/[0.02] text-center">
                  <p className="text-xs italic text-[#64748B]">
                    &quot;{fruitObj.description[lang] ?? fruitObj.description.es}&quot;
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-bold text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.loading}
              </>
            ) : (
              t.submit
            )}
          </button>

        </form>
      </main>

    </div>
  );
}
