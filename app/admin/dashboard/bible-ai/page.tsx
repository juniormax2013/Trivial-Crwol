'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  Save,
  RotateCcw,
  Mic,
  Languages,
  MessageSquare,
  Shield,
  Hash,
  Globe,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  LineChart,
  HelpCircle,
  Layers,
  Users,
  Gamepad2,
  Trophy,
  Medal,
  Gavel,
  Settings,
  LogOut,
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { BibleAIConfig, DEFAULT_BIBLE_AI_CONFIG } from '@/lib/bible-ai/types';
import { getBibleAIConfig, saveBibleAIConfig } from '@/lib/bible-ai/repository';

// ── Toggle Component ────────────────────────────────────────────

function Toggle({
  label,
  description,
  value,
  onChange,
  icon: Icon,
  color = '#310065',
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: any;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1b1b1e]/5 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}10` }}
        >
          <Icon size={18} style={{ color }} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#1b1b1e]">{label}</p>
          {description && (
            <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          value ? 'bg-[#310065]' : 'bg-[#e3e2e6]'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// ── Admin Sidebar (reusable shell) ──────────────────────────────

function AdminSidebar({ user, signOut }: { user: any; signOut: () => void }) {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-[#1b1b1e]/5 bg-[#faf9fc] flex flex-col py-6 gap-2 z-50 shadow-[4px_0_24px_rgba(49,0,101,0.02)]">
      <div className="mb-6 px-6">
        <h1 className="font-serif text-[22px] font-black text-[#310065] tracking-tight">Kingdom Panel</h1>
        <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mt-1">Ecclesiastical Oversight</p>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto px-4 flex-1">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <LineChart className="w-5 h-5" strokeWidth={2} /> Analytics
        </Link>
        <Link href="/admin/dashboard/questions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <HelpCircle className="w-5 h-5" strokeWidth={2} /> Questions
        </Link>
        <Link href="/admin/dashboard/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <Layers className="w-5 h-5" strokeWidth={2} /> Categories
        </Link>
        <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <Users className="w-5 h-5" strokeWidth={2} /> Users
        </Link>
        <Link href="/admin/dashboard/game-engine" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <Gamepad2 className="w-5 h-5" strokeWidth={2} /> Game Engine
        </Link>
        <Link href="/admin/dashboard/tournaments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <Trophy className="w-5 h-5" strokeWidth={2} /> Tournaments
        </Link>
        <Link href="/admin/dashboard/bible-ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[#310065] bg-[#310065]/5 font-bold text-[13px] relative">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#cba72f] rounded-l-full" />
          <Brain className="w-5 h-5" strokeWidth={2.5} /> Bible AI
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <Medal className="w-5 h-5" strokeWidth={2} /> Rewards
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] transition-all">
          <Gavel className="w-5 h-5" strokeWidth={2} /> Moderation
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] mt-4 transition-all">
          <Settings className="w-5 h-5" strokeWidth={2} /> Settings
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-[#1b1b1e]/5 px-6">
        <p className="text-[13px] font-bold text-[#310065] truncate">{user?.fullName || 'Admin'}</p>
        <p className="text-[11px] text-[#7c7483] capitalize">{(user?.role || 'Master Overseer').replace('_', ' ')}</p>
        <button
          onClick={signOut}
          className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-[12px] w-full"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

// ── Main Page ──────────────────────────────────────────────────

const LANG_OPTIONS = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ht', label: 'Kreyòl Ayisyen', flag: '🇭🇹' },
];

export default function BibleAIAdminPage() {
  const { user, signOut } = useAuthContext();
  const [config, setConfig] = useState<BibleAIConfig>(DEFAULT_BIBLE_AI_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getBibleAIConfig().then(c => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBibleAIConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Error saving:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_BIBLE_AI_CONFIG);
  };

  const toggleLanguage = (code: string) => {
    setConfig(prev => ({
      ...prev,
      aiAllowedLanguages: prev.aiAllowedLanguages.includes(code)
        ? prev.aiAllowedLanguages.filter(l => l !== code)
        : [...prev.aiAllowedLanguages, code],
    }));
  };

  return (
    <AdminGuard>
      <div className="bg-[#f5f3f7] text-[#1b1b1e] min-h-screen font-sans">
        <AdminSidebar user={user} signOut={signOut} />

        <main className="ml-64 min-h-screen pb-16">
          {/* Top bar */}
          <header className="bg-[#faf9fc]/80 backdrop-blur-2xl flex justify-between items-center px-10 py-5 sticky top-0 z-40 border-b border-[#1b1b1e]/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#310065] to-[#4a148c] rounded-2xl flex items-center justify-center shadow-lg shadow-[#310065]/20">
                <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-serif text-[20px] font-black text-[#310065] tracking-tight">
                  Asistente Bíblico IA
                </h2>
                <p className="text-[11px] font-bold text-[#7c7483] uppercase tracking-widest">
                  Configuración del sistema de IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1b1b1e]/10 rounded-xl text-[13px] font-bold text-[#7c7483] hover:bg-[#f5f3f7] transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#310065] to-[#4a148c] text-white rounded-xl text-[13px] font-bold shadow-[0_4px_14px_rgba(49,0,101,0.25)] hover:shadow-[0_6px_20px_rgba(49,0,101,0.3)] transition-all disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}
              </button>
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-10 h-10 animate-spin text-[#310065]/30" />
            </div>
          ) : (
            <div className="px-10 pt-8 space-y-6">

              {/* Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-center gap-4 ${
                  config.aiBibleEnabled
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    config.aiBibleEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-400'
                  }`}
                />
                <div>
                  <p
                    className={`text-[14px] font-black ${
                      config.aiBibleEnabled ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {config.aiBibleEnabled
                      ? 'Asistente Bíblico ACTIVO — Los usuarios pueden acceder'
                      : 'Asistente Bíblico DESACTIVADO — Los usuarios verán mensaje de no disponible'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Card 1: Controles principales ── */}
                <div className="bg-white rounded-2xl border border-[#1b1b1e]/5 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1b1b1e]/5">
                    <h3 className="font-serif font-black text-[16px] text-[#310065]">Controles principales</h3>
                    <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">Activa o desactiva funciones clave</p>
                  </div>
                  <div className="px-6">
                    <Toggle
                      label="IA Bíblica activada"
                      description="Permite o bloquea el acceso al asistente"
                      value={config.aiBibleEnabled}
                      onChange={v => setConfig(p => ({ ...p, aiBibleEnabled: v }))}
                      icon={Brain}
                      color="#310065"
                    />
                    <Toggle
                      label="Modo voz (Charlar)"
                      description="Activa el botón de voz para hablar con la IA"
                      value={config.aiVoiceEnabled}
                      onChange={v => setConfig(p => ({ ...p, aiVoiceEnabled: v }))}
                      icon={Mic}
                      color="#059669"
                    />
                    <Toggle
                      label="Modo estricto bíblico"
                      description="Rechaza preguntas fuera del contexto bíblico"
                      value={config.aiStrictBibleOnly}
                      onChange={v => setConfig(p => ({ ...p, aiStrictBibleOnly: v }))}
                      icon={Shield}
                      color="#d97706"
                    />
                    <Toggle
                      label="Mostrar referencias bíblicas"
                      description="Incluye citas de libro, capítulo y versículo"
                      value={config.aiShowBibleReferences}
                      onChange={v => setConfig(p => ({ ...p, aiShowBibleReferences: v }))}
                      icon={BookOpen}
                      color="#7c3aed"
                    />
                  </div>
                </div>

                {/* ── Card 2: Idiomas ── */}
                <div className="bg-white rounded-2xl border border-[#1b1b1e]/5 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1b1b1e]/5">
                    <h3 className="font-serif font-black text-[16px] text-[#310065]">Idiomas</h3>
                    <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">Configura los idiomas disponibles</p>
                  </div>
                  <div className="px-6">
                    <Toggle
                      label="Multi-idioma activado"
                      description="Permite respuestas en múltiples idiomas"
                      value={config.aiMultilanguageEnabled}
                      onChange={v => setConfig(p => ({ ...p, aiMultilanguageEnabled: v }))}
                      icon={Globe}
                      color="#0284c7"
                    />
                    <Toggle
                      label="Detectar idioma automático"
                      description="La IA detecta el idioma del usuario"
                      value={config.autoDetectLanguage}
                      onChange={v => setConfig(p => ({ ...p, autoDetectLanguage: v }))}
                      icon={Languages}
                      color="#0284c7"
                    />
                    <div className="py-4 border-b border-[#1b1b1e]/5">
                      <p className="text-[12px] font-black text-[#310065]/60 uppercase tracking-widest mb-3">
                        Idiomas permitidos
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {LANG_OPTIONS.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => toggleLanguage(lang.code)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold border transition-colors ${
                              config.aiAllowedLanguages.includes(lang.code)
                                ? 'bg-[#310065] text-white border-[#310065]'
                                : 'bg-[#f5f3f7] text-[#7c7483] border-[#1b1b1e]/10'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="py-4">
                      <p className="text-[12px] font-black text-[#310065]/60 uppercase tracking-widest mb-3">
                        Idioma por defecto
                      </p>
                      <select
                        value={config.defaultAiLanguage}
                        onChange={e => setConfig(p => ({ ...p, defaultAiLanguage: e.target.value }))}
                        className="w-full bg-[#f5f3f7] border border-[#1b1b1e]/10 rounded-xl px-4 py-3 text-[13px] font-bold text-[#1b1b1e] focus:outline-none focus:border-[#310065]/30"
                      >
                        {LANG_OPTIONS.map(l => (
                          <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Card 3: Límites ── */}
                <div className="bg-white rounded-2xl border border-[#1b1b1e]/5 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1b1b1e]/5">
                    <h3 className="font-serif font-black text-[16px] text-[#310065]">Límites de uso</h3>
                    <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">Controla el consumo de la API</p>
                  </div>
                  <div className="px-6 py-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Hash size={16} className="text-[#7c7483]" />
                          <p className="text-[14px] font-bold text-[#1b1b1e]">Preguntas por día por usuario</p>
                        </div>
                        <span className="text-[20px] font-black text-[#310065]">{config.aiDailyLimit}</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={config.aiDailyLimit}
                        onChange={e => setConfig(p => ({ ...p, aiDailyLimit: parseInt(e.target.value) }))}
                        className="w-full accent-[#310065]"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-[#7c7483] mt-1">
                        <span>5 (Muy bajo)</span>
                        <span>50 (Moderado)</span>
                        <span>100 (Alto)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Card 4: Mensaje de bienvenida ── */}
                <div className="bg-white rounded-2xl border border-[#1b1b1e]/5 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1b1b1e]/5">
                    <h3 className="font-serif font-black text-[16px] text-[#310065]">Mensaje de bienvenida</h3>
                    <p className="text-[11px] text-[#7c7483] font-medium mt-0.5">Lo primero que ve el usuario al abrir el asistente</p>
                  </div>
                  <div className="px-6 py-5">
                    <textarea
                      value={config.aiWelcomeMessage}
                      onChange={e => setConfig(p => ({ ...p, aiWelcomeMessage: e.target.value }))}
                      rows={4}
                      className="w-full bg-[#f5f3f7] border border-[#1b1b1e]/10 rounded-xl px-4 py-3 text-[13px] font-medium text-[#1b1b1e] resize-none focus:outline-none focus:border-[#310065]/30 leading-relaxed"
                      placeholder="Escribe el mensaje de bienvenida del asistente..."
                    />
                    <p className="text-[11px] text-[#7c7483] mt-2 font-medium">
                      {config.aiWelcomeMessage.length}/500 caracteres
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-[#310065] to-[#4a148c] rounded-2xl p-6 text-white">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/50 mb-3">
                  Vista previa del asistente
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
                    <p className="text-[13px] text-white/90 font-medium leading-relaxed">
                      {config.aiWelcomeMessage}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {config.aiAllowedLanguages.map(code => {
                    const lang = LANG_OPTIONS.find(l => l.code === code);
                    return lang ? (
                      <span key={code} className="px-2 py-1 bg-white/10 rounded-lg text-[11px] font-bold">
                        {lang.flag} {lang.label}
                      </span>
                    ) : null;
                  })}
                  {config.aiVoiceEnabled && (
                    <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-[11px] font-bold text-green-300">
                      🎤 Voz activa
                    </span>
                  )}
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-[11px] font-bold">
                    Límite: {config.aiDailyLimit}/día
                  </span>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
