'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useT } from '@/lib/i18n/context';

export default function ForgotPasswordPage() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  /**
   * RESET PASSWORD
   */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.code === 'auth/user-not-found') {
        setError(t.auth.errors.userNotFound);
      } else {
        setError(t.auth.errors.resetFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-[#310065]/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-[#eddcff]/40 rounded-full blur-[60px] -ml-32 -mb-32 pointer-events-none" />

      <main className="w-full max-w-sm z-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <Link href="/login" className="inline-flex items-center gap-2 text-[#7c7483] font-bold text-[13px] hover:text-[#310065] transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            {t.auth.backToLogin}
          </Link>
          <div className="w-16 h-16 bg-[#310065]/5 rounded-[1.5rem] flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-[#310065]" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl font-black text-[#310065] tracking-tight">{t.auth.forgotPasswordTitle}</h1>
          <p className="text-[#4a4452] font-medium text-[15px] leading-relaxed">
            {t.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm border border-[#ba1a1a]/5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[13px] font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Success State */}
        {isSent ? (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95 duration-500 shadow-sm">
            <div className="bg-emerald-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-black text-[#064e3b] text-xl">{t.auth.emailSentTitle}</h3>
              <p className="text-[#065f46] text-[14px] font-medium leading-relaxed">
                {t.auth.emailSentDesc} <br/>
                <span className="font-bold">{email}</span>
              </p>
            </div>
            <button 
              onClick={() => setIsSent(false)}
              className="text-[#065f46] text-[13px] font-bold uppercase tracking-widest hover:underline"
            >
              {t.auth.retryEmail}
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Email Input */}
            <div className="space-y-1.5 px-1">
              <label className="text-[11px] font-black text-[#7c7483] uppercase tracking-[0.15em] ml-1">{t.auth.forgotPasswordEmailLabel}</label>
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

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-[#310065] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(49,0,101,0.2)] flex items-center justify-center gap-3 hover:bg-[#4a148c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-[15px]">{t.auth.forgotPasswordButton}</span>
              )}
            </button>
          </form>
        )}

      </main>
    </div>
  );
}
