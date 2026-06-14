'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  signInWithRedirect,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useT, useLanguage } from '@/lib/i18n/context';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for lightweight client-side floating stars/particles
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate 12 glowing particles of divine wisdom
    const generated = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 4,
    }));
    setParticles(generated);
  }, []);

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
      const savedPath = typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect_path') : null;
      if (savedPath) {
        sessionStorage.removeItem('auth_redirect_path');
        router.push(savedPath);
      } else {
        router.push('/');
      }
    } catch (err: any) {
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
    setError(null);
    setIsLoading(true);
    try {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, googleProvider);
          return; // Detiene la ejecución aquí ya que la redirección tomará el control
        } else {
          throw popupErr;
        }
      }

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
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#eddcff] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(203,167,47,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(49,0,101,0.12),transparent_26%),var(--background)]">
      
      {/* Background Image & Ambient Illumination */}
      <div className="absolute inset-0 z-[-10]">
        <Image 
          src="/images/jwe-bib-la/bible-bg.png" 
          alt="Bible Background" 
          fill 
          className="object-cover opacity-10 brightness-90 contrast-110 select-none pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-100/40 dark:from-slate-900/20 dark:to-slate-950/70" />
      </div>

      {/* Floating Wisdom Particles */}
      <div className="absolute inset-0 z-[-5] overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-tr from-[#ffe088] to-[#e9c349] opacity-30 shadow-[0_0_8px_rgba(233,195,73,0.3)]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(p.id) * 20, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Login Card Panel */}
      <motion.main 
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm z-10 space-y-6 sm:space-y-8 bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(15,23,42,0.92)] backdrop-blur-3xl border border-white/15 dark:border-slate-700/60 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.25)] relative overflow-hidden"
      >
        {/* Soft Golden Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#e9c349]/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#310065]/10 rounded-full blur-[40px] pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center space-y-2 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#310065] to-[#4a148c] rounded-[1.5rem] shadow-[0_12px_30px_rgba(49,0,101,0.25)] border border-white/15 mb-2"
          >
            <span className="font-serif text-3xl font-black text-white select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]">BC</span>
          </motion.div>
          <h1 className="font-serif text-3xl font-black text-[#0f172a] dark:text-white tracking-tight">Bible Crown</h1>
          <p className="text-[#475569] dark:text-slate-300 font-semibold text-[14px] leading-tight">
            {t.auth.tagline}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 relative z-10">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[13px] font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          
          {/* Email Input */}
          <motion.div 
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1.5 px-1"
          >
            <label className="text-[11px] font-black text-[#475569] dark:text-slate-400 uppercase tracking-widest ml-1">{t.auth.email}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-[#9ca3af] group-focus-within:text-[#310065] transition-colors" />
              </div>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.placeholders.email}
                className="w-full pl-12 pr-6 py-4 bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#0f172a] dark:text-slate-100 font-semibold placeholder:text-slate-400"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div 
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5 px-1"
          >
            <div className="flex justify-between items-end mb-0.5 pr-1">
              <label className="text-[11px] font-black text-[#475569] dark:text-slate-400 uppercase tracking-widest ml-1">{t.auth.password}</label>
              <Link href="/forgot-password" className="text-[#310065] text-[12px] font-bold hover:underline transition-all">{t.auth.forgotPassword}</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#9ca3af] group-focus-within:text-[#310065] transition-colors" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.placeholders.password}
                className="w-full pl-12 pr-12 py-4 bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all text-[#0f172a] dark:text-slate-100 font-semibold placeholder:text-slate-400"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#310065] transition-colors"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-[#310065] to-[#4a148c] text-white font-black py-4 rounded-2xl shadow-[0_8px_20px_rgba(49,0,101,0.25)] flex items-center justify-center gap-3 hover:shadow-[0_12px_24px_rgba(49,0,101,0.35)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group mt-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-[15px] tracking-wide">{t.auth.signIn}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center px-2 relative z-10">
          <div className="flex-grow border-t border-slate-300/40 dark:border-slate-600/40" />
          <span className="mx-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">{t.auth.orContinueWith}</span>
          <div className="flex-grow border-t border-slate-300/40 dark:border-slate-600/40" />
        </div>

        {/* Social Buttons */}
        <motion.div 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 relative z-10"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 py-4 bg-white border border-slate-200/70 rounded-2xl shadow-[0_10px_25px_-14px_rgba(15,23,42,0.15)] hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Chrome className="w-5 h-5 text-[#241a00]" />
            <span className="text-[14px] font-bold text-[#0f172a]">Google</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 py-4 bg-slate-950 text-white rounded-2xl shadow-[0_10px_25px_-14px_rgba(15,23,42,0.22)] hover:bg-slate-900 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Apple className="w-5 h-5 text-white" fill="currentColor" />
            <span className="text-[14px] font-bold text-white">Apple</span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[#475569] dark:text-slate-400 text-[14px] font-semibold pt-2 relative z-10">
          {t.auth.noAccount}{' '}
          <Link href="/register" className="text-[#310065] font-black hover:underline uppercase tracking-widest text-[13px] transition-all">{t.auth.register}</Link>
        </p>

      </motion.main>
    </div>
  );
}
