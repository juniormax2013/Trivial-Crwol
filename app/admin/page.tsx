'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen,
  Mail,
  Lock,
  ShieldCheck,
  Shield,
  ArrowRight,
  ScrollText,
  AlertCircle,
  Loader2,
  Chrome
} from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError('');
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      let isAdmin = idTokenResult.claims.admin === true || 
                    ['super_admin', 'editor', 'reviewer'].includes(idTokenResult.claims.role as string);

      if (!isAdmin) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          isAdmin = ['super_admin', 'editor', 'reviewer', 'moderator'].includes(userData?.role);
        }
      }

      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        await auth.signOut();
        setError('Acceso denegado. Se requieren privilegios de administrador.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      let message = 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Usuario o contraseña incorrectos.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Inténtalo más tarde.';
      }
      setError(message);
      setIsSubmitting(false);
    }
  };

  /**
   * GOOGLE LOGIN FOR ADMINS
   */
  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, googleProvider);
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, googleProvider);
          return; // Detiene la ejecución aquí ya que la redirección tomará el control
        } else {
          throw popupErr;
        }
      }

      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      let isAdmin = idTokenResult.claims.admin === true || 
                    ['super_admin', 'editor', 'reviewer'].includes(idTokenResult.claims.role as string);

      if (!isAdmin) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          isAdmin = ['super_admin', 'editor', 'reviewer', 'moderator'].includes(userData?.role);
        }
      }

      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        await auth.signOut();
        setError('Acceso denegado. Se requieren privilegios de administrador.');
      }
    } catch (err: any) {
      console.error("Google Admin login error:", err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#310065] via-[#4a148c] to-[#1b1b1e] font-sans selection:bg-[#cba72f]/30">
      
      {/* Background Illumination */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at top right, rgba(233, 195, 73, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(115, 69, 182, 0.2), transparent 40%)'
      }}></div>
      <div className="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] bg-[#310065]/60 rounded-full blur-[120px]"></div>
      <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-[#735c00]/30 rounded-full blur-[120px]"></div>

      <main className="w-full max-w-[480px] z-10">
        
        {/* Logo Branding Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 mb-5 bg-[#cba72f]/20 rounded-full flex items-center justify-center border border-[#735c00]/30 shadow-[0_0_40px_rgba(203,167,47,0.2)]">
            <BookOpen className="w-10 h-10 text-[#e9c349] fill-[#e9c349]" strokeWidth={1} />
          </div>
          <h1 className="text-[32px] font-black text-white font-serif tracking-tight leading-none mb-1.5">Bible Crown</h1>
          <p className="text-[#d7baff]/80 font-bold tracking-[0.15em] uppercase text-[10px]">Kingdom Admin Portal</p>
        </div>

        {/* Login Card */}
        <section className="bg-[#e3e2e6]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-white/20">
          
          <header className="mb-8">
            <h2 className="text-[26px] font-black text-[#1b1b1e] font-serif leading-tight">Administrator Login</h2>
            <p className="text-[#4a4452] text-[14px] font-medium mt-1">Access the ecclesiastical oversight dashboard.</p>
          </header>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Error Message */}
            {error && (
              <div className="bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0" />
                <p className="text-[12px] font-bold text-[#ba1a1a]">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-[#1b1b1e] ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7c7483] group-focus-within:text-[#310065] transition-colors">
                  <Mail className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@biblecrown.com" 
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-[0.85rem] focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:border-[#310065]/10 transition-all text-[#1b1b1e] placeholder:text-[#cdc3d4] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[13px] font-bold text-[#1b1b1e]" htmlFor="password">Password</label>
                <Link href="#" className="text-[11px] font-black text-[#4a148c] hover:text-[#310065] transition-colors uppercase tracking-wider">
                  Forgot Access?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7c7483] group-focus-within:text-[#310065] transition-colors">
                  <Lock className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-[0.85rem] focus:outline-none focus:ring-2 focus:ring-[#310065]/20 focus:border-[#310065]/10 transition-all text-[#1b1b1e] placeholder:text-[#cdc3d4] shadow-sm font-medium tracking-widest text-lg"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-[#310065]/5 rounded-xl p-3.5 flex gap-3 items-start border border-[#310065]/5">
              <Shield className="w-5 h-5 text-[#310065] shrink-0 mt-0.5 fill-[#310065]/10" strokeWidth={2} />
              <p className="text-[11px] text-[#4a4452] font-semibold leading-relaxed">
                Authorized personnel only. All access attempts are logged under ecclesiastical oversight protocols. IP: 192.168.1.***
              </p>
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#310065] to-[#4a148c] text-white py-[18px] rounded-[1rem] font-bold text-[17px] shadow-[0_8px_20px_rgba(49,0,101,0.3)] hover:shadow-[0_12px_28px_rgba(49,0,101,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 group mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  Enter the Kingdom Panel
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" strokeWidth={2.5} />
                </>
              )}
            </button>
            
            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#1b1b1e]/10"></div>
              <span className="mx-4 text-[#7c7483] text-[10px] font-black uppercase tracking-widest">or access via</span>
              <div className="flex-grow border-t border-[#1b1b1e]/10"></div>
            </div>

            {/* Google Login for Admin */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-[#1b1b1e]/5 rounded-2xl shadow-sm hover:bg-[#f5f3f7] hover:border-[#310065]/10 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-[#310065]" />
              <span className="text-[15px] font-bold text-[#310065]">Continue with Google Admin</span>
            </button>
            
          </form>
        </section>

        {/* Footer Links */}
        <footer className="mt-8 flex justify-center items-center gap-4 text-[#d7baff]/70 text-[11px] font-bold tracking-wide uppercase">
          <Link href="#" className="hover:text-[#ffe088] transition-colors">System Status</Link>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <Link href="#" className="hover:text-[#ffe088] transition-colors">Security Policy</Link>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <Link href="#" className="hover:text-[#ffe088] transition-colors">Admin Support</Link>
        </footer>

      </main>

      {/* Decorative Illustration Element (Hidden on small screens) */}
      <div className="hidden lg:block absolute bottom-12 right-12 max-w-[280px] opacity-20 pointer-events-none select-none">
        <div className="relative p-6 border-l-2 border-b-2 border-[#cba72f]/40">
          <ScrollText className="w-16 h-16 text-[#cba72f] mb-3" strokeWidth={1.5} />
          <p className="font-serif italic text-white text-[15px] leading-relaxed">
            &quot;The entrance of thy words giveth light; it giveth understanding unto the simple.&quot;
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#ffe088] mt-3">
            Psalm 119:130
          </p>
        </div>
      </div>

    </div>
  );
}
