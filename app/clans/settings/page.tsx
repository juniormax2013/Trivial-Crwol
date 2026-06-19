'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { SPIRIT_FRUITS } from '@/lib/clan/models';
import { getClanById, updateClanSettings } from '@/lib/clan/repository';
import BackButton from '@/components/BackButton';
import { Loader2, ShieldAlert, Save } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
  es: {
    title: 'Configurar Clan',
    nameLabel: 'Nombre del Clan',
    mottoLabel: 'Lema del Clan',
    iconLabel: 'Logo del Clan',
    typeLabel: 'Privacidad del Clan',
    public: 'Público (Todos pueden entrar)',
    private: 'Privado (Requiere solicitud)',
    minLevelLabel: 'Nivel mínimo requerido',
    langLabel: 'Idioma principal del Clan',
    regionLabel: 'País / Región del Clan',
    welcomeLabel: 'Mensaje de Bienvenida',
    welcomePlaceholder: 'Ej. Bienvenido al clan...',
    saveBtn: 'Guardar Cambios',
    saving: 'Guardando...',
    success: 'Configuración actualizada con éxito',
    errorTitle: 'Acceso Denegado',
    errorDesc: 'Solo el Fundador o los Administradores del clan pueden modificar la configuración.',
    colorLabel: 'Color distintivo del Clan'
  },
  en: {
    title: 'Configure Clan',
    nameLabel: 'Clan Name',
    mottoLabel: 'Clan Motto',
    iconLabel: 'Clan Logo',
    typeLabel: 'Clan Privacy',
    public: 'Public (Everyone can join)',
    private: 'Private (Requires request)',
    minLevelLabel: 'Minimum Level Required',
    langLabel: 'Primary Clan Language',
    regionLabel: 'Clan Country / Region',
    welcomeLabel: 'Welcome Message',
    welcomePlaceholder: 'e.g., Welcome to the clan...',
    saveBtn: 'Save Changes',
    saving: 'Saving...',
    success: 'Settings updated successfully',
    errorTitle: 'Access Denied',
    errorDesc: 'Only the Founder or Clan Admins can modify settings.',
    colorLabel: 'Distinctive Clan Color'
  },
  fr: {
    title: 'Configurer le Clan',
    nameLabel: 'Nom du Clan',
    mottoLabel: 'Devise du Clan',
    iconLabel: 'Logo du Clan',
    typeLabel: 'Confidentialité du Clan',
    public: 'Public (Tout le monde peut rejoindre)',
    private: 'Privé (Sur demande)',
    minLevelLabel: 'Niveau Minimum Requis',
    langLabel: 'Langue Principale',
    regionLabel: 'Pays / Région',
    welcomeLabel: 'Message de Bienvenue',
    welcomePlaceholder: 'Ex. Bienvenue dans le clan...',
    saveBtn: 'Enregistrer',
    saving: 'Enregistrement...',
    success: 'Paramètres mis à jour avec succès',
    errorTitle: 'Accès Refusé',
    errorDesc: 'Seul le fondateur ou les administrateurs du clan peuvent modifier les paramètres.',
    colorLabel: 'Couleur Distinctive du Clan'
  },
  ht: {
    title: 'Konfigire Klan an',
    nameLabel: 'Non Klan an',
    mottoLabel: 'Deviz Klan an',
    iconLabel: 'Logo Klan an',
    typeLabel: 'Konfidansyalite Klan an',
    public: 'Piblik (Tout moun ka antre)',
    private: 'Privat (Mande pou antre)',
    minLevelLabel: 'Nivo Minimòm ki nesesè',
    langLabel: 'Lang prensipal Klan an',
    regionLabel: 'Peyi / Rejyon Klan an',
    welcomeLabel: 'Mesaj Byenveni',
    welcomePlaceholder: 'Kou. Byenveni nan klan an...',
    saveBtn: 'Save Chanjman yo',
    saving: 'Ap sove...',
    success: 'Konfigirasyon an mete ajou avèk siksè',
    errorTitle: 'Aksè Refize',
    errorDesc: 'Se sèlman Kreyatè a oswa Administratè klan an ki ka modifye konfigirasyon an.',
    colorLabel: 'Koulè Klan an'
  }
};

const COLOR_PRESETS = [
  { hex: '#0A84FF', name: 'Blue' },
  { hex: '#34C759', name: 'Green' },
  { hex: '#FF3B30', name: 'Red' },
  { hex: '#AF52DE', name: 'Purple' },
  { hex: '#FF9500', name: 'Orange' },
  { hex: '#FFCC00', name: 'Yellow' }
];

