'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  AtSign, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser } from '@/lib/user/repository';
import { useT, useLanguage } from '@/lib/i18n/context';

export default function RegisterPage() {
  const router = useRouter();
  const t = useT();
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * FORM VALIDATION (Step 1)
   */
  const canNext = formData.firstName.length >= 2 && formData.lastName.length >= 2 && formData.username.length >= 3;
  
  /**
   * FORM VALIDATION (Final)
   */
  const canSubmit = 
    canNext && 
    formData.email.includes('@') && 
    formData.password.length >= 6 && 
    formData.password === formData.confirmPassword &&
    formData.termsAccepted;

  /**
   * CREATE ACCOUNT
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // 2. Update Auth profile (displayName)
      const fullName = `${formData.firstName} ${formData.lastName}`;
      await updateProfile(user, { displayName: fullName });
      
      // 3. Create Firestore record
      await createUser({
        uid: user.uid,
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        provider: 'password',
        language,
      });
      
      // 4. Redirect to home or intended destination
      const savedPath = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_path') : null;
      if (savedPath) {
        sessionStorage.removeItem('auth_redirect_path');
        router.push(savedPath);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error("Register error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t.auth.errors.emailInUse);
      } else if (err.code === 'auth/invalid-email') {
        setError(t.auth.errors.invalidEmail);
      } else if (err.code === 'auth/weak-password') {
        setError(t.auth.errors.weakPassword);
      } else {
        setError(t.auth.errors.registerGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#eddcff]">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-[#735c00]/5 rounded-full blur-[80px] -ml-32 -mt-32 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#4a148c]/5 rounded-full blur-[100px] -mr-40 -mb-40 pointer-events-none" />

      <main className="w-full max-w-sm z-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <Link href="/login" className="inline-flex items-center gap-2 text-[#7c7483] font-bold text-[13px] hover:text-[#310065] transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            {t.auth.backToLogin}
          </Link>
          <h1 className="font-serif text-3xl font-black text-[#310065] tracking-tight">{t.auth.startJourney}</h1>
          <p className="text-[#7c7483] font-medium text-[15px]">
            {t.auth.joinCommunity}
          </p>
        </div>

        {/* Stepper indicator */}
        <div className="flex gap-2 h-1.5 w-1/2">
          <div className={`flex-1 rounded-full ${step >= 1 ? 'bg-[#310065]' : 'bg-[#e3e2e6]'} transition-colors duration-500`} />
          <div className={`flex-1 rounded-full ${step >= 2 ? 'bg-[#310065]' : 'bg-[#e3e2e6]'} transition-colors duration-500`} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm border border-[#ba1a1a]/5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[13px] font-bold leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.firstName}</label>
                  <input 
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder={t.auth.placeholders.firstName}
                    className="w-full px-4 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.lastName}</label>
                  <input 
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder={t.auth.placeholders.lastName}
                    className="w-full px-4 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.username}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AtSign className="w-5 h-5 text-[#cdc3d4] group-focus-within:text-[#310065] transition-colors" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                    placeholder={t.auth.placeholders.username}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
                  />
                </div>
                <p className="text-[10px] text-[#7c7483] font-medium ml-1">{t.auth.usernameHint}</p>
              </div>

              <button 
                type="button"
                onClick={() => setStep(2)}
                disabled={!canNext}
                className="w-full bg-[#310065] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(49,0,101,0.2)] flex items-center justify-center gap-3 hover:bg-[#4a148c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-2 group"
              >
                <span>{t.auth.continue}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.email}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-[#cdc3d4] group-focus-within:text-[#310065] transition-colors" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder={t.auth.placeholders.email}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.password}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-[#cdc3d4] group-focus-within:text-[#310065] transition-colors" />
                  </div>
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={t.auth.placeholders.password}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.confirmPassword}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle2 className={`w-5 h-5 transition-colors ${formData.password === formData.confirmPassword && formData.confirmPassword !== '' ? 'text-emerald-500' : 'text-[#cdc3d4]'}`} />
                  </div>
                  <input 
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder={t.auth.repeatPassword}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 px-1 py-1 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 mt-0.5 rounded-lg border-[#cdc3d4] text-[#310065] focus:ring-[#310065] transition-all cursor-pointer"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                />
                <span className="text-[13px] text-[#4a4452] font-medium leading-snug">
                  {t.auth.termsAccept} <Link href="/terms" className="text-[#310065] font-black underline">{t.auth.termsLink}</Link>.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-[#310065]/10 text-[#310065] font-bold rounded-2xl hover:bg-[#310065]/5 transition-all text-[15px]"
                >
                  {t.auth.back}
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="flex-[2] bg-[#310065] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(49,0,101,0.2)] flex items-center justify-center gap-3 hover:bg-[#4a148c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-[15px]">{t.auth.createAccount}</span>
                      <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

      </main>
    </div>
  );
}
