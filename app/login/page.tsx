'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Chrome, 
  Apple, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useT, useLanguage } from '@/lib/i18n/context';
import { Language } from '@/lib/i18n/types';

// Language choosing is removed as the system is strictly Haitian Creole.

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * EMAIL/PASSWORD LOGIN
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let AuthGuard handle the redirect or use a fallback here if needed
      const savedPath = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_path') : null;
      if (savedPath) {
        sessionStorage.removeItem('auth_redirect_path');
        router.push(savedPath);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(t.auth.errors.invalidCredential);
      } else if (err.code === 'auth/too-many-requests') {
        setError(t.auth.errors.tooManyRequests);
      } else {
        setError(t.auth.errors.generic);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * GOOGLE LOGIN
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      const savedPath = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_path') : null;
      if (savedPath) {
        sessionStorage.removeItem('auth_redirect_path');
        router.push(savedPath);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(t.auth.errors.googleFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#eddcff]">
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-[#eddcff]/40 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-[#310065]/5 rounded-full blur-[60px] -ml-32 -mb-32 pointer-events-none" />

      <main className="w-full max-w-sm z-10 space-y-8">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#310065] rounded-[1.5rem] shadow-[0_8px_24px_rgba(49,0,101,0.25)] mb-4">
            <span className="font-serif text-3xl font-black text-white">BC</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#310065] tracking-tight">Bible Crown</h1>
          <p className="text-[#7c7483] font-medium text-[15px]">
            {t.auth.tagline}
          </p>
        </div>

{/* Language selector removed */}

        {/* Error Message */}
        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[13px] font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5 px-1">
            <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-widest ml-1">{t.auth.email}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-[#cdc3d4] group-focus-within:text-[#310065] transition-colors" />
              </div>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.placeholders.email}
                className="w-full pl-12 pr-6 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between items-end mb-0.5 pr-1">
              <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-widest ml-1">{t.auth.password}</label>
              <Link href="/forgot-password" className="text-[#4a148c] text-[12px] font-bold hover:underline">{t.auth.forgotPassword}</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#cdc3d4] group-focus-within:text-[#310065] transition-colors" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.placeholders.password}
                className="w-full pl-12 pr-12 py-4 bg-white border border-[#310065]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#1b1b1e] font-medium placeholder:text-[#cdc3d4]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#cdc3d4] hover:text-[#310065] transition-colors"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-[#310065] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(49,0,101,0.2)] flex items-center justify-center gap-3 hover:bg-[#4a148c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-[15px]">{t.auth.signIn}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center px-2">
          <div className="flex-grow border-t border-[#1b1b1e]/10"></div>
          <span className="mx-4 text-[#7c7483] text-[11px] font-bold uppercase tracking-widest">{t.auth.orContinueWith}</span>
          <div className="flex-grow border-t border-[#1b1b1e]/10"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 py-4 bg-white border border-[#1b1b1e]/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-[#f5f3f7] transition-all disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-[#241a00]" />
            <span className="text-[14px] font-bold text-[#1b1b1e]">Google</span>
          </button>
          <button 
            type="button"
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 py-4 bg-[#1b1b1e] rounded-2xl shadow-[0_8px_20_rgba(0,0,0,0.1)] hover:bg-black transition-all disabled:opacity-50"
          >
            <Apple className="w-5 h-5 text-white" fill="currentColor" />
            <span className="text-[14px] font-bold text-white">Apple</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[#7c7483] text-[14px] font-medium pt-2">
          {t.auth.noAccount}{' '}
          <Link href="/register" className="text-[#310065] font-black hover:underline uppercase tracking-widest text-[13px]">{t.auth.register}</Link>
        </p>

      </main>
    </div>
  );
}