export default function ClanSettingsPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [clan, setClan] = useState<any>(null);
  const [loadingClan, setLoadingClan] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [icon, setIcon] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [minLevel, setMinLevel] = useState(1);
  const [language, setLanguage] = useState('es');
  const [region, setRegion] = useState('Global');
  const [color, setColor] = useState('#0A84FF');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const userLang = (user?.settings?.language ?? 'es') as keyof typeof translations;
  const t = translations[userLang] ?? translations.es;

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
            setName(clanData.name);
            setMotto(clanData.motto);
            setIcon(clanData.icon);
            setType(clanData.type || 'public');
            setMinLevel(clanData.minLevel || 1);
            setLanguage(clanData.language || 'es');
            setRegion(clanData.region || 'Global');
            setColor(clanData.color || '#0A84FF');
            setWelcomeMessage(clanData.welcomeMessage || '');
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
  }, [user, authLoading]);

  if (authLoading || loadingClan) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
      </div>
    );
  }

  // Verification: User must belong to the clan, and role must be Founder or Admin
  const hasAccess = user && (user.clanRole === 'founder' || user.clanRole === 'admin' || (clan && clan.creatorId === user.uid) || user.clanId);

  if (!hasAccess) {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await updateClanSettings(clan.id, {
        name: name.trim(),
        motto: motto.trim(),
        icon,
        type,
        minLevel,
        language,
        region,
        color,
        welcomeMessage: welcomeMessage.trim()
      });
      toast.success(t.success);
      router.push(`/clans?id=${clan.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#faf9fc] text-[#0F172A] min-h-screen font-sans">
      
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-black/[0.03] pt-safe">
        <div className="flex items-center gap-4">
          <BackButton href={`/clans?id=${clan.id}`} />
        </div>
        <h1 className="font-bold text-lg text-[#0F172A]">{t.title}</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Form Content */}
      <main className="pt-20 px-4 max-w-xl mx-auto space-y-6 pb-12">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic Info Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-black/[0.03] space-y-4">
            
            {/* Input Name */}
            <div className="space-y-1.5">
              <label htmlFor="clan-name" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.nameLabel}
              </label>
              <input
                id="clan-name"
                type="text"
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
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                maxLength={60}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
              />
            </div>

            {/* Welcome Message */}
            <div className="space-y-1.5">
              <label htmlFor="clan-welcome" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.welcomeLabel}
              </label>
              <textarea
                id="clan-welcome"
                rows={3}
                placeholder={t.welcomePlaceholder}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors resize-none"
              />
            </div>

          </div>

          {/* Logo selector */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-black/[0.03] space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t.iconLabel}</h3>
            
            <div className="grid grid-cols-4 gap-2">
              {SPIRIT_FRUITS.map((fruit) => {
                const isSelected = icon === fruit.id;
                return (
                  <button
                    key={fruit.id}
                    type="button"
                    onClick={() => setIcon(fruit.id)}
                    className={`p-1.5 rounded-[2rem] border transition-all ${
                      isSelected
                        ? 'border-[#0A84FF] bg-[#0A84FF]/5 shadow-sm'
                        : 'border-black/[0.03] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mx-auto flex items-center justify-center bg-gray-50 border border-black/[0.03]">
                      <img src={fruit.imageUrl} className="w-full h-full object-cover" alt={fruit.name[userLang]} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requirements & Settings */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-black/[0.03] space-y-4">
            
            {/* Privacy Select */}
            <div className="space-y-1.5">
              <label htmlFor="clan-type" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.typeLabel}
              </label>
              <select
                id="clan-type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
              >
                <option value="public">{t.public}</option>
                <option value="private">{t.private}</option>
              </select>
            </div>

            {/* Min Level Requirement */}
            <div className="space-y-1.5">
              <label htmlFor="clan-level" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.minLevelLabel}
              </label>
              <input
                id="clan-level"
                type="number"
                min={1}
                max={50}
                value={minLevel}
                onChange={(e) => setMinLevel(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
              />
            </div>

            {/* Clan Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t.colorLabel}
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = color === p.hex;
                  return (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setColor(p.hex)}
                      style={{ backgroundColor: p.hex }}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        isSelected ? 'border-black scale-105 shadow-sm' : 'border-white hover:scale-102'
                      }`}
                      title={p.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Language & Region */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="clan-lang" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  {t.langLabel}
                </label>
                <select
                  id="clan-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ht">Kreyòl</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="clan-region" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  {t.regionLabel}
                </label>
                <input
                  id="clan-region"
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:border-[#0A84FF] text-[15px] transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-bold text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.saveBtn}
              </>
            )}
          </button>

        </form>
      </main>

    </div>
  );
}
