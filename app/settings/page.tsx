'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  HelpCircle,
  Medal,
  Globe,
  Bell,
  Volume2,
  Vibrate,
  Shield,
  ExternalLink,
  Trash2,
  ChevronRight,
  Castle,
  Diamond,
  BarChart2,
  Settings as SettingsIcon,
  Loader2,
  User as UserIcon,
  Key,
  ShieldAlert,
  Check
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { updateUser } from '@/lib/user/repository';
import { UserSettingsModel } from '@/lib/user/models';
import { useT, useLanguage } from '@/lib/i18n/context';
import { Language } from '@/lib/i18n/types';

// Language choosing is removed as the system is strictly Haitian Creole.

export default function Settings() {
  const { user, loading, signOut } = useAuthContext();
  const router = useRouter();
  const t = useT();
  const { language, setLanguage } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  /**
   * TOGGLE SETTING HELPER
   */
  const handleToggle = async (key: keyof UserSettingsModel) => {
    setIsUpdating(true);
    try {
      const newSettings = { 
        ...user.settings, 
        [key]: !user.settings[key] 
      };
      await updateUser(user.uid, { settings: newSettings });
    } catch (err) {
      console.error("Error updating setting:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Language change is no longer supported.
   */

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white border-b border-[#310065]/5 pt-safe">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-[#310065]/5 transition-colors active:scale-95 duration-150">
            <ArrowLeft className="w-6 h-6 text-[#310065]" strokeWidth={2.5} />
          </Link>
          <h1 className="font-serif font-black tracking-tight text-[#1b1b1e] text-[22px]">{t.settings.title}</h1>
        </div>
        <div className="flex items-center">
          <button className="p-2 -mr-2 rounded-full hover:bg-[#310065]/5 transition-colors bg-[#310065] text-white w-7 h-7 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-screen-sm mx-auto space-y-8">
        
        {/* Profile Card Summary */}
        <div className="flex items-center gap-5 p-6 rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgba(49,0,101,0.03)] border border-[#310065]/5">
          <div className="relative">
            <div className="w-[84px] h-[84px] rounded-full border-[2.5px] border-[#e9c349] p-1 shadow-inner">
              <div className="w-full h-full rounded-full bg-[#f5f3f7] overflow-hidden">
                {user.photoURL ? (
                  <Image 
                    src={user.photoURL}
                    alt="User"
                    width={80} height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-[#cdc3d4]" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 right-0 bg-[#e9c349] text-[#735c00] p-1.5 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(233,195,73,0.4)] border-2 border-white">
              <Medal className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-[24px] font-black text-[#310065] leading-tight mb-1">{user?.fullName || "Noble Peregrino"}</h2>
            <p className="text-[#7c7483] font-bold text-[12px] uppercase tracking-wider">{t.profile.level} {user?.level ?? 1} · {(user?.role || 'user').replace('_', ' ')}</p>
          </div>
          <Link href="/profile/edit" className="p-3 bg-[#f5f3f7] rounded-2xl hover:bg-[#eddcff] transition-colors">
            <ChevronRight className="w-5 h-5 text-[#310065]" />
          </Link>
        </div>

        {/* Section: General */}
        <section className="space-y-3.5">
          <h3 className="font-serif text-[12px] font-black uppercase tracking-[0.25em] text-[#7c7483] px-2 opacity-60">{t.settings.general}</h3>
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#1b1b1e]/5">
            {/* Language Selection */}
            <button 
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="w-full flex items-center justify-between p-5 hover:bg-[#f5f3f7] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-[#1b1b1e] text-[15px]">{t.settings.language}</span>
                  <span className="block text-[12px] text-[#7c7483] font-bold uppercase tracking-wider">
                    {language === 'ht' ? 'Kreyòl Ayisyen' : language === 'fr' ? 'Français' : language === 'es' ? 'Español' : 'English'}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-[#cdc3d4] transition-transform duration-300 ${showLangPicker ? 'rotate-90' : ''}`} strokeWidth={2.5} />
            </button>

            {showLangPicker && (
              <div className="px-5 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-300">
                {[
                  { id: 'ht', name: 'Kreyòl Ayisyen' },
                  { id: 'fr', name: 'Français' },
                  { id: 'es', name: 'Español' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        setLanguage(lang.id as Language);
                        await updateUser(user.uid, { 
                          settings: { ...user.settings, language: lang.id as any } 
                        });
                        setShowLangPicker(false);
                      } catch (err) {
                        console.error("Error updating language:", err);
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      language === lang.id 
                        ? 'border-[#310065] bg-[#310065]/5' 
                        : 'border-[#f5f3f7] hover:border-[#eddcff]'
                    }`}
                  >
                    <span className={`font-bold ${language === lang.id ? 'text-[#310065]' : 'text-[#7c7483]'}`}>
                      {lang.name}
                    </span>
                    {language === lang.id && (
                      <Check className="w-5 h-5 text-[#310065]" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <div className="h-px bg-[#f5f3f7] mx-5"></div>
            
            {/* Notifications */}
            <div className="w-full flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#1b1b1e] text-[15px]">{t.settings.notifications}</span>
              </div>
              <button 
                onClick={() => handleToggle('allowNotifications')}
                disabled={isUpdating}
                className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 ${user.settings.allowNotifications ? 'bg-[#310065]' : 'bg-[#e3e2e6]'}`}
              >
                <div className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${user.settings.allowNotifications ? 'translate-x-6' : 'translate-x-0'} shadow-sm`} />
              </button>
            </div>
          </div>
        </section>

        {/* Section: Experiencia */}
        <section className="space-y-3.5">
          <h3 className="font-serif text-[12px] font-black uppercase tracking-[0.25em] text-[#7c7483] px-2 opacity-60">{t.settings.experience}</h3>
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#1b1b1e]/5">
            {/* Sound */}
            <div className="w-full flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#1b1b1e] text-[15px]">{t.settings.sound}</span>
              </div>
              <button 
                onClick={() => handleToggle('soundEnabled')}
                disabled={isUpdating}
                className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 ${user.settings.soundEnabled ? 'bg-[#310065]' : 'bg-[#e3e2e6]'}`}
              >
                <div className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${user.settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'} shadow-sm`} />
              </button>
            </div>
            
            <div className="h-px bg-[#f5f3f7] mx-5"></div>
            
            {/* Vibration */}
            <div className="w-full flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <Vibrate className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#1b1b1e] text-[15px]">{t.settings.vibration}</span>
              </div>
              <button 
                onClick={() => handleToggle('vibrationEnabled')}
                disabled={isUpdating}
                className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 ${user.settings.vibrationEnabled ? 'bg-[#310065]' : 'bg-[#e3e2e6]'}`}
              >
                <div className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${user.settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-0'} shadow-sm`} />
              </button>
            </div>
          </div>
        </section>

        {/* Section: Seguridad */}
        <section className="space-y-3.5">
          <h3 className="font-serif text-[12px] font-black uppercase tracking-[0.25em] text-[#7c7483] px-2 opacity-60">{t.settings.security}</h3>
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#1b1b1e]/5">
            {/* Password Reset */}
            <button className="w-full flex items-center justify-between p-5 hover:bg-[#f5f3f7] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#1b1b1e] text-[15px]">{t.settings.changePassword}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cdc3d4]" strokeWidth={2.5} />
            </button>
            
            <div className="h-px bg-[#f5f3f7] mx-5"></div>

            {/* Privacy Policy */}
            <button className="w-full flex items-center justify-between p-5 hover:bg-[#f5f3f7] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#1b1b1e] text-[15px]">{t.settings.privacyData}</span>
              </div>
              <ExternalLink className="w-5 h-5 text-[#cdc3d4]" strokeWidth={2} />
            </button>

            <div className="h-px bg-[#f5f3f7] mx-5"></div>
            
            {/* Sign Out */}
            <button 
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="w-full flex items-center justify-between p-5 hover:bg-[#f5f3f7] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3f7] flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-[#310065]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#1b1b1e] text-[15px]">{t.auth.signOut}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#cdc3d4]" strokeWidth={2.5} />
            </button>

            <div className="h-px bg-[#f5f3f7] mx-5"></div>
            
            {/* Delete Account */}
            <button className="w-full flex items-center justify-between p-5 hover:bg-[#ba1a1a]/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#ba1a1a]/5 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-[#ba1a1a]" strokeWidth={2} />
                </div>
                <span className="font-bold text-[#ba1a1a] text-[15px]">{t.settings.deleteAccount}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#ba1a1a]/30" strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* App Info Footer */}
        <div className="py-10 text-center space-y-2">
          <div className="font-serif font-black text-[#cdc3d4] text-[16px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#cdc3d4]"></span>
            Bible Crown
            <span className="w-8 h-px bg-[#cdc3d4]"></span>
          </div>
          <p className="text-[10px] uppercase tracking-wide text-[#7c7483] font-black">{t.settings.version}</p>
        </div>

      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-[#310065]/5 shadow-[0_-10px_40px_-15px_rgba(49,0,101,0.08)] pb-safe">
        <div className="flex justify-around items-center pt-3 pb-8 px-2 w-full">
          
          <Link href="/" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] px-3 py-1 transition-colors active:scale-95 w-16">
            <Castle className="w-6 h-6 mb-1" strokeWidth={2.5} />
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest">Temple</span>
          </Link>
          
          <Link href="/crowns" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] px-3 py-1 transition-colors active:scale-95 w-16">
            <Diamond className="w-6 h-6 mb-1" strokeWidth={2.5} />
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest">Crowns</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] px-3 py-1 transition-colors active:scale-95 w-16">
            <BarChart2 className="w-6 h-6 mb-1" strokeWidth={2.5} />
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest">Scribe</span>
          </Link>
          
          {/* Settings (Active) */}
          <div className="flex flex-col items-center justify-center bg-[#eddcff] text-[#310065] rounded-2xl w-[72px] h-[52px] mb-2 cursor-default shadow-[0_4px_16px_rgba(184,137,255,0.3)] border border-[#310065]/5">
            <SettingsIcon className="w-[22px] h-[22px] mb-0.5" strokeWidth={2.5} />
            <span className="font-sans text-[9px] font-black uppercase tracking-widest">{t.settings.title}</span>
          </div>
          
        </div>
      </nav>
      
    </div>
  );
}
