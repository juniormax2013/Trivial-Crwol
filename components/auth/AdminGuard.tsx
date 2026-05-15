'use client';

import { useAuthContext } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/lib/user/models';

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AdminGuard({ 
  children, 
  allowedRoles = ['super_admin', 'moderator', 'editor'] 
}: AdminGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  /**
   * ROLE REDIRECT LOGIC
   */
  useEffect(() => {
    if (!loading) {
      if (!user || !allowedRoles.includes(user.role)) {
        router.push('/');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
        <p className="text-[#7c7483] font-bold text-[13px] uppercase tracking-widest">Verificando Credenciales de Alto Rango...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-600 shadow-sm border border-red-100">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-black text-[#1b1b1e] text-2xl">Acceso Restringido</h2>
          <p className="text-[#7c7483] font-medium max-w-xs mx-auto">
            No tienes los permisos reales necesarios para acceder a las cámaras de administración.
          </p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-[#310065] text-white font-black text-[13px] uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Regresar al Templo
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
